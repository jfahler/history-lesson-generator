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
}

function createFallbackLessons(standard: string): LessonIdea[] {
  return [
    {
      title: "Exploring Historical Context",
      description: `A comprehensive lesson exploring the historical concepts in the provided standard: "${standard.substring(0, 100)}${standard.length > 100 ? '...' : ''}"`,
      objectives: [
        "Students will understand the key historical concepts in the standard",
        "Students will analyze primary sources related to the topic",
        "Students will connect historical events to modern contexts",
        "Students will develop critical thinking skills through document analysis"
      ],
      activities: [
        "Primary source document analysis in small groups",
        "Timeline creation activity showing cause and effect",
        "Socratic seminar discussion on historical significance",
        "Creative presentation project connecting past to present"
      ],
      assessmentIdeas: [
        "Written analysis of primary sources with historical context",
        "Timeline accuracy and detail assessment rubric",
        "Participation in class discussions and debates",
        "Quality and creativity of final presentation project"
      ],
      timeEstimate: "2-3 class periods",
      gradeLevel: "9-12",
      resources: [
        {
          title: "Library of Congress Teaching Materials",
          url: "https://www.loc.gov/programs/teachers/",
          type: "document",
          description: "Comprehensive collection of primary sources and teaching materials from the Library of Congress"
        },
        {
          title: "National Archives Education Resources",
          url: "https://www.archives.gov/education",
          type: "document",
          description: "Primary documents and lesson plans from the National Archives"
        },
        {
          title: "Stanford History Education Group",
          url: "https://sheg.stanford.edu/",
          type: "interactive",
          description: "Research-based curriculum and assessments for history education"
        }
      ],
      primarySources: [
        {
          title: "Historical Document Analysis",
          author: "Various Historical Figures",
          date: "Time period relevant to standard",
          excerpt: "Primary source excerpts would be selected based on the specific teaching standard provided, offering students authentic historical perspectives and voices from the time period being studied.",
          context: "Historical context would be provided to help students understand the circumstances, motivations, and significance of the primary source within its historical setting."
        }
      ],
      multimedia: [
        {
          title: "Educational Video Content",
          url: "https://www.youtube.com/education",
          type: "video",
          description: "Curated educational videos that provide visual context and expert analysis of historical topics"
        },
        {
          title: "Interactive Historical Maps",
          url: "https://www.worldhistoryatlas.com/",
          type: "map",
          description: "Interactive maps showing geographical changes and historical developments over time"
        }
      ]
    },
    {
      title: "Comparative Historical Analysis",
      description: "Students compare different historical perspectives and analyze multiple viewpoints on the same historical events or concepts.",
      objectives: [
        "Students will compare and contrast different historical perspectives",
        "Students will evaluate the reliability and bias of historical sources",
        "Students will synthesize information from multiple sources",
        "Students will develop argumentation skills based on historical evidence"
      ],
      activities: [
        "Comparative document analysis using opposing viewpoints",
        "Role-playing activity representing different historical perspectives",
        "Evidence-based debate on historical controversies",
        "Research project using multiple primary and secondary sources"
      ],
      assessmentIdeas: [
        "Comparative essay analyzing different historical perspectives",
        "Evaluation of source reliability and bias worksheet",
        "Debate performance rubric focusing on use of evidence",
        "Research project with annotated bibliography"
      ],
      timeEstimate: "3-4 class periods",
      gradeLevel: "10-12",
      resources: [
        {
          title: "Gilder Lehrman Institute",
          url: "https://www.gilderlehrman.org/",
          type: "article",
          description: "Historical articles and primary sources with multiple perspectives"
        },
        {
          title: "Facing History and Ourselves",
          url: "https://www.facinghistory.org/",
          type: "interactive",
          description: "Resources for teaching about historical decision-making and moral choices"
        }
      ],
      primarySources: [
        {
          title: "Multiple Perspective Documents",
          author: "Various Contemporary Sources",
          date: "Historical period of study",
          excerpt: "Students would examine multiple primary sources representing different viewpoints, social classes, or cultural perspectives on the same historical events or issues.",
          context: "These sources would be selected to show how different groups experienced and interpreted the same historical events, helping students understand the complexity of historical narratives."
        }
      ],
      multimedia: [
        {
          title: "Documentary Film Clips",
          url: "https://www.pbs.org/education/",
          type: "video",
          description: "Short documentary segments that present different interpretations of historical events"
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

    const apiKey = openAIKey();
    if (!apiKey) {
      log.error("OpenAI API key not configured");
      // Return fallback lessons instead of throwing an error
      return { lessons: createFallbackLessons(req.standard) };
    }

    try {
      log.info("Making request to OpenAI API");
      
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

Return your response as a JSON object with a "lessons" array containing 3-4 lesson ideas. Each lesson should follow this exact structure:

{
  "lessons": [
    {
      "title": "Lesson title",
      "description": "Brief description of the lesson",
      "objectives": ["Learning objective 1", "Learning objective 2"],
      "activities": ["Activity 1", "Activity 2"],
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
          "title": "Document title",
          "author": "Author name",
          "date": "Date or time period",
          "excerpt": "Relevant excerpt from the document",
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

IMPORTANT: Return ONLY valid JSON. Do not include any text before or after the JSON object. Use only these types for resources: "article", "video", "interactive", "document". Use only these types for multimedia: "image", "video", "audio", "map".`
            },
            {
              role: "user",
              content: `Generate lesson ideas for this history teaching standard: ${req.standard}`
            }
          ],
          temperature: 0.7,
          max_tokens: 4000
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        log.error(`OpenAI API error: ${response.status} - ${errorText}`);
        // Return fallback lessons instead of throwing an error
        return { lessons: createFallbackLessons(req.standard) };
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        log.error("Invalid response structure from OpenAI API");
        return { lessons: createFallbackLessons(req.standard) };
      }

      const content = data.choices[0].message.content;
      
      if (!content) {
        log.error("Empty response from OpenAI API");
        return { lessons: createFallbackLessons(req.standard) };
      }

      try {
        log.info("Parsing OpenAI response");
        const parsedContent = JSON.parse(content);
        
        // Validate the response structure
        if (!parsedContent.lessons || !Array.isArray(parsedContent.lessons)) {
          log.error("Invalid response structure: missing lessons array");
          return { lessons: createFallbackLessons(req.standard) };
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
        return { lessons: validatedLessons };
        
      } catch (parseError) {
        log.error("JSON parsing error:", parseError);
        log.error("Content that failed to parse:", content);
        return { lessons: createFallbackLessons(req.standard) };
      }
    } catch (error) {
      log.error("Error in lesson generation:", error);
      return { lessons: createFallbackLessons(req.standard) };
    }
  }
);
