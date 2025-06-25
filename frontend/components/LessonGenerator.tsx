import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Info, Lightbulb } from "lucide-react";
import backend from "~backend/client";
import type { LessonIdea } from "~backend/lesson/generate";

interface LessonGeneratorProps {
  onLessonsGenerated: (lessons: LessonIdea[], standard: string, cleaned: string, topics: string[]) => void;
  onLoadingChange: (loading: boolean) => void;
}

export function LessonGenerator({ onLessonsGenerated, onLoadingChange }: LessonGeneratorProps) {
  const [standard, setStandard] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!standard.trim()) {
      setError("Please enter a teaching standard");
      return;
    }

    setError("");
    onLoadingChange(true);

    try {
      const response = await backend.lesson.generate({ standard: standard.trim() });
      
      if (response && response.lessons && Array.isArray(response.lessons)) {
        onLessonsGenerated(
          response.lessons, 
          standard.trim(), 
          response.cleanedStandard || standard.trim(),
          response.extractedTopics || []
        );
      } else {
        console.error("Invalid response structure:", response);
        setError("Received invalid response from server. Please try again.");
      }
    } catch (err) {
      console.error("Error generating lessons:", err);
      
      let errorMessage = "Failed to generate lesson ideas. Please try again.";
      
      if (err instanceof Error) {
        if (err.message.includes("OpenAI API key not configured")) {
          errorMessage = "The OpenAI API key is not configured. Please contact the administrator.";
        } else if (err.message.includes("OpenAI API error")) {
          errorMessage = "There was an issue with the AI service. Please try again in a moment.";
        } else if (err.message.includes("Teaching standard is required")) {
          errorMessage = "Please enter a valid teaching standard.";
        } else if (err.message.includes("internal")) {
          errorMessage = "An internal server error occurred. Please try again or contact support if the issue persists.";
        }
      }
      
      setError(errorMessage);
    } finally {
      onLoadingChange(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Input Card */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Enter Teaching Standard
          </CardTitle>
          <CardDescription>
            Provide a world history teaching standard from College Board CED or K-12 state standards. 
            The system will automatically clean up duplicates and extract key topics for targeted lesson generation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Textarea
                placeholder="Example: History. The student understands the contributions and influence of classical civilizations from 500 BC to AD 600 on subsequent civilizations. The student is expected to: (3)(A) describe the major political, religious/philosophical, and cultural influences of Persia, India, China, Israel, Greece, and Rome..."
                value={standard}
                onChange={(e) => setStandard(e.target.value)}
                className="min-h-[120px] resize-none"
              />
            </div>
            
            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-200">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" size="lg">
              Generate Lesson Ideas
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Tips Card */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Tips for Better Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Info className="h-4 w-4 mt-1 text-blue-500" />
              <div>
                <p className="font-medium text-gray-900">Be Specific About Your Topic</p>
                <p className="text-sm text-gray-600">Mention specific civilizations, empires, time periods, or historical events (e.g., "Mongol Empire," "Renaissance Italy," "Industrial Revolution").</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Info className="h-4 w-4 mt-1 text-blue-500" />
              <div>
                <p className="font-medium text-gray-900">Include Key Historical Concepts</p>
                <p className="text-sm text-gray-600">Reference themes like trade, religion, politics, culture, war, or technological developments for richer lesson content.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Info className="h-4 w-4 mt-1 text-blue-500" />
              <div>
                <p className="font-medium text-gray-900">Mention Time Periods</p>
                <p className="text-sm text-gray-600">Include specific dates, centuries, or historical periods to help target relevant primary sources and resources.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Info className="h-4 w-4 mt-1 text-blue-500" />
              <div>
                <p className="font-medium text-gray-900">Focus on Learning Objectives</p>
                <p className="text-sm text-gray-600">Include the specific skills students should demonstrate (analyze, compare, evaluate, etc.) for better-targeted activities.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
