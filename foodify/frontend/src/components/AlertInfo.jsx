import { useEffect } from "react";

const AlertInfo = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-[bounce_0.5s_ease-out]">
      <div className={`rounded-xl shadow-2xl p-4 flex items-center gap-3 ${type === 'success' ? 'bg-green-600' : 'bg-red-500'} text-white max-w-sm`}>
        <div className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center shrink-0 shadow-inner">
          <i className={`fa-solid ${type === 'success' ? 'fa-check' : 'fa-info'}`}></i>
        </div>
        <p className="font-semibold text-sm pr-4 tracking-wide">{message}</p>
        <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors ml-auto -mr-2">
          <i className="fa-solid fa-xmark text-sm"></i>
        </button>
      </div>
    </div>
  );
};

export default AlertInfo;
