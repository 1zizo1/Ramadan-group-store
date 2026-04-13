import asyncHandler from "express-async-handler";
import Cart from "../models/cartModel.js"; // Ensure path is correct
import Product from "../models/productModel.js";

// @desc    Get user's cart
// @route   GET /api/cart
export const getCart = asyncHandler(async (req, res) => {
    let cart = await Cart.findOne({ userId: req.user._id }).populate({
        path: "items.productId",
        model: "Product"
    });

    if (!cart) {
        cart = await Cart.create({
            userId: req.user._id,
            items: []
        });
    }

    res.status(200).json({
        success: true,
        cart: cart.items, // Directly sends the array the frontend expects
        message: "Cart retrieved successfully"
    });
});

// @desc    Add item to cart
// @route   POST /api/cart
export const addItemToCart = asyncHandler(async (req, res) => {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
        res.status(400);
        throw new Error("Product ID is required");
    }

    const product = await Product.findById(productId);
    if (!product) {
        res.status(404);
        throw new Error("Product not found");
    }

    let cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
        cart = await Cart.create({
            userId: req.user._id,
            items: [{
                productId: product._id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: parseInt(quantity)
            }]
        });
    } else {
        const existingItemIndex = cart.items.findIndex(
            (item) => item.productId && item.productId.toString() === productId
        );

        if (existingItemIndex > -1) {
            cart.items[existingItemIndex].quantity += parseInt(quantity);
        } else {
            cart.items.push({
                productId: product._id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: parseInt(quantity)
            });
        }
        await cart.save();
    }

    // Populate for the response so mapCartItemToProduct sees the full product object
    await cart.populate({
        path: "items.productId",
        model: "Product"
    });

    res.status(200).json({
        success: true,
        cart: cart.items,
        message: "Item added to cart successfully"
    });
});

// @desc    Update cart item quantity
// @route   PUT /api/cart
export const updateCartItem = asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
        res.status(404);
        throw new Error("Cart not found");
    }

    const itemIndex = cart.items.findIndex(
        (item) => item.productId && item.productId.toString() === productId
    );

    if (itemIndex > -1) {
        if (parseInt(quantity) <= 0) {
            cart.items.splice(itemIndex, 1);
        } else {
            cart.items[itemIndex].quantity = parseInt(quantity);
        }
        
        await cart.save();
        await cart.populate({ path: "items.productId", model: "Product" });

        res.status(200).json({
            success: true,
            cart: cart.items,
            message: "Cart updated successfully"
        });
    } else {
        res.status(404);
        throw new Error("Item not found in cart");
    }
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
export const removeItemFromCart = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
        res.status(404);
        throw new Error("Cart not found");
    }

    cart.items = cart.items.filter(
        (item) => item.productId && item.productId.toString() !== productId
    );
    
    await cart.save();
    await cart.populate({ path: "items.productId", model: "Product" });

    res.status(200).json({
        success: true,
        cart: cart.items,
        message: "Item removed from cart"
    });
});

// @desc    Clear cart
// @route   DELETE /api/cart
export const clearCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (cart) {
        cart.items = [];
        await cart.save();
    }

    res.status(200).json({
        success: true,
        cart: [],
        message: "Cart cleared successfully"
    });
});