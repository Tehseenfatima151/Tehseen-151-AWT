import { useEffect, useState, useRef } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import {
  fetchAdminRestaurants,
  createAdminRestaurant,
  updateAdminRestaurant,
  deleteAdminRestaurant,
  toggleRestaurantStatus,
} from "../../api/adminApi";

const CATEGORIES = ["Fast Food", "Pizza", "Burgers", "Desi", "Chinese", "BBQ", "Desserts", "Beverages", "Healthy", "Seafood", "Other"];
const EMPTY_FORM = { name: "", ownerName: "", email: "", password: "", description: "", category: "", brand: "", is_home_chef: false };

export default function AdminRestaurantsPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);
  const fileRef = useRef();

  const load = () => {
    setLoading(true);
    fetchAdminRestaurants({ search, status: filterStatus, category: filterCategory })
      .then((r) => setRestaurants(r.data))
      .catch(() => setAlert({ type: "error", msg: "Failed to load restaurants" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search, filterStatus, filterCategory]);

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
    setImagePreview("");
    setShowModal(true);
  };

  const openEdit = (r) => {
    setEditTarget(r);
    setForm({
      name: r.name, ownerName: r.owner_name, email: r.owner_email,
      password: "", description: r.description || "",
      category: r.category || "", brand: r.brand || "",
      is_home_chef: !!r.is_home_chef,
    });
    setImageFile(null);
    setImagePreview(r.image_url || "");
    setShowModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!form.name || (!editTarget && (!form.email || !form.password || !form.ownerName))) {
      setAlert({ type: "error", msg: "Please fill all required fields" });
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (imageFile) fd.append("image", imageFile);

      if (editTarget) {
        await updateAdminRestaurant(editTarget.id, fd);
        setAlert({ type: "success", msg: "Restaurant updated successfully" });
      } else {
        await createAdminRestaurant(fd);
        setAlert({ type: "success", msg: "Restaurant created successfully" });
      }
      setShowModal(false);
      load();
    } catch (e) {
      setAlert({ type: "error", msg: e.response?.data?.message || "Save failed" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}" and all its data? This cannot be undone.`)) return;
    try {
      await deleteAdminRestaurant(id);
      setAlert({ type: "success", msg: "Restaurant deleted" });
      load();
    } catch (e) {
      setAlert({ type: "error", msg: e.response?.data?.message || "Delete failed" });
    }
  };

  const handleToggle = async (id) => {
    try {
      const r = await toggleRestaurantStatus(id);
      setRestaurants((prev) =>
        prev.map((x) => (x.id === id ? { ...x, is_active: r.data.is_active } : x))
      );
    } catch {
      setAlert({ type: "error", msg: "Failed to toggle status" });
    }
  };

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">🍽️ Restaurants</h1>
          <p className="admin-page-subtitle">Manage all restaurants on the platform</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Restaurant</button>
      </div>

      {alert && (
        <div className={`admin-alert ${alert.type}`} onClick={() => setAlert(null)}>
          {alert.type === "success" ? "✅" : "⚠️"} {alert.msg}
        </div>
      )}

      <div className="admin-toolbar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input placeholder="Search restaurants..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select className="filter-select" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="admin-loading"><div className="spin" /> Loading...</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th><th>Restaurant</th><th>Owner</th><th>Category</th>
                <th>Menu</th><th>Orders</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {restaurants.map((r) => (
                <tr key={r.id}>
                  <td className="img-cell">
                    {r.image_url
                      ? <img src={r.image_url} alt={r.name} />
                      : <div className="no-img">🍽️</div>}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{r.name}</div>
                    <div style={{ fontSize: 12, color: "var(--admin-text-muted)" }}>
                      {r.is_home_chef ? "👨‍🍳 Home Chef" : ""} {r.brand ? `• ${r.brand}` : ""}
                    </div>
                  </td>
                  <td>
                    <div>{r.owner_name}</div>
                    <div style={{ fontSize: 12, color: "var(--admin-text-muted)" }}>{r.owner_email}</div>
                  </td>
                  <td>{r.category || <span style={{ color: "var(--admin-text-muted)" }}>—</span>}</td>
                  <td><span className="badge badge-info">{r.menu_count} items</span></td>
                  <td><span className="badge badge-gray">{r.order_count}</span></td>
                  <td>
                    <label className="toggle-switch">
                      <input type="checkbox" checked={!!r.is_active} onChange={() => handleToggle(r.id)} />
                      <span className="toggle-slider" />
                    </label>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-sm btn-secondary" onClick={() => openEdit(r)}>✏️ Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(r.id, r.name)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!restaurants.length && (
                <tr><td colSpan={8}>
                  <div className="empty-state">
                    <div className="empty-state-icon">🍽️</div>
                    <div className="empty-state-text">No restaurants found</div>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-box modal-lg">
            <div className="modal-header">
              <h3 className="modal-title">{editTarget ? "Edit Restaurant" : "Add New Restaurant"}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="admin-form">
                {/* Image */}
                <div className="form-group">
                  <label className="form-label">Restaurant Image</label>
                  <div className="image-upload-area" onClick={() => fileRef.current.click()}>
                    {imagePreview
                      ? <img src={imagePreview} alt="preview" className="image-preview" />
                      : <div className="image-upload-placeholder"><span>📷</span>Click to upload image</div>}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageChange} />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Restaurant Name <span>*</span></label>
                    <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Pizza Palace" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                      <option value="">Select category</option>
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                {!editTarget && (
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Owner Name <span>*</span></label>
                      <input className="form-input" value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} placeholder="Owner full name" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Owner Email <span>*</span></label>
                      <input className="form-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="owner@email.com" />
                    </div>
                  </div>
                )}

                {!editTarget && (
                  <div className="form-group">
                    <label className="form-label">Password <span>*</span></label>
                    <input className="form-input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Login password" />
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Brand</label>
                    <input className="form-input" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="e.g. KFC, McDonald's" />
                  </div>
                  <div className="form-group" style={{ justifyContent: "flex-end" }}>
                    <label className="form-label">Home Chef</label>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                      <input type="checkbox" checked={form.is_home_chef} onChange={(e) => setForm({ ...form, is_home_chef: e.target.checked })} />
                      <span style={{ fontSize: 14 }}>Mark as Home Chef</span>
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Short description..." />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : editTarget ? "Update Restaurant" : "Create Restaurant"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
