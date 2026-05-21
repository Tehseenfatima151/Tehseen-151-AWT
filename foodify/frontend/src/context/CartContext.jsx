import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";

const CartContext = createContext(null);

function readCartItemCount() {
  try {
    const raw = localStorage.getItem("foodify_cart") || "[]";
    const cart = JSON.parse(raw);
    if (!Array.isArray(cart)) return 0;
    return cart.reduce((sum, line) => sum + (Number(line.quantity) || 0), 0);
  } catch {
    return 0;
  }
}

export const CartProvider = ({ children }) => {
  const [cartItemCount, setCartItemCount] = useState(readCartItemCount);

  const refresh = useCallback(() => {
    setCartItemCount(readCartItemCount());
  }, []);

  useEffect(() => {
    refresh();
    const onChange = () => refresh();
    window.addEventListener("foodify_cart_changed", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("foodify_cart_changed", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, [refresh]);

  const value = useMemo(() => ({ cartItemCount, refreshCart: refresh }), [cartItemCount, refresh]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);
