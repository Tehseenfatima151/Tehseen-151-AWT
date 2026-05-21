import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import SafeImage from "../components/SafeImage";
import LoadingSpinner from "../components/LoadingSpinner";
import api from "../api/api";
import { useFavorites } from "../context/FavoritesContext";

const getRating = (id) => (4.0 + (id % 10) * 0.1).toFixed(1);
const getDeliveryTime = (id) => (15 + (id % 30)).toString();

const FavoritesPage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toggleFavorite } = useFavorites();

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/favorites");
      setRestaurants(data);
    } catch {
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleRemove = async (restaurantId) => {
    await toggleFavorite(restaurantId);
    setRestaurants((prev) => prev.filter((r) => r.id !== restaurantId));
  };

  return (
    <div className="min-h-screen bg-[var(--color-background-soft)] font-['Outfit']">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center">
              <i className="fa-solid fa-heart text-red-500" />
            </span>
            My Favourites
          </h1>
          <p className="text-gray-500 font-medium mt-2">
            {restaurants.length > 0
              ? `${restaurants.length} restaurant${restaurants.length !== 1 ? "s" : ""} saved`
              : "Restaurants you save will appear here"}
          </p>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : restaurants.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center py-28 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">
            <div className="w-24 h-24 rounded-full bg-red-50 flex items-center justify-center mb-5 shadow-inner">
              <i className="fa-regular fa-heart text-4xl text-red-300" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-800 mb-2">No favourites yet</h2>
            <p className="text-gray-400 font-medium mb-6 text-center max-w-xs">
              Tap the heart icon on any restaurant to save it here for quick access!
            </p>
            <Link
              to="/customer"
              className="bg-[var(--color-brand)] text-white px-8 py-3 rounded-full font-bold shadow-md hover:bg-[var(--color-brand-hover)] transition-all transform hover:-translate-y-0.5"
            >
              Browse Restaurants
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {restaurants.map((restaurant) => {
              const rating = getRating(restaurant.id);
              const deliveryTime = getDeliveryTime(restaurant.id);
              return (
                <div
                  key={restaurant.id}
                  className="group bg-white rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)] transition-all duration-300 border border-gray-100 flex flex-col relative"
                >
                  {/* Remove Heart Button */}
                  <button
                    onClick={() => handleRemove(restaurant.id)}
                    className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center transition-all hover:scale-110 active:scale-95 border border-white/50"
                    title="Remove from favourites"
                  >
                    <i className="fa-solid fa-heart text-red-500 text-sm" />
                  </button>

                  {/* Image */}
                  <Link to={`/menu/${restaurant.id}`} className="block relative h-44 overflow-hidden bg-gray-100 shrink-0">
                    <SafeImage
                      src={restaurant.image_url}
                      alt={restaurant.name}
                      className="w-full h-full group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md text-gray-900 text-xs font-bold px-2.5 py-1.5 rounded-full shadow-sm flex items-center gap-1 border border-white/50">
                      <i className="fa-regular fa-clock text-[var(--color-brand)]" /> {deliveryTime} min
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="p-4 flex flex-col flex-grow justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-1.5 gap-2">
                        <Link to={`/menu/${restaurant.id}`}>
                          <h3 className="text-base font-extrabold text-gray-900 group-hover:text-[var(--color-brand)] transition-colors line-clamp-1 leading-tight tracking-tight">
                            {restaurant.name}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-1 bg-gray-50 border border-gray-100 px-1.5 py-1 rounded-md shrink-0 shadow-sm">
                          <i className="fa-solid fa-star text-yellow-400 text-[10px]" />
                          <span className="font-bold text-xs text-gray-700">{rating}</span>
                        </div>
                      </div>
                      <p className="text-gray-500 text-xs font-medium">
                        {restaurant.category || "Restaurant"} • $$$
                      </p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center text-xs font-bold text-gray-500 bg-gray-50/50 -mx-4 -mb-4 p-4">
                      <i className="fa-solid fa-motorcycle text-[var(--color-brand)] mr-2 shrink-0" />
                      <span className="text-gray-600">Free Delivery</span>
                    </div>
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

export default FavoritesPage;
