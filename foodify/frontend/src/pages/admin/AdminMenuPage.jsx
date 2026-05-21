import { useEffect, useState, useRef } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { fetchAdminMenu, updateAdminMenuItem, deleteAdminMenuItem, fetchAdminRestaurants } from "../../api/adminApi";

export default function AdminMenuPage() {
  const [items, setItems] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRestaurant, setFilterRestaurant] = useState("");
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({ name: "", price: "", description: "", category: "", image_url: "" });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);
  const fileRef = useRef();

  const load = () => {
    setLoading(true);
    Promise.all([
      fetchAdminMenu({ search, restaurantId: filterRestaurant }),
      fetchAdminRestaurants(),
    ])
      .then(([menuRes, restRes]) => {
        setItems(menuRes.data);
        setRestaurants(restRes.data);
      })
      .catch(() => setAlert({ type: "error", msg: "Failed to load data" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search, filterRestaurant]);

  const openEdit = (item) => {
    setEditTarget(item);
    setForm({ name: item.name, price: item.price, description: item.description || "", category: item.category || "", image_url: item.image_url || "" });
    setImageFile(null);
    setImagePreview(item.image_url || "");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!form.name || !form.price) { setAlert({ type: "error", msg: "Name and price are required" }); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (imageFile) fd.append("image", imageFile);
      await updateAdminMenuItem(editTarget.id, fd);
      setAlert({ type: "success", msg: "Menu item updated" });
      setEditTarget(null);
      load();
    } catch (e) {
      setAlert({ type: "error", msg: e.response?.data?.message || "Update failed" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await deleteAdminMenuItem(id);
      setAlert({ type: "success", msg: "Item deleted" });
      load();
    } catch {
      setAlert({ type: "error", msg: "Delete failed" });
    }
  };

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">📋 Menu Items</h1>
          <p className="admin-page-subtitle">View and manage all menu items across restaurants</p>
        </div>
      </div>

      {alert && <div className={`admin-alert ${alert.type}`} onClick={() => setAlert(null)}>{alert.type === "success" ? "✅" : "⚠️"} {alert.msg}</div>}

      <div className="admin-toolbar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input placeholder="Search items..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="filter-select" value={filterRestaurant} onChange={(e) => setFilterRestaurant(e.target.value)}>
          <option value="">All Restaurants</option>
          {restaurants.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="admin-loading"><div className="spin" /> Loading...</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>Image</th><th>Name</th><th>Restaurant</th><th>Category</th><th>Price</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="img-cell">
                    {item.image_url ? <img src={item.image_url} alt={item.name} /> : <div className="no-img">🍔</div>}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{item.name}</div>
                    <div style={{ fontSize: 12, color: "var(--admin-text-muted)" }}>{item.description?.slice(0, 50)}</div>
                  </td>
                  <td>{item.restaurant_name}</td>
                  <td><span className="badge badge-gray">{item.category || "—"}</span></td>
                  <td><strong>Rs. {Number(item.price).toLocaleString()}</strong></td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-sm btn-secondary" onClick={() => openEdit(item)}>✏️ Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item.id, item.name)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!items.length && (
                <tr><td colSpan={6}><div className="empty-state"><div className="empty-state-icon">📋</div><div className="empty-state-text">No menu items found</div></div></td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editTarget && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setEditTarget(null)}>
          <div className="modal-box">
            <div className="modal-header">
              <h3 className="modal-title">Edit Menu Item</h3>
              <button className="modal-close" onClick={() => setEditTarget(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="admin-form">
                <div className="form-group">
                  <label className="form-label">Image</label>
                  <div className="image-upload-area" onClick={() => fileRef.current.click()}>
                    {imagePreview ? <img src={imagePreview} alt="preview" className="image-preview" /> : <div className="image-upload-placeholder"><span>📷</span>Click to upload</div>}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageChange} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Name <span>*</span></label>
                    <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Price (Rs.) <span>*</span></label>
                    <input className="form-input" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <input className="form-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Mains, Starters" />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setEditTarget(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Update Item"}</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
