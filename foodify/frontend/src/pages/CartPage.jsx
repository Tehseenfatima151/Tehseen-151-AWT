import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { notifyCartChanged } from "../utils/cartEvents";

const CartPage = () => {
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem("foodify_cart") || "[]"));
  const navigate = useNavigate();

  const total = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);

  const updateQuantity = (itemId, delta) => {
    const updated = cart.map((item) => {
      if (item.itemId === itemId) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    });
    localStorage.setItem("foodify_cart", JSON.stringify(updated));
    notifyCartChanged();
    setCart(updated);
  };

  const removeItem = (itemId) => {
    const updated = cart.filter((item) => item.itemId !== itemId);
    localStorage.setItem("foodify_cart", JSON.stringify(updated));
    notifyCartChanged();
    setCart(updated);
  };

  return (
    <div className="min-h-screen bg-[var(--color-background-soft)] font-['Outfit'] flex flex-col">
      <Navbar />
      
      <main className="flex-grow max-w-4xl mx-auto w-full px-4 py-12">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors">
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Your Cart</h2>
        </div>

        {!cart.length ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100">
            <i className="fa-solid fa-basket-shopping text-6xl text-gray-200 mb-6"></i>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h3>
            <p className="text-gray-500 mb-8 font-medium">Looks like you haven't added anything yet.</p>
            <Link to="/customer" className="bg-[var(--color-brand)] text-white px-8 py-3 rounded-full font-bold hover:bg-[var(--color-brand-hover)] transition-all inline-block">
              Start Browsing
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
            <div className="space-y-6">
              {cart.map((item) => (
                <div key={item.itemId} className="flex flex-col sm:flex-row items-center justify-between py-4 border-b border-gray-100 last:border-0 gap-4">
                  <div className="flex-grow text-center sm:text-left">
                    <h4 className="text-lg font-bold text-gray-900">{item.name}</h4>
                    <p className="text-[var(--color-brand)] font-extrabold">Rs {Number(item.price).toFixed(2)}</p>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="flex items-center bg-gray-50 rounded-full border border-gray-200 overflow-hidden">
                      <button onClick={() => updateQuantity(item.itemId, -1)} className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">
                        <i className="fa-solid fa-minus text-sm"></i>
                      </button>
                      <span className="w-8 text-center font-bold text-gray-900">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.itemId, 1)} className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">
                        <i className="fa-solid fa-plus text-sm"></i>
                      </button>
                    </div>
                    <div className="w-20 text-right font-bold text-lg text-gray-900">
                      Rs {(item.price * item.quantity).toFixed(2)}
                    </div>
                    <button onClick={() => removeItem(item.itemId)} className="w-10 h-10 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center">
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-100 pb-2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-500 font-medium">Subtotal</span>
                <span className="font-bold">Rs {total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-500 font-medium">Delivery Fee</span>
                <span className="font-bold text-green-600">Free</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-xl font-bold text-gray-900">Total</span>
                <span className="text-3xl font-extrabold text-[var(--color-brand)]">Rs {total.toFixed(2)}</span>
              </div>
            </div>

            <button 
              onClick={() => navigate("/checkout")} 
              className="w-full mt-8 bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
            >
              Go to Checkout
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default CartPage;
