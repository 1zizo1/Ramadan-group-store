import mongoose from "mongoose";
import bcrypt from "bcryptjs"
const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
        default: "https://res.cloudinary.com/dlbqw7atu/image/upload/V1747734054/userImage_dhytay.png",
    },
    role: {
        type: String,
        enum: ["admin", "user", "deliveryman"],
        default: "user",
    },
    addresses: [
        {
            street: {
                type: String,
                required: true,
            },
            city: {
                type: String,
                required: true,
            },
            country: {
                type: String,
                required: true,
            },
            postalCode: {
                type: String,
                required: true,
            },
            isDefault: {
                type: Boolean,
                default: false,
            },
        },
    ],
    //wishlist
    //cart
    //order
},
    {
        timetamps: true,
    }
);

// Match user password to hashed in the database 
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}
//encrypt password using bcrybt 
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }
    const salt =await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})
//ensure only one address is defult 
userSchema.pre("save", async function (next) {
    if (this.isModified("addresses")) {
        const defultAddress = this.addresses.find((addr) => addr.isDefault)
        if (defultAddress) {
            this.addresses.forEach((addr) => {
                if (addr !== defultAddress) addr.isDefault = false;
            });
        }
    }
    next()
})


const User = mongoose.model("user", userSchema)
export default User;