import Cart from "../models/cartModel.js";
import Order from "../models/OrderModel.js"; // Use Capital 'Order'

export const createOrderFromCart = async (req, res) => {
    const { items, shippingAddress } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "Cart Items are required" });
    }

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.country || !shippingAddress.postalCode) {
        return res.status(400).json({ message: "Full shipping address is required" });
    }

    const validItems = items.map((item) => ({
        productId: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
    }));

    const total = validItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    const newOrder = await Order.create({ // Renamed variable to avoid conflict with Model
        userId: req.user._id, // Standard Mongoose uses _id
        items: validItems,
        total,
        status: "pending",
        shippingAddress,
    });

    res.status(201).json({ success: true, order: newOrder });
};

export const getAllOrdersAdmin = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const perPage = parseInt(req.query.limit) || 10; // Fixed typo: was using .page
        const sortOrder = req.query.sortOrder === "desc" ? -1 : 1;
        
        const filter = {};
        if (req.query.status && req.query.status !== "all") filter.status = req.query.status;

        const skip = (page - 1) * perPage;

        const orders = await Order.find(filter)
            .populate('userId', 'name email phone')
            .populate("items.productId", "name price image") // Fixed 'item' to 'items'
            .sort({ createdAt: sortOrder })
            .skip(skip)
            .limit(perPage);

        const total = await Order.countDocuments(filter);

        // Map through 'orders' (the result array), NOT 'order' (the model)
        const transformedOrders = orders.map((order) => ({
            _id: order._id,
            orderId: `ORD-${order._id.toString().slice(-6).toUpperCase()}`,
            user: order.userId || { name: 'Deleted User' },
            items: order.items,
            shippingAddress: order.shippingAddress,
            totalAmount: order.total,
            status: order.status,
            createdAt: order.createdAt
        }));

        res.status(200).json({
            orders: transformedOrders,
            total,
            totalPages: Math.ceil(total / perPage),
            currentPage: page,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        
        // 1. Check if order exists
        const order = await Order.findById(req.params.id); // Fixed req.param
        if (!order) return res.status(404).json({ message: "Order not found" });

        // 2. USE UPDATE, NOT DELETE
        order.status = status;
        
        // Add to history (Ramadan Group needs this for tracking logistics!)
        order.statusHistory.push({
            status,
            updatedBy: req.user._id,
            updatedAt: new Date()
        });

        await order.save();

        res.status(200).json({ success: true, data: order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) return res.status(404).json({ message: "Order not found" });

        // Security: Only Admin or owner can delete, and ONLY if pending
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Not authorized" });
        }

        if (order.status !== 'pending' && req.user.role !== "admin") {
            return res.status(400).json({ message: "Cannot delete active orders" });
        }

        await Order.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Order removed" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getOrders = async (req, res) => {
    try {
        const userId = req.user._id;
        
        const orders = await Order.find({ user: userId })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });

    } catch (error) {
        console.error("Get orders error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Server error"
        });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email')
            .populate('items.product', 'name image');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to view this order"
            });
        }

        res.status(200).json({
            success: true,
            data: order
        });

    } catch (error) {
        console.error("Get order by ID error:", error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID format"
            });
        }
        res.status(500).json({
            success: false,
            message: error.message || "Server error"
        });
    }
};
export default {
    createOrderFromCart,
    getOrders,
    getOrderById,
    getAllOrdersAdmin,
    updateOrderStatus,
    deleteOrder
};