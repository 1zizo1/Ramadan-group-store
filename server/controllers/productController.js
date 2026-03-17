import asyncHandler from "express-async-handler";
import Product from "../models/productModel.js";
import cloudinary from "../config/cloudinary.js";

// @desc    Get all products with pagination, sorting, and filtering
// @route   GET /api/products?page=<page>&limit=<limit>&sortOrder=<asc|desc>&category=<categoryId>&priceMin=<min>&priceMax=<max>
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sortOrder = "asc",
    category,
    brand,
    priceMin,
    priceMax,
    search,
  } = req.query;

  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);
  
  if (pageNumber < 1 || limitNumber < 1) {
    res.status(400);
    throw new Error("Page and limit must be positive integers");
  }

  const query = {};
  if (category) query.category = category;
  if (brand) query.brand = brand;
  
  if (priceMin || priceMax) {
    query.price = {};
    if (priceMin) query.price.$gte = Number(priceMin);
    if (priceMax) query.price.$lte = Number(priceMax);
  }

  if (search) {
    query.name = { $regex: search, $options: "i" };
  }

  const skip = (pageNumber - 1) * limitNumber;
  const sortValue = sortOrder === "asc" ? 1 : -1;

  const [products, total] = await Promise.all([
    Product.find(query)
      .populate("category", "name")
      .populate("brand", "name")
      .skip(skip)
      .limit(limitNumber)
      .sort({ createdAt: sortValue }),
    Product.countDocuments(query),
  ]);

  // ADDED: totalPages for frontend logic
  res.json({
    products,
    total,
    page: pageNumber,
    totalPages: Math.ceil(total / limitNumber),
  });
});

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Private
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate("category", "name")
    .populate("brand", "name");

  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    price,
    category, // Ensure lowercase in Postman!
    brand,
    image,
    discountPercentage,
    stock,
  } = req.body;

  // 1. Validate mandatory fields before even touching Cloudinary
  if (!name || !price || !category || !brand) {
    res.status(400);
    throw new Error("Please provide all required fields (name, price, category, brand)");
  }

  const productExists = await Product.findOne({ name });
  if (productExists) {
    res.status(400);
    throw new Error("Product with this name already exists");
  }

  // 2. Upload image with Error Handling
  let imageUrl = "https://via.placeholder.com/300"; // Fallback image
  
  if (image) {
    try {
      const result = await cloudinary.uploader.upload(image, {
        folder: "admin-dashboard/products",
      });
      imageUrl = result.secure_url;
    } catch (error) {
      console.error("Cloudinary Upload Error:", error.message);
      // If Cloudinary is "disabled", we can still choose to fail OR save with placeholder
      res.status(500);
      throw new Error(`Image Upload Failed: ${error.message}`);
    }
  }

  // 3. Create Product
  const product = await Product.create({
    name,
    description,
    price,
    category,
    brand,
    discountPercentage: discountPercentage || 0,
    stock: stock || 0,
    image: imageUrl,
  });

  if (product) {
    res.status(201).json(product);
  } else {
    res.status(400);
    throw new Error("Invalid product data");
  }
});
// @desc    Rate a product
// @route   POST /api/products/:id/rate
// @access  Private
const rateProduct = asyncHandler(async (req, res) => {
  const { rating } = req.body;
  const product = await Product.findById(req.params.id);

  if (product) {
    const alreadyRated = product.ratings.find(
      (r) => r.userId.toString() === req.user._id.toString()
    );

    if (alreadyRated) {
      alreadyRated.rating = rating;
    } else {
      product.ratings.push({ userId: req.user._id, rating });
    }

    // The .save() triggers your pre-save hook for avarageRating
    const updatedProduct = await product.save();
    res.json(updatedProduct); 
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});

// Helper function to safely extract Public ID and folder for deletion
const getPublicIdFromUrl = (url) => {
  if (!url || !url.includes("res.cloudinary.com")) return null;
  // This regex finds the string after the version (v1234567) and before the extension (.jpg)
  const regex = /\/v\d+\/(.+)\./;
  const match = url.match(regex);
  return match ? match[1] : null;
};

// @desc    Update a product
// @route   PUT /api/products/:id
const updateProduct = asyncHandler(async (req, res) => {
  const { name, description, price, category, brand, image, discountPercentage, stock } = req.body;

  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Handle image update
  if (image && !image.startsWith('http')) { 
    // 1. Delete old image from Cloudinary if it exists
    const publicId = getPublicIdFromUrl(product.image);
    if (publicId) {
      await cloudinary.uploader.destroy(publicId).catch(err => 
        console.log("Old image delete failed:", err.message)
      );
    }
    
    // 2. Upload new image
    const result = await cloudinary.uploader.upload(image, {
      folder: "admin-dashboard/products",
    });
    product.image = result.secure_url;
  }

  // Update other fields
  product.name = name || product.name;
  product.description = description || product.description;
  product.price = price || product.price;
  product.category = category || product.category;
  product.brand = brand || product.brand;
  product.discountPercentage = discountPercentage ?? product.discountPercentage;
  product.stock = stock ?? product.stock;

  const updatedProduct = await product.save();
  res.json(updatedProduct);
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    // 1. Delete image from Cloudinary using the helper
    const publicId = getPublicIdFromUrl(product.image);
    if (publicId) {
      await cloudinary.uploader.destroy(publicId).catch(err => 
        console.log("Cloudinary image deletion failed:", err.message)
      );
    }

    // 2. Delete from Database
    await product.deleteOne();
    res.json({ message: "Product removed" });
  } else {
    res.status(404);
    throw new Error("Product not found");
  }
});
export {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  rateProduct,
  deleteProduct,
};