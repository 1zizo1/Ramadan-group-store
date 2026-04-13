"use client";

import React, { useState } from "react";
import { Minus, Plus, ShoppingCart, Loader2 } from "lucide-react";
import { toast } from "sonner"; // Or your preferred toast library

import { Product } from "@/types/type";
import { Button } from "@/components/ui/button";
import WishlistButton from "./WishlistButton";
import { useCartStore } from "@/lib/store"; // Adjust path to your store

interface ProductActionsProps {
  product: Product;
}

const ProductActions: React.FC<ProductActionsProps> = ({ product }) => {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  
  // Access the cart store
  const { addToCart } = useCartStore();

  const handleQuantityChange = (type: "increase" | "decrease") => {
    if (type === "increase") {
      setQuantity((prev) => prev + 1);
    } else {
      setQuantity((prev) => Math.max(1, prev - 1));
    }
  };

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      // Simulate a small delay for premium feel or real API sync
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      addToCart(product, quantity);
      
      toast.success(`${product?.name || "Product"} added to cart!`, {
        description: `${quantity} items added.`,
        icon: <ShoppingCart className="h-4 w-4" />,
      });
    } catch (error) {
      toast.error("Failed to add to cart. Please try again.");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Row: Quantity + Add to Cart */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
        <div className="flex-shrink-0">
          <p className="text-sm font-bold text-slate-700 mb-2 uppercase tracking-tight">
            Quantity
          </p>
          <div className="flex items-center justify-between border-2 border-slate-100 bg-white w-32 px-4 py-2 rounded-full shadow-sm hover:border-babyshopSky transition-colors">
            <button
              onClick={() => handleQuantityChange("decrease")}
              disabled={quantity <= 1 || isAdding}
              className="p-1 text-slate-400 hover:text-babyshopSky disabled:opacity-30 transition-colors"
            >
              <Minus size={18} />
            </button>
            <span className="font-bold text-lg tabular-nums">{quantity}</span>
            <button
              onClick={() => handleQuantityChange("increase")}
              disabled={isAdding}
              className="p-1 text-slate-400 hover:text-babyshopSky transition-colors"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full">
          <Button
            onClick={handleAddToCart}
            disabled={isAdding}
            className="flex-1 h-[52px] rounded-full bg-babyshopBlack hover:bg-babyshopSky text-white font-bold text-base shadow-lg shadow-black/5 transition-all active:scale-95"
          >
            {isAdding ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Adding...
              </>
            ) : (
              "Add to Cart"
            )}
          </Button>

          {/* Wishlist Button integrated here for better UI flow */}
          <div className="h-[52px] w-[52px]">
             <WishlistButton
              // product={product}
              className="h-full w-full rounded-full border-2 border-slate-100 bg-white hover:border-babyshopSky hover:text-babyshopSky transition-all shadow-sm"
            />
          </div>
        </div>
      </div>
      
      {/* Extra helper info */}
      <p className="text-[11px] text-slate-400 font-medium italic">
        * Standard shipping calculated at checkout
      </p>
    </div>
  );
};

export default ProductActions;