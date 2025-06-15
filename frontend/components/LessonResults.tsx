import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, Users, Target, CheckSquare, ExternalLink, FileText, Image, Video, Map, Volume2 } from "lucide-react";
import type { LessonIdea } from "~backend/lesson/generate";

interface LessonResultsProps {
  lessons: LessonIdea[];
}

export function LessonResults({ lessons }: LessonResultsProps) {
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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Generated Lesson Ideas</h2>
      
      {lessons.map((lesson, index) => (
        <Card key={index} className="shadow-lg">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl mb-2">{lesson.title}</CardTitle>
                <CardDescription className="text-base">{lesson.description}</CardDescription>
              </div>
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
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Learning Objectives */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Learning Objectives
              </h4>
              <ul className="space-y-1">
                {lesson.objectives.map((objective, idx) => (
                  <li key={idx} className="text-gray-700 flex items-start gap-2">
                    <span className="text-indigo-500 mt-1">•</span>
                    {objective}
                  </li>
                ))}
              </ul>
            </div>

            <Separator />

            {/* Activities */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Activities
              </h4>
              <ul className="space-y-1">
                {lesson.activities.map((activity, idx) => (
                  <li key={idx} className="text-gray-700 flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    {activity}
                  </li>
                ))}
              </ul>
            </div>

            <Separator />

            {/* Assessment Ideas */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CheckSquare className="h-4 w-4" />
                Assessment Ideas
              </h4>
              <ul className="space-y-1">
                {lesson.assessmentIdeas.map((assessment, idx) => (
                  <li key={idx} className="text-gray-700 flex items-start gap-2">
                    <span className="text-purple-500 mt-1">•</span>
                    {assessment}
                  </li>
                ))}
              </ul>
            </div>

            <Separator />

            {/* Resources */}
            {lesson.resources.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Resources</h4>
                <div className="grid gap-3">
                  {lesson.resources.map((resource, idx) => (
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
            )}

            {/* Primary Sources */}
            {lesson.primarySources.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Primary Sources</h4>
                <div className="space-y-4">
                  {lesson.primarySources.map((source, idx) => (
                    <div key={idx} className="border rounded-lg p-4 bg-amber-50 border-amber-200">
                      <div className="mb-2">
                        <h5 className="font-medium text-gray-900">{source.title}</h5>
                        <p className="text-sm text-gray-600">
                          by {source.author} ({source.date})
                        </p>
                      </div>
                      <blockquote className="border-l-4 border-amber-400 pl-4 italic text-gray-700 mb-3">
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

            {/* Multimedia */}
            {lesson.multimedia.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Multimedia Resources</h4>
                <div className="grid gap-3">
                  {lesson.multimedia.map((media, idx) => (
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
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
