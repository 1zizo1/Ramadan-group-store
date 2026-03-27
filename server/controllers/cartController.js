import asyncHandler from "express-async-handler";
import Cart from "../models/cartModel.js";
import Product from "../models/ProductModel.js";

// Helper function to calculate total price to avoid repetition
const calculateTotal = (items) => {
    return items.reduce((total, item) => {
        if (item.product && item.product.price) {
            return total + (item.product.price * item.quantity);
        }
        return total;
    }, 0);
};

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
    let cart = await Cart.findOne({ user: req.user._id }).populate({
        path: "items.product",
        select: "name price image stock", // Fixed: match Product Schema
        model: "Product"
    });

    if (!cart) {
        cart = await Cart.create({
            user: req.user._id,
            items: [],
            totalPrice: 0
        });
    }

    // Refresh total price in case product prices changed in DB
    if (cart.items.length > 0) {
        cart.totalPrice = calculateTotal(cart.items);
        await cart.save();
    }

    res.status(200).json({
        success: true,
        data: cart
    });
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addItemToCart = asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;

    if (!productId || !quantity || quantity <= 0) {
        res.status(400);
        throw new Error("Valid Product ID and quantity are required");
    }

    const product = await Product.findById(productId);
    if (!product) {
        res.status(404);
        throw new Error("Product not found");
    }

    // Fixed: changed stockCount to stock
    if (product.stock < quantity) {
        res.status(400);
        throw new Error(`Only ${product.stock} items available in stock`);
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
        cart = await Cart.create({
            user: req.user._id,
            items: [{ product: productId, quantity }],
            totalPrice: product.price * quantity
        });
    } else {
        const existingItemIndex = cart.items.findIndex(
            item => item.product.toString() === productId
        );

        if (existingItemIndex > -1) {
            const newQuantity = cart.items[existingItemIndex].quantity + quantity;
            
            if (newQuantity > product.stock) {
                res.status(400);
                throw new Error(`Cannot add more. Total exceeds stock (${product.stock})`);
            }
            cart.items[existingItemIndex].quantity = newQuantity;
        } else {
            cart.items.push({ product: productId, quantity });
        }

        await cart.populate({
            path: "items.product",
            select: "price",
            model: "Product"
        });
        cart.totalPrice = calculateTotal(cart.items);
        await cart.save();
    }

    // Final population for response
    await cart.populate({
        path: "items.product",
        select: "name price image stock",
        model: "Product"
    });

    res.status(200).json({
        success: true,
        message: "Item added to cart",
        data: cart
    });
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/update
// @access  Private
const updateCartItem = asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;

    if (!productId || quantity === undefined || quantity < 0) {
        res.status(400);
        throw new Error("Valid Product ID and quantity are required");
    }

    const product = await Product.findById(productId);
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart || !product) {
        res.status(404);
        throw new Error("Cart or Product not found");
    }

    const itemIndex = cart.items.findIndex(
        item => item.product.toString() === productId
    );

    if (itemIndex === -1) {
        res.status(404);
        throw new Error("Item not found in cart");
    }

    if (quantity === 0) {
        cart.items.splice(itemIndex, 1);
    } else {
        if (quantity > product.stock) {
            res.status(400);
            throw new Error(`Only ${product.stock} items available`);
        }
        cart.items[itemIndex].quantity = quantity;
    }

    await cart.populate({
        path: "items.product",
        select: "price",
        model: "Product"
    });
    cart.totalPrice = calculateTotal(cart.items);
    await cart.save();

    await cart.populate({
        path: "items.product",
        select: "name price image stock",
        model: "Product"
    });

    res.status(200).json({
        success: true,
        message: quantity === 0 ? "Item removed" : "Cart updated",
        data: cart
    });
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
const removeItemFromCart = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        res.status(404);
        throw new Error("Cart not found");
    }

    cart.items = cart.items.filter(item => item.product.toString() !== productId);

    await cart.populate({
        path: "items.product",
        select: "price",
        model: "Product"
    });
    cart.totalPrice = calculateTotal(cart.items);
    await cart.save();

    await cart.populate({
        path: "items.product",
        select: "name price image stock",
        model: "Product"
    });

    res.status(200).json({
        success: true,
        message: "Item removed from cart",
        data: cart
    });
});

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
        res.status(404);
        throw new Error("Cart not found");
    }

    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();

    res.status(200).json({
        success: true,
        message: "Cart cleared successfully",
        data: cart
    });
});

export {
    getCart,
    addItemToCart,
    updateCartItem,
    removeItemFromCart,
    clearCart
};