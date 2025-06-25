import { useState, Suspense, lazy } from "react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { LoadingSpinner } from "./components/LoadingSpinner";
import type { LessonIdea } from "~backend/lesson/generate";

// Lazy load heavy components
const LessonGenerator = lazy(() => import("./components/LessonGenerator").then(module => ({ default: module.LessonGenerator })));
const LessonResults = lazy(() => import("./components/LessonResults").then(module => ({ default: module.LessonResults })));

export default function App() {
  const [lessons, setLessons] = useState<LessonIdea[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [originalStandard, setOriginalStandard] = useState("");
  const [cleanedStandard, setCleanedStandard] = useState("");
  const [extractedTopics, setExtractedTopics] = useState<string[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("");

  const handleLessonsGenerated = (
    newLessons: LessonIdea[], 
    standard: string, 
    cleaned: string, 
    topics: string[]
  ) => {
    setLessons(newLessons);
    setOriginalStandard(standard);
    setCleanedStandard(cleaned);
    setExtractedTopics(topics);
    setShowResults(true);
    setLoadingProgress(0);
    setLoadingMessage("");
  };

  const handleLoadingChange = (loading: boolean, progress?: number, message?: string) => {
    setIsLoading(loading);
    if (progress !== undefined) {
      setLoadingProgress(progress);
    }
    if (message !== undefined) {
      setLoadingMessage(message);
    }
  };

  const handleBackToSearch = () => {
    setShowResults(false);
    setLessons([]);
    setOriginalStandard("");
    setCleanedStandard("");
    setExtractedTopics([]);
    setLoadingProgress(0);
    setLoadingMessage("");
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bree-serif font-normal text-gray-900 mb-4 tracking-wide">
              History Lesson Generator
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Enter a world history teaching standard and get comprehensive lesson ideas 
              with resources, primary sources, and multimedia content.
            </p>
          </header>

          <div className="max-w-7xl mx-auto">
            <Suspense fallback={<LoadingSpinner message="Loading application..." />}>
              {!showResults ? (
                <LessonGenerator 
                  onLessonsGenerated={handleLessonsGenerated}
                  onLoadingChange={handleLoadingChange}
                  isLoading={isLoading}
                  loadingProgress={loadingProgress}
                  loadingMessage={loadingMessage}
                />
              ) : (
                <LessonResults 
                  lessons={lessons} 
                  originalStandard={originalStandard}
                  cleanedStandard={cleanedStandard}
                  extractedTopics={extractedTopics}
                  onBackToSearch={handleBackToSearch}
                />
              )}
            </Suspense>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
