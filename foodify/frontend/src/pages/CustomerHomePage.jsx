import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import RestaurantCard from "../components/RestaurantCard";
import ScrollRow from "../components/ScrollRow";
import SafeImage from "../components/SafeImage";

// ─── Static reference data ────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 1,  name: "Fast Food",     icon: "🍔", image: "https://images.unsplash.com/photo-1561758033-d89a9ad46330?q=80&w=300&h=300&fit=crop" },
  { id: 2,  name: "Pizza",         icon: "🍕", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=300&h=300&fit=crop" },
  { id: 3,  name: "Biryani",       icon: "🍚", image: "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?q=80&w=300&h=300&fit=crop" },
  { id: 4,  name: "Pakistani",     icon: "Desi", image: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?q=80&w=300&h=300&fit=crop" },
  { id: 5,  name: "Burgers",       icon: "🍔", image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=300&h=300&fit=crop" },
  { id: 6,  name: "Shawarma",      icon: "🌯", image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?q=80&w=300&h=300&fit=crop" },
  { id: 7,  name: "Chinese",       icon: "🥢", image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?q=80&w=300&h=300&fit=crop" },
  { id: 8,  name: "Haleem",        icon: "🥘", image: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?q=80&w=300&h=300&fit=crop" },
  { id: 9,  name: "Paratha",       icon: "🫓", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=300&h=300&fit=crop" },
  { id: 10, name: "Halwa Puri",    icon: "🥙", image: "https://images.unsplash.com/photo-1589647363585-f4a7d3877b10?q=80&w=300&h=300&fit=crop" },
  { id: 11, name: "Pulao",         icon: "🍲", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=300&h=300&fit=crop" },
  { id: 12, name: "Pasta",         icon: "🍝", image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?q=80&w=300&h=300&fit=crop" },
  { id: 13, name: "Desserts",      icon: "🍰", image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=300&h=300&fit=crop" },
  { id: 14, name: "Ice Cream",     icon: "🍦", image: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?q=80&w=300&h=300&fit=crop" },
  { id: 15, name: "Cake & Bakery", icon: "🎂", image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?q=80&w=300&h=300&fit=crop" },
  { id: 16, name: "Drinks",        icon: "🥤", image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=300&h=300&fit=crop" },
  { id: 17, name: "Healthy",       icon: "🥗", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=300&h=300&fit=crop" },
];

const BRANDS = [
  { id: 1, name: "KFC",       logo: "https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?q=80&w=300&fit=crop" },
  { id: 2, name: "McDonalds", logo: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=300&fit=crop" },
  { id: 3, name: "Pizza Hut", logo: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=300&fit=crop" },
  { id: 4, name: "Subway",    logo: "https://images.unsplash.com/photo-1509722747041-616f39b57569?q=80&w=300&fit=crop" },
  { id: 5, name: "Dominos",   logo: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=300&fit=crop" },
  { id: 6, name: "Starbucks", logo: "https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=300&fit=crop" },
];

// Gradient presets indexed by deal.theme (0–5)
const DEAL_THEMES = [
  "from-red-600 to-orange-500",
  "from-[var(--color-brand)] to-pink-600",
  "from-yellow-500 to-amber-500",
  "from-violet-600 to-purple-500",
  "from-blue-600 to-cyan-500",
  "from-green-600 to-emerald-500",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getCategoryIcon = (cat)  => CATEGORIES.find((c) => c.name === cat)?.icon  ?? "🍽️";
const getBrandLogo    = (brand) => BRANDS.find((b)    => b.name === brand)?.logo ?? "🏪";

// ─── Sub-components ───────────────────────────────────────────────────────────
const SectionHeader = ({ title }) => (
  <div className="flex justify-between items-end mb-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
    <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">{title}</h2>
  </div>
);

const SkeletonCard = () => (
  <div className="shrink-0 w-[260px] sm:w-[300px] h-64 bg-gray-200/70 rounded-3xl animate-pulse" />
);

const SkeletonDeal = () => (
  <div className="shrink-0 w-[280px] sm:w-[360px] h-48 sm:h-52 bg-gray-200/70 rounded-3xl animate-pulse" />
);

const EmptyState = ({ label, onClear }) => (
  <div className="text-center py-24 bg-white rounded-3xl shadow-[0_4px_30px_rgb(0,0,0,0.02)] border border-gray-100">
    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
      <span className="text-4xl text-gray-300">🏪</span>
    </div>
    <h3 className="text-xl font-bold text-gray-800 tracking-tight">No restaurants found</h3>
    <p className="text-gray-500 mt-1 font-medium text-sm sm:text-base">
      No results for <span className="font-semibold text-gray-700">{label}</span>. Try a different filter.
    </p>
    <button
      onClick={onClear}
      className="mt-6 bg-[var(--color-brand)] text-white font-bold py-2.5 px-6 rounded-full hover:bg-[var(--color-brand-hover)] transition-colors shadow-md"
    >
      Show All Restaurants
    </button>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const CustomerHomePage = () => {
  const navigate = useNavigate();

  const [allRestaurants, setAllRestaurants] = useState([]);
  const [deals, setDeals]                   = useState([]);
  const [loading, setLoading]               = useState(true);
  const [dealsLoading, setDealsLoading]     = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeBrand, setActiveBrand]       = useState(null);

  // ── Fetch on mount ────────────────────────────────────────────────────────
  useEffect(() => {
    api.get("/restaurants")
      .then((res) => {
        setAllRestaurants(res.data);
      })
      .catch(() => setAllRestaurants([]))
      .finally(() => setLoading(false));

    api.get("/deals")
      .then((res) => setDeals(res.data))
      .catch(() => setDeals([]))
      .finally(() => setDealsLoading(false));
  }, []);

  // ── Client-side filtering ─────────────────────────────────────────────────
  const filteredRestaurants = allRestaurants.filter((r) => {
    // Normalize string constraints
    const cleanCat = activeCategory?.trim().toLowerCase() || "";
    const keyword = cleanCat.endsWith('s') ? cleanCat.slice(0, -1) : cleanCat; // burgers -> burger

    const categoryDB = r.category?.trim().toLowerCase() || "";
    const menuDB = r.menu_items_concat?.toLowerCase() || "";

    const catMatch = !activeCategory || 
                     categoryDB === cleanCat || 
                     menuDB.includes(keyword);
                     
    const brandMatch = !activeBrand || r.brand?.trim() === activeBrand;
    return catMatch && brandMatch;
  });

  const homeChefs = allRestaurants.filter((r) => r.is_home_chef === 1 || r.is_home_chef === true);
  const topShops  = allRestaurants.filter((r) => !r.is_home_chef);

  const hasFilter = !!activeCategory || !!activeBrand;

  // ── Handlers ─────────────────────────────────────────────────────────────
  const toggleCategory = useCallback((name) => setActiveCategory((p) => (p === name ? null : name)), []);
  const toggleBrand    = useCallback((name) => setActiveBrand((p)    => (p === name ? null : name)), []);
  const clearFilters   = useCallback(() => { setActiveCategory(null); setActiveBrand(null); }, []);

  const activeFilterLabel = [activeCategory, activeBrand].filter(Boolean).join(" + ");

  const sectionTitle = activeCategory && activeBrand
    ? `🎯 ${activeCategory} · ${activeBrand}`
    : activeCategory ? `🎯 ${activeCategory}`
    : activeBrand    ? `🏷️ ${activeBrand}`
    : null;

  return (
    <div className="min-h-screen bg-[var(--color-background-soft)] font-['Outfit'] pb-20">
      <Navbar />
      <HeroSection />

      {/* ─── FOOD CATEGORIES ──────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 py-6 mb-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              🍲 Cuisines & Categories
            </h2>
            {activeCategory && (
              <button
                onClick={() => setActiveCategory(null)}
                className="text-xs font-bold text-gray-500 hover:text-[var(--color-brand)] transition-colors flex items-center gap-1"
              >
                Clear <i className="fa-solid fa-xmark" />
              </button>
            )}
          </div>

          {/* ScrollRow adds ‹ › arrows automatically */}
          <ScrollRow className="gap-4 sm:gap-6 pb-2" scrollAmount={220}>
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.name;
              return (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.name)}
                  aria-pressed={isActive}
                  className="flex flex-col items-center gap-3 group shrink-0 w-20 sm:w-24 snap-start focus:outline-none"
                >
                  <div className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 transition-all duration-300 transform
                    ${isActive
                      ? "border-[var(--color-brand)] scale-110 shadow-[0_8px_25px_rgba(219,39,119,0.2)]"
                      : "border-gray-100 shadow-sm group-hover:border-gray-200 group-hover:-translate-y-1"
                    }`}
                  >
                    <SafeImage
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full rounded-full"
                    />
                  </div>
                  <span className={`text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-center leading-tight
                    ${isActive ? "text-[var(--color-brand)]" : "text-gray-600 group-hover:text-gray-900"}`}
                  >
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </ScrollRow>
        </div>
      </div>

      {/* ─── Loading skeleton ─────────────────────────────────────────────── */}
      {loading ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 animate-pulse">
          <div className="flex gap-4 overflow-hidden">
            <SkeletonDeal /><SkeletonDeal /><SkeletonDeal />
          </div>
          <div className="flex gap-4 overflow-hidden">
            <SkeletonCard /><SkeletonCard /><SkeletonCard />
          </div>
        </div>
      ) : (
        <div className="space-y-10 sm:space-y-14">

          {/* ─── YOUR DAILY DEALS ───────────────────────────────────────── */}
          {!hasFilter && (
            <section>
              <SectionHeader title="🔥 Your Daily Deals" />
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <ScrollRow className="gap-4 sm:gap-6 pb-4" scrollAmount={380}>
                  {dealsLoading ? (
                    [1, 2, 3].map((i) => <SkeletonDeal key={i} />)
                  ) : deals.length > 0 ? (
                    deals.map((deal) => (
                      <button
                        key={deal.id}
                        type="button"
                        onClick={() =>
                          navigate(`/menu/${deal.restaurant_id}`, {
                            state: { activeDeal: deal },
                          })
                        }
                        className="relative shrink-0 w-[280px] sm:w-[360px] h-48 sm:h-52 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer snap-start text-left focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
                      >
                        {deal.img_url ? (
                          <img
                            src={deal.img_url}
                            alt={deal.title}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            loading="lazy"
                          />
                        ) : null}
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${DEAL_THEMES[deal.theme ?? 0]} ${deal.img_url ? "opacity-88" : "opacity-100"} group-hover:opacity-95 transition-opacity`}
                        />
                        <div className="absolute inset-0 p-5 sm:p-6 flex flex-col justify-between z-10">
                          <div className="flex items-start justify-between gap-2">
                            <span className="bg-white text-[var(--color-brand)] text-xs font-black px-3 py-1.5 rounded-full shadow-lg border border-white/50 tracking-wide">
                              {deal.discount_text}
                            </span>
                            <span className="bg-black/25 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/20 max-w-[140px] truncate">
                              {deal.restaurant_name}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-xl sm:text-2xl font-black text-white leading-tight drop-shadow-lg tracking-tight line-clamp-2">
                              {deal.title}
                            </h3>
                            {deal.description ? (
                              <p className="text-white/85 text-xs sm:text-sm font-semibold mt-1 drop-shadow-sm line-clamp-2">
                                {deal.description}
                              </p>
                            ) : null}
                            <div className="mt-3 inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-bold px-3 py-1.5 rounded-full group-hover:bg-white/35 transition-colors">
                              View menu <i className="fa-solid fa-arrow-right text-[10px]" />
                            </div>
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="shrink-0 w-full min-w-0 max-w-2xl mx-auto rounded-3xl border border-dashed border-gray-200 bg-white/80 py-14 px-6 text-center shadow-sm">
                      <div className="text-4xl mb-3">🏷️</div>
                      <p className="text-gray-800 font-bold text-lg">No deals available</p>
                      <p className="text-gray-500 text-sm mt-1 font-medium">Check back soon for restaurant promotions.</p>
                    </div>
                  )}
                </ScrollRow>
              </div>
            </section>
          )}

          {/* ─── HOME CHEFS ─────────────────────────────────────────────── */}
          {!hasFilter && homeChefs.length > 0 && (
            <section>
              <SectionHeader title="👩‍🍳 Home Chefs" />
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <ScrollRow className="gap-4 sm:gap-6 pb-4" scrollAmount={320}>
                  {homeChefs.map((r) => (
                    <div key={r.id} className="shrink-0 w-[260px] sm:w-[300px] snap-start">
                      <RestaurantCard restaurant={r} tag="Home Chef" genre={r.category ?? "Fast Food"} />
                    </div>
                  ))}
                </ScrollRow>
              </div>
            </section>
          )}

          {/* ─── TOP SHOPS ──────────────────────────────────────────────── */}
          {!hasFilter && topShops.length > 0 && (
            <section>
              <SectionHeader title="🏆 Top Shops" />
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <ScrollRow className="gap-4 sm:gap-6 pb-4" scrollAmount={320}>
                  {topShops.map((r) => (
                    <div key={r.id} className="shrink-0 w-[260px] sm:w-[300px] snap-start">
                      <RestaurantCard restaurant={r} genre={r.category ?? "Fast Food"} featured={true} />
                    </div>
                  ))}
                </ScrollRow>
              </div>
            </section>
          )}

          {/* ─── TOP BRANDS ─────────────────────────────────────────────── */}
          {!activeCategory && (
            <section className="bg-white py-12 border-y border-gray-100 shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
              <div className="flex justify-between items-center mb-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">🌟 Top Brands</h2>
                {activeBrand && (
                  <button
                    onClick={() => setActiveBrand(null)}
                    className="text-xs font-bold text-gray-500 hover:text-[var(--color-brand)] transition-colors flex items-center gap-1"
                  >
                    Clear <i className="fa-solid fa-xmark" />
                  </button>
                )}
              </div>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <ScrollRow className="gap-5 sm:gap-8 items-center pb-2" scrollAmount={300}>
                  {BRANDS.map((brand) => {
                    const isActive = activeBrand === brand.name;
                    return (
                      <button
                        key={brand.id}
                        onClick={() => toggleBrand(brand.name)}
                        aria-pressed={isActive}
                        className="shrink-0 snap-start flex flex-col items-center group focus:outline-none"
                      >
                          <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center transition-all duration-300 overflow-hidden
                          ${isActive
                            ? "border-4 border-[var(--color-brand)] bg-pink-50 shadow-[0_8px_25px_rgba(219,39,119,0.3)] scale-110"
                            : "border border-gray-200 bg-gray-50 shadow-sm group-hover:border-[var(--color-brand)] group-hover:scale-105 group-hover:shadow-[0_8px_20px_rgba(0,0,0,0.1)]"
                          }`}
                        >
                          <SafeImage
                             src={brand.logo}
                             alt={brand.name}
                             className={`w-full h-full object-cover rounded-full transition-transform duration-500`}
                          />
                        </div>
                        <span className={`text-xs sm:text-sm font-bold mt-3 text-center ${isActive ? "text-[var(--color-brand)]" : "text-gray-700 group-hover:text-gray-900"}`}>
                          {brand.name}
                        </span>
                        {isActive && (
                          <span className="mt-1 text-[10px] font-bold text-[var(--color-brand)] bg-pink-50 rounded-full px-2 py-0.5 border border-pink-200">
                            Active
                          </span>
                        )}
                      </button>
                    );
                  })}
                </ScrollRow>
              </div>
            </section>
          )}

          {/* ─── ALL / FILTERED RESTAURANTS ─────────────────────────────── */}
          <section id="all-restaurants">
            <div className="flex items-center justify-between mb-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex-wrap gap-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2 flex-wrap">
                {sectionTitle ? (
                  <>
                    <span>{sectionTitle}</span>
                    <span className="text-base font-semibold text-gray-400">
                      ({filteredRestaurants.length} result{filteredRestaurants.length !== 1 ? "s" : ""})
                    </span>
                  </>
                ) : (
                  <><span>🍽️</span> All Restaurants</>
                )}
              </h2>
              {hasFilter && (
                <button
                  onClick={clearFilters}
                  className="bg-gray-100 text-gray-600 px-4 py-2 rounded-full text-xs sm:text-sm font-bold hover:bg-gray-200 hover:text-gray-800 transition-colors flex items-center gap-1.5 shadow-sm shrink-0"
                >
                  Clear Filter <i className="fa-solid fa-xmark" />
                </button>
              )}
            </div>

            {/* Active filter pills */}
            {hasFilter && (
              <div className="flex gap-2 mb-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex-wrap">
                {activeCategory && (
                  <span className="flex items-center gap-2 bg-pink-50 border border-pink-200 text-[var(--color-brand)] text-xs font-bold px-3 py-1.5 rounded-full">
                    {getCategoryIcon(activeCategory)} {activeCategory}
                    <button onClick={() => setActiveCategory(null)} className="hover:text-pink-700">
                      <i className="fa-solid fa-xmark text-[10px]" />
                    </button>
                  </span>
                )}
                {activeBrand && (
                  <span className="flex items-center gap-2 bg-pink-50 border border-pink-200 text-[var(--color-brand)] text-xs font-bold px-3 py-1.5 rounded-full">
                    <img src={getBrandLogo(activeBrand)} alt="" className="w-4 h-4 rounded-full object-cover" /> {activeBrand}
                    <button onClick={() => setActiveBrand(null)} className="hover:text-pink-700">
                      <i className="fa-solid fa-xmark text-[10px]" />
                    </button>
                  </span>
                )}
              </div>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {filteredRestaurants.length === 0 ? (
                <EmptyState label={activeFilterLabel} onClear={clearFilters} />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
                  {filteredRestaurants.map((restaurant) => (
                    <RestaurantCard
                      key={restaurant.id}
                      restaurant={restaurant}
                      genre={restaurant.category ?? "Fast Food"}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>

        </div>
      )}
    </div>
  );
};

export default CustomerHomePage;
