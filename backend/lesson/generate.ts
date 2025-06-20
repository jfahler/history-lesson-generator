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

function cleanStandard(standard: string): { cleaned: string; topics: string[] } {
  // Remove duplicate lines and sentences
  const lines = standard.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const uniqueLines = [...new Set(lines)];
  
  // Join and split by sentences to remove duplicate sentences
  const text = uniqueLines.join(' ');
  const sentences = text.split(/[.;]/).map(s => s.trim()).filter(s => s.length > 0);
  const uniqueSentences = [...new Set(sentences)];
  
  const cleaned = uniqueSentences.join('. ').replace(/\s+/g, ' ').trim();
  
  // Extract proper nouns, place names, and historical concepts
  const topics = extractHistoricalTopics(cleaned);
  
  return { cleaned, topics };
}

function extractHistoricalTopics(text: string): string[] {
  const topics = new Set<string>();
  
  // Common historical civilizations and empires
  const civilizations = [
    'Persia', 'Persian Empire', 'India', 'China', 'Han China', 'Israel', 'Greece', 'Greek', 'Rome', 'Roman Empire',
    'Byzantine', 'Ottoman', 'Mongol', 'Aztec', 'Inca', 'Maya', 'Egypt', 'Mesopotamia', 'Babylon', 'Assyria'
  ];
  
  // Religious and philosophical concepts
  const religions = [
    'Christianity', 'Buddhism', 'Hinduism', 'Judaism', 'Islam', 'Confucianism', 'Taoism', 'Zoroastrianism',
    'Stoicism', 'Platonism', 'Aristotelian'
  ];
  
  // Historical periods and concepts
  const concepts = [
    'Classical Period', 'Ancient', 'Medieval', 'Renaissance', 'Enlightenment', 'Industrial Revolution',
    'Silk Road', 'Trade Routes', 'Cultural Exchange', 'Political Systems', 'Religious Influence',
    'Fall of Rome', 'Collapse', 'Empire', 'Republic', 'Democracy', 'Monarchy', 'Feudalism'
  ];
  
  // Combine all categories
  const allTopics = [...civilizations, ...religions, ...concepts];
  
  // Find matches in the text (case insensitive)
  allTopics.forEach(topic => {
    if (text.toLowerCase().includes(topic.toLowerCase())) {
      topics.add(topic);
    }
  });
  
  // Also extract capitalized words that might be proper nouns
  const words = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
  words.forEach(word => {
    if (word.length > 3 && !['The', 'This', 'That', 'These', 'Those', 'History', 'Student'].includes(word)) {
      topics.add(word);
    }
  });
  
  return Array.from(topics).slice(0, 15); // Limit to 15 most relevant topics
}

function createTopicSpecificActivities(topics: string[]): string[] {
  const activities = [];
  
  // Create topic-specific primary source activities
  if (topics.some(t => ['Christianity', 'Buddhism', 'Judaism', 'Islam'].some(r => t.includes(r)))) {
    activities.push("Primary source document analysis of religious texts and philosophical writings from the classical period (e.g., Buddhist sutras, Christian gospels, Jewish Talmud excerpts)");
  }
  
  if (topics.some(t => ['Rome', 'Roman', 'Greece', 'Greek'].some(r => t.includes(r)))) {
    activities.push("Comparative analysis of Roman and Greek political documents (e.g., Cicero's speeches, Aristotle's Politics, Plutarch's Lives)");
  }
  
  if (topics.some(t => ['China', 'Han', 'Confucianism'].some(r => t.includes(r)))) {
    activities.push("Document analysis of Chinese philosophical texts and imperial edicts (e.g., Analects of Confucius, Han dynasty administrative records)");
  }
  
  if (topics.some(t => ['Persia', 'Persian'].some(r => t.includes(r)))) {
    activities.push("Primary source examination of Persian royal inscriptions and Zoroastrian texts (e.g., Behistun Inscription, Avesta excerpts)");
  }
  
  if (topics.some(t => ['Trade', 'Silk Road', 'Cultural Exchange'].some(r => t.includes(r)))) {
    activities.push("Map analysis and trade route documentation study using archaeological evidence and merchant accounts");
  }
  
  if (topics.some(t => ['Fall', 'Collapse', 'Decline'].some(r => t.includes(r)))) {
    activities.push("Comparative timeline analysis of empire decline factors using contemporary historical accounts and modern archaeological evidence");
  }
  
  // Add general activities if no specific topics found
  if (activities.length === 0) {
    activities.push("Primary source document analysis using period-appropriate texts and archaeological evidence");
    activities.push("Comparative civilization study using historical maps and cultural artifacts");
  }
  
  return activities;
}

function createFallbackLessons(standard: string, topics: string[]): LessonIdea[] {
  const topicSpecificActivities = createTopicSpecificActivities(topics);
  
  return [
    {
      title: "Exploring Classical Civilizations and Their Legacy",
      description: `A comprehensive lesson exploring the classical civilizations and their lasting influence on subsequent societies, focusing on the specific topics: ${topics.slice(0, 5).join(', ')}`,
      objectives: [
        "Students will analyze the political, religious, and cultural contributions of classical civilizations",
        "Students will evaluate primary sources from the classical period",
        "Students will compare and contrast different classical civilizations",
        "Students will assess the long-term impact of classical civilizations on later societies"
      ],
      activities: [
        ...topicSpecificActivities.slice(0, 2),
        "Interactive timeline creation showing the rise and fall of classical civilizations",
        "Socratic seminar discussion on the lasting influence of classical thought and institutions"
      ],
      assessmentIdeas: [
        "Document-based question (DBQ) essay analyzing primary sources from multiple civilizations",
        "Comparative chart assessment evaluating political, religious, and cultural contributions",
        "Timeline accuracy and analysis rubric focusing on cause-and-effect relationships",
        "Participation rubric for class discussions and collaborative activities"
      ],
      timeEstimate: "3-4 class periods",
      gradeLevel: "9-12",
      resources: [
        {
          title: "Library of Congress Ancient Civilizations Collection",
          url: "https://www.loc.gov/programs/teachers/",
          type: "document",
          description: "Primary sources and teaching materials focusing on classical civilizations"
        },
        {
          title: "Metropolitan Museum of Art Heilbrunn Timeline",
          url: "https://www.metmuseum.org/toah/",
          type: "interactive",
          description: "Art and cultural artifacts from classical civilizations with historical context"
        },
        {
          title: "World History Encyclopedia",
          url: "https://www.worldhistory.org/",
          type: "article",
          description: "Scholarly articles on classical civilizations and their contributions"
        }
      ],
      primarySources: [
        {
          title: "Classical Civilization Primary Sources",
          author: "Various Historical Figures",
          date: "500 BCE - 600 CE",
          excerpt: "Primary source excerpts would include texts from the specific civilizations mentioned in the standard, such as Confucian writings from China, philosophical texts from Greece, legal documents from Rome, and religious texts from various traditions.",
          context: "These sources provide authentic voices from the classical period, allowing students to understand how people of the time viewed their world, their beliefs, and their political and social systems."
        }
      ],
      multimedia: [
        {
          title: "Classical Civilization Documentary Clips",
          url: "https://www.pbs.org/education/",
          type: "video",
          description: "Educational videos exploring the rise and influence of classical civilizations"
        },
        {
          title: "Interactive Maps of Classical World",
          url: "https://www.worldhistoryatlas.com/",
          type: "map",
          description: "Interactive maps showing the extent and influence of classical civilizations"
        }
      ]
    },
    {
      title: "Comparative Analysis of Empire Decline",
      description: "Students examine the factors leading to the collapse of major classical empires, with specific focus on the civilizations and concepts identified in the teaching standard.",
      objectives: [
        "Students will identify and analyze factors contributing to empire decline",
        "Students will compare collapse patterns across different civilizations",
        "Students will evaluate the role of internal and external pressures on empires",
        "Students will assess the long-term consequences of empire collapse"
      ],
      activities: [
        "Primary source analysis of contemporary accounts describing empire decline (e.g., Ammianus Marcellinus on Rome, Chinese records on Han collapse)",
        "Comparative case study analysis using archaeological evidence and historical documents",
        "Role-playing simulation representing different perspectives during empire decline",
        "Evidence-based debate on the primary causes of specific empire collapses"
      ],
      assessmentIdeas: [
        "Comparative essay analyzing collapse factors across multiple empires",
        "Primary source analysis worksheet with historical context questions",
        "Group presentation rubric for case study analysis",
        "Debate performance assessment focusing on use of historical evidence"
      ],
      timeEstimate: "4-5 class periods",
      gradeLevel: "10-12",
      resources: [
        {
          title: "Stanford History Education Group",
          url: "https://sheg.stanford.edu/",
          type: "interactive",
          description: "Research-based curriculum materials for analyzing historical causation"
        },
        {
          title: "National Humanities Center Online Resources",
          url: "https://nationalhumanitiescenter.org/",
          type: "document",
          description: "Primary sources and scholarly analysis of classical civilizations"
        }
      ],
      primarySources: [
        {
          title: "Contemporary Accounts of Empire Decline",
          author: "Various Historical Chroniclers",
          date: "200-600 CE",
          excerpt: "Historical accounts from the period would include descriptions of political instability, economic challenges, military pressures, and social changes that contributed to empire decline.",
          context: "These sources help students understand how people living through empire decline experienced and interpreted the changes happening around them."
        }
      ],
      multimedia: [
        {
          title: "Archaeological Evidence of Empire Decline",
          url: "https://www.archaeology.org/",
          type: "image",
          description: "Archaeological findings that illustrate the material culture changes during empire decline"
        }
      ]
    }
  ];
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
    const { cleaned, topics } = cleanStandard(req.standard);
    log.info("Cleaned standard:", cleaned);
    log.info("Extracted topics:", topics);

    const apiKey = openAIKey();
    if (!apiKey) {
      log.error("OpenAI API key not configured");
      // Return fallback lessons with cleaned standard and topics
      return { 
        lessons: createFallbackLessons(cleaned, topics),
        cleanedStandard: cleaned,
        extractedTopics: topics
      };
    }

    try {
      log.info("Making request to OpenAI API");
      
      const topicSpecificActivities = createTopicSpecificActivities(topics);
      
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
              content: `You are an expert history teacher and curriculum designer. Generate comprehensive lesson ideas based on history teaching standards.

The user has provided a teaching standard that has been cleaned and processed. Key historical topics extracted from the standard include: ${topics.join(', ')}

Create topic-specific activities that reference actual historical sources, documents, and evidence related to these topics. Instead of generic activities like "primary source analysis," provide specific examples like "analysis of Confucian Analects and Han dynasty administrative records" or "comparative study of Roman legal codes and Greek philosophical texts."

Return your response as a JSON object with a "lessons" array containing 3-4 lesson ideas. Each lesson should follow this exact structure:

{
  "lessons": [
    {
      "title": "Lesson title",
      "description": "Brief description mentioning specific topics: ${topics.slice(0, 3).join(', ')}",
      "objectives": ["Learning objective 1", "Learning objective 2"],
      "activities": ["Specific activity with actual historical sources", "Another specific activity"],
      "assessmentIdeas": ["Assessment idea 1", "Assessment idea 2"],
      "timeEstimate": "Duration estimate",
      "gradeLevel": "Grade level range",
      "resources": [
        {
          "title": "Resource title",
          "url": "https://example.com",
          "type": "article",
          "description": "Brief description"
        }
      ],
      "primarySources": [
        {
          "title": "Specific document title",
          "author": "Author name",
          "date": "Date or time period",
          "excerpt": "Relevant excerpt from the actual document",
          "context": "Historical context explanation"
        }
      ],
      "multimedia": [
        {
          "title": "Media title",
          "url": "https://example.com",
          "type": "image",
          "description": "Description of the media"
        }
      ]
    }
  ]
}

IMPORTANT: 
- Reference specific historical documents, texts, and sources in activities
- Use the extracted topics to create targeted, specific lesson content
- Return ONLY valid JSON
- Use only these types for resources: "article", "video", "interactive", "document"
- Use only these types for multimedia: "image", "video", "audio", "map"`
            },
            {
              role: "user",
              content: `Generate lesson ideas for this cleaned history teaching standard: ${cleaned}

Key topics to focus on: ${topics.join(', ')}

Please create specific activities that reference actual historical sources and documents related to these topics.`
            }
          ],
          temperature: 0.7,
          max_tokens: 4000
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        log.error(`OpenAI API error: ${response.status} - ${errorText}`);
        return { 
          lessons: createFallbackLessons(cleaned, topics),
          cleanedStandard: cleaned,
          extractedTopics: topics
        };
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        log.error("Invalid response structure from OpenAI API");
        return { 
          lessons: createFallbackLessons(cleaned, topics),
          cleanedStandard: cleaned,
          extractedTopics: topics
        };
      }

      const content = data.choices[0].message.content;
      
      if (!content) {
        log.error("Empty response from OpenAI API");
        return { 
          lessons: createFallbackLessons(cleaned, topics),
          cleanedStandard: cleaned,
          extractedTopics: topics
        };
      }

      try {
        log.info("Parsing OpenAI response");
        const parsedContent = JSON.parse(content);
        
        // Validate the response structure
        if (!parsedContent.lessons || !Array.isArray(parsedContent.lessons)) {
          log.error("Invalid response structure: missing lessons array");
          return { 
            lessons: createFallbackLessons(cleaned, topics),
            cleanedStandard: cleaned,
            extractedTopics: topics
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
          extractedTopics: topics
        };
        
      } catch (parseError) {
        log.error("JSON parsing error:", parseError);
        log.error("Content that failed to parse:", content);
        return { 
          lessons: createFallbackLessons(cleaned, topics),
          cleanedStandard: cleaned,
          extractedTopics: topics
        };
      }
    } catch (error) {
      log.error("Error in lesson generation:", error);
      return { 
        lessons: createFallbackLessons(cleaned, topics),
        cleanedStandard: cleaned,
        extractedTopics: topics
      };
    }
  }
);
