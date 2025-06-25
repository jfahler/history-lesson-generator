import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Clock, Users, Target, ExternalLink, FileText, Image, Video, Map, Volume2, MapPin, Globe, Hash, Sparkles } from "lucide-react";
import type { LessonIdea } from "~backend/lesson/generate";

interface LessonResultsProps {
  lessons: LessonIdea[];
  originalStandard: string;
  cleanedStandard: string;
  extractedTopics: string[];
  onBackToSearch: () => void;
}

export function LessonResults({ lessons, originalStandard, cleanedStandard, extractedTopics, onBackToSearch }: LessonResultsProps) {
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

  // Create search queries for external resources using extracted topics
  const createSearchQuery = (topics: string[], maxLength: number = 100) => {
    return topics.slice(0, 5).join(' ').substring(0, maxLength);
  };

  const searchQuery = createSearchQuery(extractedTopics);

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

      {/* Standards Section with Processing Info */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Processed Teaching Standard
          </CardTitle>
          <CardDescription>
            The original standard has been cleaned and key topics extracted for better resource targeting
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Cleaned Standard */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Cleaned Standard</h4>
            <p className="text-gray-700 leading-relaxed bg-blue-50 p-4 rounded-lg border border-blue-200">
              {cleanedStandard}
            </p>
          </div>

          {/* Extracted Topics */}
          {extractedTopics.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Key Topics Identified
              </h4>
              <div className="flex flex-wrap gap-2">
                {extractedTopics.map((topic, idx) => (
                  <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Learning Objectives from all lessons */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Specific Learning Objectives
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {lessons.flatMap(lesson => lesson.objectives).slice(0, 8).map((objective, idx) => (
                <div key={idx} className="text-sm text-gray-700 flex items-start gap-2 p-2 bg-blue-50 rounded">
                  <span className="text-blue-500 mt-1 text-xs">•</span>
                  {objective}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column - Activities */}
        <div className="space-y-6">
          
          {/* Topic-Specific Activities by Lesson */}
          {lessons.map((lesson, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">{lesson.title}</CardTitle>
                <CardDescription>{lesson.description}</CardDescription>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {lesson.timeEstimate}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    Grade {lesson.gradeLevel}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Topic-Specific Activities
                  </h4>
                  <ul className="space-y-2">
                    {lesson.activities.map((activity, idx) => (
                      <li key={idx} className="text-gray-700 flex items-start gap-2 p-3 bg-green-50 rounded border border-green-200">
                        <span className="text-green-500 mt-1 text-sm">•</span>
                        <span className="text-sm">{activity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Right Column - Resources and Multimedia */}
        <div className="space-y-6">
          
          {/* Enhanced Resources with Topic-Specific Searches */}
          <Card>
            <CardHeader>
              <CardTitle>Primary Sources & Academic Resources</CardTitle>
              <CardDescription>
                Targeted searches using extracted topics: {extractedTopics.slice(0, 3).join(', ')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* JSTOR Resources */}
              <div>
                <h5 className="font-medium text-gray-900 mb-2">JSTOR Primary Sources</h5>
                <div className="space-y-2">
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
                        <p className="text-sm text-gray-600">Academic articles and primary documents related to your specific topics</p>
                      </div>
                    </div>
                  </a>
                </div>
              </div>

              <Separator />

              {/* Archive.org Resources */}
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Internet Archive</h5>
                <div className="space-y-2">
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
                        <p className="text-sm text-gray-600">Historical documents, books, and multimedia resources for your topics</p>
                      </div>
                    </div>
                  </a>
                </div>
              </div>

              <Separator />

              {/* World History Encyclopedia */}
              <div>
                <h5 className="font-medium text-gray-900 mb-2">World History Encyclopedia</h5>
                <div className="space-y-2">
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

          {/* Enhanced Multimedia Resources */}
          <Card>
            <CardHeader>
              <CardTitle>Multimedia Resources</CardTitle>
              <CardDescription>
                Educational videos and interactive content for: {extractedTopics.slice(0, 3).join(', ')}
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
                      <p className="text-sm text-gray-600">AP World History review videos for your specific topics</p>
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
                      <p className="text-sm text-gray-600">Art history and cultural context for your topics</p>
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
                      <p className="text-sm text-gray-600">Documentary clips and historical analysis for your topics</p>
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

          {/* Primary Sources from lessons */}
          {lessons.some(lesson => lesson.primarySources.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle>Primary Source Excerpts</CardTitle>
                <CardDescription>
                  Historical documents related to: {extractedTopics.slice(0, 3).join(', ')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {lessons.flatMap(lesson => lesson.primarySources).slice(0, 2).map((source, idx) => (
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
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
