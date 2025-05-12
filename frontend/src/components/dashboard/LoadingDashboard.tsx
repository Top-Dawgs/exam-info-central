
import React from "react";
import { Loader } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const LoadingDashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      <Loader className="h-12 w-12 animate-spin text-gray-400 mx-auto" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingDashboard;
