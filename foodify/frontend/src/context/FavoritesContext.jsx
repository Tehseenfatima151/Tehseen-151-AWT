import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import api from "../api/api";
import { useAuth } from "./AuthContext";

const FavoritesContext = createContext(null);

export const FavoritesProvider = ({ children }) => {
  const { user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  // Load favorite IDs when user logs in
  const loadFavoriteIds = useCallback(async () => {
    if (!user || user.role !== "customer") {
      setFavoriteIds(new Set());
      return;
    }
    try {
      setLoading(true);
      const { data } = await api.get("/favorites/ids");
      setFavoriteIds(new Set(data));
    } catch {
      setFavoriteIds(new Set());
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadFavoriteIds();
  }, [loadFavoriteIds]);

  const toggleFavorite = useCallback(async (restaurantId) => {
    // Optimistic update
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(restaurantId)) next.delete(restaurantId);
      else next.add(restaurantId);
      return next;
    });

    try {
      const { data } = await api.post("/favorites/toggle", { restaurant_id: restaurantId });
      // Sync actual server response
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (data.favorited) next.add(restaurantId);
        else next.delete(restaurantId);
        return next;
      });
    } catch {
      // Rollback on error
      loadFavoriteIds();
    }
  }, [loadFavoriteIds]);

  const isFavorite = useCallback((restaurantId) => favoriteIds.has(restaurantId), [favoriteIds]);

  const favoriteCount = favoriteIds.size;

  const value = useMemo(
    () => ({ favoriteIds, favoriteCount, isFavorite, toggleFavorite, loading }),
    [favoriteIds, favoriteCount, isFavorite, toggleFavorite, loading]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
};

export const useFavorites = () => useContext(FavoritesContext);
