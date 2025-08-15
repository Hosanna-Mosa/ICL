# Razorpay Integration Setup Guide

This guide will help you set up Razorpay payment integration for the BRELIS e-commerce platform.

## Backend Setup

### 1. Install Dependencies

Navigate to the backend directory and install the Razorpay package:

```bash
cd backend
npm install razorpay@^2.9.2
```

### 2. Environment Variables

Add the following variables to your `.env` file in the backend directory:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
```

### 3. Get Razorpay Credentials

1. Sign up for a Razorpay account at [https://razorpay.com](https://razorpay.com)
2. Go to Settings > API Keys
3. Generate a new key pair
4. Copy the Key ID and Key Secret to your environment variables

## Frontend Setup

### 1. Install Dependencies

Navigate to the frontend directory and install the Razorpay package:

```bash
cd frontend
npm install razorpay@^2.9.2
```

### 2. Environment Variables

Create a `.env` file in the frontend directory and add:

```env
# API Configuration
VITE_API_URL=http://localhost:8000/api

# Razorpay Configuration
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id_here
```

### 3. Razorpay Script

The Razorpay script has been added to `frontend/index.html`. Make sure it's present:

```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

## Features Implemented

### 1. Payment Methods

- **Razorpay Gateway**: Secure payment processing with multiple payment options
- **UPI Payment**: Direct UPI transfers
- **Cash on Delivery**: Pay on delivery

### 2. Backend Endpoints

#### Create Razorpay Order

```
POST /api/payments/create-order
```

Creates a Razorpay order and database order entry.

#### Verify Payment

```
POST /api/payments/verify
```

Verifies the payment signature and updates order status.

#### Get Payment Status

```
GET /api/payments/status/:orderId
```

Returns the current payment and order status.

### 3. Frontend Integration

#### Payment Flow

1. User selects "Secure Payment Gateway" option
2. System creates Razorpay order via backend
3. Razorpay modal opens with payment options
4. User completes payment
5. Payment is verified on backend
6. Order is confirmed and cart is cleared

#### Features

- Real-time payment processing
- Automatic order confirmation
- Email notifications
- Coin integration maintained
- Stock management
- Error handling and user feedback

## Testing

### Test Mode

For testing, use Razorpay's test credentials:

- Key ID: `rzp_test_...`
- Key Secret: `...`

### Test Cards

Use these test card numbers:

- Success: `4111 1111 1111 1111`
- Failure: `4000 0000 0000 0002`

## Security Features

1. **Signature Verification**: All payments are verified using HMAC SHA256
2. **Server-side Validation**: Payment verification happens on backend
3. **Order Validation**: Stock and user validation before payment
4. **Error Handling**: Comprehensive error handling and user feedback

## Order Flow

1. **Cart Validation**: Check stock availability and user authentication
2. **Order Creation**: Create order in database with pending status
3. **Payment Processing**: Initialize Razorpay payment
4. **Payment Verification**: Verify payment signature and update order
5. **Order Confirmation**: Update stock, clear cart, send confirmation email
6. **Coin Processing**: Handle coin redemption and earning

## Error Handling

The integration includes comprehensive error handling for:

- Payment failures
- Network errors
- Invalid signatures
- Insufficient stock
- Authentication issues

## Production Deployment

### 1. Update Environment Variables

Replace test credentials with production credentials:

- Key ID: `rzp_live_...`
- Key Secret: Production secret

### 2. SSL Certificate

Ensure your domain has a valid SSL certificate for secure payments.

### 3. Webhook Setup (Optional)

For additional security, set up Razorpay webhooks to handle payment status updates.

## Troubleshooting

### Common Issues

1. **Payment Modal Not Opening**

   - Check if Razorpay script is loaded
   - Verify API key is correct
   - Check browser console for errors

2. **Payment Verification Fails**

   - Verify signature calculation
   - Check environment variables
   - Ensure order exists in database

3. **Order Not Created**
   - Check cart validation
   - Verify user authentication
   - Check stock availability

### Debug Mode

Enable debug logging by adding to backend `.env`:

```env
DEBUG=razorpay:*
```

## Support

For issues related to:

- **Razorpay Integration**: Check Razorpay documentation
- **Backend Issues**: Check server logs and API responses
- **Frontend Issues**: Check browser console and network tab

## Files Modified

### Backend

- `controllers/paymentController.js` - Payment processing logic
- `routes/payments.js` - Payment API routes
- `server.js` - Added payment routes
- `package.json` - Added Razorpay dependency
- `env.example` - Added Razorpay environment variables

### Frontend

- `src/utils/api.js` - Added payment API functions
- `src/pages/Checkout.tsx` - Integrated Razorpay payment flow
- `package.json` - Added Razorpay dependency
- `index.html` - Added Razorpay script

This integration provides a secure, user-friendly payment experience while maintaining all existing functionality like coin integration, stock management, and order processing.

