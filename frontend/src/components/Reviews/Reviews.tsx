import React, { useState, useEffect } from 'react';
import { Star, Edit3, Trash2, MessageCircle, ThumbsUp, Calendar, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { reviewsAPI } from '@/utils/api';
import { useToast } from '@/hooks/use-toast';
import Button from '@/components/UI/ICLButton';

interface Review {
  _id: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
  helpful: number;
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    [key: number]: {
      count: number;
      percentage: number;
    };
  };
}

interface ReviewsProps {
  productId: string;
}

const Reviews: React.FC<ReviewsProps> = ({ productId }) => {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(false);
  
  // Review form state
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('newest');

  // Fetch reviews and stats
  useEffect(() => {
    fetchReviews();
    fetchReviewStats();
    if (isAuthenticated) {
      fetchUserReviews();
    }
  }, [productId, currentPage, sortBy, isAuthenticated]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewsAPI.getProductReviews(productId, currentPage, 10, sortBy);
      if (response.success) {
        setReviews(response.data.reviews);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error: any) {
      console.error('Error fetching reviews:', error);
      toast({
        title: "Error",
        description: "Failed to load reviews",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewStats = async () => {
    try {
      const response = await reviewsAPI.getReviewStats(productId);
      if (response.success) {
        setReviewStats(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching review stats:', error);
    }
  };

  const fetchUserReviews = async () => {
    try {
      const response = await reviewsAPI.getUserReviews(productId);
      if (response.success && response.data.reviews) {
        setUserReviews(response.data.reviews);
        // Set the most recent review for editing if needed
        if (response.data.reviews.length > 0) {
          const latestReview = response.data.reviews[0];
          setRating(latestReview.rating);
          setComment(latestReview.comment);
        }
      }
    } catch (error: any) {
      // User hasn't reviewed this product yet
      setUserReviews([]);
    }
  };

  const handleSubmitReview = async () => {
    if (!rating || !comment.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide both rating and comment",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      
      // Always create a new review (users can have multiple reviews)
      const response = await reviewsAPI.createReview(productId, { rating, comment });
      if (response.success) {
        // Add the new review to user's reviews
        setUserReviews(prev => [response.data, ...prev]);
        setComment('');
        setRating(0);
        toast({
          title: "Success",
          description: "Review submitted successfully",
        });
      }
      
      // Refresh reviews and stats
      fetchReviews();
      fetchReviewStats();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit review",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      setSubmitting(true);
      const response = await reviewsAPI.deleteReview(reviewId);
      if (response.success) {
        // Remove the deleted review from user's reviews
        setUserReviews(prev => prev.filter(review => review._id !== reviewId));
        toast({
          title: "Success",
          description: "Review deleted successfully",
        });
        
        // Refresh reviews and stats
        fetchReviews();
        fetchReviewStats();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete review",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditReview = (review: Review) => {
    setRating(review.rating);
    setComment(review.comment);
    setEditing(true);
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setComment('');
    setRating(0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderStars = (rating: number, interactive = false, onStarClick?: (star: number) => void, onStarHover?: (star: number) => void) => {
    return (
      <div className="flex items-center gap-0.5 sm:gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : "button"}
            onClick={() => interactive && onStarClick?.(star)}
            onMouseEnter={() => interactive && onStarHover?.(star)}
            onMouseLeave={() => interactive && onStarHover?.(0)}
            className={`transition-all duration-200 ${
              interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
            }`}
            disabled={!interactive}
          >
            <Star
              className={`w-4 h-4 sm:w-5 sm:h-5 ${
                star <= (interactive ? hoveredRating || rating : rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const renderRatingDistribution = () => {
    if (!reviewStats) return null;

    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((star) => {
          const stat = reviewStats.ratingDistribution[star];
          const percentage = stat?.percentage || 0;
          
          return (
            <div key={star} className="flex items-center gap-3">
              <div className="flex items-center gap-1 min-w-[60px]">
                <span className="text-sm font-medium">{star}</span>
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 min-w-[40px] text-right">
                {stat?.count || 0}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

    return (
    <div className="space-y-6 sm:space-y-8">
      {/* Reviews Header */}
      <div className="border-b border-gray-200 pb-4 sm:pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Customer Reviews</h2>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {reviewStats && (
                <>
                  <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {reviewStats.averageRating.toFixed(1)}
                  </span>
                  <div className="flex items-center gap-1">
                    {renderStars(reviewStats.averageRating)}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        
        {reviewStats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Rating Summary */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="font-semibold text-gray-900">Rating Breakdown</h3>
              {renderRatingDistribution()}
              <p className="text-sm text-gray-600">
                Based on {reviewStats.totalReviews} reviews
              </p>
            </div>
            
            {/* Sort Options */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="font-semibold text-gray-900">Sort Reviews</h3>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Rated</option>
                <option value="lowest">Lowest Rated</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Review Form */}
      {isAuthenticated && (
        <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="w-5 h-5 text-blue-600" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
              {userReviews.length > 0 ? `Your Reviews (${userReviews.length})` : 'Write a Review'}
            </h3>
          </div>
          
          {userReviews.length > 0 && !editing ? (
            <div className="space-y-4">
              <div className="space-y-4">
                {userReviews.map((review) => (
                  <div key={review._id} className="border border-gray-200 rounded-lg p-3 sm:p-4 bg-white">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        {renderStars(review.rating)}
                        <span className="text-sm text-gray-600">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditReview(review)}
                          className="flex items-center gap-2 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                        >
                          <Edit3 className="w-3 h-3 sm:w-4 sm:h-4" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteReview(review._id)}
                          disabled={submitting}
                          className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm sm:text-base">{review.comment}</p>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 w-full sm:w-auto"
                >
                  <Edit3 className="w-4 h-4" />
                  Write Another Review
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Star Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating *
                </label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  {renderStars(rating, true, setRating, setHoveredRating)}
                  <span className="text-sm text-gray-600 sm:ml-2">
                    {rating > 0 && `${rating} out of 5`}
                  </span>
                </div>
              </div>
              
              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Review *
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm sm:text-base"
                  placeholder="Share your thoughts about this product..."
                  maxLength={500}
                />
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-gray-500">
                    {comment.length}/500 characters
                  </span>
                </div>
              </div>
              
              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Button
                  onClick={handleSubmitReview}
                  disabled={submitting || !rating || !comment.trim()}
                  className="flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <MessageCircle className="w-4 h-4" />
                      Submit Review
                    </>
                  )}
                </Button>
                
                {editing && (
                  <Button
                    variant="outline"
                    onClick={handleCancelEdit}
                    className="flex items-center justify-center gap-2 w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4 sm:space-y-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">
          All Reviews ({reviewStats?.totalReviews || 0})
        </h3>
        
        {reviews.length === 0 ? (
          <div className="text-center py-6 sm:py-8">
            <MessageCircle className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-sm sm:text-base">No reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {reviews.map((review) => (
              <div key={review._id} className="border border-gray-200 rounded-lg p-4 sm:p-6 bg-white shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">
                        {review.user.firstName} {review.user.lastName}
                      </h4>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        {renderStars(review.rating)}
                        <span className="text-xs sm:text-sm text-gray-500">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {review.user._id === user?.id && (
                    <div className="flex items-center gap-2 self-end sm:self-start">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setRating(review.rating);
                          setComment(review.comment);
                          setEditing(true);
                        }}
                        className="text-blue-600 hover:text-blue-700 p-1 sm:p-2"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
                
                <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{review.comment}</p>
                
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                  <button className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 hover:text-blue-600 transition-colors">
                    <ThumbsUp className="w-3 h-3 sm:w-4 sm:h-4" />
                    Helpful ({review.helpful})
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-2 pt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="w-full sm:w-auto"
            >
              Previous
            </Button>
            
            <span className="text-sm text-gray-600 text-center">
              Page {currentPage} of {totalPages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="w-full sm:w-auto"
            >
              Next
            </Button>
          </div>
        )}
      </div>
      
      {/* Sign In Prompt */}
      {!isAuthenticated && (
        <div className="text-center py-6 sm:py-8 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl px-4 sm:px-6">
          <MessageCircle className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600 mx-auto mb-4" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
            Sign in to leave a review
          </h3>
          <p className="text-gray-600 mb-4 text-sm sm:text-base">
            Share your experience and help other customers make informed decisions
          </p>
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 w-full sm:w-auto">
            Sign In to Review
          </Button>
        </div>
      )}
    </div>
  );
};

export default Reviews;
