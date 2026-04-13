import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
    getCart,
    addItemToCart,
    updateCartItem,
    removeItemFromCart,
    clearCart,
} from "../controllers/cartController.js"

const router = express.Router();

// All cart routes are protected
router.use(protect);

router.route("/").get(getCart).post(addItemToCart).delete(clearCart);

router.route("/update").put(updateCartItem);

router.route("/:productId").delete(removeItemFromCart);

export default router
