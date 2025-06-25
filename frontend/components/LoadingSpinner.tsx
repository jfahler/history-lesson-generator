import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingSpinner({ message = "Loading...", size = "md" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className={`${sizeClasses[size]} animate-spin text-indigo-600`} />
          <p className="text-gray-600 text-center">{message}</p>
        </div>
      </CardContent>
    </Card>
  );
}
