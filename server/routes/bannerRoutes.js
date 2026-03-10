import express from "express";
import { createBanner,
    getBanners,
    getBannerById,
    updateBanner,
    deleteBanner} from "../controllers/bannerController.js"; // Default import
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
    .get(getBanners)
    .post(protect, admin, createBanner);

router.route("/:id")
    .get(getBannerById)
    .put(protect, admin, updateBanner)
    .delete(protect, admin, deleteBanner);

export default router;