# ICL Streetwear API Documentation

## Base URL

```
http://localhost:5000/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

---

## Authentication Endpoints

### Register User

```http
POST /auth/register
```

**Request Body:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "9876543210"
}
```

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "...",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "user",
      "coins": 0
    },
    "token": "jwt-token-here"
  }
}
```

### Login User

```http
POST /auth/login
```

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "...",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "user",
      "coins": 150
    },
    "token": "jwt-token-here"
  }
}
```

---

## Product Endpoints

### Get All Products

```http
GET /products?page=1&limit=12&category=hoodies&minPrice=1000&maxPrice=5000&sort=price_asc
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 12, max: 100)
- `category` (optional): Filter by category
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter
- `sort` (optional): Sort by (price_asc, price_desc, newest, rating, popularity)
- `search` (optional): Search query
- `featured` (optional): Filter featured products (true/false)

**Response:**

```json
{
  "success": true,
  "data": {
    "products": [...],
    "pagination": {
      "page": 1,
      "limit": 12,
      "total": 50,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### Get Single Product

```http
GET /products/:id
```

**Response:**

```json
{
  "success": true,
  "data": {
    "product": {
      "id": "...",
      "name": "Premium Oversized Hoodie",
      "description": "...",
      "category": "hoodies",
      "basePrice": 4499,
      "salePrice": 3999,
      "currentPrice": 3999,
      "discountPercentage": 11,
      "sizes": [...],
      "images": [...],
      "rating": 4.8,
      "reviewCount": 127,
      "isInStock": true,
      "totalStock": 73
    }
  }
}
```

---

## Cart Endpoints

### Get User Cart

```http
GET /cart
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "cart": {
      "items": [...],
      "subtotal": 6397,
      "itemCount": 2,
      "total": 6397,
      "couponCode": null,
      "discountAmount": 0,
      "coinsUsed": 0,
      "coinsDiscount": 0
    }
  }
}
```

### Add Item to Cart

```http
POST /cart
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "productId": "product-id-here",
  "size": "L",
  "quantity": 1
}
```

### Update Cart Item

```http
PUT /cart/:productId
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "size": "L",
  "quantity": 2
}
```

### Apply Coupon

```http
POST /cart/coupon
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "couponCode": "WELCOME10"
}
```

---

## Order Endpoints

### Create Order (Checkout)

```http
POST /orders
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "shippingAddress": {
    "firstName": "John",
    "lastName": "Doe",
    "phone": "9876543210",
    "street": "123 Main Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zipCode": "400001",
    "country": "India"
  },
  "payment": {
    "method": "cod"
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "Order placed successfully",
  "data": {
    "order": {
      "id": "...",
      "orderNumber": "ICL12345678",
      "status": "pending",
      "total": 6547,
      "items": [...],
      "shippingAddress": {...},
      "payment": {
        "method": "cod",
        "status": "pending",
        "amount": 6547
      }
    }
  }
}
```

### Get User Orders

```http
GET /orders?page=1&limit=10&status=pending
Authorization: Bearer <token>
```

---

## User Endpoints

### Get User Profile

```http
GET /user/profile
Authorization: Bearer <token>
```

### Update User Profile

```http
PUT /user/profile
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "9876543210",
  "address": {
    "street": "123 Main Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zipCode": "400001"
  }
}
```

### Get User Wishlist

```http
GET /user/wishlist
Authorization: Bearer <token>
```

### Add to Wishlist

```http
POST /user/wishlist
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "productId": "product-id-here"
}
```

### Get User Coins

```http
GET /user/coins
Authorization: Bearer <token>
```

### Redeem Coins

```http
POST /user/coins/redeem
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "amount": 50
}
```

---

## Admin Endpoints

### Get All Users (Admin Only)

```http
GET /user/admin/all?page=1&limit=20&role=user&search=john
Authorization: Bearer <admin-token>
```

### Add Coins to User (Admin Only)

```http
POST /user/coins/add
Authorization: Bearer <admin-token>
```

**Request Body:**

```json
{
  "userId": "user-id-here",
  "amount": 100
}
```

### Get All Orders (Admin Only)

```http
GET /orders/admin/all?page=1&limit=20&status=pending
Authorization: Bearer <admin-token>
```

### Update Order Status (Admin Only)

```http
PUT /orders/:id/status
Authorization: Bearer <admin-token>
```

**Request Body:**

```json
{
  "status": "shipped",
  "notes": "Order shipped via courier"
}
```

---

## Review Endpoints

### Create Review

```http
POST /reviews/product/:productId
Authorization: Bearer <user-token>
```

**Request Body:**

```json
{
  "rating": 5,
  "comment": "Great product! Love the quality and fit."
}
```

**Response:**

```json
{
  "success": true,
  "message": "Review created successfully",
  "data": {
    "review": {
      "_id": "review-id-here",
      "user": {
        "_id": "user-id-here",
        "firstName": "John",
        "lastName": "Doe"
      },
      "product": "product-id-here",
      "rating": 5,
      "comment": "Great product! Love the quality and fit.",
      "isVerified": false,
      "helpful": 0,
      "reported": false,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "productReviews": 15,
    "productRating": 4.2
  }
}
```

### Get Product Reviews

```http
GET /reviews/product/:productId?page=1&limit=10&sort=newest
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Reviews per page (default: 10)
- `sort` (optional): Sort order - "newest", "oldest", "highest", "lowest" (default: "newest")

**Response:**

```json
{
  "success": true,
  "message": "Reviews fetched successfully",
  "data": {
    "reviews": [
      {
        "_id": "review-id-here",
        "user": {
          "_id": "user-id-here",
          "firstName": "John",
          "lastName": "Doe"
        },
        "product": "product-id-here",
        "rating": 5,
        "comment": "Great product!",
        "isVerified": false,
        "helpful": 0,
        "reported": false,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalReviews": 25,
      "hasNextPage": true,
      "hasPrevPage": false,
      "limit": 10
    }
  }
}
```

### Get Product with Reviews

```http
GET /reviews/product/:productId/with-reviews?page=1&limit=5&sort=newest
```

**Response:**

```json
{
  "success": true,
  "message": "Product with reviews fetched successfully",
  "data": {
    "product": {
      "_id": "product-id-here",
      "name": "ICL Streetwear Hoodie",
      "rating": 4.2,
      "reviewCount": 15,
      "reviews": [
        {
          "_id": "review-id-here",
          "user": {
            "_id": "user-id-here",
            "firstName": "John",
            "lastName": "Doe"
          },
          "rating": 5,
          "comment": "Great product!",
          "createdAt": "2024-01-01T00:00:00.000Z"
        }
      ],
      "totalReviews": 15,
      "totalPages": 3,
      "currentPage": 1
    }
  }
}
```

### Get Review Statistics

```http
GET /reviews/product/:productId/stats
```

**Response:**

```json
{
  "success": true,
  "message": "Review statistics fetched successfully",
  "data": {
    "totalReviews": 25,
    "averageRating": 4.2,
    "ratingDistribution": {
      "5": { "count": 10, "percentage": 40 },
      "4": { "count": 8, "percentage": 32 },
      "3": { "count": 4, "percentage": 16 },
      "2": { "count": 2, "percentage": 8 },
      "1": { "count": 1, "percentage": 4 }
    }
  }
}
```

### Update Review

```http
PUT /reviews/:reviewId
Authorization: Bearer <user-token>
```

**Request Body:**

```json
{
  "rating": 4,
  "comment": "Updated comment about the product."
}
```

### Delete Review

```http
DELETE /reviews/:reviewId
Authorization: Bearer <user-token>
```

**Response:**

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

### Get User Reviews for Product

```http
GET /reviews/product/:productId/user
Authorization: Bearer <user-token>
```

---

## Error Responses

### Validation Error

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "type": "field",
      "value": "invalid-email",
      "msg": "Please provide a valid email",
      "path": "email",
      "location": "body"
    }
  ]
}
```

### Authentication Error

```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

### Not Found Error

```json
{
  "success": false,
  "message": "Product not found"
}
```

### Server Error

```json
{
  "success": false,
  "message": "Server Error"
}
```

---

## Sample API Calls

### Using cURL

**Register User:**

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "9876543210"
  }'
```

**Login:**

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Get Products:**

```bash
curl -X GET "http://localhost:5000/api/products?category=hoodies&sort=price_asc"
```

**Add to Cart:**

```bash
curl -X POST http://localhost:5000/api/cart \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "productId": "product-id-here",
    "size": "L",
    "quantity": 1
  }'
```

### Using JavaScript/Fetch

```javascript
// Login
const loginResponse = await fetch("http://localhost:5000/api/auth/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    email: "john@example.com",
    password: "password123",
  }),
});

const loginData = await loginResponse.json();
const token = loginData.data.token;

// Get products
const productsResponse = await fetch(
  "http://localhost:5000/api/products?category=hoodies"
);
const productsData = await productsResponse.json();

// Add to cart
const cartResponse = await fetch("http://localhost:5000/api/cart", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    productId: "product-id-here",
    size: "L",
    quantity: 1,
  }),
});
```

---

## Testing the API

1. **Start the server:**

   ```bash
   npm run dev
   ```

2. **Run seeders (if not done):**

   ```bash
   npm run seed
   ```

3. **Test endpoints using Postman or cURL**

4. **Sample admin credentials:**

   - Email: `admin@icl.com`
   - Password: `admin123`

5. **Sample user credentials:**
   - Email: `john@example.com`
   - Password: `password123`
