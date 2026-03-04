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
            message:"User deleted successfully!",
        })
    } else {
        res.status(404);
        throw new Error("  user not found")
    }
})

export { getUsers, createUser, getUserById, updateUser, deleteUser }