import { Skeleton } from "@/components/UI/skeleton";

interface PageSkeletonProps {
  showHeader?: boolean;
  showFooter?: boolean;
  className?: string;
}

export const PageSkeleton: React.FC<PageSkeletonProps> = ({
  showHeader = true,
  showFooter = true,
  className = "",
}) => {
  return (
    <div className={`min-h-screen bg-background ${className}`}>
      {showHeader && (
        <div className="border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-32" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-20" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
            <div className="space-y-6">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>

      {showFooter && (
        <div className="border-t bg-muted/30">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-6 w-24" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-36" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
