import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { fetchAdminRestaurants, updateAdminRestaurant } from "../../api/adminApi";

export default function AdminHomeChefsPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [alert, setAlert] = useState(null);
  const [saving, setSaving] = useState(null);

  const load = () => {
    setLoading(true);
    fetchAdminRestaurants({ search })
      .then((r) => setRestaurants(r.data))
      .catch(() => setAlert({ type: "error", msg: "Failed to load" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search]);

  const handleToggleHomeChef = async (r) => {
    setSaving(r.id);
    try {
      const fd = new FormData();
      fd.append("name", r.name);
      fd.append("is_home_chef", r.is_home_chef ? "false" : "true");
      await updateAdminRestaurant(r.id, fd);
      setRestaurants((prev) =>
        prev.map((x) => x.id === r.id ? { ...x, is_home_chef: x.is_home_chef ? 0 : 1 } : x)
      );
      setAlert({ type: "success", msg: `${r.name} ${r.is_home_chef ? "removed from" : "added to"} Home Chefs` });
    } catch {
      setAlert({ type: "error", msg: "Failed to update" });
    } finally {
      setSaving(null);
    }
  };

  const handleToggleFeatured = async (r) => {
    setSaving(r.id + "_f");
    try {
      const fd = new FormData();
      fd.append("name", r.name);
      fd.append("is_featured", r.is_featured ? "false" : "true");
      await updateAdminRestaurant(r.id, fd);
      setRestaurants((prev) =>
        prev.map((x) => x.id === r.id ? { ...x, is_featured: x.is_featured ? 0 : 1 } : x)
      );
    } catch {
      setAlert({ type: "error", msg: "Failed to update" });
    } finally {
      setSaving(null);
    }
  };

  const homeChefs = restaurants.filter((r) => r.is_home_chef);
  const others = restaurants.filter((r) => !r.is_home_chef);

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">👨‍🍳 Home Chefs</h1>
          <p className="admin-page-subtitle">Manage home chef listings on the platform</p>
        </div>
      </div>

      {alert && <div className={`admin-alert ${alert.type}`} onClick={() => setAlert(null)}>{alert.type === "success" ? "✅" : "⚠️"} {alert.msg}</div>}

      {/* Current Home Chefs */}
      <div className="admin-card" style={{ marginBottom: 24 }}>
        <div className="admin-card-header">
          <h3 className="admin-card-title">👨‍🍳 Current Home Chefs ({homeChefs.length})</h3>
        </div>
        <div className="admin-card-body" style={{ padding: 0 }}>
          {homeChefs.length === 0 ? (
            <div className="empty-state" style={{ padding: 30 }}>
              <div className="empty-state-icon">👨‍🍳</div>
              <div className="empty-state-text">No home chefs yet</div>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr><th>Image</th><th>Name</th><th>Owner</th><th>Category</th><th>Featured</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {homeChefs.map((r) => (
                  <tr key={r.id}>
                    <td className="img-cell">
                      {r.image_url ? <img src={r.image_url} alt={r.name} /> : <div className="no-img">👨‍🍳</div>}
                    </td>
                    <td><div style={{ fontWeight: 600 }}>{r.name}</div></td>
                    <td>
                      <div>{r.owner_name}</div>
                      <div style={{ fontSize: 12, color: "var(--admin-text-muted)" }}>{r.owner_email}</div>
                    </td>
                    <td>{r.category || "—"}</td>
                    <td>
                      <label className="toggle-switch">
                        <input type="checkbox" checked={!!r.is_featured} onChange={() => handleToggleFeatured(r)} disabled={saving === r.id + "_f"} />
                        <span className="toggle-slider" />
                      </label>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-danger" onClick={() => handleToggleHomeChef(r)} disabled={saving === r.id}>
                        ✕ Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add from existing restaurants */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">🍽️ Add Home Chef from Restaurants</h3>
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
                <tr><th>Restaurant</th><th>Owner</th><th>Category</th><th>Action</th></tr>
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
                    <td>{r.owner_name}</td>
                    <td>{r.category || "—"}</td>
                    <td>
                      <button className="btn btn-sm btn-success" onClick={() => handleToggleHomeChef(r)} disabled={saving === r.id}>
                        👨‍🍳 Mark as Home Chef
                      </button>
                    </td>
                  </tr>
                ))}
                {!others.length && (
                  <tr><td colSpan={4}><div className="empty-state" style={{ padding: 20 }}><div className="empty-state-text">All restaurants are home chefs</div></div></td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
