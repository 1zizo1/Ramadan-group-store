import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Product name is required"],
        unique: true,
    },
    description: {
        type: String,
        required: [true, "Product description is required"]
    },
    price: {
        type: Number,
        required: [true, "Product price is required"],
        default: 0,
        min: [0, "Price cannot be negative"],
    },
    discountPercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 90,
    },
    stock: {
        type: Number,
        default: 0,
        min: 0,
    },
    ratings: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
            rating: {
                type: Number,
                required: true,
                min: 1,
                max: 5,
            },
            createdAt: {
                type: Date,
                default: Date.now,
            },
        },
    ],
    avarageRating: {
        type: Number,
        required: true,
    },
    category: {  // Note: uppercase C
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Category"
    },
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Brand"
    },
    image: {
        type: String,
        default: ""
    },

}, {
    timestamps: true
}
);
//caltculating avarage rating before saving 
productSchema.pre("save", function (next) {
    if (this.ratings && this.ratings.length > 0) {
        const sum = this.ratings.reduce((acc, item) => acc + item.rating, 0);
        this.avarageRating = sum / this.ratings.length;
    }
    next();
})
const product = mongoose.model("Product", productSchema);

export default product;