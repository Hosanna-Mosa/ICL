import { useState, useEffect } from "react";
import { reviewsAPI } from "@/utils/api";

interface ReviewLinkingState {
  isEnabled: boolean;
  isLoading: boolean;
  error: string | null;
}

interface UseReviewLinkingOptions {
  productId?: string;
  autoCheck?: boolean;
}

export const useReviewLinking = (options: UseReviewLinkingOptions = {}) => {
  const { productId, autoCheck = true } = options;
  const [state, setState] = useState<ReviewLinkingState>({
    isEnabled: true, // Assume enabled by default
    isLoading: false,
    error: null,
  });

  // Check if review linking is working by testing the new endpoint
  const checkReviewLinking = async (testProductId?: string) => {
    const id = testProductId || productId;
    if (!id) return;

    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      // Try to fetch product with reviews using the new endpoint
      const response = await reviewsAPI.getProductWithReviews(
        id,
        1,
        1,
        "newest"
      );

      if (response.success) {
        setState((prev) => ({
          ...prev,
          isEnabled: true,
          isLoading: false,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          isEnabled: false,
          isLoading: false,
          error: "New review endpoint not available",
        }));
      }
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        isEnabled: false,
        isLoading: false,
        error: error.message || "Failed to check review linking",
      }));
    }
  };

  // Auto-check when productId changes
  useEffect(() => {
    if (autoCheck && productId) {
      checkReviewLinking();
    }
  }, [productId, autoCheck]);

  return {
    ...state,
    checkReviewLinking,
    // Helper to get the appropriate review component
    getReviewComponent: (productId: string, initialData?: any) => {
      if (state.isEnabled) {
        return {
          component: "ProductReviews",
          props: {
            productId,
            initialProductData: initialData,
          },
        };
      } else {
        return {
          component: "Reviews",
          props: {
            productId,
          },
        };
      }
    },
  };
};

export default useReviewLinking;
