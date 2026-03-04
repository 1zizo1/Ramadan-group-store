import express from 'express'
import { registerUser, loginUser ,getUserProfile, logoutUser} from '../controllers/authControllers.js';
import {protect} from "../middleware/authMiddleware.js"
const router = express.Router();


//register route
router.post("/register", registerUser)

// login route 
router.post("/login", loginUser)

// profile 
router.get("/profile", protect,getUserProfile)

//logout 
router.post("/logout", protect,logoutUser)



export default router