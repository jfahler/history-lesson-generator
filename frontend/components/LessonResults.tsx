import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowLeft, Clock, Users, Target, ExternalLink, FileText, Image, Video, Map, Volume2, MapPin, Globe, Hash, Sparkles, BookOpen, Activity, Award, Info, Gamepad2, Brain, Puzzle, Search, Zap, Eye, Users2, Pen, MessageSquare, Star } from "lucide-react";
import { useState, Suspense } from "react";
import { LoadingSpinner } from "./LoadingSpinner";
import type { LessonIdea, SuggestedActivity } from "~backend/lesson/generate";

interface LessonResultsProps {
  lessons: LessonIdea[];
  originalStandard: string;
  cleanedStandard: string;
  extractedTopics: string[];
  onBackToSearch: () => void;
}

export function LessonResults({ lessons, originalStandard, cleanedStandard, extractedTopics, onBackToSearch }: LessonResultsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'lessons' | 'resources'>('overview');

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "video": return <Video className="h-4 w-4" />;
      case "document": return <FileText className="h-4 w-4" />;
      case "interactive": return <Target className="h-4 w-4" />;
      default: return <ExternalLink className="h-4 w-4" />;
    }
  };

  const getMultimediaIcon = (type: string) => {
    switch (type) {
      case "image": return <Image className="h-4 w-4" />;
      case "video": return <Video className="h-4 w-4" />;
      case "audio": return <Volume2 className="h-4 w-4" />;
      case "map": return <Map className="h-4 w-4" />;
      default: return <Image className="h-4 w-4" />;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "timeline": return <Clock className="h-4 w-4" />;
      case "mindmap": return <Brain className="h-4 w-4" />;
      case "crossword": return <Puzzle className="h-4 w-4" />;
      case "wordsearch": return <Search className="h-4 w-4" />;
      case "flashcards": return <Zap className="h-4 w-4" />;
      case "bingo": return <Gamepad2 className="h-4 w-4" />;
      case "webquest": return <Globe className="h-4 w-4" />;
      case "comparison": return <Eye className="h-4 w-4" />;
      case "videoquiz": return <Video className="h-4 w-4" />;
      case "worksheet": return <FileText className="h-4 w-4" />;
      case "spinner": return <Gamepad2 className="h-4 w-4" />;
      case "memory": return <Brain className="h-4 w-4" />;
      case "jigsaw": return <Puzzle className="h-4 w-4" />;
      case "quiz": return <Target className="h-4 w-4" />;
      case "research": return <Search className="h-4 w-4" />;
      case "comic": return <Image className="h-4 w-4" />;
      case "discussion": return <MessageSquare className="h-4 w-4" />;
      case "cardgame": return <Gamepad2 className="h-4 w-4" />;
      case "roleplay": return <Users2 className="h-4 w-4" />;
      case "scavenger": return <Search className="h-4 w-4" />;
      case "cartoon": return <Image className="h-4 w-4" />;
      case "writing": return <Pen className="h-4 w-4" />;
      case "vocabulary": return <BookOpen className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  // Create search queries using the search context (extracted topics joined)
  const createSearchQuery = (topics: string[], maxLength: number = 100) => {
    return topics.join(' ').substring(0, maxLength);
  };

  const searchQuery = createSearchQuery(extractedTopics);

  // Get detected grade level from first lesson
  const detectedGradeLevel = lessons.length > 0 ? lessons[0].detectedGradeRange : "High School (9-12)";

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Standards Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Teaching Standard Analysis
          </CardTitle>
          <CardDescription>
            Your standard has been processed and enhanced with targeted resources for {detectedGradeLevel}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Cleaned Standard</h4>
            <p className="text-gray-700 leading-relaxed bg-blue-50 p-4 rounded-lg border border-blue-200">
              {cleanedStandard}
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Detected Grade Level
            </h4>
            <Badge variant="secondary" className="text-sm">
              {detectedGradeLevel}
            </Badge>
            <p className="text-sm text-gray-600 mt-2">
              All activities and assessments have been tailored for this grade level.
            </p>
          </div>

          {extractedTopics.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Search Context
              </h4>
              <div className="flex flex-wrap gap-2">
                {extractedTopics.map((topic, idx) => (
                  <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {topic}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                These terms will be used to search for relevant historical resources and primary sources.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{lessons.length}</p>
                <p className="text-sm text-gray-600">Lesson Ideas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Activity className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{lessons.reduce((acc, lesson) => acc + lesson.activities.length, 0)}</p>
                <p className="text-sm text-gray-600">Activities</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Award className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{lessons.reduce((acc, lesson) => acc + lesson.assessmentIdeas.length, 0)}</p>
                <p className="text-sm text-gray-600">Assessments</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lesson Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Lesson Ideas Preview
          </CardTitle>
          <CardDescription>
            Click on "Lesson Plans" to see detailed lesson plans with suggested activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {lessons.slice(0, 2).map((lesson, index) => (
              <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <h4 className="font-semibold text-gray-900 mb-2">{lesson.title}</h4>
                <p className="text-sm text-gray-600 mb-3">{lesson.description}</p>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {lesson.timeEstimate}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {lesson.detectedGradeRange}
                  </Badge>
                  {lesson.suggestedActivities && lesson.suggestedActivities.length > 0 && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Gamepad2 className="h-3 w-3" />
                      {lesson.suggestedActivities.length} Smart Activities
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderLessons = () => (
    <div className="space-y-6">
      {lessons.map((lesson, index) => (
        <Card key={index} className="border-2 border-blue-100">
          <CardHeader>
            <CardTitle className="text-xl text-blue-900">{lesson.title}</CardTitle>
            <CardDescription className="text-base">{lesson.description}</CardDescription>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {lesson.timeEstimate}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {lesson.detectedGradeRange}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Learning Objectives */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Learning Objectives
              </h4>
              <ul className="space-y-2">
                {lesson.objectives.map((objective, idx) => (
                  <li key={idx} className="text-gray-700 flex items-start gap-2 p-3 bg-blue-50 rounded border border-blue-200">
                    <span className="text-blue-500 mt-1 text-sm">•</span>
                    <span className="text-sm">{objective}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Suggested Activities */}
            {lesson.suggestedActivities && lesson.suggestedActivities.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Gamepad2 className="h-4 w-4" />
                  Smart Activity Suggestions
                </h4>
                <TooltipProvider>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {lesson.suggestedActivities.map((activity, idx) => (
                      <Tooltip key={idx}>
                        <TooltipTrigger asChild>
                          <div className="border rounded-lg p-3 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 hover:shadow-md transition-shadow cursor-help">
                            <div className="flex items-center gap-2 mb-2">
                              {getActivityIcon(activity.type)}
                              <h5 className="font-medium text-gray-900">{activity.name}</h5>
                              <Info className="h-3 w-3 text-gray-400" />
                            </div>
                            <p className="text-sm text-gray-600">{activity.description}</p>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-sm"><strong>Pedagogical Benefit:</strong> {activity.pedagogicalBenefit}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </TooltipProvider>
              </div>
            )}

            {/* Activities */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Detailed Activities
              </h4>
              <ul className="space-y-3">
                {lesson.activities.map((activity, idx) => (
                  <li key={idx} className="text-gray-700 flex items-start gap-2 p-4 bg-green-50 rounded border border-green-200">
                    <span className="text-green-500 mt-1 text-sm font-bold">{idx + 1}.</span>
                    <span className="text-sm">{activity}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Assessment Ideas */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Award className="h-4 w-4" />
                Assessment Ideas
              </h4>
              <ul className="space-y-2">
                {lesson.assessmentIdeas.map((assessment, idx) => (
                  <li key={idx} className="text-gray-700 flex items-start gap-2 p-3 bg-purple-50 rounded border border-purple-200">
                    <span className="text-purple-500 mt-1 text-sm">•</span>
                    <span className="text-sm">{assessment}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Primary Sources */}
            {lesson.primarySources.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Primary Sources
                </h4>
                <div className="space-y-3">
                  {lesson.primarySources.map((source, idx) => (
                    <div key={idx} className="border rounded-lg p-4 bg-amber-50 border-amber-200">
                      <div className="mb-2">
                        <h5 className="font-medium text-gray-900">{source.title}</h5>
                        <p className="text-sm text-gray-600">
                          by {source.author} ({source.date})
                        </p>
                      </div>
                      <blockquote className="border-l-4 border-amber-400 pl-4 italic text-gray-700 mb-3 text-sm">
                        "{source.excerpt}"
                      </blockquote>
                      <p className="text-sm text-gray-600">
                        <strong>Context:</strong> {source.context}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderResources = () => (
    <Suspense fallback={<LoadingSpinner message="Loading resources..." />}>
      <ResourcesSection 
        extractedTopics={extractedTopics}
        detectedGradeLevel={detectedGradeLevel}
        searchQuery={searchQuery}
        lessons={lessons}
        getResourceIcon={getResourceIcon}
        getMultimediaIcon={getMultimediaIcon}
      />
    </Suspense>
  );

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center justify-between mb-6">
        <Button 
          onClick={onBackToSearch}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Search for another topic
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <Button
          variant={activeTab === 'overview' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('overview')}
          className="flex-1"
        >
          Overview
        </Button>
        <Button
          variant={activeTab === 'lessons' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('lessons')}
          className="flex-1"
        >
          Lesson Plans ({lessons.length})
        </Button>
        <Button
          variant={activeTab === 'resources' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('resources')}
          className="flex-1"
        >
          Resources
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'lessons' && renderLessons()}
      {activeTab === 'resources' && renderResources()}
    </div>
  );
}

// Separate component for resources section
function ResourcesSection({ 
  extractedTopics, 
  detectedGradeLevel, 
  searchQuery, 
  lessons, 
  getResourceIcon, 
  getMultimediaIcon 
}: {
  extractedTopics: string[];
  detectedGradeLevel: string;
  searchQuery: string;
  lessons: LessonIdea[];
  getResourceIcon: (type: string) => JSX.Element;
  getMultimediaIcon: (type: string) => JSX.Element;
}) {
  return (
    <div className="space-y-6">
      {/* Academic Resources */}
      <Card>
        <CardHeader>
          <CardTitle>Academic Resources & Primary Sources</CardTitle>
          <CardDescription>
            Targeted searches for: {extractedTopics.slice(0, 3).join(', ')} ({detectedGradeLevel})
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* JSTOR Resources */}
          <div>
            <h5 className="font-medium text-gray-900 mb-2">JSTOR Primary Sources</h5>
            <a 
              href={`https://www.jstor.org/action/doBasicSearch?Query=${encodeURIComponent(searchQuery)}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <FileText className="h-4 w-4 mt-1" />
                <div>
                  <p className="font-medium text-indigo-600 hover:text-indigo-800">
                    Search JSTOR: {extractedTopics.slice(0, 3).join(', ')}
                  </p>
                  <p className="text-sm text-gray-600">Academic articles and primary documents</p>
                </div>
              </div>
            </a>
          </div>

          <Separator />

          {/* Archive.org Resources */}
          <div>
            <h5 className="font-medium text-gray-900 mb-2">Internet Archive</h5>
            <a 
              href={`https://archive.org/search.php?query=${encodeURIComponent(searchQuery)}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <FileText className="h-4 w-4 mt-1" />
                <div>
                  <p className="font-medium text-indigo-600 hover:text-indigo-800">
                    Search Archive.org: {extractedTopics.slice(0, 3).join(', ')}
                  </p>
                  <p className="text-sm text-gray-600">Historical documents and multimedia resources</p>
                </div>
              </div>
            </a>
          </div>

          <Separator />

          {/* World History Encyclopedia */}
          <div>
            <h5 className="font-medium text-gray-900 mb-2">World History Encyclopedia</h5>
            <a 
              href={`https://www.google.com/search?q=site:worldhistory.org+${encodeURIComponent(searchQuery)}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <Globe className="h-4 w-4 mt-1" />
                <div>
                  <p className="font-medium text-indigo-600 hover:text-indigo-800">
                    Search World History Encyclopedia
                  </p>
                  <p className="text-sm text-gray-600">Scholarly articles on {extractedTopics.slice(0, 3).join(', ')}</p>
                </div>
              </div>
            </a>
          </div>

          {/* Original lesson resources */}
          {lessons.some(lesson => lesson.resources.length > 0) && (
            <>
              <Separator />
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Additional Resources</h5>
                <div className="space-y-2">
                  {lessons.flatMap(lesson => lesson.resources).slice(0, 4).map((resource, idx) => (
                    <div key={idx} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-3">
                        {getResourceIcon(resource.type)}
                        <div className="flex-1">
                          <a 
                            href={resource.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
                          >
                            {resource.title}
                          </a>
                          <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
                          <Badge variant="outline" size="sm" className="mt-2">
                            {resource.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Multimedia Resources */}
      <Card>
        <CardHeader>
          <CardTitle>Multimedia Resources</CardTitle>
          <CardDescription>
            Educational videos and interactive content for: {extractedTopics.slice(0, 3).join(', ')} ({detectedGradeLevel})
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Heimler History */}
          <div>
            <h5 className="font-medium text-gray-900 mb-2">Heimler History Videos</h5>
            <a 
              href={`https://www.youtube.com/results?search_query=Heimler+history+${encodeURIComponent(searchQuery)}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <Video className="h-4 w-4 mt-1" />
                <div>
                  <p className="font-medium text-indigo-600 hover:text-indigo-800">
                    Search Heimler History: {extractedTopics.slice(0, 2).join(', ')}
                  </p>
                  <p className="text-sm text-gray-600">AP World History review videos</p>
                </div>
              </div>
            </a>
          </div>

          <Separator />

          {/* Smarthistory */}
          <div>
            <h5 className="font-medium text-gray-900 mb-2">Smarthistory</h5>
            <a 
              href={`https://www.google.com/search?q=site:smarthistory.org+${encodeURIComponent(searchQuery)}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <Image className="h-4 w-4 mt-1" />
                <div>
                  <p className="font-medium text-indigo-600 hover:text-indigo-800">
                    Search Smarthistory: {extractedTopics.slice(0, 2).join(', ')}
                  </p>
                  <p className="text-sm text-gray-600">Art history and cultural context</p>
                </div>
              </div>
            </a>
          </div>

          <Separator />

          {/* BBC History */}
          <div>
            <h5 className="font-medium text-gray-900 mb-2">BBC History</h5>
            <a 
              href={`https://www.youtube.com/results?search_query=BBC+history+${encodeURIComponent(searchQuery)}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <Video className="h-4 w-4 mt-1" />
                <div>
                  <p className="font-medium text-indigo-600 hover:text-indigo-800">
                    Search BBC History: {extractedTopics.slice(0, 2).join(', ')}
                  </p>
                  <p className="text-sm text-gray-600">Documentary clips and historical analysis</p>
                </div>
              </div>
            </a>
          </div>

          {/* Original multimedia resources */}
          {lessons.some(lesson => lesson.multimedia.length > 0) && (
            <>
              <Separator />
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Additional Multimedia</h5>
                <div className="space-y-2">
                  {lessons.flatMap(lesson => lesson.multimedia).slice(0, 3).map((media, idx) => (
                    <div key={idx} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-3">
                        {getMultimediaIcon(media.type)}
                        <div className="flex-1">
                          <a 
                            href={media.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
                          >
                            {media.title}
                          </a>
                          <p className="text-sm text-gray-600 mt-1">{media.description}</p>
                          <Badge variant="outline" size="sm" className="mt-2">
                            {media.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
