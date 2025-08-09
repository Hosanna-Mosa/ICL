import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useRef,
} from "react";
import { useAuth } from "./AuthContext";
import { cartAPI } from "@/utils/api";
import { useToast } from "@/hooks/use-toast";

interface CartItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    images: Array<{ url: string; alt?: string; isPrimary: boolean }>;
    basePrice: number;
    salePrice?: number;
  };
  size: string;
  quantity: number;
  price: number;
}

interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  couponCode?: string;
  discountAmount: number;
  coinsUsed: number;
  coinsDiscount: number;
  subtotal: number;
  total: number;
  itemCount: number;
  lastUpdated: string;
}

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  addToCart: (productId: string, size: string, quantity: number) => Promise<boolean>;
  updateItemQuantity: (productId: string, size: string, quantity: number) => Promise<boolean>;
  removeFromCart: (productId: string, size: string) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  refreshCart: () => Promise<void>;
  applyCoupon: (couponCode: string) => Promise<boolean>;
  removeCoupon: () => Promise<boolean>;
  applyCoinsDiscount: (coinsUsed: number) => Promise<boolean>;
  removeCoinsDiscount: () => Promise<boolean>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  // No quantity debounce state needed since quantity controls were removed

  // Fetch cart data when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshCart();
    } else {
      setCart(null);
      setInitialLoading(false);
    }
  }, [isAuthenticated]);

  const refreshCart = async () => {
    if (!isAuthenticated) {
      setCart(null);
      setInitialLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await cartAPI.getCart();
      if (response.success) {
        setCart(response.data.cart);
      } else {
        console.error("Failed to fetch cart:", response.message);
        setCart(null);
      }
    } catch (error: any) {
      console.error("Error fetching cart:", error);
      setCart(null);
      // Only show toast for non-initial loads
      if (!initialLoading) {
        toast({
          title: "Error",
          description: "Failed to load cart",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  const addToCart = async (productId: string, size: string, quantity: number): Promise<boolean> => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add items to your cart",
        variant: "destructive",
      });
      return false;
    }

    // Fire-and-forget API call to avoid UI lag
    (async () => {
      try {
        const response = await cartAPI.addToCart(productId, size, quantity);
        if (response.success) {
          setCart(response.data.cart);
          toast({
            title: "Added to cart",
            description: "Item added to your cart successfully",
          });
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to add item to cart",
            variant: "destructive",
          });
        }
      } catch (error: any) {
        console.error("Error adding to cart:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to add item to cart",
          variant: "destructive",
        });
      }
    })();

    return true;
  };

  // Update quantity for an item
  const updateItemQuantity = async (
    productId: string,
    size: string,
    quantity: number
  ): Promise<boolean> => {
    if (!cart) return false;
    if (quantity < 1) {
      // If quantity would drop below 1, remove the item
      return await removeFromCart(productId, size);
    }

    try {
      // Optimistic update for snappy UI
      const updatedItems = cart.items.map((item) => {
        if (item.product._id === productId && item.size === size) {
          return { ...item, quantity };
        }
        return item;
      });

      const newSubtotal = updatedItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const discounts = (cart.discountAmount || 0) + (cart.coinsDiscount || 0);
      const updatedCart: Cart = {
        ...cart,
        items: updatedItems,
        itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
        subtotal: newSubtotal,
        total: Math.max(0, newSubtotal - discounts),
      };
      setCart(updatedCart);

      const response = await cartAPI.updateCartItem(productId, size, quantity);
      if (response.success) {
        setCart(response.data.cart);
        return true;
      }

      // Re-sync if server rejected
      await refreshCart();
      toast({
        title: "Error",
        description: response.message || "Failed to update quantity",
        variant: "destructive",
      });
      return false;
    } catch (error: any) {
      console.error("Error updating cart item quantity:", error);
      await refreshCart();
      toast({
        title: "Error",
        description: error?.message || "Failed to update quantity",
        variant: "destructive",
      });
      return false;
    }
  };

  const removeFromCart = async (productId: string, size: string): Promise<boolean> => {
    try {
      
      // Immediately remove item from local state for instant UI feedback
      if (cart) {
        const updatedItems = cart.items.filter(
          item => !(item.product._id === productId && item.size === size)
        );
        const newSubtotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const discounts = (cart.discountAmount || 0) + (cart.coinsDiscount || 0);
        const updatedCart = {
          ...cart,
          items: updatedItems,
          itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
          subtotal: newSubtotal,
          total: Math.max(0, newSubtotal - discounts)
        };
        setCart(updatedCart);
      }
      
      const response = await cartAPI.removeFromCart(productId, size);
      if (response.success) {
        // Update with server response to ensure consistency
        setCart(response.data.cart);
        toast({
          title: "Removed from cart",
          description: "Item removed from your cart",
        });
        return true;
      } else {
        // If server failed, revert the local change
        refreshCart();
        toast({
          title: "Error",
          description: response.message || "Failed to remove item from cart",
          variant: "destructive",
        });
        return false;
      }
    } catch (error: any) {
      console.error("Error removing from cart:", error);
      // If error occurred, revert the local change
      refreshCart();
      toast({
        title: "Error",
        description: error.message || "Failed to remove item from cart",
        variant: "destructive",
      });
      return false;
    } finally {
    }
  };

  const clearCart = async (): Promise<boolean> => {
    try {
      
      // Immediately clear local state for instant UI feedback
      if (cart) {
        const clearedCart = {
          ...cart,
          items: [],
          itemCount: 0,
          subtotal: 0,
          total: 0,
          discountAmount: 0,
          coinsDiscount: 0,
          couponCode: undefined
        };
        setCart(clearedCart);
      }
      
      const response = await cartAPI.clearCart();
      if (response.success) {
        // Update with server response to ensure consistency
        setCart(response.data.cart);
        toast({
          title: "Cart cleared",
          description: "All items removed from your cart",
        });
        return true;
      } else {
        // If server failed, revert the local change
        refreshCart();
        toast({
          title: "Error",
          description: response.message || "Failed to clear cart",
          variant: "destructive",
        });
        return false;
      }
    } catch (error: any) {
      console.error("Error clearing cart:", error);
      // If error occurred, revert the local change
      refreshCart();
      toast({
        title: "Error",
        description: error.message || "Failed to clear cart",
        variant: "destructive",
      });
      return false;
    } finally {
    }
  };

  const applyCoupon = async (couponCode: string): Promise<boolean> => {
    try {
      const response = await cartAPI.applyCoupon(couponCode);
      if (response.success) {
        setCart(response.data.cart);
        toast({
          title: "Coupon applied",
          description: "Coupon applied successfully",
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to apply coupon",
          variant: "destructive",
        });
        return false;
      }
    } catch (error: any) {
      console.error("Error applying coupon:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to apply coupon",
        variant: "destructive",
      });
      return false;
    } finally {
    }
  };

  const removeCoupon = async (): Promise<boolean> => {
    try {
      const response = await cartAPI.removeCoupon();
      if (response.success) {
        setCart(response.data.cart);
        toast({
          title: "Coupon removed",
          description: "Coupon removed from cart",
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to remove coupon",
          variant: "destructive",
        });
        return false;
      }
    } catch (error: any) {
      console.error("Error removing coupon:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove coupon",
        variant: "destructive",
      });
      return false;
    } finally {
    }
  };

  const applyCoinsDiscount = async (coinsUsed: number): Promise<boolean> => {
    try {
      const response = await cartAPI.applyCoinsDiscount(coinsUsed);
      if (response.success) {
        setCart(response.data.cart);
        toast({
          title: "Coins applied",
          description: "Coins discount applied successfully",
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to apply coins discount",
          variant: "destructive",
        });
        return false;
      }
    } catch (error: any) {
      console.error("Error applying coins discount:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to apply coins discount",
        variant: "destructive",
      });
      return false;
    } finally {
    }
  };

  const removeCoinsDiscount = async (): Promise<boolean> => {
    try {
      const response = await cartAPI.removeCoinsDiscount();
      if (response.success) {
        setCart(response.data.cart);
        toast({
          title: "Coins removed",
          description: "Coins discount removed from cart",
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to remove coins discount",
          variant: "destructive",
        });
        return false;
      }
    } catch (error: any) {
      console.error("Error removing coins discount:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove coins discount",
        variant: "destructive",
      });
      return false;
    } finally {
    }
  };

  const value: CartContextType = {
    cart,
    loading: loading || initialLoading,
    addToCart,
    updateItemQuantity,
    removeFromCart,
    clearCart,
    refreshCart,
    applyCoupon,
    removeCoupon,
    applyCoinsDiscount,
    removeCoinsDiscount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
