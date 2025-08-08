# ICL Streetwear Backend API

A comprehensive Node.js backend for the ICL Streetwear e-commerce platform built with Express.js, MongoDB, and JWT authentication.

## 🚀 Features

- **User Management**: Registration, login, profile management
- **Product Management**: CRUD operations with categories and filters
- **Shopping Cart**: Add, update, remove items with coupon support
- **Order Management**: Complete order lifecycle with status tracking
- **Coin System**: Earn and redeem coins for discounts
- **Wishlist**: Save favorite products
- **Admin Panel**: Full admin functionality for managing products and orders
- **Payment Integration**: Support for COD, UPI, and other payment methods
- **Advanced Logging**: Winston and Morgan for comprehensive request/error logging
- **Security**: JWT authentication, rate limiting, input validation
- **Database Seeding**: Sample data for testing and development

## 🛠 Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Security**: bcryptjs
- **Validation**: express-validator
- **Logging**: Winston + Morgan
- **Security**: Helmet, CORS, Rate Limiting, XSS Protection
- **Image Handling**: Cloudinary (ready for integration)

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic
│   │   ├── productController.js  # Product management
│   │   ├── cartController.js     # Shopping cart logic
│   │   ├── orderController.js    # Order management
│   │   └── userController.js     # User & wishlist management
│   ├── models/
│   │   ├── User.js              # User schema
│   │   ├── Product.js           # Product schema
│   │   ├── Cart.js              # Cart schema
│   │   └── Order.js             # Order schema
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── products.js          # Product routes
│   │   ├── cart.js              # Cart routes
│   │   ├── orders.js            # Order routes
│   │   └── users.js             # User routes
│   ├── middlewares/
│   │   ├── auth.js              # JWT authentication
│   │   ├── errorHandler.js      # Error handling
│   │   └── validation.js        # Input validation
│   ├── utils/
│   │   └── logger.js            # Custom logging utility
│   └── seeders/
│       ├── userSeeder.js        # Sample users
│       ├── productSeeder.js     # Sample products
│       └── runSeeders.js        # Seeder runner
├── logs/                        # Log files
├── server.js                    # Main application file
├── package.json                 # Dependencies
└── env.example                  # Environment variables template
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   cd backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   ```bash
   cp env.example .env
   ```

   Edit `.env` file with your configuration:

   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/icl_streetwear
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d
   ```

4. **Run database seeders**

   ```bash
   npm run seed
   ```

5. **Start the server**

   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## 📚 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Products

- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get single product
- `GET /api/products/featured` - Get featured products
- `GET /api/products/category/:category` - Get products by category
- `GET /api/products/search` - Search products
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Cart

- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:productId` - Update cart item
- `DELETE /api/cart/:productId` - Remove item from cart
- `DELETE /api/cart` - Clear cart
- `POST /api/cart/coupon` - Apply coupon
- `DELETE /api/cart/coupon` - Remove coupon
- `POST /api/cart/coins` - Apply coins discount
- `DELETE /api/cart/coins` - Remove coins discount

### Orders

- `POST /api/orders` - Create order (checkout)
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/cancel` - Cancel order
- `PUT /api/orders/:id/status` - Update order status (Admin)
- `GET /api/orders/admin/all` - Get all orders (Admin)

### Users

- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/wishlist` - Get user wishlist
- `POST /api/user/wishlist` - Add to wishlist
- `DELETE /api/user/wishlist/:productId` - Remove from wishlist
- `GET /api/user/coins` - Get user coins
- `POST /api/user/coins/redeem` - Redeem coins
- `POST /api/user/coins/add` - Add coins to user (Admin)
- `GET /api/user/admin/all` - Get all users (Admin)
- `GET /api/user/admin/:id` - Get user by ID (Admin)
- `PUT /api/user/admin/:id` - Update user (Admin)

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 🎯 Sample Data

After running the seeders, you'll have:

### Admin User

- Email: `admin@icl.com`
- Password: `admin123`
- Role: `admin`

### Sample Users

- `john@example.com` / `password123`
- `jane@example.com` / `password123`
- `mike@example.com` / `password123`
- `sarah@example.com` / `password123`

### Sample Products

- Premium Oversized Hoodie
- Classic Oversized Tee
- Urban Cargo Pants
- Street Essential Hoodie
- And more...

## 📊 Logging

The application uses Winston for comprehensive logging:

- **Console**: Real-time logs during development
- **Files**:
  - `logs/combined.log` - All logs
  - `logs/error.log` - Error logs only
  - `logs/api.log` - API request logs
  - `logs/exceptions.log` - Unhandled exceptions
  - `logs/rejections.log` - Unhandled promise rejections

## 🔒 Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Prevent abuse
- **Input Validation**: Sanitize user input
- **XSS Protection**: Prevent cross-site scripting
- **NoSQL Injection Protection**: Sanitize database queries
- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt for password security

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📝 Environment Variables

| Variable                  | Description               | Default       |
| ------------------------- | ------------------------- | ------------- |
| `PORT`                    | Server port               | `5000`        |
| `NODE_ENV`                | Environment               | `development` |
| `MONGODB_URI`             | MongoDB connection string | -             |
| `JWT_SECRET`              | JWT secret key            | -             |
| `JWT_EXPIRE`              | JWT expiration            | `7d`          |
| `CLOUDINARY_CLOUD_NAME`   | Cloudinary cloud name     | -             |
| `CLOUDINARY_API_KEY`      | Cloudinary API key        | -             |
| `CLOUDINARY_API_SECRET`   | Cloudinary API secret     | -             |
| `RATE_LIMIT_WINDOW_MS`    | Rate limit window         | `900000`      |
| `RATE_LIMIT_MAX_REQUESTS` | Rate limit max requests   | `100`         |

## 🚀 Deployment

### Production Checklist

1. Set `NODE_ENV=production`
2. Configure MongoDB connection string
3. Set strong JWT secret
4. Configure CORS origins
5. Set up proper logging
6. Configure Cloudinary (if using image uploads)
7. Set up monitoring and error tracking

### Docker (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@icl.com or create an issue in the repository.
