import { Skeleton } from "@/components/UI/skeleton";

export const CheckoutSkeleton: React.FC = () => {
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Column - Shipping & Payment */}
            <div className="space-y-8">
              {/* Shipping Details */}
              <div className="space-y-6">
                <Skeleton className="h-8 w-40" />
                
                {/* Saved Addresses */}
                <div className="space-y-3">
                  <Skeleton className="h-5 w-48" />
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="border rounded p-3 space-y-3">
                      <div className="flex items-start gap-3">
                        <Skeleton className="h-4 w-4 mt-1" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-4 w-48" />
                        </div>
                        <div className="flex gap-2">
                          <Skeleton className="h-8 w-20" />
                          <Skeleton className="h-8 w-16" />
                          <Skeleton className="h-8 w-20" />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <Skeleton className="h-10 w-40" />
                </div>

                {/* Address Form */}
                <div className="space-y-4">
                  <Skeleton className="h-6 w-32" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="flex gap-3">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-24" />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-6">
                <Skeleton className="h-8 w-40" />
                
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="border-2 rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-5 w-5" />
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-4 w-48" />
                        </div>
                      </div>
                      {i === 0 && (
                        <div className="ml-7 space-y-3">
                          <Skeleton className="h-4 w-64" />
                          <div className="bg-white p-4 rounded inline-block">
                            <Skeleton className="h-32 w-32 rounded" />
                          </div>
                          <Skeleton className="h-4 w-48" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Coin Discount */}
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-6 w-48" />
                    </div>
                    <Skeleton className="h-4 w-64 ml-7" />
                  </div>
                </div>
                
                <div className="ml-7 space-y-4">
                  <div className="bg-white/50 border border-primary/20 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-40" />
                      </div>
                      <div className="text-right">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-48" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-24" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-5 w-32" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div>
              <div className="bg-card p-6 rounded-lg border sticky top-32">
                <div className="flex items-center gap-2 mb-6">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-8 w-32" />
                </div>

                {/* Cart Items */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>

                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="flex gap-3 p-3 bg-muted/30 rounded-lg">
                      <Skeleton className="h-16 w-16 rounded-md" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <div className="flex gap-2">
                          <Skeleton className="h-6 w-16" />
                          <Skeleton className="h-6 w-16" />
                        </div>
                        <div className="flex items-center justify-between">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-5 w-20" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <hr className="border-border mb-4" />

                {/* Transaction Details */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-5 w-32" />
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-muted/20 rounded-lg">
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <Skeleton className="h-5 w-24" />
                    </div>

                    <div className="flex justify-between items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4" />
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-24" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                      </div>
                      <Skeleton className="h-5 w-20" />
                    </div>

                    <div className="flex justify-between items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <Skeleton className="h-5 w-20" />
                    </div>

                    <div className="flex justify-between items-center p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <Skeleton className="h-5 w-16" />
                    </div>
                  </div>
                </div>

                <hr className="border-border mb-4" />

                {/* Final Total */}
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center">
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-8 w-24" />
                  </div>
                </div>

                {/* Action Button */}
                <Skeleton className="h-12 w-full" />

                <div className="text-center mt-4">
                  <Skeleton className="h-4 w-80 mx-auto" />
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
