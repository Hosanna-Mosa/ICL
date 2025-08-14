import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Filter,
  Package,
  Upload,
  X,
} from "lucide-react";
import api from "@/utils/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

type AdminProduct = {
  _id: string;
  name: string;
  description?: string;
  category: string;
  subcategory?: string;
  brand?: string;
  basePrice: number;
  salePrice?: number;
  coinsEarned?: number;
  coinsRequired?: number;
  fabric?: string;
  gsm?: string;
  fit?: string;
  washCare?: string;
  tags?: string[];
  images?: Array<{
    url: string;
    alt?: string;
    isPrimary?: boolean;
    public_id?: string;
  }>;
  sizes?: Array<{
    size: string;
    stock: number;
    price: number;
  }>;
  totalStock?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  createdAt: string;
};

const categories = [
  { label: "All Categories", value: "all" },
  { label: "Hoodies", value: "hoodies" },
  { label: "T-Shirts", value: "tshirts" },
  { label: "Pants", value: "pants" },
  { label: "Shorts", value: "shorts" },
  { label: "Jackets", value: "jackets" },
  { label: "Accessories", value: "accessories" },
];

const statusColors = {
  active: "bg-success/10 text-success border-success/20",
  "out-of-stock": "bg-warning/10 text-warning border-warning/20",
  disabled: "bg-muted/10 text-muted-foreground border-muted/20",
};

type ImageInput = {
  url: string;
  alt?: string;
  isPrimary?: boolean;
  file?: File;
  preview?: string;
};
type SizeInput = { size: string; stock: number; price: number };
const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"] as const;
const fitOptions = ["regular", "oversized", "slim", "relaxed"] as const;

// Image validation
const allowedImageTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];
const maxFileSize = 5 * 1024 * 1024; // 5MB

const AddProductDialog: React.FC<{ onCreated: () => void }> = ({
  onCreated,
}) => {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("hoodies");
  const [subcategory, setSubcategory] = useState("");
  const [brand, setBrand] = useState("BRELIS");
  const [basePrice, setBasePrice] = useState<string>("");
  const [salePrice, setSalePrice] = useState<string>("");
  const [coinsEarned, setCoinsEarned] = useState<string>("");
  const [coinsRequired, setCoinsRequired] = useState<string>("");
  const [fabric, setFabric] = useState("");
  const [gsm, setGsm] = useState("");
  const [fit, setFit] = useState<string>("regular");
  const [washCare, setWashCare] = useState("");
  const [tags, setTags] = useState<string>("");
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  const [images, setImages] = useState<ImageInput[]>([]);
  const [sizes, setSizes] = useState<SizeInput[]>([]);
  const [error, setError] = useState<string>("");
  const [dragActive, setDragActive] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  const resetForm = () => {
    setName("");
    setDescription("");
    setCategory("hoodies");
    setSubcategory("");
    setBrand("BRELIS");
    setBasePrice("");
    setSalePrice("");
    setCoinsEarned("");
    setCoinsRequired("");
    setFabric("");
    setGsm("");
    setFit("regular");
    setWashCare("");
    setTags("");
    setIsActive(true);
    setIsFeatured(false);
    setImages([]);
    setSizes([]);
    setError("");
  };

  const validateImage = (file: File): string | null => {
    if (!allowedImageTypes.includes(file.type)) {
      return `File type ${file.type} is not supported. Please use JPEG, PNG, WebP, or GIF.`;
    }
    if (file.size > maxFileSize) {
      return `File size ${(file.size / 1024 / 1024).toFixed(
        2
      )}MB exceeds the maximum limit of 5MB.`;
    }
    return null;
  };

  const processImageFile = (file: File): Promise<ImageInput> => {
    return new Promise((resolve, reject) => {
      const error = validateImage(file);
      if (error) {
        reject(new Error(error));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = e.target?.result as string;
        resolve({
          url: URL.createObjectURL(file),
          alt: file.name,
          isPrimary: images.length === 0,
          file,
          preview,
        });
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  };

  const addImages = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const newImages: ImageInput[] = [];

    for (const file of fileArray) {
      try {
        const image = await processImageFile(file);
        newImages.push(image);
      } catch (error: any) {
        setError(error.message);
        setTimeout(() => setError(""), 3000);
      }
    }

    if (newImages.length > 0) {
      setImages((prev) => [...prev, ...newImages]);
    }
  };

  const updateImage = (index: number, updates: Partial<ImageInput>) =>
    setImages((prev) =>
      prev.map((img, i) => (i === index ? { ...img, ...updates } : img))
    );
  const removeImage = (index: number) =>
    setImages((prev) => prev.filter((_, i) => i !== index));
  const setPrimaryImage = (index: number) =>
    setImages((prev) =>
      prev.map((img, i) => ({ ...img, isPrimary: i === index }))
    );

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      addImages(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      addImages(e.target.files);
    }
  };

  const addSizeRow = () =>
    setSizes((prev) => [...prev, { size: "M", stock: 0, price: 0 }]);
  const updateSize = (index: number, updates: Partial<SizeInput>) =>
    setSizes((prev) =>
      prev.map((s, i) => (i === index ? { ...s, ...updates } : s))
    );
  const removeSize = (index: number) =>
    setSizes((prev) => prev.filter((_, i) => i !== index));

  const submit = async () => {
    setSubmitting(true);
    setError("");
    try {
      if (!name.trim() || !description.trim() || !category || !basePrice) {
        throw new Error(
          "Please fill required fields: name, description, category, base price"
        );
      }

      // Upload images to Cloudinary first
      let uploadedImages = [];
      if (images.length > 0) {
        const imageDataArray = images
          .filter((img) => img.file && img.preview)
          .map((img) => img.preview!);

        if (imageDataArray.length > 0) {
          setUploadingImages(true);
          try {
            const uploadResult = await api.upload.uploadImages(
              imageDataArray,
              "icl-products"
            );

            if (uploadResult.success && uploadResult.data.uploaded.length > 0) {
              uploadedImages = uploadResult.data.uploaded.map(
                (uploadedImg: any, index: number) => {
                  const originalImage = images.find(
                    (img) => img.preview === imageDataArray[index]
                  );
                  return {
                    url: uploadedImg.url,
                    alt: originalImage?.alt?.trim(),
                    isPrimary: Boolean(originalImage?.isPrimary),
                    public_id: uploadedImg.public_id,
                  };
                }
              );
            }
          } finally {
            setUploadingImages(false);
          }
        }
      }

      const payload: any = {
        name: name.trim(),
        description: description.trim(),
        category,
        basePrice: Number(basePrice),
        brand: brand.trim() || undefined,
        subcategory: subcategory.trim() || undefined,
        salePrice: salePrice ? Number(salePrice) : undefined,
        coinsEarned: coinsEarned ? Number(coinsEarned) : undefined,
        coinsRequired: coinsRequired ? Number(coinsRequired) : undefined,
        fabric: fabric.trim() || undefined,
        gsm: gsm.trim() || undefined,
        fit,
        washCare: washCare.trim() || undefined,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        isActive,
        isFeatured,
        images: uploadedImages,
        sizes: sizes.map((s) => ({
          size: s.size,
          stock: Number(s.stock || 0),
          price: Number(s.price || 0),
        })),
      };

      // Remove undefined values to avoid validation issues
      Object.keys(payload).forEach((key) => {
        if (
          payload[key] === undefined ||
          payload[key] === null ||
          payload[key] === ""
        ) {
          delete payload[key];
        }
      });

      await api.products.create(payload);
      setOpen(false);
      resetForm();
      onCreated();
    } catch (e: any) {
      if (e?.payload?.errors && Array.isArray(e.payload.errors)) {
        const errorMessages = e.payload.errors
          .map((err: any) => `${err.field}: ${err.message}`)
          .join(", ");
        setError(`Validation failed: ${errorMessages}`);
      } else {
        setError(e?.message || "Failed to create product");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button className="bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow">
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add Product</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Product name"
                />
              </div>
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the product"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Category *</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories
                        .filter((c) => c.value !== "all")
                        .map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            {c.label}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subcategory">Subcategory</Label>
                  <Input
                    id="subcategory"
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    placeholder="Optional"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Fit</Label>
                  <Select value={fit} onValueChange={setFit}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select fit" />
                    </SelectTrigger>
                    <SelectContent>
                      {fitOptions.map((f) => (
                        <SelectItem key={f} value={f}>
                          {f[0].toUpperCase() + f.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="fabric">Fabric</Label>
                  <Input
                    id="fabric"
                    value={fabric}
                    onChange={(e) => setFabric(e.target.value)}
                    placeholder="e.g. 100% Cotton"
                  />
                </div>
                <div>
                  <Label htmlFor="gsm">GSM</Label>
                  <Input
                    id="gsm"
                    value={gsm}
                    onChange={(e) => setGsm(e.target.value)}
                    placeholder="e.g. 240"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="washCare">Wash Care</Label>
                <Input
                  id="washCare"
                  value={washCare}
                  onChange={(e) => setWashCare(e.target.value)}
                  placeholder="e.g. Machine wash cold"
                />
              </div>
              <div>
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Comma separated"
                />
              </div>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="basePrice">Base Price (₹) *</Label>
                  <Input
                    id="basePrice"
                    type="number"
                    min={0}
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="salePrice">Sale Price (₹)</Label>
                  <Input
                    id="salePrice"
                    type="number"
                    min={0}
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="coinsEarned">Coins Earned</Label>
                  <Input
                    id="coinsEarned"
                    type="number"
                    min={0}
                    value={coinsEarned}
                    onChange={(e) => setCoinsEarned(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="coinsRequired">Coins Required</Label>
                  <Input
                    id="coinsRequired"
                    type="number"
                    min={0}
                    value={coinsRequired}
                    onChange={(e) => setCoinsRequired(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="isActive"
                    checked={isActive}
                    onCheckedChange={(v) => setIsActive(Boolean(v))}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="isFeatured"
                    checked={isFeatured}
                    onCheckedChange={(v) => setIsFeatured(Boolean(v))}
                  />
                  <Label htmlFor="isFeatured">Featured</Label>
                </div>
              </div>
            </div>
          </div>

          {/* Images Section - Full Width */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Images *</Label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Files
                  </Button>
                </label>
              </div>
            </div>
            {/* Drag & Drop Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="drag-drop-upload"
              />
              <label htmlFor="drag-drop-upload" className="cursor-pointer">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <div className="text-lg font-medium mb-2">
                  Drop images here or click to browse
                </div>
                <div className="text-sm text-muted-foreground mb-4">
                  Supports JPEG, PNG, WebP, GIF (max 5MB each)
                </div>
                <Button type="button" variant="outline">
                  Choose Images
                </Button>
              </label>
            </div>

            {/* Image Previews */}
            {images.length > 0 && (
              <div className="space-y-3">
                <div className="text-sm font-medium">
                  Uploaded Images ({images.length})
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {images.map((img, idx) => (
                    <div key={idx} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-16 border rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                            {img.preview ? (
                              <img
                                src={img.preview}
                                alt={img.alt || "Product image"}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="h-6 w-6 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium truncate">
                              {img.file?.name || "Image"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {img.file
                                ? `${(img.file.size / 1024 / 1024).toFixed(
                                    2
                                  )}MB`
                                : ""}
                            </div>
                            {img.isPrimary && (
                              <Badge
                                variant="secondary"
                                className="text-xs mt-1"
                              >
                                Primary
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeImage(idx)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div>
                        <Label>Alt Text (optional)</Label>
                        <Input
                          placeholder="Image description for accessibility"
                          value={img.alt || ""}
                          onChange={(e) =>
                            updateImage(idx, { alt: e.target.value })
                          }
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant={img.isPrimary ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPrimaryImage(idx)}
                          className="flex-1"
                        >
                          {img.isPrimary ? "Primary Image" : "Set as Primary"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sizes Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Sizes *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSizeRow}
              >
                Add Size
              </Button>
            </div>
            {sizes.length === 0 && (
              <div className="text-sm text-muted-foreground">
                No size variants added
              </div>
            )}
            <div className="space-y-2">
              {sizes.map((s, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-3">
                    <Select
                      value={s.size}
                      onValueChange={(v) => updateSize(idx, { size: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Size" />
                      </SelectTrigger>
                      <SelectContent>
                        {sizeOptions.map((sz) => (
                          <SelectItem key={sz} value={sz}>
                            {sz}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-3">
                    <Input
                      type="number"
                      min={0}
                      placeholder="Stock"
                      value={String(s.stock)}
                      onChange={(e) =>
                        updateSize(idx, { stock: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className="col-span-4">
                    <Input
                      type="number"
                      min={0}
                      placeholder="Price (₹)"
                      value={String(s.price)}
                      onChange={(e) =>
                        updateSize(idx, { price: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className="col-span-2 flex items-center justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSize(idx)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {error && <div className="text-destructive text-sm mt-2">{error}</div>}
        {uploadingImages && (
          <div className="text-primary text-sm mt-2 flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            Uploading images to cloud storage...
          </div>
        )}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={submitting || uploadingImages}
            className="bg-gradient-primary text-primary-foreground"
          >
            {uploadingImages
              ? "Uploading Images…"
              : submitting
              ? "Creating…"
              : "Create Product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Edit Product Dialog Component
const EditProductDialog: React.FC<{
  product: AdminProduct | null;
  onUpdated: () => void;
  onClose: () => void;
}> = ({ product, onUpdated, onClose }) => {
  const open = !!product;
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("hoodies");
  const [subcategory, setSubcategory] = useState("");
  const [brand, setBrand] = useState("ICL");
  const [basePrice, setBasePrice] = useState<string>("");
  const [salePrice, setSalePrice] = useState<string>("");
  const [coinsEarned, setCoinsEarned] = useState<string>("");
  const [coinsRequired, setCoinsRequired] = useState<string>("");
  const [fabric, setFabric] = useState("");
  const [gsm, setGsm] = useState("");
  const [fit, setFit] = useState<string>("regular");
  const [washCare, setWashCare] = useState("");
  const [tags, setTags] = useState<string>("");
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  const [images, setImages] = useState<ImageInput[]>([]);
  const [sizes, setSizes] = useState<SizeInput[]>([]);
  const [error, setError] = useState<string>("");
  const [dragActive, setDragActive] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Load product data when product prop changes
  useEffect(() => {
    if (product) {
      setName(product.name || "");
      setDescription(product.description || "");
      setCategory(product.category || "hoodies");
      setSubcategory(product.subcategory || "");
      setBrand(product.brand || "BRELIS");
      setBasePrice(String(product.basePrice || ""));
      setSalePrice(product.salePrice ? String(product.salePrice) : "");
      setCoinsEarned(product.coinsEarned ? String(product.coinsEarned) : "");
      setCoinsRequired(
        product.coinsRequired ? String(product.coinsRequired) : ""
      );
      setFabric(product.fabric || "");
      setGsm(product.gsm || "");
      setFit(product.fit || "regular");
      setWashCare(product.washCare || "");
      setTags(product.tags ? product.tags.join(", ") : "");
      setIsActive(product.isActive ?? true);
      setIsFeatured(product.isFeatured ?? false);

      // Load existing images
      if (product.images && Array.isArray(product.images)) {
        setImages(
          product.images.map((img: any) => ({
            url: img.url,
            alt: img.alt || "",
            isPrimary: img.isPrimary || false,
            preview: img.url,
          }))
        );
      }

      // Load existing sizes
      if (product.sizes && Array.isArray(product.sizes)) {
        setSizes(
          product.sizes.map((size: any) => ({
            size: size.size,
            stock: size.stock || 0,
            price: size.price || 0,
          }))
        );
      }
    }
  }, [product]);

  const resetForm = () => {
    setName("");
    setDescription("");
    setCategory("hoodies");
    setSubcategory("");
    setBrand("BRELIS");
    setBasePrice("");
    setSalePrice("");
    setCoinsEarned("");
    setCoinsRequired("");
    setFabric("");
    setGsm("");
    setFit("regular");
    setWashCare("");
    setTags("");
    setIsActive(true);
    setIsFeatured(false);
    setImages([]);
    setSizes([]);
    setError("");
  };

  const validateImage = (file: File): string | null => {
    if (!allowedImageTypes.includes(file.type)) {
      return `File type ${file.type} is not supported. Please use JPEG, PNG, WebP, or GIF.`;
    }
    if (file.size > maxFileSize) {
      return `File size ${(file.size / 1024 / 1024).toFixed(
        2
      )}MB exceeds the maximum limit of 5MB.`;
    }
    return null;
  };

  const processImageFile = (file: File): Promise<ImageInput> => {
    return new Promise((resolve, reject) => {
      const error = validateImage(file);
      if (error) {
        reject(new Error(error));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = e.target?.result as string;
        resolve({
          url: URL.createObjectURL(file),
          alt: file.name,
          isPrimary: images.length === 0,
          file,
          preview,
        });
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  };

  const addImages = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const newImages: ImageInput[] = [];

    for (const file of fileArray) {
      try {
        const image = await processImageFile(file);
        newImages.push(image);
      } catch (error: any) {
        setError(error.message);
        setTimeout(() => setError(""), 3000);
      }
    }

    if (newImages.length > 0) {
      setImages((prev) => [...prev, ...newImages]);
    }
  };

  const updateImage = (index: number, updates: Partial<ImageInput>) =>
    setImages((prev) =>
      prev.map((img, i) => (i === index ? { ...img, ...updates } : img))
    );
  const removeImage = (index: number) =>
    setImages((prev) => prev.filter((_, i) => i !== index));
  const setPrimaryImage = (index: number) =>
    setImages((prev) =>
      prev.map((img, i) => ({ ...img, isPrimary: i === index }))
    );

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      addImages(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      addImages(e.target.files);
    }
  };

  const addSizeRow = () =>
    setSizes((prev) => [...prev, { size: "M", stock: 0, price: 0 }]);
  const updateSize = (index: number, updates: Partial<SizeInput>) =>
    setSizes((prev) =>
      prev.map((s, i) => (i === index ? { ...s, ...updates } : s))
    );
  const removeSize = (index: number) =>
    setSizes((prev) => prev.filter((_, i) => i !== index));

  const submit = async () => {
    if (!product) return;

    setSubmitting(true);
    setError("");
    try {
      if (!name.trim() || !description.trim() || !category || !basePrice) {
        throw new Error(
          "Please fill required fields: name, description, category, base price"
        );
      }

      // Upload new images to Cloudinary first
      let uploadedImages = [];
      const existingImages = images.filter((img) => !img.file && img.url);
      const newImages = images.filter((img) => img.file && img.preview);

      // Keep existing images
      uploadedImages = [...existingImages];

      // Upload new images
      if (newImages.length > 0) {
        const imageDataArray = newImages.map((img) => img.preview!);

        setUploadingImages(true);
        try {
          const uploadResult = await api.upload.uploadImages(
            imageDataArray,
            "icl-products"
          );

          if (uploadResult.success && uploadResult.data.uploaded.length > 0) {
            const newUploadedImages = uploadResult.data.uploaded.map(
              (uploadedImg: any, index: number) => {
                const originalImage = newImages[index];
                return {
                  url: uploadedImg.url,
                  alt: originalImage?.alt?.trim(),
                  isPrimary: Boolean(originalImage?.isPrimary),
                  public_id: uploadedImg.public_id,
                };
              }
            );
            uploadedImages = [...uploadedImages, ...newUploadedImages];
          }
        } finally {
          setUploadingImages(false);
        }
      }

      const payload: any = {
        name: name.trim(),
        description: description.trim(),
        category,
        basePrice: Number(basePrice),
        brand: brand.trim() || undefined,
        subcategory: subcategory.trim() || undefined,
        salePrice: salePrice ? Number(salePrice) : undefined,
        coinsEarned: coinsEarned ? Number(coinsEarned) : undefined,
        coinsRequired: coinsRequired ? Number(coinsRequired) : undefined,
        fabric: fabric.trim() || undefined,
        gsm: gsm.trim() || undefined,
        fit,
        washCare: washCare.trim() || undefined,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        isActive,
        isFeatured,
        images: uploadedImages,
        sizes: sizes.map((s) => ({
          size: s.size,
          stock: Number(s.stock || 0),
          price: Number(s.price || 0),
        })),
      };

      // Remove undefined values to avoid validation issues
      Object.keys(payload).forEach((key) => {
        if (
          payload[key] === undefined ||
          payload[key] === null ||
          payload[key] === ""
        ) {
          delete payload[key];
        }
      });

      await api.products.update(product._id, payload);
      resetForm();
      onUpdated();
      onClose();
    } catch (e: any) {
      if (e?.payload?.errors && Array.isArray(e.payload.errors)) {
        const errorMessages = e.payload.errors
          .map((err: any) => `${err.field}: ${err.message}`)
          .join(", ");
        setError(`Validation failed: ${errorMessages}`);
      } else {
        setError(e?.message || "Failed to update product");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          resetForm();
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Product name"
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description *</Label>
                <Textarea
                  id="edit-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the product"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Category *</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories
                        .filter((c) => c.value !== "all")
                        .map((c) => (
                          <SelectItem key={c.value} value={c.value}>
                            {c.label}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-subcategory">Subcategory</Label>
                  <Input
                    id="edit-subcategory"
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    placeholder="Optional"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="edit-brand">Brand</Label>
                  <Input
                    id="edit-brand"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Fit</Label>
                  <Select value={fit} onValueChange={setFit}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select fit" />
                    </SelectTrigger>
                    <SelectContent>
                      {fitOptions.map((f) => (
                        <SelectItem key={f} value={f}>
                          {f[0].toUpperCase() + f.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="edit-fabric">Fabric</Label>
                  <Input
                    id="edit-fabric"
                    value={fabric}
                    onChange={(e) => setFabric(e.target.value)}
                    placeholder="e.g. 100% Cotton"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-gsm">GSM</Label>
                  <Input
                    id="edit-gsm"
                    value={gsm}
                    onChange={(e) => setGsm(e.target.value)}
                    placeholder="e.g. 240"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-washCare">Wash Care</Label>
                <Input
                  id="edit-washCare"
                  value={washCare}
                  onChange={(e) => setWashCare(e.target.value)}
                  placeholder="e.g. Machine wash cold"
                />
              </div>
              <div>
                <Label htmlFor="edit-tags">Tags</Label>
                <Input
                  id="edit-tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Comma separated"
                />
              </div>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="edit-basePrice">Base Price (₹) *</Label>
                  <Input
                    id="edit-basePrice"
                    type="number"
                    min={0}
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-salePrice">Sale Price (₹)</Label>
                  <Input
                    id="edit-salePrice"
                    type="number"
                    min={0}
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="edit-coinsEarned">Coins Earned</Label>
                  <Input
                    id="edit-coinsEarned"
                    type="number"
                    min={0}
                    value={coinsEarned}
                    onChange={(e) => setCoinsEarned(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-coinsRequired">Coins Required</Label>
                  <Input
                    id="edit-coinsRequired"
                    type="number"
                    min={0}
                    value={coinsRequired}
                    onChange={(e) => setCoinsRequired(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="edit-isActive"
                    checked={isActive}
                    onCheckedChange={(v) => setIsActive(Boolean(v))}
                  />
                  <Label htmlFor="edit-isActive">Active</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="edit-isFeatured"
                    checked={isFeatured}
                    onCheckedChange={(v) => setIsFeatured(Boolean(v))}
                  />
                  <Label htmlFor="edit-isFeatured">Featured</Label>
                </div>
              </div>
            </div>
          </div>

          {/* Images Section - Full Width */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Images *</Label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="edit-image-upload"
                />
                <label htmlFor="edit-image-upload">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Add More Images
                  </Button>
                </label>
              </div>
            </div>
            {/* Drag & Drop Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="edit-drag-drop-upload"
              />
              <label htmlFor="edit-drag-drop-upload" className="cursor-pointer">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <div className="text-lg font-medium mb-2">
                  Drop images here or click to browse
                </div>
                <div className="text-sm text-muted-foreground mb-4">
                  Supports JPEG, PNG, WebP, GIF (max 5MB each)
                </div>
                <Button type="button" variant="outline">
                  Choose Images
                </Button>
              </label>
            </div>

            {/* Image Previews */}
            {images.length > 0 && (
              <div className="space-y-3">
                <div className="text-sm font-medium">
                  Product Images ({images.length})
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {images.map((img, idx) => (
                    <div key={idx} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-16 border rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                            {img.preview ? (
                              <img
                                src={img.preview}
                                alt={img.alt || "Product image"}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="h-6 w-6 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium truncate">
                              {img.file?.name || "Existing Image"}
                            </div>
                            {img.file && (
                              <div className="text-xs text-muted-foreground">
                                {`${(img.file.size / 1024 / 1024).toFixed(
                                  2
                                )}MB`}
                              </div>
                            )}
                            {img.isPrimary && (
                              <Badge
                                variant="secondary"
                                className="text-xs mt-1"
                              >
                                Primary
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeImage(idx)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div>
                        <Label>Alt Text (optional)</Label>
                        <Input
                          placeholder="Image description for accessibility"
                          value={img.alt || ""}
                          onChange={(e) =>
                            updateImage(idx, { alt: e.target.value })
                          }
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant={img.isPrimary ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPrimaryImage(idx)}
                          className="flex-1"
                        >
                          {img.isPrimary ? "Primary Image" : "Set as Primary"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sizes Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Sizes *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSizeRow}
              >
                Add Size
              </Button>
            </div>
            {sizes.length === 0 && (
              <div className="text-sm text-muted-foreground">
                No size variants added
              </div>
            )}
            <div className="space-y-2">
              {sizes.map((s, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-3">
                    <Select
                      value={s.size}
                      onValueChange={(v) => updateSize(idx, { size: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Size" />
                      </SelectTrigger>
                      <SelectContent>
                        {sizeOptions.map((sz) => (
                          <SelectItem key={sz} value={sz}>
                            {sz}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-3">
                    <Input
                      type="number"
                      min={0}
                      placeholder="Stock"
                      value={String(s.stock)}
                      onChange={(e) =>
                        updateSize(idx, { stock: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className="col-span-4">
                    <Input
                      type="number"
                      min={0}
                      placeholder="Price (₹)"
                      value={String(s.price)}
                      onChange={(e) =>
                        updateSize(idx, { price: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className="col-span-2 flex items-center justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSize(idx)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {error && <div className="text-destructive text-sm mt-2">{error}</div>}
        {uploadingImages && (
          <div className="text-primary text-sm mt-2 flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            Uploading images to cloud storage...
          </div>
        )}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onClose();
            }}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={submitting || uploadingImages}
            className="bg-gradient-primary text-primary-foreground"
          >
            {uploadingImages
              ? "Uploading Images…"
              : submitting
              ? "Updating…"
              : "Update Product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const Products = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(
    null
  );

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const params: Record<string, string | number> = { page: 1, limit: 50 };
      if (selectedCategory !== "all") params.category = selectedCategory;
      if (searchQuery.trim()) params.search = searchQuery.trim();
      const res: any = await api.products.list(params);
      if (res && res.success && res.data && Array.isArray(res.data.products)) {
        setProducts(res.data.products);
      } else {
        setProducts([]);
      }
    } catch (e: any) {
      setError(e?.message || "Failed to load products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  // Debounce search to avoid spamming API
  useEffect(() => {
    const id = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const displayProducts = useMemo(() => products, [products]);

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Delete this product?");
    if (!confirmed) return;
    try {
      await api.products.remove(id);
      await fetchProducts();
    } catch (e: any) {
      window.alert(e?.message || "Failed to delete product");
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">
            Manage your streetwear product catalog
          </p>
        </div>
        <AddProductDialog onCreated={fetchProducts} />
      </div>

      {/* Edit Product Dialog */}
      <EditProductDialog
        product={editingProduct}
        onUpdated={fetchProducts}
        onClose={() => setEditingProduct(null)}
      />

      {/* Filters */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filters
          </CardTitle>
          <CardDescription>
            Filter and search through your product inventory
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search products by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background/50"
                />
              </div>
            </div>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-full sm:w-48 bg-background/50">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="glass border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-primary" />
              <CardTitle>Product Catalog</CardTitle>
            </div>
            <Badge variant="outline" className="text-muted-foreground">
              {loading ? "Loading…" : `${displayProducts.length} products`}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-12 text-muted-foreground"
                    >
                      Loading products…
                    </TableCell>
                  </TableRow>
                ) : displayProducts.length > 0 ? (
                  displayProducts.map((product) => {
                    const price = product.salePrice ?? product.basePrice;
                    const stock = product.totalStock ?? 0;
                    const status = !product.isActive
                      ? "disabled"
                      : stock === 0
                      ? "out-of-stock"
                      : "active";
                    const categoryLabel =
                      categories.find((c) => c.value === product.category)
                        ?.label || product.category;
                    return (
                      <TableRow key={product._id} className="hover:bg-muted/30">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-card rounded-lg flex items-center justify-center">
                              <Package className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-muted-foreground">
                                ID: {product._id}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="bg-secondary/10 border-secondary/20 text-secondary-foreground"
                          >
                            {categoryLabel}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold">
                          ₹{Number(price || 0).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              stock === 0 ? "text-warning" : "text-foreground"
                            }
                          >
                            {stock} units
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              statusColors[status as keyof typeof statusColors]
                            }
                          >
                            {status.replace("-", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {product.createdAt
                            ? new Date(product.createdAt).toLocaleDateString()
                            : ""}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="hover:bg-primary/10"
                              onClick={() => setEditingProduct(product)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => handleDelete(product._id)}
                              variant="ghost"
                              size="sm"
                              className="hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center space-y-3">
                        <Package className="h-12 w-12 text-muted-foreground/50" />
                        <div className="text-muted-foreground">
                          {error || "No products found matching your criteria"}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSearchQuery("");
                            setSelectedCategory("all");
                            fetchProducts();
                          }}
                        >
                          Clear Filters
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Products;
