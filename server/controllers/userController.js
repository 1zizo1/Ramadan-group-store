import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
//get users 
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).select("-password")
    res.status(200).json({
        success: true,
        users,
    })
})
// create users 
const createUser = asyncHandler(async (req, res) => {
    const { name, email, password, role, addresses } = req.body
    const userExists = await User.findOne({ email })
    if (userExists) {
        res.status(400);
        throw new Error("User already exists, Try login ")
    }

    const user = await User.create({
        name,
        email,
        password,
        role,
        addresses: [],
    });
    if (user) {
        //init emty cart
        //await Cart.create(userId:user._id,items:{[]})

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            role: user.role,
            addresses: user.addresses,
        })
    } else {
        res.status(400);
        throw new Error("invalid user data")
    }
})
//getUserById
const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select("-password")
    if (user) {
        res.json(user)
    } else {
        res.status(404);
        throw new Error(" user not found")
    }
})
// updateUser
const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)

    if (!user) {
        res.status(404);
        throw new Error(" user not found")
    }
    //allow updates by themselfs or admins
    user.name = req.body.name || user.name;

    if (req.body.password) {
        user.password = req.body.password;
    }

    if (req.body.role) {
        user.role = req.body.role;
    }

    user.addresses = req.body.addresses || user.addresses;

    //avater
    const updatedUser = await user.save();
    res.status(200).json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        role: updatedUser.role,
        addresses: updatedUser.addresses,
    })
    // if (user._id.toString() !== req.user._id.toString() && user.role !== "admin") {
    //     res.status(400);
    //     throw new Error(" not authrized")
    // }
})
//deleteUser 
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)

    if (user) {
        //delete users cart 
        // delete users orders if exists 
        //delete user 
        await user.deleteOne()
        res.status(200).json({
            success: "success",
            message: "User deleted successfully!",
        })
    } else {
        res.status(404);
        throw new Error("  user not found")
    }
})
// @desc    Add address to user profile
// @route   POST /api/users/:id/addresses
// @access  Private
const addAddress = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    // Authorization
    if (req.user._id.toString() !== user._id.toString() && req.user.role !== "admin") {
        res.status(403);
        throw new Error("Not authorized");
    }

    const { street, city, country, postalCode, isDefault } = req.body;

    if (!street || !city || !country || !postalCode) {
        res.status(400);
        throw new Error("All address fields are required");
    }
    // --- 1. ERROR ON DUPLICATE DATA ---
    // Check if address already exist in the user's addresses
    const isDuplicate = user.addresses.some(addr =>
        addr.street.toLowerCase().trim() === street.toLowerCase().trim() &&
        addr.postalCode.toString().trim() === postalCode.toString().trim() &&
        addr.city.toLowerCase().trim() === city.toLowerCase().trim() &&
        addr.country.toString().trim() === country.toString().trim()
    );

    if (isDuplicate) {
        res.status(400);
        throw new Error("This address already exists in your profile");
    }

    // --- 2. STRICT BOOLEAN LOGIC ---
    // Convert input to a real boolean (handles "true", true, or undefined)

    // If this is set as default, make other addresses non-default
    if (isDefault) {
        user.addresses.forEach((addr) => {
            addr.isDefault = false;
        });
    }

    // If this is the first address, set as default
    if (user.addresses.length === 0) {
        user.addresses.push({
            street,
            city,
            country,
            postalCode,
            isDefault : true
        })
    } else {
       user.addresses.push({
            street,
            city,
            country,
            postalCode,
            isDefault : isDefault || false
        })
    }
    await user.save();
    res.json({
        success: true,
        addresses: user.addresses,
        message: "Address added successfully",
        
    });
});
// update address
// @desc    Update user address
// @route   PUT /api/users/:id/addresses/:addressId
// @access  Private
const updateAddress = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    // Only allow user to modify their own addresses or admin
    if (req.user._id.toString() !== user._id.toString() && req.user.role !== "admin") {
        res.status(403);
        throw new Error("Not authorized to modify this user's addresses");
    }

    const address = user.addresses.id(req.params.addressId);

    if (!address) {
        res.status(404);
        throw new Error("Address not found");
    }

    const { street, city, country, postalCode, isDefault } = req.body;

    if (street) address.street = street;
    if (city) address.city = city;
    if (country) address.country = country;
    if (postalCode) address.postalCode = postalCode;

    // If this is set as default, make other addresses non-default
    if (isDefault) {
        user.addresses.forEach((addr) => {
            addr.isDefault = false;
        });
        address.isDefault = true;
    }

    await user.save();

    res.json({
        success: true,
        addresses: user.addresses,
        message: "Address updated successfully",
    });
});

// @desc    Delete user address
// @route   DELETE /api/users/:id/addresses/:addressId
// @access  Private
const deleteAddress = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    // Only allow user to modify their own addresses or admin
    if (req.user._id.toString() !== user._id.toString() && req.user.role !== "admin") {
        res.status(403);
        throw new Error("Not authorized to modify this user's addresses");
    }

    const address = user.addresses.id(req.params.addressId);

    if (!address) {
        res.status(404);
        throw new Error("Address not found");
    }

    // If deleting default address, make the first remaining address default
    const wasDefault = address.isDefault;
    user.addresses.pull(req.params.addressId);

    if (wasDefault && user.addresses.length > 0) {
        user.addresses[0].isDefault = true;
    }

    await user.save();

    res.json({
        success: true,
        addresses: user.addresses,
        message: "Address deleted successfully",
    });
});
export { getUsers, createUser, getUserById, updateUser, deleteUser, addAddress, updateAddress, deleteAddress }