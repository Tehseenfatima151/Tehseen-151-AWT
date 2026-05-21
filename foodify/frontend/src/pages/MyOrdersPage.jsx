import { useEffect, useState } from "react";
import api from "../api/api";
import Navbar from "../components/Navbar";
import LoadingSpinner from "../components/LoadingSpinner";
import { Link, useNavigate } from "react-router-dom";

/* ── Status configs ── */
const ORDER_STATUS_CFG = {
  pending:   { color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: "fa-clock",              label: "Pending" },
  accepted:  { color: "bg-blue-100 text-blue-700 border-blue-200",       icon: "fa-check-to-slot",      label: "Accepted" },
  preparing: { color: "bg-orange-100 text-orange-700 border-orange-200", icon: "fa-fire-burner",        label: "Preparing" },
  ready:     { color: "bg-indigo-100 text-indigo-700 border-indigo-200", icon: "fa-box-open",           label: "Ready" },
  completed: { color: "bg-green-100 text-green-700 border-green-200",    icon: "fa-house-circle-check", label: "Completed" },
  rejected:  { color: "bg-red-100 text-red-700 border-red-200",          icon: "fa-ban",                label: "Rejected" },
};

const LEFT_BAR = {
  pending: "bg-yellow-400", accepted: "bg-blue-400", preparing: "bg-orange-400",
  ready: "bg-indigo-400", completed: "bg-green-400", rejected: "bg-red-400",
};

/* ── Delivery tracking steps ── */
const DELIVERY_STEPS = [
  { key: "confirmed",  label: "Order Confirmed", icon: "fa-circle-check",   color: "#3b82f6" },
  { key: "preparing",  label: "Preparing",        icon: "fa-fire-burner",    color: "#f97316" },
  { key: "picked_up",  label: "Picked Up",        icon: "fa-motorcycle",     color: "#8b5cf6" },
  { key: "on_the_way", label: "On the Way",       icon: "fa-road",           color: "#d70f64" },
  { key: "delivered",  label: "Delivered",        icon: "fa-house-circle-check", color: "#10b981" },
];

const DeliveryTracker = ({ deliveryStatus, riderName }) => {
  if (!deliveryStatus || deliveryStatus === "pending") return null;

  const currentIdx = DELIVERY_STEPS.findIndex((s) => s.key === deliveryStatus);

  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      {/* Rider info */}
      {riderName && (
        <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-pink-50 rounded-xl border border-pink-100">
          <span className="text-lg">🏍️</span>
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Your Rider</span>
            <p className="text-sm font-bold text-gray-900">{riderName}</p>
          </div>
          <span className="ml-auto text-xs font-bold text-[var(--color-brand)] bg-white px-2 py-1 rounded-full border border-pink-200">
            {deliveryStatus === "delivered" ? "✅ Delivered" : "🟢 On duty"}
          </span>
        </div>
      )}

      {/* Step tracker */}
      <div className="flex items-start justify-between gap-1 overflow-x-auto pb-1">
        {DELIVERY_STEPS.map((step, i) => {
          const done   = i < currentIdx;
          const active = i === currentIdx;
          return (
            <div key={step.key} className="flex flex-col items-center flex-1 min-w-[56px] relative">
              {/* Connector line */}
              {i < DELIVERY_STEPS.length - 1 && (
                <div
                  className="absolute top-4 left-1/2 w-full h-0.5 z-0"
                  style={{
                    background: done ? step.color : "#e5e7eb",
                    transform: "translateX(50%)",
                  }}
                />
              )}
              {/* Dot */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center z-10 relative transition-all duration-300"
                style={{
                  background: done || active ? step.color : "#f3f4f6",
                  boxShadow: active ? `0 0 0 4px ${step.color}33` : "none",
                  transform: active ? "scale(1.15)" : "scale(1)",
                }}
              >
                <i
                  className={`fa-solid ${done ? "fa-check" : step.icon} text-[10px]`}
                  style={{ color: done || active ? "#fff" : "#9ca3af" }}
                />
              </div>
              {/* Label */}
              <span
                className="text-[9px] font-bold mt-1.5 text-center leading-tight"
                style={{ color: active ? "#111" : done ? "#6b7280" : "#9ca3af" }}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ── Main Page ── */
const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = () => {
      api.get("/orders")
        .then((res) => setOrders(res.data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    };

    fetchOrders();
    const intervalId = setInterval(fetchOrders, 5000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-background-soft)] font-['Outfit']">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-12">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/customer")}
            className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors"
          >
            <i className="fa-solid fa-arrow-left" />
          </button>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">My Orders</h2>
            {orders.length > 0 && (
              <p className="text-sm text-gray-500 font-medium mt-0.5">
                {orders.length} order{orders.length !== 1 ? "s" : ""} • auto-refreshes every 5s
              </p>
            )}
          </div>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fa-solid fa-receipt text-5xl text-gray-300" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No orders yet</h3>
            <p className="text-gray-500 mb-8 font-medium text-lg">When you place an order, it will appear here.</p>
            <Link
              to="/customer"
              className="bg-[var(--color-brand)] text-white px-8 py-3.5 rounded-full font-bold hover:bg-[var(--color-brand-hover)] shadow-md transition-all inline-block hover:-translate-y-0.5 transform"
            >
              Start Browsing
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => {
              const statusCfg = ORDER_STATUS_CFG[order.status] || ORDER_STATUS_CFG.pending;
              const leftBar   = LEFT_BAR[order.status] || "bg-gray-300";
              const hasRider  = order.delivery_status && order.delivery_status !== "pending";

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all relative overflow-hidden"
                >
                  {/* Left status bar */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${leftBar}`} />

                  <div className="p-6 sm:p-7 pl-7">
                    {/* Top row */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-pink-50 text-[var(--color-brand)] flex items-center justify-center shrink-0 border border-pink-100">
                          <i className="fa-solid fa-store text-xl" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-0.5 leading-tight">
                            {order.restaurant_name}
                          </h3>
                          <p className="text-gray-400 text-xs font-medium mb-3">Order #{order.id}</p>
                          {/* Order status badge */}
                          <span className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-2 w-max capitalize shadow-sm ${statusCfg.color}`}>
                            <i className={`fa-solid ${statusCfg.icon}`} /> {statusCfg.label}
                          </span>
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="sm:text-right border-t border-gray-100 sm:border-0 pt-4 sm:pt-0">
                        <p className="text-gray-400 text-xs mb-1 font-medium uppercase tracking-wider">Total</p>
                        <p className="text-3xl font-black text-gray-900">
                          Rs {Number(order.total_price).toFixed(2)}
                        </p>
                        {order.rider_tip > 0 && (
                          <p className="text-xs text-[var(--color-brand)] font-bold mt-1">
                            💰 Includes Rs.{order.rider_tip} rider tip
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Delivery tracker — only shown when rider is assigned */}
                    {hasRider && (
                      <DeliveryTracker
                        deliveryStatus={order.delivery_status}
                        riderName={order.rider_name}
                      />
                    )}

                    {/* Rejected message */}
                    {order.status === "rejected" && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-xl border border-red-100">
                          <i className="fa-solid fa-circle-exclamation text-red-400" />
                          <p className="text-sm text-red-600 font-medium">
                            This order was rejected by the restaurant.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyOrdersPage;
