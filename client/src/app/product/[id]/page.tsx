import { payment } from "@/assets/image";
import BackToHome from "@/components/common/BackToHome";
import Container from "@/components/common/Container";
import DiscountBadge from "@/components/common/DiscountBadge";
import ProductActions from "@/components/common/pages/product/ProductActions";
import ProductDescription from "@/components/common/pages/product/ProductDescription";
import PriceFormatter from "@/components/common/PriceFormatter";
import { Button } from "@/components/ui/button";
import { fetchData } from "@/lib/api";
import { Product } from "@/types/type";
import { Box, Eye, FileQuestion, Share2, Star, Truck, ShieldCheck } from "lucide-react";
import Image from "next/image";
import React from "react";

// Helper to generate dynamic delivery dates
const getDeliveryRange = () => {
  const today = new Date();
  const start = new Date(today);
  const end = new Date(today);
  start.setDate(today.getDate() + 3);
  end.setDate(today.getDate() + 7);
  
  const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short' };
  return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}, ${end.getFullYear()}`;
};

const SingleProductPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  
  let product: Product | null = null;
  try {
    product = await fetchData(`/products/${id}`);
  } catch (error) {
    console.error("Fetch error:", error);
  }

  if (!product) {
    return (
      <div className="min-h-[70vh] flex flex-col gap-4 items-center justify-center p-10 text-center">
        <div className="bg-babyshopSky/10 p-6 rounded-full">
            <Box size={50} className="text-babyshopSky" />
        </div>
        <h2 className="text-2xl font-bold text-babyshopBlack">
          Product Not Found
        </h2>
        <p className="text-babyshopTextLight max-w-xs">
          Sorry, we couldn&apos;t find a product with ID: <span className="font-mono text-babyshopSky font-bold">{id}</span>
        </p>
        <BackToHome />
      </div>
    );
  }

  // Calculate discount safely
  const discount = product?.discountPercentage || 0;
  const price = product?.price || 0;
  const discountedPrice = discount > 0 ? price * (1 - discount / 100) : price;

  return (
    <div className="py-10 bg-slate-50/50">
      <Container>
        <div className="max-w-screen-xl mx-auto">
          <div className="bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-10">
            
            {/* Image Section */}
            <div className="p-5 lg:p-10 flex items-center justify-center bg-white border-b lg:border-b-0 lg:border-r border-slate-100">
              <div className="relative group overflow-hidden rounded-xl">
                <Image
                  src={product?.image}
                  alt={product?.name || "Product Image"}
                  width={600}
                  height={600}
                  priority
                  className="object-contain transition-transform duration-500 group-hover:scale-110"
                />
              </div>
            </div>

            {/* Content Section */}
            <div className="p-6 lg:p-10 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                    <DiscountBadge
                        discountPercentage={discount}
                        className="px-3 py-1 text-sm font-bold"
                    />
                    <span className="text-xs font-bold uppercase tracking-widest text-babyshopSky">In Stock</span>
                </div>
                <h1 className="text-3xl font-bold text-babyshopBlack leading-tight">
                    {product?.name}
                </h1>
              </div>

              {/* Price & Reviews */}
              <div className="flex flex-wrap items-center gap-6 justify-between border-y border-slate-50 py-4">
                <div className="flex items-center gap-3">
                  <PriceFormatter amount={discountedPrice} className="text-3xl font-extrabold text-babyshopSky" />
                  {discount > 0 && (
                    <PriceFormatter
                      amount={price}
                      className="text-babyshopTextLight line-through font-medium text-lg"
                    />
                  )}
                </div>
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg">
                  <div className="flex items-center text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-sm font-semibold text-slate-600">({product?.ratings || 0} reviews)</p>
                </div>
              </div>

              {/* View Counter */}
              <div className="flex items-center gap-3 text-slate-700 bg-babyshopSky/5 p-3 rounded-xl border border-babyshopSky/10">
                <div className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </div>
                <p className="text-sm">
                  <span className="font-bold">29</span> people are viewing this right now
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <ProductActions product={product} />
                <Button className="w-full py-7 text-lg font-bold bg-babyshopBlack hover:bg-babyshopBlack/90 shadow-lg shadow-babyshopBlack/20 transition-all active:scale-95">
                  Buy it now
                </Button>
              </div>

              {/* Helper Links */}
              <div className="flex items-center gap-8 py-2">
                <button className="flex items-center gap-2 text-sm font-medium hover:text-babyshopSky transition-colors">
                  <FileQuestion size={18} /> Ask a Question
                </button>
                <button className="flex items-center gap-2 text-sm font-medium hover:text-babyshopSky transition-colors">
                  <Share2 size={18} /> Share
                </button>
              </div>

              <hr className="border-slate-100" />

              {/* Delivery Info */}
              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <Truck size={24} className="text-slate-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Estimated Delivery</p>
                    <p className="text-sm text-slate-500">{getDeliveryRange()}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <Box size={24} className="text-slate-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Free Shipping & Returns</p>
                    <p className="text-sm text-slate-500">On all orders over $200.00</p>
                  </div>
                </div>
              </div>

              {/* Secure Checkout */}
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col items-center">
                <div className="flex items-center gap-2 mb-3 text-slate-600">
                    <ShieldCheck size={18} className="text-green-600" />
                    <span className="text-xs font-bold uppercase tracking-wider">Secure Checkout</span>
                </div>
                <Image
                  src={payment}
                  alt="Payment Methods"
                  className="w-full max-w-[320px] mb-3 grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all"
                />
                <p className="text-[11px] text-slate-400 text-center uppercase tracking-tight">
                  Guaranteed safe & secure checkout
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Tabs/Description */}
          <div className="mt-8">
             <ProductDescription product={product} />
          </div>
        </div>
      </Container>
    </div>
  );
};

export default SingleProductPage;