import mongoose from "mongoose";

const coinTransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["earned", "redeemed"],
    },
    amount: {
      type: Number,
      required: true,
      min: [1, "Amount must be at least 1"],
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    orderNumber: {
      type: String,
      trim: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    balanceAfter: {
      type: Number,
      required: true,
      min: [0, "Balance cannot be negative"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
coinTransactionSchema.index({ user: 1, createdAt: -1 });
coinTransactionSchema.index({ type: 1 });
coinTransactionSchema.index({ order: 1 });

// Virtual for transaction type display
coinTransactionSchema.virtual("typeDisplay").get(function () {
  return this.type === "earned" ? "Earned" : "Redeemed";
});

// Virtual for formatted amount
coinTransactionSchema.virtual("formattedAmount").get(function () {
  return `${this.type === "earned" ? "+" : "-"}${this.amount}`;
});

// Static method to create earned transaction
coinTransactionSchema.statics.createEarnedTransaction = async function (
  userId,
  amount,
  description,
  orderNumber = null,
  orderId = null
) {
  const user = await mongoose.model("User").findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const balanceAfter = user.coins + amount;

  return await this.create({
    user: userId,
    type: "earned",
    amount,
    description,
    orderNumber,
    order: orderId,
    balanceAfter,
  });
};

// Static method to create redeemed transaction
coinTransactionSchema.statics.createRedeemedTransaction = async function (
  userId,
  amount,
  description,
  orderNumber = null,
  orderId = null
) {
  const user = await mongoose.model("User").findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  if (user.coins < amount) {
    throw new Error("Insufficient coins");
  }

  const balanceAfter = user.coins - amount;

  return await this.create({
    user: userId,
    type: "redeemed",
    amount,
    description,
    orderNumber,
    order: orderId,
    balanceAfter,
  });
};

export default mongoose.model("CoinTransaction", coinTransactionSchema);


