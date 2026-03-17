import Banner from "../models/bannerModel.js";
import cloudinary from "../config/cloudinary.js";
export const createBanner = async (req, res) => {
    try {
        const { name, title, startFrom, image, bannerType } = req.body;

        // 1. Validation (Check startFrom specifically as it's a number)
        if (!name || !title || startFrom === undefined || !image || !bannerType) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const existingBanner = await Banner.findOne({ name });
        if (existingBanner) {
            return res.status(400).json({
                success: false,
                message: "Banner with this name already exists"
            });
        }

        // 2. Cloudinary Upload Logic
        let imageUrl = "";
      try {
    const result = await cloudinary.uploader.upload(image, {
        folder: "admin-dashboard/banners",
    });
    imageUrl = result.secure_url;
} catch (uploadError) {
    console.error("DETAILED CLOUDINARY ERROR:", uploadError); // Check your terminal!
    return res.status(500).json({ 
        success: false, 
        message: "Image upload failed", 
        debug: uploadError.message // This tells you WHY
    });
}

        // 3. Create Database Entry
        const banner = await Banner.create({
            name,
            title,
            startFrom : new Date(startFrom), // Ensure this is a Date object
            image: imageUrl,
            bannerType
        });

        res.status(201).json({
            success: true,
            message: "Banner created successfully",
            data: banner
        });
    } catch (error) {
        console.error("Create banner error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Server error"
        });
    }
};

export const getBanners = async (req, res) => {
    try {
        const banners = await Banner.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            count: banners.length,
            data: banners // This is what banners.map() looks for
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const getBannerById = async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);

        if (!banner) {
            return res.status(404).json({
                success: false,
                message: "Banner not found"
            });
        }

        res.status(200).json({
            success: true,
            data: banner
        });
    } catch (error) {
        console.error("Get banner by ID error:", error);
        if (error.kind === 'ObjectId') {
            return res.status(400).json({
                success: false,
                message: "Invalid banner ID format"
            });
        }
        res.status(500).json({
            success: false,
            message: error.message || "Server error"
        });
    }
};

export const updateBanner = async (req, res) => {
    try {
        const { name, title, startFrom, image, bannerType } = req.body;

        let banner = await Banner.findById(req.params.id);
        if (!banner) {
            return res.status(404).json({ success: false, message: "Banner not found" });
        }

        // Handle Image Update
        let imageUrl = banner.image;
        // Check if image is a new Base64 string (not a URL)
        if (image && !image.startsWith("http")) {
            const result = await cloudinary.uploader.upload(image, {
                folder: "admin-dashboard/banners",
            });
            imageUrl = result.secure_url;
        }

        const updatedData = {
            name: name || banner.name,
            title: title || banner.title,
            startFrom: startFrom !== undefined ? startFrom : banner.startFrom,
            image: imageUrl,
            bannerType: bannerType || banner.bannerType
        };

        const updatedBanner = await Banner.findByIdAndUpdate(
            req.params.id,
            updatedData,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: "Banner updated successfully",
            data: updatedBanner
        });
    } catch (error) {
        console.error("Update banner error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
export const deleteBanner = async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);
        if (!banner) {
            return res.status(404).json({ success: false, message: "Banner not found" });
        }

        // Optional: Add logic here to delete from Cloudinary using banner.image public_id
        await Banner.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Banner deleted successfully"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export default {
    createBanner,
    getBanners,
    getBannerById,
    updateBanner,
    deleteBanner
};