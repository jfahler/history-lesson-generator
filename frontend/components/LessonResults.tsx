import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Clock, Users, Target, ExternalLink, FileText, Image, Video, Map, Volume2, MapPin, Globe } from "lucide-react";
import type { LessonIdea } from "~backend/lesson/generate";

interface LessonResultsProps {
  lessons: LessonIdea[];
  originalStandard: string;
  onBackToSearch: () => void;
}

export function LessonResults({ lessons, originalStandard, onBackToSearch }: LessonResultsProps) {
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

  // Extract regions and places from the standard and lessons
  const extractRegionsAndPlaces = () => {
    const text = `${originalStandard} ${lessons.map(l => l.description).join(' ')}`;
    const regions = [];
    
    // Common historical regions and places
    const regionKeywords = [
      'Europe', 'Asia', 'Africa', 'Americas', 'Middle East', 'Mediterranean', 'Atlantic', 'Pacific',
      'China', 'India', 'Japan', 'Russia', 'Ottoman Empire', 'Byzantine', 'Roman Empire',
      'France', 'Britain', 'Germany', 'Spain', 'Italy', 'Greece', 'Egypt', 'Persia',
      'Mesopotamia', 'Anatolia', 'Balkans', 'Scandinavia', 'Iberian Peninsula'
    ];

    regionKeywords.forEach(region => {
      if (text.toLowerCase().includes(region.toLowerCase())) {
        regions.push(region);
      }
    });

    return [...new Set(regions)].slice(0, 6); // Remove duplicates and limit to 6
  };

  const regions = extractRegionsAndPlaces();

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

      {/* Standards Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-xl">Teaching Standard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed">{originalStandard}</p>
          
          {/* Learning Objectives from all lessons */}
          <div className="mt-6">
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
        
        {/* Left Column - Activities and Regions */}
        <div className="space-y-6">
          
          {/* Regions and Places */}
          {regions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Relevant Regions & Places
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {regions.map((region, idx) => (
                    <Badge key={idx} variant="outline" className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {region}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Activities by Topic */}
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
                      <li key={idx} className="text-gray-700 flex items-start gap-2 p-2 bg-green-50 rounded">
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
          
          {/* Enhanced Resources */}
          <Card>
            <CardHeader>
              <CardTitle>Primary Sources & Academic Resources</CardTitle>
              <CardDescription>Curated from JSTOR, Archive.org, and History Commons</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* JSTOR Resources */}
              <div>
                <h5 className="font-medium text-gray-900 mb-2">JSTOR Primary Sources</h5>
                <div className="space-y-2">
                  <a 
                    href={`https://www.jstor.org/action/doBasicSearch?Query=${encodeURIComponent(originalStandard.substring(0, 100))}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <FileText className="h-4 w-4 mt-1" />
                      <div>
                        <p className="font-medium text-indigo-600 hover:text-indigo-800">
                          Search JSTOR for Primary Sources
                        </p>
                        <p className="text-sm text-gray-600">Academic articles and primary documents related to your topic</p>
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
                    href={`https://archive.org/search.php?query=${encodeURIComponent(originalStandard.substring(0, 100))}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <FileText className="h-4 w-4 mt-1" />
                      <div>
                        <p className="font-medium text-indigo-600 hover:text-indigo-800">
                          Search Archive.org
                        </p>
                        <p className="text-sm text-gray-600">Historical documents, books, and multimedia resources</p>
                      </div>
                    </div>
                  </a>
                </div>
              </div>

              <Separator />

              {/* History Commons */}
              <div>
                <h5 className="font-medium text-gray-900 mb-2">History Commons</h5>
                <div className="space-y-2">
                  <a 
                    href="https://history-commons.net/"
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <Globe className="h-4 w-4 mt-1" />
                      <div>
                        <p className="font-medium text-indigo-600 hover:text-indigo-800">
                          Browse History Commons
                        </p>
                        <p className="text-sm text-gray-600">Collaborative historical research and timelines</p>
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
              <CardDescription>Educational videos and interactive content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Heimler History */}
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Heimler History Videos</h5>
                <a 
                  href={`https://www.youtube.com/results?search_query=Heimler+history+${encodeURIComponent(originalStandard.substring(0, 50))}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <Video className="h-4 w-4 mt-1" />
                    <div>
                      <p className="font-medium text-indigo-600 hover:text-indigo-800">
                        Search Heimler History on YouTube
                      </p>
                      <p className="text-sm text-gray-600">AP World History review videos and explanations</p>
                    </div>
                  </div>
                </a>
              </div>

              <Separator />

              {/* Smarthistory */}
              <div>
                <h5 className="font-medium text-gray-900 mb-2">Smarthistory</h5>
                <a 
                  href={`https://www.google.com/search?q=site:smarthistory.org+${encodeURIComponent(originalStandard.substring(0, 50))}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <Image className="h-4 w-4 mt-1" />
                    <div>
                      <p className="font-medium text-indigo-600 hover:text-indigo-800">
                        Search Smarthistory
                      </p>
                      <p className="text-sm text-gray-600">Art history and cultural context resources</p>
                    </div>
                  </div>
                </a>
              </div>

              <Separator />

              {/* BBC History */}
              <div>
                <h5 className="font-medium text-gray-900 mb-2">BBC History</h5>
                <a 
                  href={`https://www.youtube.com/results?search_query=BBC+history+${encodeURIComponent(originalStandard.substring(0, 50))}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <Video className="h-4 w-4 mt-1" />
                    <div>
                      <p className="font-medium text-indigo-600 hover:text-indigo-800">
                        Search BBC History on YouTube
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

          {/* Primary Sources from lessons */}
          {lessons.some(lesson => lesson.primarySources.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle>Primary Source Excerpts</CardTitle>
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
