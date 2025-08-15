import { Skeleton } from "@/components/UI/skeleton";

export const AccountSkeleton: React.FC = () => {
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

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-card p-6 rounded-lg border space-y-6">
                {/* User Profile */}
                <div className="text-center space-y-4">
                  <Skeleton className="h-24 w-24 rounded-full mx-auto" />
                  <Skeleton className="h-6 w-32 mx-auto" />
                  <Skeleton className="h-4 w-24 mx-auto" />
                </div>

                {/* Navigation Tabs */}
                <div className="space-y-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg">
                      <Skeleton className="h-5 w-5" />
                      <Skeleton className="h-5 w-24" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-card p-6 rounded-lg border">
                {/* Tab Content */}
                <div className="space-y-6">
                  {/* Profile Tab */}
                  <div className="space-y-6">
                    <Skeleton className="h-8 w-32" />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                      <div className="space-y-3">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                      <div className="space-y-3">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                      <div className="space-y-3">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    </div>
                    
                    <Skeleton className="h-10 w-32" />
                  </div>

                  {/* Orders Tab */}
                  <div className="space-y-6">
                    <Skeleton className="h-8 w-32" />
                    
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="border rounded-lg p-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-2">
                              <Skeleton className="h-5 w-32" />
                              <Skeleton className="h-4 w-24" />
                            </div>
                            <Skeleton className="h-6 w-20" />
                          </div>
                          
                          <div className="flex gap-4">
                            <Skeleton className="h-16 w-16 rounded-md" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-5 w-3/4" />
                              <Skeleton className="h-4 w-1/2" />
                              <Skeleton className="h-4 w-1/3" />
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-8 w-24" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Addresses Tab */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-8 w-32" />
                      <Skeleton className="h-10 w-32" />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <Skeleton className="h-5 w-32" />
                            <div className="flex gap-2">
                              <Skeleton className="h-8 w-16" />
                              <Skeleton className="h-8 w-16" />
                              <Skeleton className="h-8 w-16" />
                            </div>
                          </div>
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-4 w-40" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Coins Tab */}
                  <div className="space-y-6">
                    <Skeleton className="h-8 w-32" />
                    
                    <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-6">
                      <div className="text-center space-y-4">
                        <Skeleton className="h-16 w-16 rounded-full mx-auto" />
                        <Skeleton className="h-8 w-32 mx-auto" />
                        <Skeleton className="h-6 w-48 mx-auto" />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-2">
                              <Skeleton className="h-5 w-32" />
                              <Skeleton className="h-4 w-24" />
                            </div>
                            <div className="text-right space-y-2">
                              <Skeleton className="h-5 w-20 ml-auto" />
                              <Skeleton className="h-4 w-16 ml-auto" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
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
