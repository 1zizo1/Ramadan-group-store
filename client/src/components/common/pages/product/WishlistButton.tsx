import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";
import React from "react";

interface Props {
  className?: string;
}

const WishlistButton = ({ className }: Props) => {
  return (
    <button
      className={cn(
        "p-2 rounded-full transition-colors hover:bg-gray-100",
        className
      )}
    >
      <Heart
        size={20}
        // className={isLoading ? "animate-pulse" : ""}
      />
    </button>
  );
};

export default WishlistButton;
