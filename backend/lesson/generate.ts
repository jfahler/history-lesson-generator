import { api, APIError } from "encore.dev/api";
import { secret } from "encore.dev/config";
import log from "encore.dev/log";

const openAIKey = secret("OpenAIKey");

export interface GenerateLessonRequest {
  standard: string;
}

export interface Resource {
  title: string;
  url: string;
  type: "article" | "video" | "interactive" | "document";
  description: string;
}

export interface PrimarySource {
  title: string;
  author: string;
  date: string;
  excerpt: string;
  context: string;
}

export interface MultimediaResource {
  title: string;
  url: string;
  type: "image" | "video" | "audio" | "map";
  description: string;
}

export interface LessonIdea {
  title: string;
  description: string;
  objectives: string[];
  activities: string[];
  assessmentIdeas: string[];
  timeEstimate: string;
  gradeLevel: string;
  resources: Resource[];
  primarySources: PrimarySource[];
  multimedia: MultimediaResource[];
}

export interface GenerateLessonResponse {
  lessons: LessonIdea[];
  cleanedStandard: string;
  extractedTopics: string[];
}

function cleanStandard(standard: string): { cleaned: string; searchContext: string } {
  // Remove duplicate lines and sentences
  const lines = standard.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const uniqueLines = [...new Set(lines)];
  
  // Join and split by sentences to remove duplicate sentences
  const text = uniqueLines.join(' ');
  const sentences = text.split(/[.;]/).map(s => s.trim()).filter(s => s.length > 0);
  const uniqueSentences = [...new Set(sentences)];
  
  const cleaned = uniqueSentences.join('. ').replace(/\s+/g, ' ').trim();
  
  // Create a search context from the cleaned text
  // Extract key terms for searching, focusing on the most important concepts
  const searchTerms = extractSearchTerms(cleaned);
  const searchContext = searchTerms.join(' ');
  
  return { cleaned, searchContext };
}

function extractSearchTerms(text: string): string[] {
  // Extract key terms that would be useful for searching historical resources
  const terms = new Set<string>();
  
  // First, filter out directive verbs and common educational language
  const filteredText = filterDirectiveVerbs(text);
  
  // College Board AP World History Modern Themes (from CED)
  const apThemes = [
    'interaction between humans and the environment', 'demography and disease', 'migration', 'patterns of settlement', 'technology',
    'development and interaction of cultures', 'religions', 'belief systems', 'philosophies', 'ideologies', 'science and technology', 'arts and architecture',
    'state-building, expansion, and conflict', 'political structures', 'empires', 'nations', 'nationalism', 'revolts', 'revolutions', 'regional', 'transregional', 'global structures',
    'creation, expansion, and interaction of economic systems', 'agricultural', 'pastoral production', 'trade', 'commerce', 'labor systems', 'industrialization', 'capitalism', 'socialism',
    'development and transformation of social structures', 'gender roles', 'family', 'racial', 'ethnic constructions', 'social', 'economic classes'
  ];
  
  // College Board Historical Thinking Skills
  const historicalSkills = [
    'analyze', 'evaluate', 'compare', 'contrast', 'contextualize', 'synthesize', 'causation', 'continuity', 'change over time', 'periodization'
  ];
  
  // College Board Course Units and Key Concepts
  const courseUnits = [
    'global tapestry', 'networks of exchange', 'land-based empires', 'transoceanic interconnections', 
    'revolutions', 'consequences of industrialization', 'global conflict', 'cold war', 'decolonization', 'globalization'
  ];
  
  // Extract time periods and dates
  const timePatterns = [
    /\b\d{3,4}\s*(?:BCE?|CE|AD)\b/gi,
    /\b(?:century|centuries)\b/gi,
    /\b(?:millennium|millennia)\b/gi,
    /\b(?:ancient|classical|medieval|renaissance|enlightenment|modern|early modern|late modern)\b/gi
  ];
  
  timePatterns.forEach(pattern => {
    const matches = filteredText.match(pattern) || [];
    matches.forEach(match => terms.add(match.toLowerCase()));
  });
  
  // Extract capitalized proper nouns (likely historical entities) from filtered text
  const properNouns = filteredText.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
  properNouns.forEach(word => {
    if (word.length > 3 && !['The', 'This', 'That', 'These', 'Those', 'History', 'Student', 'Expected', 'Describe', 'Explain', 'Analyze', 'Compare', 'Contrast', 'Evaluate', 'Understand', 'Major', 'Political', 'Religious', 'Cultural', 'Influence', 'Contribution', 'Civilization', 'Society', 'Period', 'Time', 'World', 'Global', 'Ancient', 'Classical', 'Modern', 'Historical'].includes(word)) {
      terms.add(word);
    }
  });
  
  // Extract key historical concepts (including College Board themes)
  const concepts = [
    'empire', 'civilization', 'dynasty', 'kingdom', 'republic', 'democracy', 'monarchy',
    'religion', 'philosophy', 'trade', 'war', 'conquest', 'colonization', 'revolution',
    'renaissance', 'reformation', 'enlightenment', 'industrialization', 'nationalism',
    'imperialism', 'globalization', 'migration', 'cultural exchange', 'technology',
    'agriculture', 'commerce', 'art', 'literature', 'science', 'medicine', 'architecture',
    // College Board specific concepts
    'state-building', 'expansion', 'conflict', 'economic systems', 'social structures',
    'gender roles', 'family structures', 'racial constructions', 'ethnic constructions',
    'social classes', 'economic classes', 'labor systems', 'belief systems', 'ideologies',
    'patterns of settlement', 'demography', 'disease', 'regional', 'transregional', 'global'
  ];
  
  // Check for College Board themes in the filtered text
  apThemes.forEach(theme => {
    if (filteredText.toLowerCase().includes(theme.toLowerCase())) {
      terms.add(theme);
    }
  });
  
  // Check for historical thinking skills
  historicalSkills.forEach(skill => {
    if (filteredText.toLowerCase().includes(skill.toLowerCase())) {
      terms.add(skill);
    }
  });
  
  // Check for course units
  courseUnits.forEach(unit => {
    if (filteredText.toLowerCase().includes(unit.toLowerCase())) {
      terms.add(unit);
    }
  });
  
  // Check for general concepts in filtered text
  concepts.forEach(concept => {
    if (filteredText.toLowerCase().includes(concept)) {
      terms.add(concept);
    }
  });
  
  // Extract important adjectives and nouns from filtered text
  const importantTerms = extractImportantTerms(filteredText);
  importantTerms.forEach(term => terms.add(term));
  
  // Limit to the most relevant terms for search
  return Array.from(terms).slice(0, 15);
}

function filterDirectiveVerbs(text: string): string {
  // Common directive verbs and educational language to filter out
  const directiveVerbs = [
    // Basic instruction verbs
    'provide', 'create', 'develop', 'design', 'make', 'build', 'generate', 'produce',
    'write', 'compose', 'draft', 'prepare', 'plan', 'organize', 'structure',
    
    // Analysis verbs
    'analyze', 'examine', 'study', 'investigate', 'explore', 'research', 'review',
    'assess', 'evaluate', 'critique', 'judge', 'appraise', 'consider',
    
    // Description verbs
    'describe', 'explain', 'discuss', 'detail', 'outline', 'summarize', 'present',
    'show', 'demonstrate', 'illustrate', 'display', 'exhibit', 'reveal',
    
    // Comparison verbs
    'compare', 'contrast', 'differentiate', 'distinguish', 'relate', 'connect',
    
    // Educational context words
    'lesson', 'unit', 'curriculum', 'instruction', 'teaching', 'learning',
    'student', 'students', 'class', 'grade', 'level', 'activity', 'assignment',
    
    // Common sentence starters
    'help', 'assist', 'support', 'guide', 'teach', 'educate', 'inform',
    'understand', 'comprehend', 'grasp', 'learn', 'know', 'realize',
    
    // Modal and auxiliary verbs
    'should', 'would', 'could', 'might', 'may', 'will', 'shall', 'must',
    'can', 'need', 'want', 'wish', 'hope', 'expect', 'require',
    
    // Common prepositions that start educational requests
    'about', 'regarding', 'concerning', 'for', 'on', 'with', 'using'
  ];
  
  // Split text into words, preserving punctuation context
  const words = text.split(/\s+/);
  const filteredWords: string[] = [];
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
    
    // Skip directive verbs, but be more lenient after the first few words
    const isDirectiveVerb = directiveVerbs.includes(cleanWord);
    const isEarlyInText = i < 5; // Only aggressively filter in first 5 words
    
    if (isDirectiveVerb && isEarlyInText) {
      continue; // Skip this word
    }
    
    // Keep the word if it's not a directive verb or if we're past the early filtering zone
    if (!isDirectiveVerb || !isEarlyInText) {
      filteredWords.push(word);
    }
  }
  
  return filteredWords.join(' ');
}

function extractImportantTerms(text: string): string[] {
  const terms = new Set<string>();
  
  // Extract multi-word phrases that are likely to be important
  // Look for patterns like "Ancient Rome", "World War", "Industrial Revolution"
  const phrasePatterns = [
    // Historical periods with adjectives
    /\b(ancient|classical|medieval|early|late|modern|contemporary)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/gi,
    // Geographic entities
    /\b([A-Z][a-z]+)\s+(Empire|Kingdom|Republic|Dynasty|Civilization|Culture|Society)\b/gi,
    // Historical events
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(War|Revolution|Period|Era|Age|Movement)\b/gi,
    // Cultural/religious terms
    /\b([A-Z][a-z]+)\s+(Religion|Philosophy|Art|Architecture|Literature|Science)\b/gi
  ];
  
  phrasePatterns.forEach(pattern => {
    const matches = text.match(pattern) || [];
    matches.forEach(match => {
      // Clean up the match and add individual important words
      const cleanMatch = match.replace(/[^\w\s]/g, '').trim();
      const words = cleanMatch.split(/\s+/);
      words.forEach(word => {
        if (word.length > 3 && /^[A-Z]/.test(word)) {
          terms.add(word);
        }
      });
    });
  });
  
  // Extract standalone important words (nouns, adjectives, proper nouns)
  const words = text.split(/\s+/);
  words.forEach(word => {
    const cleanWord = word.replace(/[^\w]/g, '');
    
    // Include words that are:
    // 1. Capitalized (likely proper nouns)
    // 2. Historical time periods
    // 3. Important descriptive words
    if (cleanWord.length > 3) {
      if (/^[A-Z]/.test(cleanWord)) {
        terms.add(cleanWord);
      } else if (/^(culture|society|politics|economics|religion|art|science|technology|military|social|political|economic|religious|cultural)$/i.test(cleanWord)) {
        terms.add(cleanWord.toLowerCase());
      }
    }
  });
  
  return Array.from(terms);
}

function createContextualActivities(searchContext: string): string[] {
  // Create activities that reference the search context and align with College Board standards
  const activities = [
    `Primary source analysis focusing on ${searchContext} using period-appropriate documents and archaeological evidence, applying historical thinking skills`,
    `Comparative study of ${searchContext} using historical maps, artifacts, and contemporary accounts to identify patterns of continuity and change`,
    `Interactive timeline creation showing key events and developments related to ${searchContext}, emphasizing causation and periodization`,
    `Role-playing simulation representing different perspectives within the context of ${searchContext} to understand diverse viewpoints`,
    `Evidence-based debate on significant aspects of ${searchContext} using historical sources and contextualization`,
    `Document-based question (DBQ) analysis of ${searchContext} using multiple primary and secondary sources`,
    `Historical argumentation exercise on ${searchContext} requiring students to develop and support historical claims with evidence`
  ];
  
  return activities;
}

function createFallbackLessons(standard: string, searchContext: string): LessonIdea[] {
  const contextualActivities = createContextualActivities(searchContext);
  
  // Create more specific fallback lessons based on search context, aligned with College Board standards
  const baseLesson: LessonIdea = {
    title: `Exploring ${searchContext}: Historical Analysis and Impact`,
    description: `A comprehensive lesson exploring the historical significance and lasting influence of ${searchContext}, focusing on primary sources and contemporary accounts. Aligned with College Board AP World History themes and historical thinking skills.`,
    objectives: [
      "Students will analyze the historical significance and impact of the specified topic using primary and secondary sources (Historical Thinking Skill: Analysis)",
      "Students will evaluate primary sources from the relevant time period using historical thinking skills and contextualization",
      "Students will compare and contrast different perspectives on the historical topic to understand diverse viewpoints",
      "Students will assess the long-term consequences and influence on subsequent historical developments (Historical Thinking Skill: Causation)"
    ],
    activities: [
      ...contextualActivities.slice(0, 2),
      "Interactive timeline creation showing key events and developments related to the topic, emphasizing causation and periodization",
      "Socratic seminar discussion on the lasting influence and historical significance, requiring evidence-based argumentation"
    ],
    assessmentIdeas: [
      "Document-based question (DBQ) essay analyzing primary sources related to the topic using College Board rubric criteria",
      "Comparative chart assessment evaluating different aspects and perspectives with evidence-based analysis",
      "Timeline accuracy and analysis rubric focusing on cause-and-effect relationships and periodization",
      "Participation rubric for class discussions and collaborative activities emphasizing historical argumentation"
    ],
    timeEstimate: "3-4 class periods",
    gradeLevel: "9-12",
    resources: [
      {
        title: "College Board AP World History Resources",
        url: "https://apcentral.collegeboard.org/courses/ap-world-history-modern",
        type: "document" as const,
        description: "Official AP World History course materials and exam resources"
      },
      {
        title: "Library of Congress Digital Collections",
        url: "https://www.loc.gov/collections/",
        type: "document" as const,
        description: "Primary sources and historical documents searchable by topic"
      },
      {
        title: "World History Encyclopedia",
        url: "https://www.worldhistory.org/",
        type: "article" as const,
        description: "Scholarly articles and historical analysis on various topics"
      }
    ],
    primarySources: [
      {
        title: "Historical Primary Sources",
        author: "Various Historical Figures",
        date: "Relevant time period",
        excerpt: "Primary source excerpts would include texts, documents, and accounts related to the specified topic from the relevant historical period.",
        context: "These sources provide authentic voices from the historical period, allowing students to understand contemporary perspectives and experiences while practicing historical thinking skills."
      }
    ],
    multimedia: [
      {
        title: "Historical Documentary Resources",
        url: "https://www.pbs.org/education/",
        type: "video" as const,
        description: "Educational videos and documentary content on historical topics"
      },
      {
        title: "Interactive Historical Maps",
        url: "https://www.worldhistoryatlas.com/",
        type: "map" as const,
        description: "Interactive maps showing historical developments and geographical context"
      }
    ]
  };

  const comparativeLesson: LessonIdea = {
    title: `Comparative Analysis: ${searchContext} in Global Context`,
    description: `Students examine ${searchContext} through comparative analysis with related historical developments, exploring connections and influences across time and space. Aligned with College Board themes of state-building, expansion, and conflict.`,
    objectives: [
      "Students will identify and analyze key aspects of the historical topic using comparative methods (Historical Thinking Skill: Comparison)",
      "Students will compare the topic with related historical developments in other regions or time periods to identify patterns",
      "Students will evaluate the role of various factors in shaping historical outcomes using evidence-based analysis",
      "Students will assess the broader historical significance and global impact through contextualization"
    ],
    activities: [
      "Comparative case study analysis using primary and secondary sources from multiple perspectives",
      "Cross-regional or cross-temporal comparison of related historical developments using College Board themes",
      "Role-playing simulation representing different historical perspectives and stakeholders",
      "Evidence-based debate on the significance and impact of the historical topic requiring historical argumentation"
    ],
    assessmentIdeas: [
      "Comparative essay analyzing the topic in broader historical context using College Board rubric criteria",
      "Primary source analysis worksheet with comparative questions and contextualization",
      "Group presentation rubric for case study analysis with peer evaluation and evidence-based argumentation",
      "Debate performance assessment focusing on use of historical evidence and causation analysis"
    ],
    timeEstimate: "4-5 class periods",
    gradeLevel: "10-12",
    resources: [
      {
        title: "Stanford History Education Group",
        url: "https://sheg.stanford.edu/",
        type: "interactive" as const,
        description: "Research-based curriculum materials for historical analysis and comparison"
      },
      {
        title: "College Board AP Classroom Resources",
        url: "https://apcentral.collegeboard.org/",
        type: "document" as const,
        description: "AP World History course materials and assessment resources"
      }
    ],
    primarySources: [
      {
        title: "Comparative Historical Sources",
        author: "Various Historical Figures",
        date: "Relevant time periods",
        excerpt: "Historical accounts and documents that provide different perspectives on the topic and related developments.",
        context: "These sources help students understand how different people and societies viewed and experienced related historical developments, supporting comparative analysis."
      }
    ],
    multimedia: [
      {
        title: "Archaeological and Historical Evidence",
        url: "https://www.archaeology.org/",
        type: "image" as const,
        description: "Archaeological findings and historical artifacts that illustrate the topic"
      }
    ]
  };

  const impactLesson: LessonIdea = {
    title: `Legacy and Impact: The Enduring Influence of ${searchContext}`,
    description: `Students explore the lasting legacy and contemporary relevance of ${searchContext}, examining how historical developments continue to influence the modern world. Aligned with College Board themes of continuity and change over time.`,
    objectives: [
      "Students will trace the historical legacy and long-term impact of the specified topic (Historical Thinking Skill: Continuity and Change Over Time)",
      "Students will evaluate the contemporary relevance and influence on modern society using evidence-based analysis",
      "Students will assess how historical developments shaped subsequent events and institutions through causation analysis",
      "Students will analyze the ways in which historical knowledge informs current understanding through contextualization"
    ],
    activities: [
      "Historical impact analysis using primary sources and contemporary accounts to trace continuity and change",
      "Legacy mapping exercise connecting historical developments to modern institutions and practices",
      "Contemporary relevance discussion connecting historical themes to current events using evidence",
      "Historical influence presentation analyzing specific examples of lasting impact with argumentation"
    ],
    assessmentIdeas: [
      "Legacy analysis project tracing historical influence to the present using College Board themes",
      "Contemporary relevance essay connecting historical themes to modern issues with evidence-based argumentation",
      "Historical impact presentation with specific examples and evidence supporting claims",
      "Reflection paper on the value of historical knowledge for understanding the present using historical thinking skills"
    ],
    timeEstimate: "3-4 class periods",
    gradeLevel: "9-11",
    resources: [
      {
        title: "College Board Historical Thinking Skills",
        url: "https://apcentral.collegeboard.org/courses/ap-world-history-modern/classroom-resources",
        type: "document" as const,
        description: "Resources for teaching historical thinking skills and College Board themes"
      },
      {
        title: "Modern Historical Connections",
        url: "https://www.neh.gov/",
        type: "article" as const,
        description: "Analysis of how historical developments influence modern society"
      }
    ],
    primarySources: [
      {
        title: "Historical Legacy Sources",
        author: "Various Historical and Contemporary Authors",
        date: "Historical and modern periods",
        excerpt: "Documents and accounts that demonstrate the lasting influence and contemporary relevance of the historical topic.",
        context: "These sources help students understand how historical developments continue to influence modern society and institutions, supporting continuity and change over time analysis."
      }
    ],
    multimedia: [
      {
        title: "Historical Legacy Visual Resources",
        url: "https://www.metmuseum.org/toah/",
        type: "image" as const,
        description: "Visual evidence showing the lasting influence of historical developments"
      }
    ]
  };

  return [baseLesson, comparativeLesson, impactLesson];
}

// Generates lesson ideas based on a history teaching standard.
export const generate = api<GenerateLessonRequest, GenerateLessonResponse>(
  { expose: true, method: "POST", path: "/lesson/generate" },
  async (req) => {
    log.info("Generating lesson ideas for standard:", req.standard);

    if (!req.standard || req.standard.trim().length === 0) {
      throw APIError.invalidArgument("Teaching standard is required");
    }

    // Clean the standard and extract topics
    const { cleaned, searchContext } = cleanStandard(req.standard);
    log.info("Cleaned standard:", cleaned);
    log.info("Extracted topics:", searchContext);

    const apiKey = openAIKey();
    if (!apiKey) {
      log.error("OpenAI API key not configured");
      // Return fallback lessons with cleaned standard and topics
      return { 
        lessons: createFallbackLessons(cleaned, searchContext),
        cleanedStandard: cleaned,
        extractedTopics: searchContext.split(' ')
      };
    }

    try {
      log.info("Making request to OpenAI API");
      
      const contextualActivities = createContextualActivities(searchContext);
      
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: `You are an expert history teacher and curriculum designer with deep knowledge of world history, primary sources, and educational best practices. Your task is to create highly specific, engaging lesson ideas that directly address the provided teaching standard, aligned with College Board AP World History Modern standards.

COLLEGE BOARD AP WORLD HISTORY THEMES TO INCORPORATE:
1. Interaction Between Humans and the Environment (demography, disease, migration, patterns of settlement, technology)
2. Development and Interaction of Cultures (religions, belief systems, philosophies, ideologies, science, arts, architecture)
3. State-Building, Expansion, and Conflict (political structures, empires, nations, nationalism, revolts, revolutions)
4. Creation, Expansion, and Interaction of Economic Systems (agricultural/pastoral production, trade, commerce, labor systems, industrialization)
5. Development and Transformation of Social Structures (gender roles, family, racial/ethnic constructions, social/economic classes)

HISTORICAL THINKING SKILLS TO EMPHASIZE:
- Analysis: Examine and evaluate historical sources and evidence
- Comparison: Identify similarities and differences between historical developments
- Contextualization: Situate historical events and processes in broader contexts
- Causation: Identify and evaluate cause-and-effect relationships
- Continuity and Change Over Time: Analyze patterns of continuity and change
- Periodization: Organize historical events into meaningful periods

KEY REQUIREMENTS:
1. Create 3-4 distinct lesson ideas that build upon each other in complexity
2. Each activity must reference SPECIFIC historical documents, texts, artifacts, or sources
3. Focus on the exact topics extracted from the standard: ${searchContext}
4. Include real primary sources with actual excerpts when possible
5. Provide concrete, actionable activities that teachers can implement immediately
6. Use age-appropriate content for the specified grade level
7. Include diverse perspectives and voices from the historical period
8. Align with College Board themes and historical thinking skills

LESSON STRUCTURE REQUIREMENTS:
- Title: Clear, engaging title that mentions specific topics
- Description: Brief overview mentioning key topics, learning approach, and College Board alignment
- Objectives: 3-4 specific, measurable learning objectives using historical thinking skills
- Activities: 3-4 detailed activities with specific sources and clear instructions
- Assessment: 2-3 varied assessment methods (formative and summative) using College Board rubrics
- Time Estimate: Realistic time allocation
- Grade Level: Appropriate for the content complexity
- Resources: 2-3 high-quality, accessible resources with working URLs
- Primary Sources: 1-2 specific documents with actual excerpts and context
- Multimedia: 1-2 relevant media types with descriptions

SPECIFICITY REQUIREMENTS:
- Instead of "analyze primary sources," say "analyze excerpts from the Analects of Confucius and Han dynasty administrative records"
- Instead of "compare civilizations," say "compare Roman legal codes (Twelve Tables) with Greek philosophical texts (Aristotle's Politics)"
- Include actual document titles, author names, and time periods
- Reference specific archaeological sites, artifacts, or historical events
- Connect activities to specific College Board themes and historical thinking skills

Return ONLY valid JSON following this exact structure:
{
  "lessons": [
    {
      "title": "Specific lesson title",
      "description": "Brief description mentioning specific topics and College Board alignment",
      "objectives": ["Specific objective 1 with historical thinking skill", "Specific objective 2 with historical thinking skill", "Specific objective 3 with historical thinking skill"],
      "activities": ["Detailed activity with specific sources and College Board theme", "Another detailed activity"],
      "assessmentIdeas": ["Specific assessment method 1 using College Board rubric", "Specific assessment method 2"],
      "timeEstimate": "Realistic time estimate",
      "gradeLevel": "Appropriate grade level",
      "resources": [
        {
          "title": "Specific resource title",
          "url": "https://working-url.com",
          "type": "article|video|interactive|document",
          "description": "Brief description of the resource"
        }
      ],
      "primarySources": [
        {
          "title": "Specific document title",
          "author": "Actual author name",
          "date": "Specific date or time period",
          "excerpt": "Actual excerpt from the document",
          "context": "Historical context explanation"
        }
      ],
      "multimedia": [
        {
          "title": "Specific media title",
          "url": "https://working-url.com",
          "type": "image|video|audio|map",
          "description": "Description of the media content"
        }
      ]
    }
  ]
}`
            },
            {
              role: "user",
              content: `Generate comprehensive lesson ideas for this history teaching standard, aligned with College Board AP World History Modern themes and historical thinking skills:

ORIGINAL STANDARD: ${req.standard}

CLEANED STANDARD: ${cleaned}

SEARCH CONTEXT: ${searchContext}

Please create specific, engaging lessons that directly address these topics with concrete activities and real historical sources. Focus on making the content accessible and engaging for students while maintaining historical accuracy and incorporating College Board standards.`
            }
          ],
          temperature: 0.6,
          max_tokens: 4000
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        log.error(`OpenAI API error: ${response.status} - ${errorText}`);
        return { 
          lessons: createFallbackLessons(cleaned, searchContext),
          cleanedStandard: cleaned,
          extractedTopics: searchContext.split(' ')
        };
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        log.error("Invalid response structure from OpenAI API");
        return { 
          lessons: createFallbackLessons(cleaned, searchContext),
          cleanedStandard: cleaned,
          extractedTopics: searchContext.split(' ')
        };
      }

      const content = data.choices[0].message.content;
      
      if (!content) {
        log.error("Empty response from OpenAI API");
        return { 
          lessons: createFallbackLessons(cleaned, searchContext),
          cleanedStandard: cleaned,
          extractedTopics: searchContext.split(' ')
        };
      }

      try {
        log.info("Parsing OpenAI response");
        const parsedContent = JSON.parse(content);
        
        // Validate the response structure
        if (!parsedContent.lessons || !Array.isArray(parsedContent.lessons)) {
          log.error("Invalid response structure: missing lessons array");
          return { 
            lessons: createFallbackLessons(cleaned, searchContext),
            cleanedStandard: cleaned,
            extractedTopics: searchContext.split(' ')
          };
        }

        // Ensure each lesson has required fields and valid types
        const validatedLessons = parsedContent.lessons.map((lesson: any) => ({
          title: lesson.title || "Untitled Lesson",
          description: lesson.description || "No description provided",
          objectives: Array.isArray(lesson.objectives) ? lesson.objectives : [],
          activities: Array.isArray(lesson.activities) ? lesson.activities : [],
          assessmentIdeas: Array.isArray(lesson.assessmentIdeas) ? lesson.assessmentIdeas : [],
          timeEstimate: lesson.timeEstimate || "1-2 class periods",
          gradeLevel: lesson.gradeLevel || "9-12",
          resources: Array.isArray(lesson.resources) ? lesson.resources.map((r: any) => ({
            title: r.title || "Resource",
            url: r.url || "#",
            type: ["article", "video", "interactive", "document"].includes(r.type) ? r.type : "article",
            description: r.description || "No description"
          })) : [],
          primarySources: Array.isArray(lesson.primarySources) ? lesson.primarySources.map((ps: any) => ({
            title: ps.title || "Primary Source",
            author: ps.author || "Unknown",
            date: ps.date || "Unknown date",
            excerpt: ps.excerpt || "No excerpt available",
            context: ps.context || "No context provided"
          })) : [],
          multimedia: Array.isArray(lesson.multimedia) ? lesson.multimedia.map((mm: any) => ({
            title: mm.title || "Multimedia Resource",
            url: mm.url || "#",
            type: ["image", "video", "audio", "map"].includes(mm.type) ? mm.type : "image",
            description: mm.description || "No description"
          })) : []
        }));

        log.info(`Successfully generated ${validatedLessons.length} lesson ideas`);
        return { 
          lessons: validatedLessons,
          cleanedStandard: cleaned,
          extractedTopics: searchContext.split(' ')
        };
        
      } catch (parseError) {
        log.error("JSON parsing error:", parseError);
        log.error("Content that failed to parse:", content);
        return { 
          lessons: createFallbackLessons(cleaned, searchContext),
          cleanedStandard: cleaned,
          extractedTopics: searchContext.split(' ')
        };
      }
    } catch (error) {
      log.error("Error in lesson generation:", error);
      return { 
        lessons: createFallbackLessons(cleaned, searchContext),
        cleanedStandard: cleaned,
        extractedTopics: searchContext.split(' ')
      };
    }
  }
);
