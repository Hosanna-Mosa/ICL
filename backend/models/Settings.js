import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    // General Settings
    general: {
      storeName: {
        type: String,
        default: "ICL Streetwear",
        trim: true,
      },
      storeDescription: {
        type: String,
        default: "Premium streetwear fashion brand",
        trim: true,
      },
      contactEmail: {
        type: String,
        default: "contact@iclstreetwear.com",
        trim: true,
      },
      contactPhone: {
        type: String,
        default: "+91 9999999999",
        trim: true,
      },
      address: {
        type: String,
        default: "123 Fashion Street",
        trim: true,
      },
      city: {
        type: String,
        default: "Mumbai",
        trim: true,
      },
      state: {
        type: String,
        default: "Maharashtra",
        trim: true,
      },
      pincode: {
        type: String,
        default: "400001",
        trim: true,
      },
      country: {
        type: String,
        default: "India",
        trim: true,
      },
      currency: {
        type: String,
        default: "INR",
        enum: ["INR", "USD", "EUR"],
      },
      timezone: {
        type: String,
        default: "Asia/Kolkata",
        trim: true,
      },
    },

    // Payment Settings
    payment: {
      phonepeMerchantId: {
        type: String,
        trim: true,
      },
      phonepeMerchantKey: {
        type: String,
        trim: true,
      },
      phonepeEnvironment: {
        type: String,
        enum: ["UAT", "PROD"],
        default: "UAT",
      },
      upiEnabled: {
        type: Boolean,
        default: true,
      },
      codEnabled: {
        type: Boolean,
        default: true,
      },
      minOrderAmount: {
        type: Number,
        default: 100,
        min: [0, "Minimum order amount cannot be negative"],
      },
      maxOrderAmount: {
        type: Number,
        default: 50000,
        min: [0, "Maximum order amount cannot be negative"],
      },
    },

    // Email Settings
    email: {
      emailService: {
        type: String,
        enum: ["gmail", "smtp"],
        default: "gmail",
      },
      emailHost: {
        type: String,
        default: "smtp.gmail.com",
        trim: true,
      },
      emailPort: {
        type: Number,
        default: 587,
        min: [1, "Port must be positive"],
        max: [65535, "Port must be less than 65536"],
      },
      emailUser: {
        type: String,
        trim: true,
      },
      emailPass: {
        type: String,
        trim: true,
      },
      emailFrom: {
        type: String,
        default: "ICL Streetwear <noreply@iclstreetwear.com>",
        trim: true,
      },
      emailSecure: {
        type: Boolean,
        default: false,
      },
    },

    // Security Settings
    security: {
      jwtSecret: {
        type: String,
        default: "your-super-secret-jwt-key-change-this-in-production",
        trim: true,
      },
      jwtExpire: {
        type: String,
        default: "7d",
        trim: true,
      },
      rateLimitWindow: {
        type: Number,
        default: 900000, // 15 minutes in milliseconds
        min: [60000, "Rate limit window must be at least 1 minute"],
      },
      rateLimitMaxRequests: {
        type: Number,
        default: 100,
        min: [1, "Rate limit max requests must be at least 1"],
      },
      sessionTimeout: {
        type: Number,
        default: 3600, // 1 hour in seconds
        min: [60, "Session timeout must be at least 1 minute"],
      },
      requireTwoFactor: {
        type: Boolean,
        default: false,
      },
    },

    // System Settings
    system: {
      nodeEnv: {
        type: String,
        enum: ["development", "staging", "production"],
        default: "development",
      },
      port: {
        type: Number,
        default: 5000,
        min: [1, "Port must be positive"],
        max: [65535, "Port must be less than 65536"],
      },
      frontendUrl: {
        type: String,
        default: "http://localhost:5173",
        trim: true,
      },
      cloudinaryCloudName: {
        type: String,
        trim: true,
      },
      cloudinaryApiKey: {
        type: String,
        trim: true,
      },
      cloudinaryApiSecret: {
        type: String,
        trim: true,
      },
    },

    // Notification Settings
    notifications: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      orderNotifications: {
        type: Boolean,
        default: true,
      },
      userNotifications: {
        type: Boolean,
        default: true,
      },
      systemNotifications: {
        type: Boolean,
        default: true,
      },
      notificationEmail: {
        type: String,
        default: "admin@iclstreetwear.com",
        trim: true,
      },
    },

    // Metadata
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
settingsSchema.index({ "general.storeName": 1 });

// Static method to get or create default settings
settingsSchema.statics.getOrCreateDefault = async function () {
  let settings = await this.findOne();
  
  if (!settings) {
    settings = new this();
    await settings.save();
  }
  
  return settings;
};

// Instance method to update specific section
settingsSchema.methods.updateSection = async function (section, data) {
  if (this[section]) {
    this[section] = { ...this[section], ...data };
    this.lastUpdated = new Date();
    await this.save();
    return this;
  }
  throw new Error(`Invalid section: ${section}`);
};

// Virtual for formatted store address
settingsSchema.virtual("general.fullAddress").get(function () {
  const { address, city, state, pincode, country } = this.general;
  return `${address}, ${city}, ${state} ${pincode}, ${country}`.trim();
});

// Ensure virtuals are included in JSON output
settingsSchema.set("toJSON", { virtuals: true });
settingsSchema.set("toObject", { virtuals: true });

export default mongoose.model("Settings", settingsSchema);
