import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    size: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
    },
    price: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"],
    },
    total: {
      type: Number,
      required: true,
      min: [0, "Total cannot be negative"],
    },
  },
  { _id: false }
);

const paymentSchema = new mongoose.Schema(
  {
    method: {
      type: String,
      required: true,
      enum: ["cod", "upi", "card", "wallet"],
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    transactionId: {
      type: String,
      trim: true,
    },
    upiId: {
      type: String,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, "Amount cannot be negative"],
    },
    gateway: {
      type: String,
      trim: true,
    },
    gatewayResponse: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [orderItemSchema],
    shippingAddress: {
      firstName: {
        type: String,
        required: true,
        trim: true,
      },
      lastName: {
        type: String,
        required: true,
        trim: true,
      },
      phone: {
        type: String,
        required: true,
        trim: true,
      },
      street: {
        type: String,
        required: true,
        trim: true,
      },
      city: {
        type: String,
        required: true,
        trim: true,
      },
      state: {
        type: String,
        required: true,
        trim: true,
      },
      zipCode: {
        type: String,
        required: true,
        trim: true,
      },
      country: {
        type: String,
        default: "India",
        trim: true,
      },
    },
    status: {
      type: String,
      required: true,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "returned",
      ],
      default: "pending",
    },
    payment: paymentSchema,
    subtotal: {
      type: Number,
      required: true,
      min: [0, "Subtotal cannot be negative"],
    },
    shippingCost: {
      type: Number,
      default: 0,
      min: [0, "Shipping cost cannot be negative"],
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: [0, "Discount amount cannot be negative"],
    },
    coinsUsed: {
      type: Number,
      default: 0,
      min: [0, "Coins used cannot be negative"],
    },
    coinsEarned: {
      type: Number,
      default: 0,
      min: [0, "Coins earned cannot be negative"],
    },
    total: {
      type: Number,
      required: true,
      min: [0, "Total cannot be negative"],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
    trackingNumber: {
      type: String,
      trim: true,
    },
    estimatedDelivery: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
    cancelledBy: {
      type: String,
      enum: ["customer", "admin", "system"],
    },
    cancellationReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for order status display
orderSchema.virtual("statusDisplay").get(function () {
  const statusMap = {
    pending: "Pending",
    confirmed: "Confirmed",
    processing: "Processing",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
    returned: "Returned",
  };
  return statusMap[this.status] || this.status;
});

// Virtual for payment status display
orderSchema.virtual("paymentStatusDisplay").get(function () {
  const statusMap = {
    pending: "Pending",
    completed: "Completed",
    failed: "Failed",
    refunded: "Refunded",
  };
  return statusMap[this.payment.status] || this.payment.status;
});

// Indexes for better query performance (orderNumber is already unique in schema)
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ "payment.status": 1 });
orderSchema.index({ createdAt: -1 });

// Static method to generate order number
orderSchema.statics.generateOrderNumber = function () {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `ICL${timestamp}${random}`;
};

// Method to update order status
orderSchema.methods.updateStatus = async function (newStatus, notes = "") {
  this.status = newStatus;

  if (newStatus === "delivered") {
    this.deliveredAt = new Date();
  } else if (newStatus === "cancelled") {
    this.cancelledAt = new Date();
  }

  if (notes) {
    this.notes = notes;
  }

  return await this.save();
};

// Method to update payment status
orderSchema.methods.updatePaymentStatus = async function (
  newStatus,
  transactionId = null
) {
  this.payment.status = newStatus;
  if (transactionId) {
    this.payment.transactionId = transactionId;
  }
  return await this.save();
};

// Method to add tracking information
orderSchema.methods.addTracking = async function (
  trackingNumber,
  estimatedDelivery
) {
  this.trackingNumber = trackingNumber;
  this.estimatedDelivery = estimatedDelivery;
  this.status = "shipped";
  return await this.save();
};

// Method to calculate coins earned
orderSchema.methods.calculateCoinsEarned = function () {
  return Math.floor(this.total * 0.01); // 1 coin per 100 rupees
};

// Pre-save middleware to set coins earned if not set
orderSchema.pre("save", function (next) {
  if (this.isNew && !this.coinsEarned) {
    this.coinsEarned = this.calculateCoinsEarned();
  }
  next();
});

export default mongoose.model("Order", orderSchema);
