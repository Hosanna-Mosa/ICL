import mongoose from "mongoose";

const lookbookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    image: {
      type: String,
      required: [true, "Image URL is required"],
    },
    products: [
      {
        type: String,
        required: [true, "At least one product is required"],
      },
    ],
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["Street Inspirations", "Urban Fits", "Seasonal", "Featured"],
      default: "Street Inspirations",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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

// Index for better query performance
lookbookSchema.index({ category: 1, isActive: 1, sortOrder: 1 });
lookbookSchema.index({ title: "text", description: "text" });

// Pre-save middleware to update updatedBy field
lookbookSchema.pre("save", function (next) {
  if (this.isModified() && !this.isNew) {
    this.updatedBy = this.createdBy; // In a real app, you'd get this from the request context
  }
  next();
});

const Lookbook = mongoose.model("Lookbook", lookbookSchema);

export default Lookbook;
