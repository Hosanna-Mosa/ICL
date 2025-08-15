import { Skeleton } from "@/components/UI/skeleton";

export const WishlistSkeleton: React.FC = () => {
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

      <div className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Page Title */}
          <Skeleton className="h-12 w-48 mb-8" />

          {/* Wishlist Grid */}
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
                  <div className="flex gap-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-12" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty Wishlist Message */}
          <div className="text-center py-12">
            <Skeleton className="h-24 w-24 mx-auto mb-4" />
            <Skeleton className="h-8 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto mb-6" />
            <Skeleton className="h-12 w-48 mx-auto" />
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
