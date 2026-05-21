import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { fetchAdminDeals, deleteAdminDeal, toggleDealFeatured } from "../../api/adminApi";

export default function AdminDealsPage() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [alert, setAlert] = useState(null);

  const load = () => {
    setLoading(true);
    fetchAdminDeals({ search })
      .then((r) => setDeals(r.data))
      .catch(() => setAlert({ type: "error", msg: "Failed to load deals" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search]);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete deal "${title}"?`)) return;
    try {
      await deleteAdminDeal(id);
      setAlert({ type: "success", msg: "Deal deleted" });
      load();
    } catch {
      setAlert({ type: "error", msg: "Delete failed" });
    }
  };

  const handleToggleFeatured = async (id) => {
    try {
      const r = await toggleDealFeatured(id);
      setDeals((prev) => prev.map((d) => d.id === id ? { ...d, is_featured: r.data.is_featured } : d));
    } catch {
      setAlert({ type: "error", msg: "Failed to update deal" });
    }
  };

  const isActive = (deal) => {
    const now = new Date();
    const from = deal.valid_from ? new Date(deal.valid_from) : null;
    const until = deal.valid_until ? new Date(deal.valid_until) : null;
    if (from && now < from) return false;
    if (until && now > until) return false;
    return true;
  };

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">🏷️ Deals</h1>
          <p className="admin-page-subtitle">Manage all deals across the platform</p>
        </div>
      </div>

      {alert && <div className={`admin-alert ${alert.type}`} onClick={() => setAlert(null)}>{alert.type === "success" ? "✅" : "⚠️"} {alert.msg}</div>}

      <div className="admin-toolbar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input placeholder="Search deals..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div className="admin-loading"><div className="spin" /> Loading...</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>Image</th><th>Title</th><th>Restaurant</th><th>Discount</th><th>Validity</th><th>Status</th><th>Featured</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {deals.map((d) => (
                <tr key={d.id}>
                  <td className="img-cell">
                    {d.image_url ? <img src={d.image_url} alt={d.title} /> : <div className="no-img">🏷️</div>}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{d.title}</div>
                    <div style={{ fontSize: 12, color: "var(--admin-text-muted)" }}>{d.description?.slice(0, 50)}</div>
                  </td>
                  <td>{d.restaurant_name}</td>
                  <td><span className="badge badge-orange">{d.discount}% OFF</span></td>
                  <td style={{ fontSize: 12 }}>
                    {d.valid_from ? new Date(d.valid_from).toLocaleDateString() : "—"}
                    {" → "}
                    {d.valid_until ? new Date(d.valid_until).toLocaleDateString() : "∞"}
                  </td>
                  <td>
                    <span className={`badge ${isActive(d) ? "badge-success" : "badge-danger"}`}>
                      {isActive(d) ? "Active" : "Expired"}
                    </span>
                  </td>
                  <td>
                    <label className="toggle-switch">
                      <input type="checkbox" checked={!!d.is_featured} onChange={() => handleToggleFeatured(d.id)} />
                      <span className="toggle-slider" />
                    </label>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(d.id, d.title)}>🗑️ Delete</button>
                  </td>
                </tr>
              ))}
              {!deals.length && (
                <tr><td colSpan={8}><div className="empty-state"><div className="empty-state-icon">🏷️</div><div className="empty-state-text">No deals found</div></div></td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
