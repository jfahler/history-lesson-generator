import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import backend from "~backend/client";
import type { LessonIdea } from "~backend/lesson/generate";

interface LessonGeneratorProps {
  onLessonsGenerated: (lessons: LessonIdea[]) => void;
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
        onLessonsGenerated(response.lessons);
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
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Enter Teaching Standard
        </CardTitle>
        <CardDescription>
          Provide a world history teaching standard from College Board CED or K-12 state standards
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Textarea
              placeholder="Example: Students will analyze the causes and effects of the Industrial Revolution in Europe and its global impact from 1750-1900..."
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
  );
}
