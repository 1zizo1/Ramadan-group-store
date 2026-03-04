import express from 'express'
import {protect ,admin} from "../middleware/authMiddleware.js"
import { getUsers ,createUser,getUserById,updateUser,deleteUser} from '../controllers/userController.js'
 
const router = express.Router()
/// /route 
router.route("/")
.get(protect,admin,getUsers)
.post(protect,admin,createUser);

// :id route 
router.route("/:id")
.get(protect, getUserById)
.put(protect, updateUser) // Removed admin middleware for self-updates
.delete(protect, admin, deleteUser);
//:id/addresses 
//:id/addresses/:addressId 
export default router