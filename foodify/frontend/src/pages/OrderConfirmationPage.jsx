import { Link, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";

const OrderConfirmationPage = () => {
  const location = useLocation();
  const orderId = location.state?.orderId;

  return (
    <div className="min-h-screen bg-[var(--color-background-soft)] font-['Outfit'] flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] max-w-md w-full text-center border border-pink-50 relative overflow-hidden transform animate-[scale-in_0.4s_ease-out]">
          <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-[var(--color-brand)] to-pink-400"></div>
          
          <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner relative">
            <div className="absolute inset-0 border-4 border-green-100 rounded-full scale-110 animate-pulse"></div>
            <i className="fa-solid fa-check text-5xl"></i>
          </div>
          
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Order Confirmed!</h2>
          <p className="text-gray-500 font-medium mb-8 text-lg">
            Your delicious food is being prepared. 
            {orderId && <span className="block mt-2 text-sm text-gray-400 font-bold bg-gray-50 w-max mx-auto px-4 py-1 rounded-full">Order ID: #{orderId}</span>}
          </p>
          
          <div className="bg-gray-50/80 rounded-2xl p-5 mb-8 text-left border border-gray-100">
            <h4 className="font-bold text-gray-800 mb-4 text-xs uppercase tracking-widest">What happens next?</h4>
            <ul className="space-y-4">
              <li className="flex gap-4 items-center">
                 <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-[var(--color-brand)] shrink-0 border border-pink-50"><i className="fa-solid fa-fire-burner text-lg"></i></div>
                 <span className="text-sm font-semibold text-gray-700">The restaurant will prepare your food.</span>
              </li>
              <li className="flex gap-4 items-center">
                 <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-[var(--color-brand)] shrink-0 border border-pink-50"><i className="fa-solid fa-motorcycle text-lg"></i></div>
                 <span className="text-sm font-semibold text-gray-700">A rider will pick it up and deliver to you.</span>
              </li>
            </ul>
          </div>
          
          <div className="space-y-3">
             <Link to="/customer/orders" className="block w-full bg-[var(--color-brand)] text-white py-4 rounded-xl font-bold text-lg shadow-[0_8px_20px_rgba(215,15,100,0.25)] hover:bg-[var(--color-brand-hover)] hover:shadow-[0_12px_25px_rgba(215,15,100,0.35)] transition-all transform hover:-translate-y-0.5 text-center">
               Track Your Order
             </Link>
             <Link to="/customer" className="block w-full bg-white text-gray-700 py-3.5 rounded-xl font-bold hover:bg-gray-50 transition-colors text-center border border-gray-200">
               Back to Home
             </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrderConfirmationPage;
