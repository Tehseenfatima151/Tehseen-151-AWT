import { useEffect, useState, useRef } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { fetchTopBrands, createTopBrand, updateTopBrand, deleteTopBrand, fetchAdminRestaurants } from "../../api/adminApi";

const EMPTY_FORM = { name: "", restaurant_id: "", display_order: "0" };

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
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
    Promise.all([fetchTopBrands(), fetchAdminRestaurants()])
      .then(([brandsRes, restRes]) => { setBrands(brandsRes.data); setRestaurants(restRes.data); })
      .catch(() => setAlert({ type: "error", msg: "Failed to load" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
    setImagePreview("");
    setShowModal(true);
  };

  const openEdit = (b) => {
    setEditTarget(b);
    setForm({ name: b.name, restaurant_id: b.restaurant_id || "", display_order: String(b.display_order) });
    setImageFile(null);
    setImagePreview(b.image_url || "");
    setShowModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!form.name) { setAlert({ type: "error", msg: "Brand name is required" }); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (imageFile) fd.append("image", imageFile);

      if (editTarget) {
        await updateTopBrand(editTarget.id, fd);
        setAlert({ type: "success", msg: "Brand updated" });
      } else {
        await createTopBrand(fd);
        setAlert({ type: "success", msg: "Brand created" });
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
    if (!window.confirm(`Delete brand "${name}"?`)) return;
    try {
      await deleteTopBrand(id);
      setAlert({ type: "success", msg: "Brand deleted" });
      load();
    } catch {
      setAlert({ type: "error", msg: "Delete failed" });
    }
  };

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">🏆 Top Brands</h1>
          <p className="admin-page-subtitle">Manage brand logos and links shown on the homepage</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Brand</button>
      </div>

      {alert && <div className={`admin-alert ${alert.type}`} onClick={() => setAlert(null)}>{alert.type === "success" ? "✅" : "⚠️"} {alert.msg}</div>}

      {loading ? (
        <div className="admin-loading"><div className="spin" /> Loading...</div>
      ) : (
        <>
          {/* Brand Cards Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
            {brands.map((b) => (
              <div key={b.id} style={{ background: "#fff", borderRadius: 12, border: "1px solid var(--admin-border)", padding: 16, textAlign: "center", boxShadow: "var(--admin-shadow)" }}>
                {b.image_url
                  ? <img src={b.image_url} alt={b.name} style={{ width: 80, height: 80, objectFit: "contain", borderRadius: 8, marginBottom: 10 }} />
                  : <div style={{ width: 80, height: 80, borderRadius: 8, background: "var(--admin-primary-light)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 10px" }}>🏆</div>}
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{b.name}</div>
                {b.restaurant_name && <div style={{ fontSize: 12, color: "var(--admin-text-muted)", marginBottom: 8 }}>→ {b.restaurant_name}</div>}
                <div style={{ fontSize: 11, color: "var(--admin-text-muted)", marginBottom: 12 }}>Order: {b.display_order}</div>
                <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                  <button className="btn btn-sm btn-secondary" onClick={() => openEdit(b)}>✏️</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(b.id, b.name)}>🗑️</button>
                </div>
              </div>
            ))}
            {!brands.length && (
              <div style={{ gridColumn: "1/-1" }}>
                <div className="empty-state"><div className="empty-state-icon">🏆</div><div className="empty-state-text">No brands yet</div><div className="empty-state-sub">Click "Add Brand" to create one</div></div>
              </div>
            )}
          </div>

          {/* Table view */}
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>Logo</th><th>Brand Name</th><th>Linked Restaurant</th><th>Display Order</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {brands.map((b) => (
                  <tr key={b.id}>
                    <td className="img-cell">
                      {b.image_url ? <img src={b.image_url} alt={b.name} /> : <div className="no-img">🏆</div>}
                    </td>
                    <td><strong>{b.name}</strong></td>
                    <td>{b.restaurant_name || <span style={{ color: "var(--admin-text-muted)" }}>Not linked</span>}</td>
                    <td>{b.display_order}</td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn btn-sm btn-secondary" onClick={() => openEdit(b)}>✏️ Edit</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(b.id, b.name)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-box">
            <div className="modal-header">
              <h3 className="modal-title">{editTarget ? "Edit Brand" : "Add New Brand"}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="admin-form">
                <div className="form-group">
                  <label className="form-label">Brand Logo</label>
                  <div className="image-upload-area" onClick={() => fileRef.current.click()}>
                    {imagePreview
                      ? <img src={imagePreview} alt="preview" className="image-preview" style={{ maxHeight: 120, objectFit: "contain" }} />
                      : <div className="image-upload-placeholder"><span>🏆</span>Click to upload logo</div>}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Brand Name <span>*</span></label>
                  <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. KFC, McDonald's" />
                </div>
                <div className="form-group">
                  <label className="form-label">Link to Restaurant</label>
                  <select className="form-select" value={form.restaurant_id} onChange={(e) => setForm({ ...form, restaurant_id: e.target.value })}>
                    <option value="">No link</option>
                    {restaurants.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Display Order</label>
                  <input className="form-input" type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: e.target.value })} />
                  <span className="form-hint">Lower number = shown first</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? "Saving..." : editTarget ? "Update Brand" : "Create Brand"}</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
