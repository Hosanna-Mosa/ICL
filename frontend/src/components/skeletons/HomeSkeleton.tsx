import { Skeleton } from "@/components/UI/skeleton";

export const HomeSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
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

      {/* Hero Section */}
      <div className="relative h-[600px] bg-gradient-to-r from-gray-100 to-gray-200">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-6">
            <Skeleton className="h-16 w-96 mx-auto" />
            <Skeleton className="h-6 w-80 mx-auto" />
            <div className="flex gap-4 justify-center">
              <Skeleton className="h-12 w-32" />
              <Skeleton className="h-12 w-32" />
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-20">
        <div className="max-w-7xl mx-auto space-y-20">
          {/* Categories Section */}
          <div className="text-center space-y-8">
            <Skeleton className="h-12 w-64 mx-auto" />
            <Skeleton className="h-6 w-96 mx-auto" />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-48 w-full rounded-lg" />
                  <Skeleton className="h-6 w-32 mx-auto" />
                  <Skeleton className="h-4 w-24 mx-auto" />
                </div>
              ))}
            </div>
          </div>

          {/* Featured Products */}
          <div className="space-y-8">
            <div className="text-center">
              <Skeleton className="h-12 w-64 mx-auto" />
              <Skeleton className="h-6 w-96 mx-auto mt-4" />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-card rounded-lg border p-4 space-y-4">
                  <Skeleton className="h-48 w-full rounded-md" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-6 w-20" />
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Brand Story */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Skeleton className="h-12 w-64" />
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <Skeleton className="h-12 w-32" />
            </div>
            <div>
              <Skeleton className="h-96 w-full rounded-lg" />
            </div>
          </div>

          {/* Best Sellers */}
          <div className="space-y-8">
            <div className="text-center">
              <Skeleton className="h-12 w-48 mx-auto" />
              <Skeleton className="h-6 w-80 mx-auto mt-4" />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-card rounded-lg border p-4 space-y-4">
                  <Skeleton className="h-48 w-full rounded-md" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-6 w-20" />
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Skeleton */}
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
    </div>
  );
};
