import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BookOpen, Info, Lightbulb, AlertCircle, Wifi, Clock, Zap, CheckCircle2, Timer } from "lucide-react";
import backend from "~backend/client";
import type { LessonIdea } from "~backend/lesson/generate";

interface LessonGeneratorProps {
  onLessonsGenerated: (lessons: LessonIdea[], standard: string, cleaned: string, topics: string[]) => void;
  onLoadingChange: (loading: boolean, progress?: number, message?: string) => void;
  isLoading: boolean;
  loadingProgress: number;
  loadingMessage: string;
}

interface ErrorState {
  message: string;
  type: 'validation' | 'network' | 'api' | 'timeout' | 'rate-limit' | 'server' | 'unknown';
  retryable: boolean;
  suggestedAction?: string;
  retryAfter?: number;
}

export function LessonGenerator({ 
  onLessonsGenerated, 
  onLoadingChange, 
  isLoading, 
  loadingProgress, 
  loadingMessage 
}: LessonGeneratorProps) {
  const [standard, setStandard] = useState("");
  const [error, setError] = useState<ErrorState | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [retryCountdown, setRetryCountdown] = useState(0);

  const getErrorIcon = (type: string) => {
    switch (type) {
      case 'network':
        return <Wifi className="h-4 w-4" />;
      case 'timeout':
        return <Clock className="h-4 w-4" />;
      case 'rate-limit':
        return <Timer className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getErrorColor = (type: string) => {
    switch (type) {
      case 'validation':
        return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      case 'network':
      case 'timeout':
        return 'border-orange-200 bg-orange-50 text-orange-800';
      case 'rate-limit':
        return 'border-purple-200 bg-purple-50 text-purple-800';
      case 'server':
        return 'border-red-200 bg-red-50 text-red-800';
      default:
        return 'border-red-200 bg-red-50 text-red-800';
    }
  };

  const parseError = (err: any): ErrorState => {
    console.error("Error generating lessons:", err);

    // Handle validation errors
    if (err.message?.includes("Teaching standard is required") || 
        err.message?.includes("cannot be empty") ||
        err.message?.includes("too short") ||
        err.message?.includes("too long") ||
        err.message?.includes("invalid content")) {
      return {
        message: err.message,
        type: 'validation',
        retryable: false,
        suggestedAction: "Please check your input and try again."
      };
    }

    // Handle network errors
    if (err.message?.includes("Network error") || 
        err.message?.includes("fetch") ||
        err.name === 'TypeError') {
      return {
        message: "Unable to connect to the service. Please check your internet connection.",
        type: 'network',
        retryable: true,
        suggestedAction: "Check your internet connection and try again."
      };
    }

    // Handle timeout errors
    if (err.message?.includes("timeout") || 
        err.message?.includes("timed out") ||
        err.name === 'AbortError') {
      return {
        message: "The request took too long to complete. This may be due to a complex standard or high server load.",
        type: 'timeout',
        retryable: true,
        suggestedAction: "Try again with a shorter standard or wait a moment before retrying."
      };
    }

    // Handle rate limiting with enhanced messaging
    if (err.message?.includes("rate limit") || 
        err.message?.includes("Too Many Requests") ||
        err.message?.includes("resource_exhausted")) {
      const retryAfter = err.details?.retryAfter || 180; // Default to 3 minutes
      return {
        message: "The AI service is currently experiencing high demand. Please wait a few minutes before trying again.",
        type: 'rate-limit',
        retryable: true,
        retryAfter: retryAfter,
        suggestedAction: `Wait ${Math.ceil(retryAfter / 60)} minutes before trying again. You can also try shortening your teaching standard to reduce processing time.`
      };
    }

    // Handle API configuration errors
    if (err.message?.includes("API key not configured") ||
        err.message?.includes("authentication failed")) {
      return {
        message: "The AI service is not properly configured. Please contact support.",
        type: 'server',
        retryable: false,
        suggestedAction: "Contact support for assistance."
      };
    }

    // Handle server errors
    if (err.message?.includes("temporarily unavailable") ||
        err.message?.includes("service error") ||
        err.message?.includes("internal server error")) {
      return {
        message: "The service is temporarily unavailable. Please try again in a few minutes.",
        type: 'server',
        retryable: true,
        suggestedAction: "Wait a few minutes and try again."
      };
    }

    // Handle permission errors
    if (err.message?.includes("permission denied") ||
        err.message?.includes("access denied")) {
      return {
        message: "Access to the AI service is restricted. Please contact support.",
        type: 'server',
        retryable: false,
        suggestedAction: "Contact support for assistance."
      };
    }

    // Handle JSON parsing errors
    if (err.message?.includes("parse") || err.message?.includes("JSON")) {
      return {
        message: "Received an invalid response from the service. Please try again.",
        type: 'server',
        retryable: true,
        suggestedAction: "Try again in a moment."
      };
    }

    // Generic error
    return {
      message: "An unexpected error occurred. Please try again or contact support if the issue persists.",
      type: 'unknown',
      retryable: true,
      suggestedAction: "Try again or contact support if the problem continues."
    };
  };

  const simulateProgress = () => {
    const steps = [
      { progress: 10, message: "Analyzing teaching standard..." },
      { progress: 25, message: "Extracting key topics and concepts..." },
      { progress: 40, message: "Detecting grade level and requirements..." },
      { progress: 55, message: "Generating lesson ideas with AI..." },
      { progress: 70, message: "Creating suggested activities..." },
      { progress: 85, message: "Finding relevant resources..." },
      { progress: 95, message: "Finalizing lesson plans..." }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        const step = steps[currentStep];
        onLoadingChange(true, step.progress, step.message);
        currentStep++;
      } else {
        clearInterval(interval);
      }
    }, 800);

    return interval;
  };

  const startRetryCountdown = (seconds: number) => {
    setRetryCountdown(seconds);
    const interval = setInterval(() => {
      setRetryCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!standard.trim()) {
      setError({
        message: "Please enter a teaching standard",
        type: 'validation',
        retryable: false
      });
      return;
    }

    setError(null);
    setRetryCountdown(0);
    onLoadingChange(true, 0, "Starting lesson generation...");
    
    const progressInterval = simulateProgress();

    try {
      const response = await backend.lesson.generate({ standard: standard.trim() });
      
      clearInterval(progressInterval);
      onLoadingChange(true, 100, "Complete!");
      
      // Brief delay to show completion
      setTimeout(() => {
        if (response && response.lessons && Array.isArray(response.lessons)) {
          onLessonsGenerated(
            response.lessons, 
            standard.trim(), 
            response.cleanedStandard || standard.trim(),
            response.extractedTopics || []
          );
          setRetryCount(0);
        } else {
          console.error("Invalid response structure:", response);
          setError({
            message: "Received invalid response from server. Please try again.",
            type: 'server',
            retryable: true,
            suggestedAction: "Try again in a moment."
          });
          onLoadingChange(false);
        }
      }, 500);
    } catch (err) {
      clearInterval(progressInterval);
      const errorState = parseError(err);
      setError(errorState);
      onLoadingChange(false);
      
      if (errorState.retryable) {
        setRetryCount(prev => prev + 1);
        
        // Start countdown for rate limit errors
        if (errorState.type === 'rate-limit' && errorState.retryAfter) {
          startRetryCountdown(errorState.retryAfter);
        }
      }
    }
  };

  const handleRetry = () => {
    setError(null);
    handleSubmit(new Event('submit') as any);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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
                disabled={isLoading}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{standard.length} characters</span>
                <span>Minimum: 10 characters, Maximum: 5000 characters</span>
              </div>
            </div>
            
            {error && (
              <Alert className={`${getErrorColor(error.type)} border`}>
                <div className="flex items-start gap-2">
                  {getErrorIcon(error.type)}
                  <div className="flex-1">
                    <AlertDescription className="font-medium mb-1">
                      {error.message}
                    </AlertDescription>
                    {error.suggestedAction && (
                      <AlertDescription className="text-sm opacity-90">
                        {error.suggestedAction}
                      </AlertDescription>
                    )}
                    {error.retryable && retryCount > 0 && (
                      <AlertDescription className="text-sm opacity-90 mt-2">
                        Attempt {retryCount + 1} - If this continues, try a shorter standard or contact support.
                      </AlertDescription>
                    )}
                    {retryCountdown > 0 && (
                      <AlertDescription className="text-sm opacity-90 mt-2 flex items-center gap-1">
                        <Timer className="h-3 w-3" />
                        Please wait {formatTime(retryCountdown)} before retrying
                      </AlertDescription>
                    )}
                  </div>
                  {error.retryable && retryCountdown === 0 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleRetry}
                      disabled={isLoading}
                      className="ml-2"
                    >
                      Retry
                    </Button>
                  )}
                </div>
              </Alert>
            )}

            {isLoading && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-500 border-t-transparent"></div>
                  <span>{loadingMessage || "Processing..."}</span>
                </div>
                <Progress value={loadingProgress} className="w-full" />
                <div className="text-xs text-gray-500 text-center">
                  {loadingProgress === 100 ? (
                    <span className="flex items-center justify-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      Generation complete!
                    </span>
                  ) : (
                    `${loadingProgress}% complete - This usually takes 10-30 seconds`
                  )}
                </div>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              size="lg" 
              disabled={isLoading || !standard.trim() || retryCountdown > 0}
            >
              {isLoading ? "Generating..." : retryCountdown > 0 ? `Wait ${formatTime(retryCountdown)}` : "Generate Lesson Ideas"}
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
            <div className="flex items-start gap-3">
              <Timer className="h-4 w-4 mt-1 text-purple-500" />
              <div>
                <p className="font-medium text-gray-900">High Demand Notice</p>
                <p className="text-sm text-gray-600">Due to high usage, you may experience brief delays. Shorter, more focused standards process faster and are less likely to encounter rate limits.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
