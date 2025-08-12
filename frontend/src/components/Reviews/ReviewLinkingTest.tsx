import React, { useState } from "react";
import { reviewsAPI } from "@/utils/api";
import { useToast } from "@/hooks/use-toast";
import Button from "@/components/UI/ICLButton";

interface ReviewLinkingTestProps {
  productId: string;
}

const ReviewLinkingTest: React.FC<ReviewLinkingTestProps> = ({ productId }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const testReviewLinking = async () => {
    setLoading(true);
    setResults(null);

    try {
      const tests = [];

      // Test 1: Get product with reviews
      try {
        const response1 = await reviewsAPI.getProductWithReviews(
          productId,
          1,
          5,
          "newest"
        );
        tests.push({
          name: "Get Product with Reviews",
          success: response1.success,
          data: response1.data,
          error: null,
        });
      } catch (error: any) {
        tests.push({
          name: "Get Product with Reviews",
          success: false,
          data: null,
          error: error.message,
        });
      }

      // Test 2: Get regular reviews
      try {
        const response2 = await reviewsAPI.getProductReviews(
          productId,
          1,
          5,
          "newest"
        );
        tests.push({
          name: "Get Regular Reviews",
          success: response2.success,
          data: response2.data,
          error: null,
        });
      } catch (error: any) {
        tests.push({
          name: "Get Regular Reviews",
          success: false,
          data: null,
          error: error.message,
        });
      }

      // Test 3: Get review stats
      try {
        const response3 = await reviewsAPI.getReviewStats(productId);
        tests.push({
          name: "Get Review Stats",
          success: response3.success,
          data: response3.data,
          error: null,
        });
      } catch (error: any) {
        tests.push({
          name: "Get Review Stats",
          success: false,
          data: null,
          error: error.message,
        });
      }

      setResults({ tests, timestamp: new Date().toISOString() });

      toast({
        title: "Test Complete",
        description: "Review linking tests completed. Check results below.",
      });
    } catch (error: any) {
      toast({
        title: "Test Failed",
        description: error.message || "Failed to run tests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Review Linking Test</h3>
        <Button onClick={testReviewLinking} disabled={loading} size="sm">
          {loading ? "Running Tests..." : "Run Tests"}
        </Button>
      </div>

      {results && (
        <div className="space-y-3">
          <div className="text-sm text-gray-600">
            Tested at: {new Date(results.timestamp).toLocaleString()}
          </div>

          {results.tests.map((test: any, index: number) => (
            <div
              key={index}
              className="border border-gray-200 rounded p-3 bg-white"
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    test.success ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <span className="font-medium">{test.name}</span>
              </div>

              {test.success ? (
                <div className="text-sm text-gray-600">
                  <div>✅ Success</div>
                  {test.data && (
                    <div className="mt-1">
                      <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                        {JSON.stringify(test.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-red-600">
                  ❌ Failed: {test.error}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewLinkingTest;
