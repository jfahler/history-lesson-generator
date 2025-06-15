import { api } from "encore.dev/api";
import { secret } from "encore.dev/config";

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

// Generates lesson ideas based on a history teaching standard.
export const generate = api<GenerateLessonRequest, GenerateLessonResponse>(
  { expose: true, method: "POST", path: "/lesson/generate" },
  async (req) => {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openAIKey()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: `You are an expert history teacher and curriculum designer. Generate comprehensive lesson ideas based on history teaching standards. For each lesson, provide:

1. Clear learning objectives aligned with the standard
2. Engaging activities and teaching strategies
3. Assessment ideas
4. Realistic time estimates
5. Appropriate grade level
6. Relevant resources with actual URLs when possible
7. Primary source excerpts with proper attribution
8. Multimedia resources

Focus on creating diverse, engaging lessons that help students understand historical concepts, develop critical thinking skills, and connect past events to present-day issues.

Return your response as a JSON object with a "lessons" array containing 3-5 lesson ideas. Each lesson should follow this structure:
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
      "type": "article|video|interactive|document",
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
      "type": "image|video|audio|map",
      "description": "Description of the media"
    }
  ]
}`
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
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      try {
        const parsedContent = JSON.parse(content);
        return parsedContent;
      } catch (parseError) {
        // If JSON parsing fails, return a fallback response
        return {
          lessons: [
            {
              title: "Exploring the Standard",
              description: "A comprehensive lesson exploring the historical concepts in the provided standard.",
              objectives: [
                "Students will understand the key historical concepts in the standard",
                "Students will analyze primary sources related to the topic",
                "Students will connect historical events to modern contexts"
              ],
              activities: [
                "Document analysis activity",
                "Timeline creation",
                "Group discussion and debate",
                "Creative presentation project"
              ],
              assessmentIdeas: [
                "Written analysis of primary sources",
                "Timeline accuracy and detail assessment",
                "Participation in class discussions",
                "Quality of final presentation"
              ],
              timeEstimate: "2-3 class periods",
              gradeLevel: "9-12",
              resources: [
                {
                  title: "Library of Congress Teaching Materials",
                  url: "https://www.loc.gov/programs/teachers/",
                  type: "document" as const,
                  description: "Comprehensive collection of primary sources and teaching materials"
                },
                {
                  title: "National Archives Education Resources",
                  url: "https://www.archives.gov/education",
                  type: "document" as const,
                  description: "Primary documents and lesson plans from the National Archives"
                }
              ],
              primarySources: [
                {
                  title: "Historical Document",
                  author: "Various",
                  date: "Historical period relevant to standard",
                  excerpt: "Relevant excerpt would be provided based on the specific standard",
                  context: "Historical context explanation would be tailored to the standard"
                }
              ],
              multimedia: [
                {
                  title: "Educational Video Resource",
                  url: "https://www.youtube.com/education",
                  type: "video" as const,
                  description: "Educational videos related to the historical topic"
                }
              ]
            }
          ]
        };
      }
    } catch (error) {
      console.error("Error generating lesson ideas:", error);
      throw new Error("Failed to generate lesson ideas. Please try again.");
    }
  }
);
