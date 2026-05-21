import { useEffect, useState, useMemo } from "react";
import { useParams, useLocation } from "react-router-dom";
import api from "../api/api";
import Navbar from "../components/Navbar";
import MenuItemCard from "../components/MenuItemCard";
import AlertInfo from "../components/AlertInfo";
import LoadingSpinner from "../components/LoadingSpinner";
import SafeImage from "../components/SafeImage";
import { notifyCartChanged } from "../utils/cartEvents";

const MenuPage = () => {
  const { restaurantId } = useParams();
  const location = useLocation();
  const activeDeal = location.state?.activeDeal;

  const [items, setItems] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Popular");
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const highlightIds = useMemo(() => {
    const ids = activeDeal?.menu_item_ids;
    if (!Array.isArray(ids) || !ids.length) return new Set();
    return new Set(ids.map(Number));
  }, [activeDeal]);

  const categorizedItems = useMemo(() => {
    const filtered = items.filter(item => {
      const query = searchText.toLowerCase();
      return (
        item.name.toLowerCase().includes(query) ||
        (item.description || "").toLowerCase().includes(query)
      );
    });

    const groups = {};

    // Highlight or first 3 items are "Popular"
    const popularItems = filtered.filter(item => highlightIds.has(item.id) || items.slice(0, 3).some(p => p.id === item.id));

    if (popularItems.length > 0) {
      groups["Popular"] = popularItems;
    }

    filtered.forEach(item => {
      const cat = item.category || "Mains";
      if (!groups[cat]) {
        groups[cat] = [];
      }
      groups[cat].push(item);
    });

    return groups;
  }, [items, searchText, highlightIds]);

  const categoriesList = useMemo(() => {
    const list = Object.keys(categorizedItems);
    return list.sort((a, b) => {
      if (a === "Popular") return -1;
      if (b === "Popular") return 1;
      return a.localeCompare(b);
    });
  }, [categorizedItems]);

  const hasMatches = useMemo(() => {
    if (!searchText) return true;
    const query = searchText.toLowerCase();
    return items.some(item => 
      item.name.toLowerCase().includes(query) || 
      (item.description || "").toLowerCase().includes(query)
    );
  }, [items, searchText]);

  const checkScroll = () => {
    const container = document.getElementById("category-tabs-container");
    if (container) {
      setShowLeftArrow(container.scrollLeft > 10);
      setShowRightArrow(
        container.scrollWidth - container.clientWidth - container.scrollLeft > 10
      );
    }
  };

  useEffect(() => {
    const container = document.getElementById("category-tabs-container");
    if (container) {
      container.addEventListener("scroll", checkScroll);
      checkScroll();
      window.addEventListener("resize", checkScroll);
    }
    return () => {
      const container = document.getElementById("category-tabs-container");
      if (container) container.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [categoriesList]);

  useEffect(() => {
    if (categoriesList.length === 0) return;

    const observerOptions = {
      root: null,
      rootMargin: "-120px 0px -60% 0px",
      threshold: 0
    };

    const handleIntersection = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const categoryName = entry.target.dataset.category;
          if (categoryName) {
            setSelectedCategory(categoryName);
            const tabBtn = document.getElementById(`tab-btn-${categoryName}`);
            const container = document.getElementById("category-tabs-container");
            if (tabBtn && container) {
              const tabRect = tabBtn.getBoundingClientRect();
              const containerRect = container.getBoundingClientRect();
              container.scrollLeft += (tabRect.left - containerRect.left) - (containerRect.width / 2) + (tabRect.width / 2);
            }
          }
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, observerOptions);

    categoriesList.forEach(cat => {
      const el = document.getElementById(`category-sec-${cat}`);
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [categoriesList]);

  const handleCategoryClick = (catName) => {
    setSelectedCategory(catName);
    const element = document.getElementById(`category-sec-${catName}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const scrollTabs = (direction) => {
    const container = document.getElementById("category-tabs-container");
    if (container) {
      const amount = direction === "left" ? -200 : 200;
      container.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const fetchMenuAndRestaurant = async () => {
      try {
        const [menuRes, restRes] = await Promise.all([
          api.get(`/menu/restaurant/${restaurantId}`),
          api.get(`/restaurants`)
        ]);
        setItems(menuRes.data);
        const currentRest = restRes.data.find(r => r.id === Number(restaurantId));
        setRestaurant(currentRest);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMenuAndRestaurant();
  }, [restaurantId]);

  useEffect(() => {
    if (!activeDeal || !highlightIds.size || !items.length) return;
    const first = items.find((it) => highlightIds.has(it.id));
    if (!first) return;
    const t = window.setTimeout(() => {
      document.getElementById(`menu-item-${first.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 400);
    return () => window.clearTimeout(t);
  }, [activeDeal, highlightIds, items]);

  const addToCart = (item) => {
    const activeCart = JSON.parse(localStorage.getItem("foodify_cart") || "[]");
    if (activeCart.length && activeCart[0].restaurantId !== Number(restaurantId)) {
      if (!window.confirm("Adding this will clear your current cart from another restaurant. Continue?")) {
          return;
      }
      localStorage.setItem("foodify_cart", "[]");
      activeCart.length = 0;
    }
    
    const existing = activeCart.find((c) => c.itemId === item.id);
    if (existing) existing.quantity += 1;
    else activeCart.push({ itemId: item.id, name: item.name, price: Number(item.price), quantity: 1, restaurantId: Number(restaurantId) });
    
    localStorage.setItem("foodify_cart", JSON.stringify(activeCart));
    notifyCartChanged();
    setAlert(`Added ${item.name} to cart`);
  };

  return (
    <div className="min-h-screen bg-[var(--color-background-soft)] font-['Outfit']">
      <Navbar />
      
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="bg-white border-b border-gray-100 py-12 px-4 shadow-[0_4px_30px_rgb(0,0,0,0.03)] relative overflow-hidden">
            {/* Background Image Layer */}
            {restaurant?.image_url && (
              <div className="absolute inset-0 z-0">
                <SafeImage src={restaurant.image_url} className="w-full h-full opacity-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-white via-white/40 to-white/10" />
              </div>
            )}
            
            <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row justify-between items-center md:items-end gap-6 text-center md:text-left">
                <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                   {restaurant?.image_url && (
                     <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl overflow-hidden shadow-2xl border-4 border-white shrink-0">
                        <SafeImage src={restaurant.image_url} className="w-full h-full" />
                     </div>
                   )}
                   <div className="pb-1">
                      <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">{restaurant?.name || "Restaurant Menu"}</h1>
                      <p className="text-gray-500 mt-2 text-lg max-w-xl font-medium">{restaurant?.description || "Find your favorite meals and enjoy our delicious offerings."}</p>
                      <div className="mt-5 flex flex-wrap justify-center md:justify-start gap-3 text-sm font-bold">
                        <span className="bg-pink-50 text-[var(--color-brand)] px-3 py-1.5 rounded-full border border-pink-100 flex items-center gap-1.5 shadow-sm"><i className="fa-solid fa-star text-xs"></i> 4.8 Rating</span>
                        <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm"><i className="fa-solid fa-motorcycle text-xs"></i> 25-35 min • Free delivery</span>
                        <span className="bg-orange-50 text-orange-600 px-3 py-1.5 rounded-full border border-orange-100 flex items-center gap-1.5 shadow-sm"><i className="fa-solid fa-tag text-xs"></i> {restaurant?.category || "Fast Food"}</span>
                      </div>
                   </div>
                </div>
            </div>
            <div className="absolute top-0 right-0 w-1/3 h-full opacity-5 pointer-events-none hidden md:block">
                <i className="fa-solid fa-utensils text-[20rem] absolute -right-20 -top-20 text-[var(--color-brand)]"></i>
            </div>
          </div>

          {/* Sticky Search and Categories Bar */}
          <div className="sticky top-[64px] z-30 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] py-4 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
              
              {/* Search Box */}
              <div className="relative w-full md:w-80 shrink-0">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
                  <i className="fa-solid fa-magnifying-glass text-sm"></i>
                </span>
                <input
                  type="text"
                  placeholder="Search in menu..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full pl-11 pr-10 py-3 bg-gray-50/80 border border-gray-100 hover:bg-gray-100/50 focus:bg-white rounded-full text-sm font-bold text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/20 focus:border-[var(--color-brand)] transition-all"
                />
                {searchText && (
                  <button
                    onClick={() => setSearchText("")}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <i className="fa-solid fa-circle-xmark"></i>
                  </button>
                )}
              </div>

              {/* Categories Tabs */}
              {categoriesList.length > 0 && (
                <div className="relative w-full overflow-hidden flex items-center">
                  {showLeftArrow && (
                    <div className="absolute left-0 top-0 bottom-0 flex items-center justify-start bg-gradient-to-r from-white via-white/80 to-transparent pr-8 z-10">
                      <button 
                        onClick={() => scrollTabs("left")}
                        className="w-8 h-8 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-50 active:scale-95 transition-transform"
                      >
                        <i className="fa-solid fa-chevron-left text-xs"></i>
                      </button>
                    </div>
                  )}

                  <div 
                    id="category-tabs-container"
                    className="flex gap-2 overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap py-1 pr-10 w-full select-none"
                  >
                    {categoriesList.map((cat) => {
                      const count = categorizedItems[cat]?.length || 0;
                      const isActive = selectedCategory === cat;
                      return (
                        <button
                          key={cat}
                          id={`tab-btn-${cat}`}
                          onClick={() => handleCategoryClick(cat)}
                          className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer select-none ${
                            isActive
                              ? "bg-[var(--color-brand)] text-white shadow-[0_6px_20px_rgba(215,15,100,0.3)] scale-102"
                              : "bg-gray-50 text-gray-500 hover:text-gray-900 hover:bg-gray-100 border border-transparent font-extrabold"
                          }`}
                        >
                          {cat} <span className={`ml-1 text-[10px] ${isActive ? "text-pink-100" : "text-gray-400"}`}>({count})</span>
                        </button>
                      );
                    })}
                  </div>
                  
                  {showRightArrow && (
                    <div className="absolute right-0 top-0 bottom-0 flex items-center justify-end bg-gradient-to-l from-white via-white/80 to-transparent pl-8 z-10">
                      <button 
                        onClick={() => scrollTabs("right")}
                        className="w-8 h-8 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-50 active:scale-95 transition-transform"
                      >
                        <i className="fa-solid fa-chevron-right text-xs"></i>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {activeDeal && Number(activeDeal.restaurant_id) === Number(restaurantId) && (
              <div className="mb-8 rounded-2xl border border-pink-100 bg-gradient-to-r from-pink-50 to-white p-5 sm:p-6 shadow-[0_8px_30px_rgba(215,15,100,0.08)]">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <span className="inline-block bg-[var(--color-brand)] text-white text-xs font-black px-3 py-1 rounded-full mb-2">
                      {activeDeal.discount_text}
                    </span>
                    <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">{activeDeal.title}</h3>
                    {activeDeal.description ? (
                      <p className="text-gray-600 text-sm mt-1 font-medium">{activeDeal.description}</p>
                    ) : null}
                  </div>
                  {highlightIds.size > 0 ? (
                    <p className="text-xs font-bold text-[var(--color-brand)] shrink-0">
                      <i className="fa-solid fa-circle-dot mr-1" /> Highlighted items apply to this deal
                    </p>
                  ) : null}
                </div>
              </div>
            )}

            {items.length === 0 ? (
               <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
                 <div className="text-4xl text-gray-300 mb-2">🍽️</div>
                 <p className="text-gray-500 font-medium">No items available on this menu yet.</p>
               </div>
            ) : !hasMatches ? (
               <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                 <div className="text-4xl text-gray-300 mb-2">🔍</div>
                 <p className="text-gray-600 font-extrabold text-lg mt-2">No items found</p>
                 <p className="text-gray-400 text-sm mt-1 font-medium">We couldn't find any menu item matching "{searchText}".</p>
               </div>
            ) : (
              <div className="space-y-14">
                {categoriesList.map((cat) => {
                  const catItems = categorizedItems[cat] || [];
                  if (catItems.length === 0) return null;
                  return (
                    <section
                      key={cat}
                      id={`category-sec-${cat}`}
                      data-category={cat}
                      className="scroll-mt-36"
                    >
                      <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-3">
                        {cat === "Popular" ? (
                          <span className="text-2xl">🔥</span>
                        ) : null}
                        <h3 className="text-2xl font-black text-gray-900 tracking-tight">{cat}</h3>
                        <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2.5 py-0.5 rounded-full ml-2">{catItems.length} items</span>
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {catItems.map((item) => (
                          <MenuItemCard
                            key={`${cat}-${item.id}`}
                            item={item}
                            onAdd={addToCart}
                            dealHighlight={highlightIds.has(item.id)}
                          />
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}
          </main>
        </>
      )}

      {alert && <AlertInfo message={alert} onClose={() => setAlert(null)} />}
    </div>
  );
};

export default MenuPage;
