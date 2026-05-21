import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { fetchAdminRestaurants, updateAdminRestaurant } from "../../api/adminApi";

export default function AdminTopShopsPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [alert, setAlert] = useState(null);
  const [saving, setSaving] = useState(null);

  const load = () => {
    setLoading(true);
    fetchAdminRestaurants({ search })
      .then((r) => setRestaurants(r.data))
      .catch(() => setAlert({ type: "error", msg: "Failed to load restaurants" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search]);

  const handleToggleTopShop = async (r) => {
    setSaving(r.id);
    try {
      const fd = new FormData();
      fd.append("name", r.name);
      fd.append("is_top_shop", r.is_top_shop ? "false" : "true");
      await updateAdminRestaurant(r.id, fd);
      setRestaurants((prev) =>
        prev.map((x) => x.id === r.id ? { ...x, is_top_shop: x.is_top_shop ? 0 : 1 } : x)
      );
      setAlert({ type: "success", msg: `${r.name} ${r.is_top_shop ? "removed from" : "added to"} Top Shops` });
    } catch {
      setAlert({ type: "error", msg: "Failed to update" });
    } finally {
      setSaving(null);
    }
  };

  const handleOrderChange = async (r, newOrder) => {
    try {
      const fd = new FormData();
      fd.append("name", r.name);
      fd.append("top_shop_order", newOrder);
      await updateAdminRestaurant(r.id, fd);
      setRestaurants((prev) =>
        prev.map((x) => x.id === r.id ? { ...x, top_shop_order: Number(newOrder) } : x)
      );
    } catch {
      setAlert({ type: "error", msg: "Failed to update order" });
    }
  };

  const topShops = restaurants.filter((r) => r.is_top_shop).sort((a, b) => a.top_shop_order - b.top_shop_order);
  const others = restaurants.filter((r) => !r.is_top_shop);

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">⭐ Top Shops</h1>
          <p className="admin-page-subtitle">Manage which restaurants appear in the Top Shops section</p>
        </div>
      </div>

      {alert && <div className={`admin-alert ${alert.type}`} onClick={() => setAlert(null)}>{alert.type === "success" ? "✅" : "⚠️"} {alert.msg}</div>}

      {/* Current Top Shops */}
      <div className="admin-card" style={{ marginBottom: 24 }}>
        <div className="admin-card-header">
          <h3 className="admin-card-title">⭐ Current Top Shops ({topShops.length})</h3>
        </div>
        <div className="admin-card-body">
          {topShops.length === 0 ? (
            <div className="empty-state" style={{ padding: 30 }}>
              <div className="empty-state-icon">⭐</div>
              <div className="empty-state-text">No top shops selected yet</div>
              <div className="empty-state-sub">Add restaurants from the list below</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {topShops.map((r) => (
                <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "#f8fafc", borderRadius: 8, border: "1px solid var(--admin-border)" }}>
                  {r.image_url
                    ? <img src={r.image_url} alt={r.name} style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover" }} />
                    : <div style={{ width: 44, height: 44, borderRadius: 8, background: "var(--admin-primary-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🍽️</div>}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{r.name}</div>
                    <div style={{ fontSize: 12, color: "var(--admin-text-muted)" }}>{r.category || "—"}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <label style={{ fontSize: 12, color: "var(--admin-text-muted)" }}>Order:</label>
                    <input
                      type="number"
                      defaultValue={r.top_shop_order}
                      style={{ width: 60, padding: "4px 8px", border: "1.5px solid var(--admin-border)", borderRadius: 6, fontSize: 13 }}
                      onBlur={(e) => handleOrderChange(r, e.target.value)}
                    />
                  </div>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleToggleTopShop(r)}
                    disabled={saving === r.id}
                  >
                    ✕ Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* All Restaurants */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">🍽️ All Restaurants</h3>
          <div className="search-box" style={{ maxWidth: 280 }}>
            <span className="search-icon">🔍</span>
            <input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="admin-card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="admin-loading"><div className="spin" /></div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr><th>Restaurant</th><th>Category</th><th>Orders</th><th>Top Shop</th><th>Action</th></tr>
              </thead>
              <tbody>
                {others.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {r.image_url
                          ? <img src={r.image_url} alt={r.name} style={{ width: 36, height: 36, borderRadius: 6, objectFit: "cover" }} />
                          : <div style={{ width: 36, height: 36, borderRadius: 6, background: "var(--admin-primary-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>🍽️</div>}
                        <span style={{ fontWeight: 600 }}>{r.name}</span>
                      </div>
                    </td>
                    <td>{r.category || "—"}</td>
                    <td>{r.order_count}</td>
                    <td><span className="badge badge-gray">Not in Top Shops</span></td>
                    <td>
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => handleToggleTopShop(r)}
                        disabled={saving === r.id}
                      >
                        ⭐ Add to Top Shops
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
