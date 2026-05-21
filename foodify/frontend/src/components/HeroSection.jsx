import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import SafeImage from "./SafeImage";

const HeroSection = () => {
  const [query, setQuery]           = useState("");
  const [results, setResults]       = useState(null);   // null | { restaurants, menuItems }
  const [isSearching, setIsSearch]  = useState(false);
  const [showDrop, setShowDrop]     = useState(false);

  const debounceRef  = useRef(null);
  const containerRef = useRef(null);
  const navigate     = useNavigate();

  // ── Close dropdown on outside click ──────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDrop(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Core search function ──────────────────────────────────────────────────
  const doSearch = useCallback(async (q) => {
    if (!q || q.trim().length < 2) {
      setResults(null);
      setShowDrop(false);
      return;
    }
    setIsSearch(true);
    setShowDrop(true);
    try {
      const res = await api.get(`/search?q=${encodeURIComponent(q.trim())}`);
      setResults(res.data);
    } catch {
      setResults({ restaurants: [], menuItems: [] });
    } finally {
      setIsSearch(false);
    }
  }, []);

  // ── Input change with 350 ms debounce ────────────────────────────────────
  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    if (val.trim().length < 2) {
      setResults(null);
      setShowDrop(false);
      return;
    }
    setIsSearch(true);
    setShowDrop(true);
    debounceRef.current = setTimeout(() => doSearch(val), 350);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") { setShowDrop(false); }
    if (e.key === "Enter")  { clearTimeout(debounceRef.current); doSearch(query); }
  };

  // ── Navigate helpers ──────────────────────────────────────────────────────
  const goToRestaurant = (id) => {
    setShowDrop(false);
    setQuery("");
    setResults(null);
    navigate(`/menu/${id}`);
  };

  const clearSearch = () => {
    setQuery("");
    setResults(null);
    setShowDrop(false);
  };

  const totalResults = results
    ? results.restaurants.length + results.menuItems.length
    : 0;

  return (
    <div className="relative bg-[var(--color-brand)] z-30">
      {/* Background texture */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop"
          alt=""
          className="w-full h-full object-cover opacity-15"
        />
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)", backgroundSize: "32px 32px" }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="max-w-2xl">
          {/* Headline */}
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/25 rounded-full px-4 py-1.5 mb-4">
            <span className="text-sm">⚡</span>
            <span className="text-white/90 text-xs sm:text-sm font-semibold">Fast delivery · 25 restaurants near you</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-3 leading-snug">
            It's the food you love,{" "}
            <br className="hidden sm:block" />
            <span className="text-yellow-300">delivered fast.</span>
          </h1>
          <p className="text-base sm:text-lg text-white/85 max-w-xl mb-6 font-medium">
            Discover local restaurants, search your favourite dishes and get them at your door.
          </p>

          {/* ── Search bar ───────────────────────────────────────────── */}
          <div ref={containerRef} className="relative">
            <div className="flex bg-white rounded-2xl sm:rounded-full shadow-2xl p-1.5 focus-within:ring-4 focus-within:ring-white/30 transition-all">
              <div className="flex-grow flex items-center pl-4 gap-3 min-w-0">
                {isSearching ? (
                  <i className="fa-solid fa-spinner animate-spin text-[var(--color-brand)] text-lg shrink-0" />
                ) : (
                  <i className="fa-solid fa-magnifying-glass text-[var(--color-brand)] text-lg shrink-0" />
                )}
                <input
                  type="text"
                  value={query}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  onFocus={() => query.trim().length >= 2 && setShowDrop(true)}
                  placeholder="Search for food or restaurants..."
                  className="w-full py-2 border-none outline-none text-gray-800 font-medium bg-transparent text-sm sm:text-base placeholder:text-gray-400 min-w-0"
                  autoComplete="off"
                />
                {query && (
                  <button
                    onClick={clearSearch}
                    className="shrink-0 w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors mr-1"
                  >
                    <i className="fa-solid fa-xmark text-gray-500 text-xs" />
                  </button>
                )}
              </div>
              <button
                onClick={() => { clearTimeout(debounceRef.current); doSearch(query); }}
                className="bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-white px-5 sm:px-7 py-2.5 rounded-xl sm:rounded-full font-bold transition-all shadow-md hover:scale-105 active:scale-95 text-sm sm:text-base shrink-0"
              >
                Search
              </button>
            </div>

            {/* ── Results dropdown ─────────────────────────────────── */}
            {showDrop && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                {isSearching ? (
                  <div className="flex items-center justify-center gap-3 py-8 text-gray-400">
                    <i className="fa-solid fa-spinner animate-spin" />
                    <span className="font-medium text-sm">Searching…</span>
                  </div>

                ) : results && totalResults === 0 ? (
                  <div className="py-10 text-center">
                    <span className="text-4xl block mb-2">🔍</span>
                    <p className="font-bold text-gray-700">No results for "{query}"</p>
                    <p className="text-xs text-gray-400 mt-1">Try a different keyword</p>
                  </div>

                ) : results ? (
                  <div className="max-h-72 overflow-y-auto">
                    {/* Restaurant results */}
                    {results.restaurants.length > 0 && (
                      <>
                        <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center gap-2 sticky top-0">
                          <i className="fa-solid fa-store text-[var(--color-brand)] text-xs" />
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Restaurants</span>
                        </div>
                        {results.restaurants.map((r) => (
                          <button
                            key={r.id}
                            onClick={() => goToRestaurant(r.id)}
                            className="w-full flex items-center gap-4 px-4 py-3 hover:bg-pink-50 transition-colors text-left border-b border-gray-50 last:border-0"
                          >
                            <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-gray-100">
                              <SafeImage src={r.image_url} alt={r.name} className="w-full h-full" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-gray-900 text-sm truncate">{r.name}</p>
                              <p className="text-[10px] text-gray-500 flex items-center gap-1 font-bold uppercase tracking-tight">
                                <span>{r.category}</span>
                              </p>
                            </div>
                            <i className="fa-solid fa-chevron-right text-gray-300 text-xs ml-auto shrink-0" />
                          </button>
                        ))}
                      </>
                    )}

                    {/* Menu item results */}
                    {results.menuItems.length > 0 && (
                      <>
                        <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 border-t border-gray-100 flex items-center gap-2 sticky top-0">
                          <i className="fa-solid fa-utensils text-[var(--color-brand)] text-xs" />
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Menu Items</span>
                        </div>
                        {results.menuItems.map((m) => (
                          <button
                            key={m.id}
                            onClick={() => goToRestaurant(m.restaurant_id)}
                            className="w-full flex items-center gap-4 px-4 py-3 hover:bg-pink-50 transition-colors text-left border-b border-gray-50 last:border-0"
                          >
                            <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-gray-100">
                              <SafeImage src={m.image_url} alt={m.name} className="w-full h-full" />
                            </div>
                            <div className="min-w-0 flex-grow">
                              <p className="font-bold text-gray-900 text-sm truncate">{m.name}</p>
                              <p className="text-xs text-gray-500">
                                from <span className="font-bold text-gray-700">{m.restaurant_name}</span>
                                {" · "}
                                <span className="text-[var(--color-brand)] font-black">${Number(m.price).toFixed(2)}</span>
                              </p>
                            </div>
                            <i className="fa-solid fa-chevron-right text-gray-300 text-xs ml-auto shrink-0" />
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* Quick chips */}
          <div className="flex flex-wrap gap-2 mt-4">
            {["Biryani", "Pizza", "Burgers", "Shawarma", "Haleem"].map((tag) => (
              <button
                key={tag}
                onClick={() => { setQuery(tag); doSearch(tag); }}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-full transition-all hover:scale-105 active:scale-95"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
