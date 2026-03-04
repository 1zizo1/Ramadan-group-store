import express from 'express'
import { protect, admin } from "../middleware/authMiddleware.js"
import { getUsers, createUser, getUserById, updateUser, deleteUser,addAddress, updateAddress, deleteAddress } from '../controllers/userController.js'

const router = express.Router()
/// /route 
router.route("/")
    .get(protect, admin, getUsers)
    .post(protect, admin, createUser);

// :id route 
router.route("/:id")
    .get(protect, getUserById)
    .put(protect, updateUser) // Removed admin middleware for self-updates
    .delete(protect, admin, deleteUser);
//:id/addresses 
// Address routes
router.route('/:id/addresses')
    .post(protect, addAddress);             // POST /api/users/:id/addresses - Add address

router.route('/:id/addresses/:addressId')
    .put(protect,updateAddress)            // PUT /api/users/:id/addresses/:addressId - Update address
    .delete(protect,deleteAddress);        // DELETE /api/users/:id/addresses/:addressId - Delete address

//:id/addresses/:addressId 
export default router