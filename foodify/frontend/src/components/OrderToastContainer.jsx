import { useOrderTracking } from "../context/OrderTrackingContext";

const OrderToastContainer = () => {
  const { toasts, dismissToast } = useOrderTracking();

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-start gap-3 bg-gray-900 text-white px-5 py-4 rounded-2xl shadow-2xl max-w-sm w-full animate-slide-in-right border border-white/10 backdrop-blur-md"
          style={{ animation: "slideInRight 0.3s ease-out" }}
        >
          <div className={`${toast.color} w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-lg`}>
            <i className={`fa-solid ${toast.icon} text-sm text-white`}></i>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-0.5">Order Update</p>
            <p className="text-sm font-semibold leading-snug">{toast.msg}</p>
          </div>
          <button
            onClick={() => dismissToast(toast.id)}
            className="text-gray-500 hover:text-white transition-colors mt-0.5 shrink-0"
          >
            <i className="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>
      ))}
    </div>
  );
};

export default OrderToastContainer;
