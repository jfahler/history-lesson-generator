import { useState } from "react";
import { LessonGenerator } from "./components/LessonGenerator";
import { LessonResults } from "./components/LessonResults";
import type { LessonIdea } from "~backend/lesson/generate";

export default function App() {
  const [lessons, setLessons] = useState<LessonIdea[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [originalStandard, setOriginalStandard] = useState("");
  const [cleanedStandard, setCleanedStandard] = useState("");
  const [extractedTopics, setExtractedTopics] = useState<string[]>([]);

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
  };

  const handleLoadingChange = (loading: boolean) => {
    setIsLoading(loading);
  };

  const handleBackToSearch = () => {
    setShowResults(false);
    setLessons([]);
    setOriginalStandard("");
    setCleanedStandard("");
    setExtractedTopics([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bella font-normal text-gray-900 mb-4 tracking-wide">
            History Lesson Generator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Enter a world history teaching standard and get comprehensive lesson ideas 
            with resources, primary sources, and multimedia content.
          </p>
        </header>

        <div className="max-w-7xl mx-auto">
          {!showResults ? (
            <LessonGenerator 
              onLessonsGenerated={handleLessonsGenerated}
              onLoadingChange={handleLoadingChange}
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
          
          {isLoading && (
            <div className="text-center py-8">
              <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-indigo-500 hover:bg-indigo-400 transition ease-in-out duration-150 cursor-not-allowed">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating lesson ideas...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
