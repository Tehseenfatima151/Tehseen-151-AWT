import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useOrderTracking } from "../context/OrderTrackingContext";
import { useFavorites } from "../context/FavoritesContext";
import { useCart } from "../context/CartContext";

const STATUS_PILL = {
  pending:   { label: "Order Pending",   color: "bg-yellow-400 text-yellow-900" },
  accepted:  { label: "Order Accepted",  color: "bg-blue-500 text-white"        },
  preparing: { label: "Being Prepared",  color: "bg-orange-500 text-white"      },
  ready:     { label: "Ready to Ship",   color: "bg-indigo-500 text-white"      },
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { activeOrderStatus } = useOrderTracking() || {};
  const { favoriteCount = 0 } = useFavorites() || {};
  const { cartItemCount = 0 } = useCart() || {};

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  const pill = activeOrderStatus ? STATUS_PILL[activeOrderStatus] : null;

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link to={user?.role === "restaurant" ? "/restaurant" : "/customer"} className="text-2xl font-bold text-[var(--color-brand)] flex items-center gap-2">
              <i className="fa-solid fa-cloud-meatball"></i>
              Foodify
            </Link>
          </div>
          <div className="flex items-center gap-5">
            {user?.role === "customer" && (
              <>
                {/* Live order status pill */}
                {pill && (
                  <Link
                    to="/customer/orders"
                    className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm border border-black/10 animate-pulse ${pill.color}`}
                    title="View your active order"
                  >
                    <i className="fa-solid fa-circle-notch fa-spin text-[10px]"></i>
                    {pill.label}
                  </Link>
                )}
                <Link to="/customer/orders" className="text-gray-600 hover:text-[var(--color-brand)] font-medium transition-colors">
                  My Orders
                </Link>
                <Link
                  to="/customer/favourites"
                  className="text-gray-600 hover:text-red-500 transition-colors relative inline-flex items-center justify-center w-10 h-10 rounded-xl hover:bg-red-50/80 group"
                  title="My Favourites"
                  aria-label={favoriteCount > 0 ? `Favourites, ${favoriteCount} saved` : "Favourites"}
                >
                  <i className="fa-regular fa-heart text-xl group-hover:fa-solid relative" />
                  {favoriteCount > 0 && (
                    <span
                      className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-[var(--color-brand)] ring-2 ring-white shadow-sm"
                      aria-hidden
                    />
                  )}
                </Link>
                <Link
                  to="/cart"
                  className="text-gray-600 hover:text-[var(--color-brand)] transition-colors relative inline-flex items-center justify-center w-10 h-10 rounded-xl hover:bg-pink-50/80"
                  title="Cart"
                  aria-label={cartItemCount > 0 ? `Cart, ${cartItemCount} items` : "Cart"}
                >
                  <i className="fa-solid fa-cart-shopping text-xl" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-[var(--color-brand)] text-white text-[10px] font-extrabold border-2 border-white shadow-sm leading-none tabular-nums">
                      {cartItemCount > 99 ? "99+" : cartItemCount}
                    </span>
                  )}
                </Link>
              </>
            )}
            <div className="relative group">
              <button className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium pb-4 -mb-4 pt-4 -mt-4">
                <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center text-[var(--color-brand)]">
                  <i className="fa-regular fa-user"></i>
                </div>
                <span className="hidden sm:block">{user?.name || "User"}</span>
                <i className="fa-solid fa-chevron-down text-xs ml-1"></i>
              </button>
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] py-2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-50 border border-gray-100">
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 font-medium transition-colors"
                >
                  <i className="fa-solid fa-arrow-right-from-bracket mr-2"></i>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
