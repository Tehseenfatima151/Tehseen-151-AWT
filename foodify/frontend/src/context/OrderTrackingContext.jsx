import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import api from "../api/api";
import { useAuth } from "./AuthContext";

const OrderTrackingContext = createContext(null);

const STATUS_MESSAGES = {
  pending:   { text: "Your order is pending confirmation",        icon: "fa-clock",             color: "bg-yellow-500" },
  accepted:  { text: "Your order has been accepted! 🎉",          icon: "fa-check-circle",       color: "bg-blue-500"   },
  preparing: { text: "Your order is being prepared 👨‍🍳",           icon: "fa-fire-burner",        color: "bg-orange-500" },
  ready:     { text: "Your order is ready for delivery/pickup! 🛵", icon: "fa-box-open",          color: "bg-indigo-500" },
  completed: { text: "Your order has been delivered! Enjoy! ✅",   icon: "fa-house-circle-check", color: "bg-green-500"  },
  rejected:  { text: "Your order was rejected by the restaurant.", icon: "fa-ban",                color: "bg-red-500"    },
};

export const OrderTrackingProvider = ({ children }) => {
  const { user } = useAuth();
  const [toasts, setToasts] = useState([]);
  const [activeOrderStatus, setActiveOrderStatus] = useState(null); // most recent non-terminal order
  const prevStatusesRef = useRef({}); // { orderId: status } — tracks what we last knew

  const addToast = useCallback((msg, color, icon) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, msg, color, icon }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    // Only poll for customers
    if (!user || user.role !== "customer") return;

    const TERMINAL = new Set(["completed", "rejected"]);

    const poll = async () => {
      try {
        const { data: orders } = await api.get("/orders");

        // Find first non-terminal order for navbar indicator
        const active = orders.find((o) => !TERMINAL.has(o.status));
        setActiveOrderStatus(active?.status ?? null);

        // Detect status changes and fire toasts
        orders.forEach((order) => {
          const prev = prevStatusesRef.current[order.id];
          const curr = order.status;

          if (prev !== undefined && prev !== curr) {
            // Status just changed → fire notification
            const cfg = STATUS_MESSAGES[curr];
            if (cfg) addToast(cfg.text, cfg.color, cfg.icon);

            // Cart management rules:
            // accepted → clear cart (restaurant took the order)
            if (curr === "accepted") {
              localStorage.setItem("foodify_cart", "[]");
              window.dispatchEvent(new Event("foodify_cart_changed"));
            }
            // rejected → keep cart intact (user can adjust & reorder)
          }

          prevStatusesRef.current[order.id] = curr;
        });

        // Seed initial snapshot without triggering toasts on first load
        if (orders.length && Object.keys(prevStatusesRef.current).length === 0) {
          orders.forEach((o) => {
            prevStatusesRef.current[o.id] = o.status;
          });
        }
      } catch {
        // silent — don't spam console on network issues
      }
    };

    poll(); // initial fetch
    const id = setInterval(poll, 5000);
    return () => clearInterval(id);
  }, [user, addToast]);

  return (
    <OrderTrackingContext.Provider value={{ toasts, dismissToast, activeOrderStatus }}>
      {children}
    </OrderTrackingContext.Provider>
  );
};

export const useOrderTracking = () => useContext(OrderTrackingContext);
