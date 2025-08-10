# Pocket/Coins Feature Implementation

## Overview
A comprehensive pocket/coins system has been implemented for the ICL e-commerce platform. Users can earn coins by making purchases and redeem them for discounts on future orders.

## Features Implemented

### 🪙 Coin System
- **Earning Coins**: Users earn 1 coin for every ₹100 spent on orders
- **Redeeming Coins**: Users can redeem coins during checkout for discounts (1 coin = ₹1)
- **Transaction History**: Complete tracking of all coin transactions
- **Real-time Balance**: Live coin balance updates

### 📱 Frontend Components

#### 1. Pocket Page (`/pocket`)
- **Location**: `ICL/frontend/src/pages/Pocket.tsx`
- **Features**:
  - Beautiful UI with pocket icon and gradient design
  - Real-time coin balance display
  - Transaction history with detailed information
  - Monthly earning statistics
  - How-to-earn instructions
  - Responsive design for mobile and desktop

#### 2. Header Integration
- **Location**: `ICL/frontend/src/components/Layout/Header.tsx`
- **Features**:
  - Pocket icon in the main navigation
  - Mobile menu integration
  - Consistent with existing design

#### 3. API Integration
- **Location**: `ICL/frontend/src/utils/api.js`
- **Endpoints**:
  - `getUserCoins()` - Get user's current coin balance
  - `getCoinTransactions()` - Get transaction history
  - `redeemCoins(amount)` - Redeem coins for discounts

### 🔧 Backend Implementation

#### 1. Database Models

##### CoinTransaction Model (`ICL/backend/models/CoinTransaction.js`)
```javascript
{
  user: ObjectId,           // Reference to User
  type: "earned" | "redeemed",
  amount: Number,           // Coin amount
  description: String,      // Transaction description
  orderNumber: String,      // Related order number
  order: ObjectId,          // Reference to Order
  balanceAfter: Number,     // User's balance after transaction
  createdAt: Date,
  updatedAt: Date
}
```

##### User Model Updates (`ICL/backend/models/User.js`)
- Added `coins` field (default: 0)
- Added `addCoins(amount)` method
- Added `redeemCoins(amount)` method

##### Order Model Updates (`ICL/backend/models/Order.js`)
- Added `coinsEarned` field (calculated: 1 coin per ₹100)
- Added `coinsUsed` field (coins redeemed during checkout)

#### 2. API Endpoints

##### User Routes (`ICL/backend/routes/users.js`)
- `GET /api/user/coins` - Get user's coin balance
- `GET /api/user/coins/transactions` - Get transaction history
- `POST /api/user/coins/redeem` - Redeem coins

##### Admin Routes
- `POST /api/user/coins/add` - Admin can add coins to users

#### 3. Controllers

##### User Controller (`ICL/backend/controllers/userController.js`)
- `getUserCoins()` - Returns user's current coin balance
- `getCoinTransactions()` - Returns paginated transaction history
- `redeemCoins()` - Handles coin redemption
- `addCoinsToUser()` - Admin function to add coins

##### Order Controller (`ICL/backend/controllers/orderController.js`)
- Automatic coin earning when orders are delivered
- Automatic coin deduction when coins are used in checkout
- Transaction record creation for all coin operations

## How It Works

### 1. Earning Coins
1. User places an order
2. When order is delivered, system calculates coins earned (1 coin per ₹100)
3. Coins are automatically added to user's balance
4. Transaction record is created

### 2. Using Coins
1. User applies coins during checkout
2. System validates sufficient coin balance
3. Coins are deducted from user's balance
4. Transaction record is created
5. Discount is applied to order total

### 3. Transaction Tracking
- All coin operations create detailed transaction records
- Each transaction includes:
  - Type (earned/redeemed)
  - Amount
  - Description
  - Related order information
  - Balance after transaction
  - Timestamp

## Testing the Feature

### Prerequisites
1. MongoDB running locally or accessible
2. Backend server running (`npm start` in `ICL/backend`)
3. Frontend server running (`npm run dev` in `ICL/frontend`)

### Test Steps

#### 1. Backend Testing
```bash
cd ICL/backend
node test-pocket.js
```

#### 2. Frontend Testing
1. Start the frontend server
2. Navigate to `http://localhost:5173`
3. Sign in to your account
4. Click the pocket icon (🪙) in the header
5. View your coin balance and transaction history

#### 3. Manual Testing
1. **Create an order** with a value over ₹100
2. **Complete the order** (admin marks as delivered)
3. **Check pocket page** - should show earned coins
4. **Create another order** and apply coins during checkout
5. **Check pocket page** - should show redeemed transaction

### Sample Test Data
- Order value: ₹2500 → Earns 25 coins
- Order value: ₹1500 → Earns 15 coins
- Redeem 10 coins → Creates redemption transaction

## File Structure

```
ICL/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   └── Pocket.tsx              # Main pocket page
│   │   ├── components/Layout/
│   │   │   └── Header.tsx              # Header with pocket icon
│   │   └── utils/
│   │       └── api.js                  # API methods for coins
│   └── App.tsx                         # Route configuration
└── backend/
    ├── models/
    │   ├── CoinTransaction.js          # Transaction model
    │   ├── User.js                     # Updated with coins
    │   └── Order.js                    # Updated with coin fields
    ├── controllers/
    │   ├── userController.js           # Coin-related endpoints
    │   └── orderController.js          # Order coin integration
    ├── routes/
    │   └── users.js                    # Coin API routes
    └── test-pocket.js                  # Test script
```

## Future Enhancements

1. **Coin Expiry**: Add expiration dates for earned coins
2. **Tier System**: Different earning rates based on user tier
3. **Referral Bonus**: Earn coins for referring friends
4. **Special Events**: Bonus coin earning during sales
5. **Coin Transfer**: Allow users to gift coins to others
6. **Analytics Dashboard**: Detailed coin usage analytics

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in environment variables

2. **Coins Not Updating**
   - Verify order status is "delivered"
   - Check transaction records in database

3. **Frontend Not Loading**
   - Ensure both frontend and backend servers are running
   - Check browser console for errors

### Debug Commands
```bash
# Check MongoDB connection
mongo --eval "db.adminCommand('ping')"

# View coin transactions
mongo icl --eval "db.cointransactions.find().pretty()"

# Check user coins
mongo icl --eval "db.users.find({}, {email: 1, coins: 1})"
```

## Security Considerations

1. **Authentication Required**: All coin operations require user authentication
2. **Admin Only**: Adding coins manually is restricted to admin users
3. **Validation**: All coin amounts are validated for positive values
4. **Transaction Integrity**: Each operation creates an audit trail
5. **Balance Validation**: Prevents negative coin balances

---

**Implementation Status**: ✅ Complete
**Test Status**: ✅ Ready for testing
**Documentation**: ✅ Complete
