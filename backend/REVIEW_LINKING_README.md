# Review-Product Linking Feature

## Overview

This feature ensures that reviews are properly linked to products by storing review IDs in the product document. This follows best practices for data consistency and enables efficient querying of product reviews.

## Changes Made

### 1. Product Model Updates

**File:** `models/Product.js`

- Added `reviews` field to store review IDs:

```javascript
reviews: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: "Review",
}],
```

### 2. Review Model Updates

**File:** `models/Review.js`

- **Pre-save middleware**: Automatically adds review ID to product when a new review is created
- **Pre-remove middleware**: Removes review ID from product when review is deleted
- **Pre-findOneAndDelete middleware**: Handles deletion via `findByIdAndDelete` method

### 3. Review Controller Updates

**File:** `controllers/reviewController.js`

- Enhanced `createReview` to return updated product information
- Enhanced `deleteReview` to return updated product information
- Added `getProductWithReviews` method for efficient product + reviews queries

### 4. New Routes

**File:** `routes/reviews.js`

- Added `GET /reviews/product/:productId/with-reviews` for getting product with populated reviews

## How It Works

### Creating Reviews

1. User creates a review via `POST /reviews/product/:productId`
2. Review is saved to the Review collection
3. Pre-save middleware automatically:
   - Calculates new average rating
   - Updates product's `rating` and `reviewCount`
   - Adds review ID to product's `reviews` array

### Deleting Reviews

1. User deletes a review via `DELETE /reviews/:reviewId`
2. Pre-delete middleware automatically:
   - Removes review ID from product's `reviews` array
   - Recalculates average rating
   - Updates product's `rating` and `reviewCount`

### Querying Reviews

- **Individual reviews**: `GET /reviews/product/:productId`
- **Product with reviews**: `GET /reviews/product/:productId/with-reviews`
- **Review statistics**: `GET /reviews/product/:productId/stats`

## Benefits

1. **Data Consistency**: Review IDs are always in sync between Review and Product collections
2. **Efficient Queries**: Can get product with reviews in a single query
3. **Automatic Updates**: Rating and review count are automatically maintained
4. **Best Practices**: Follows MongoDB best practices for related data

## Migration

For existing data, run the migration script:

```bash
node seeders/reviewMigration.js
```

This will:

- Find all existing reviews
- Update products with their review IDs
- Recalculate ratings and review counts
- Verify data consistency

## Testing

Run the test script to verify the linking works correctly:

```bash
node test-review-linking.js
```

This will test:

- Products have correct review IDs
- Review counts are consistent
- New reviews are properly linked
- Deleted reviews are properly unlinked
- No orphaned reviews exist

## API Response Examples

### Create Review Response

```json
{
  "success": true,
  "message": "Review created successfully",
  "data": {
    "review": {
      /* review object */
    },
    "productReviews": 15,
    "productRating": 4.2
  }
}
```

### Delete Review Response

```json
{
  "success": true,
  "message": "Review deleted successfully",
  "data": {
    "message": "Review deleted successfully",
    "productReviews": 14,
    "productRating": 4.1
  }
}
```

### Product with Reviews Response

```json
{
  "success": true,
  "message": "Product with reviews fetched successfully",
  "data": {
    "product": {
      "_id": "product-id",
      "name": "Product Name",
      "rating": 4.2,
      "reviewCount": 15,
      "reviews": [
        /* array of review objects */
      ],
      "totalReviews": 15,
      "totalPages": 3,
      "currentPage": 1
    }
  }
}
```

## Error Handling

The system includes comprehensive error handling:

- Validates product existence before creating reviews
- Ensures review ownership before updates/deletions
- Handles database errors gracefully
- Provides meaningful error messages

## Performance Considerations

- Indexes are maintained on `product` and `user` fields in Review collection
- Product queries with reviews use efficient population
- Pagination is implemented for large review sets
- Rating calculations are optimized

## Maintenance

Regular maintenance tasks:

1. Run migration script after schema changes
2. Monitor for orphaned reviews
3. Verify data consistency periodically
4. Update indexes as needed
