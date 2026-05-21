import { Link } from "react-router-dom";
import SafeImage from "./SafeImage";
import { useFavorites } from "../context/FavoritesContext";
import { useAuth } from "../context/AuthContext";

const getRating = (id) => (4.0 + (id % 10) * 0.1).toFixed(1);
const getDeliveryTime = (id) => (15 + (id % 30)).toString();

const RestaurantCard = ({ restaurant, tag, genre = "Fast Food", featured = false }) => {
  const rating = getRating(restaurant.id);
  const deliveryTime = getDeliveryTime(restaurant.id);
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(restaurant.id);

  // Professional fallbacks based on genre if image_url is missing
  const getFallback = (g) => {
    const fallbacks = {
      "Pizza":     "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600",
      "Burgers":   "https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=600",
      "Biryani":   "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?q=80&w=600",
      "Chinese":   "https://images.unsplash.com/photo-1525755662778-989d0524087e?q=80&w=600",
      "Pakistani": "https://images.unsplash.com/photo-1589118949245-7d38baf380d6?q=80&w=600",
      "Haleem":    "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?q=80&w=600",
      "Desserts":  "https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=600",
    };
    return fallbacks[g] || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600";
  };

  const displayImage = restaurant.image_url || getFallback(genre);

  const handleHeartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(restaurant.id);
  };

  return (
    <Link 
      to={`/menu/${restaurant.id}`} 
      className="block group bg-white rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)] transition-all duration-300 border border-gray-100 flex flex-col h-full relative"
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 flex flex-col gap-2 z-10 pointer-events-none">
        {tag && (
          <span className="bg-[var(--color-brand)] text-white text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-full shadow-md backdrop-blur-sm border border-pink-400">
             {tag}
          </span>
        )}
        {featured && (
          <span className="bg-yellow-400 text-yellow-900 text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-full shadow-md w-max flex items-center gap-1.5 border border-yellow-300">
             <i className="fa-solid fa-crown text-[10px]"></i> Top
          </span>
        )}
      </div>

      {/* Heart Favorite Button — only for customers */}
      {user?.role === "customer" && (
        <button
          onClick={handleHeartClick}
          className={`absolute top-3 right-3 z-20 w-9 h-9 rounded-full backdrop-blur-sm shadow-md flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-90 border border-white/50 ${
            favorited ? "bg-red-500 text-white" : "bg-white/90 text-gray-400 hover:text-red-400"
          }`}
          title={favorited ? "Remove from favourites" : "Add to favourites"}
        >
          <i className={`${favorited ? "fa-solid" : "fa-regular"} fa-heart text-sm transition-all`} />
        </button>
      )}

      {/* Image Section */}
      <div className="relative h-44 sm:h-48 overflow-hidden w-full shrink-0 bg-gray-100">
        <SafeImage 
          src={displayImage} 
          alt={restaurant.name} 
          className="w-full h-full group-hover:scale-110 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        {/* Floating delivery time badge */}
        <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md text-gray-900 text-xs font-bold px-2.5 py-1.5 rounded-full shadow-sm flex items-center gap-1 border border-white/50">
          <i className="fa-regular fa-clock text-[var(--color-brand)]"></i> {deliveryTime} min
        </div>
      </div>
      
      {/* Content Section */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow justify-between">
        <div>
          <div className="flex justify-between items-start mb-2 gap-3">
            <h3 className="text-lg font-extrabold text-gray-900 group-hover:text-[var(--color-brand)] transition-colors line-clamp-1 leading-tight tracking-tight">
              {restaurant.name}
            </h3>
            <div className="flex items-center gap-1 bg-gray-50 border border-gray-100 px-1.5 py-1 rounded-md shrink-0 shadow-sm">
               <i className="fa-solid fa-star text-yellow-400 text-[10px]"></i>
               <span className="font-bold text-xs text-gray-700">{rating}</span>
            </div>
          </div>
          <p className="text-gray-500 text-xs sm:text-sm font-medium flex items-center gap-1.5">
             {genre} • <span className="text-gray-300 text-[10px]"><i className="fa-solid fa-circle"></i></span> $$$
          </p>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center text-xs font-bold text-gray-500 bg-gray-50/50 -mx-4 sm:-mx-5 -mb-4 sm:-mb-5 p-4 sm:p-5">
          <i className="fa-solid fa-motorcycle text-[var(--color-brand)] mr-2 shrink-0"></i> <span className="text-gray-600">Free Delivery</span>
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;

