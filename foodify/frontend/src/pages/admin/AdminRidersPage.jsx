import { useEffect, useState, useRef, useCallback } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import api from "../../api/api";
import {
  fetchRiderStats, fetchRiders, createRider, updateRider,
  deleteRider, toggleRiderActive, toggleRiderAvailability,
} from "../../api/riderApi";

/* ── constants ── */
const VEHICLE_ICONS = { bike: "🏍️", bicycle: "🚲", car: "🚗" };
const AVAIL_CFG = {
  online:  { label: "Online",  cls: "badge-success" },
  offline: { label: "Offline", cls: "badge-gray" },
};
const EMPTY_FORM = {
  name: "", phone: "", email: "", cnic: "",
  vehicle_type: "bike", vehicle_number: "",
  availability: "offline",
};

/* ══════════════════════════════════════════════════════════
   Rider Form Modal
══════════════════════════════════════════════════════════ */
function RiderModal({ rider, onClose, onSaved }) {
  const [form, setForm]     = useState(rider ? {
    name: rider.name || "", phone: rider.phone || "",
    email: rider.email || "", cnic: rider.cnic || "",
    vehicle_type: rider.vehicle_type || "bike",
    vehicle_number: rider.vehicle_number || "",
    availability: rider.availability || "offline",
  } : { ...EMPTY_FORM });
  const [imgFile, setImgFile] = useState(null);
  const [imgPrev, setImgPrev] = useState(rider?.image_url || "");
  const [saving, setSaving]   = useState(false);
  const [err, setErr]         = useState("");
  const fileRef               = useRef();

  const handleImg = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setImgFile(f);
    setImgPrev(URL.createObjectURL(f));
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.phone.trim()) {
      setErr("Name and phone are required");
      return;
    }
    setSaving(true); setErr("");
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
      if (imgFile) fd.append("image", imgFile);
      if (rider) await updateRider(rider.id, fd);
      else       await createRider(fd);
      onSaved();
    } catch (e) {
      setErr(e.response?.data?.message || "Save failed — check backend is running");
    } finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box modal-lg">
        <div className="modal-header">
          <h3 className="modal-title">{rider ? "✏️ Edit Rider" : "➕ Add New Rider"}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {err && <div className="admin-alert error" style={{ marginBottom: 16 }}>⚠️ {err}</div>}
          <div className="admin-form">

            {/* Profile photo */}
            <div className="form-group" style={{ alignItems: "center" }}>
              <label className="form-label">Profile Photo</label>
              <div className="rider-img-upload" onClick={() => fileRef.current?.click()}>
                {imgPrev
                  ? <img src={imgPrev} alt="preview" className="rider-img-preview" />
                  : <div className="rider-img-placeholder">
                      <span>📷</span><p>Click to upload</p>
                    </div>}
              </div>
              <input ref={fileRef} type="file" accept="image/*"
                style={{ display: "none" }} onChange={handleImg} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name <span>*</span></label>
                <input className="form-input" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Ali Hassan" />
              </div>
              <div className="form-group">
                <label className="form-label">Phone <span>*</span></label>
                <input className="form-input" value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="03XX-XXXXXXX" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="rider@email.com" />
              </div>
              <div className="form-group">
                <label className="form-label">CNIC / ID</label>
                <input className="form-input" value={form.cnic}
                  onChange={(e) => setForm({ ...form, cnic: e.target.value })}
                  placeholder="XXXXX-XXXXXXX-X" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Vehicle Type</label>
                <select className="form-select" value={form.vehicle_type}
                  onChange={(e) => setForm({ ...form, vehicle_type: e.target.value })}>
                  <option value="bike">🏍️ Bike</option>
                  <option value="bicycle">🚲 Bicycle</option>
                  <option value="car">🚗 Car</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Vehicle Number</label>
                <input className="form-input" value={form.vehicle_number}
                  onChange={(e) => setForm({ ...form, vehicle_number: e.target.value })}
                  placeholder="ABC-123" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Availability Status</label>
              <select className="form-select" value={form.availability}
                onChange={(e) => setForm({ ...form, availability: e.target.value })}>
                <option value="online">🟢 Online — Ready to deliver</option>
                <option value="offline">⚫ Offline — Not available</option>
              </select>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : rider ? "Update Rider" : "Add Rider"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Rider Detail Modal
══════════════════════════════════════════════════════════ */
function RiderDetailModal({ rider, onClose }) {
  if (!rider) return null;
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box modal-lg">
        <div className="modal-header">
          <h3 className="modal-title">🏍️ Rider Profile</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">

          {/* Profile header */}
          <div className="rider-detail-header">
            <div className="rider-detail-avatar">
              {rider.image_url
                ? <img src={rider.image_url} alt={rider.name} />
                : <span>{rider.name?.charAt(0)?.toUpperCase()}</span>}
            </div>
            <div className="rider-detail-info">
              <h2>{rider.name}</h2>
              <p>
                📞 {rider.phone}
                {rider.email ? ` • ✉️ ${rider.email}` : ""}
                {rider.cnic  ? ` • 🪪 ${rider.cnic}`  : ""}
              </p>
              <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                <span className={`badge ${AVAIL_CFG[rider.availability]?.cls}`}>
                  {rider.availability === "online" ? "🟢" : "⚫"} {AVAIL_CFG[rider.availability]?.label}
                </span>
                <span className={`badge ${rider.is_active ? "badge-success" : "badge-danger"}`}>
                  {rider.is_active ? "✅ Active" : "❌ Inactive"}
                </span>
                <span className="badge badge-gray">
                  {VEHICLE_ICONS[rider.vehicle_type]} {rider.vehicle_type}
                  {rider.vehicle_number ? ` • ${rider.vehicle_number}` : ""}
                </span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="rider-stats-row">
            {[
              { label: "Total Assigned",  value: rider.total_deliveries    || 0, icon: "📦" },
              { label: "Completed",       value: rider.completed_deliveries || 0, icon: "✅" },
              { label: "Today",           value: rider.deliveries_today     || 0, icon: "📅" },
              { label: "Tips Earned",     value: `Rs. ${Number(rider.total_tips || 0).toLocaleString()}`, icon: "💰" },
            ].map((s) => (
              <div key={s.label} className="rider-stat-box">
                <div className="rider-stat-icon">{s.icon}</div>
                <div className="rider-stat-val">{s.value}</div>
                <div className="rider-stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Recent orders */}
          {rider.recentOrders?.length > 0 ? (
            <div>
              <h4 style={{ fontWeight: 700, marginBottom: 12, fontSize: 14 }}>
                Recent Assignments ({rider.recentOrders.length})
              </h4>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>#</th><th>Customer</th><th>Restaurant</th>
                      <th>Amount</th><th>Tip</th><th>Delivery</th><th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rider.recentOrders.map((o) => (
                      <tr key={o.id}>
                        <td><strong>#{o.id}</strong></td>
                        <td>{o.customer_name}</td>
                        <td>{o.restaurant_name}</td>
                        <td>Rs. {Number(o.total_price).toLocaleString()}</td>
                        <td style={{ color: "var(--admin-primary)", fontWeight: 700 }}>
                          {o.rider_tip > 0 ? `Rs. ${o.rider_tip}` : "—"}
                        </td>
                        <td>
                          <span className={`badge ${o.delivery_status === "delivered" ? "badge-success" : "badge-warning"}`}>
                            {o.delivery_status || "pending"}
                          </span>
                        </td>
                        <td style={{ fontSize: 12, color: "var(--admin-text-muted)" }}>
                          {new Date(o.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="empty-state" style={{ padding: 30 }}>
              <div className="empty-state-icon">📦</div>
              <div className="empty-state-text">No deliveries yet</div>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Main Riders Page
══════════════════════════════════════════════════════════ */
export default function AdminRidersPage() {
  const [riders, setRiders]           = useState([]);
  const [stats, setStats]             = useState({});
  const [loading, setLoading]         = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [search, setSearch]           = useState("");
  const [filterAvail, setFilterAvail] = useState("");
  const [showModal, setShowModal]     = useState(false);
  const [editRider, setEditRider]     = useState(null);
  const [detailRider, setDetailRider] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [alert, setAlert]             = useState(null);

  /* Load riders list */
  const loadRiders = useCallback(() => {
    setLoading(true);
    fetchRiders({ search, availability: filterAvail || undefined })
      .then((r) => setRiders(r.data))
      .catch((e) => setAlert({
        type: "error",
        msg: e.response?.data?.message || "Failed to load riders — restart backend server",
      }))
      .finally(() => setLoading(false));
  }, [search, filterAvail]);

  /* Load stats separately */
  const loadStats = useCallback(() => {
    setStatsLoading(true);
    fetchRiderStats()
      .then((r) => setStats(r.data))
      .catch(() => {/* stats failure is non-critical */})
      .finally(() => setStatsLoading(false));
  }, []);

  useEffect(() => { loadRiders(); }, [loadRiders]);
  useEffect(() => { loadStats(); }, [loadStats]);

  /* Open detail modal */
  const openDetail = async (id) => {
    setDetailLoading(true);
    try {
      const res = await api.get(`/riders/${id}`);
      setDetailRider(res.data);
    } catch {
      setAlert({ type: "error", msg: "Failed to load rider details" });
    } finally { setDetailLoading(false); }
  };

  const handleToggleActive = async (id) => {
    try {
      const r = await toggleRiderActive(id);
      setRiders((prev) => prev.map((x) => x.id === id ? { ...x, is_active: r.data.is_active } : x));
      loadStats();
    } catch { setAlert({ type: "error", msg: "Failed to update" }); }
  };

  const handleToggleAvail = async (id) => {
    try {
      const r = await toggleRiderAvailability(id);
      setRiders((prev) => prev.map((x) => x.id === id ? { ...x, availability: r.data.availability } : x));
      loadStats();
    } catch { setAlert({ type: "error", msg: "Failed to update" }); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete rider "${name}"? This cannot be undone.`)) return;
    try {
      await deleteRider(id);
      setAlert({ type: "success", msg: `Rider "${name}" deleted` });
      loadRiders(); loadStats();
    } catch { setAlert({ type: "error", msg: "Delete failed" }); }
  };

  const STAT_CARDS = [
    { label: "Total Riders",    value: stats.totalRiders    ?? 0, icon: "🏍️", color: "red" },
    { label: "Active Riders",   value: stats.activeRiders   ?? 0, icon: "✅",  color: "green" },
    { label: "Online Now",      value: stats.onlineRiders   ?? 0, icon: "🟢",  color: "teal" },
    { label: "Delivered Today", value: stats.deliveriesToday?? 0, icon: "📦",  color: "blue" },
    { label: "Total Tips Paid", value: `Rs. ${Number(stats.totalTips || 0).toLocaleString()}`, icon: "💰", color: "orange" },
  ];

  return (
    <AdminLayout>
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">🏍️ Riders</h1>
          <p className="admin-page-subtitle">Manage delivery riders and track performance</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditRider(null); setShowModal(true); }}>
          + Add Rider
        </button>
      </div>

      {/* Alert */}
      {alert && (
        <div className={`admin-alert ${alert.type}`} onClick={() => setAlert(null)}>
          {alert.type === "success" ? "✅" : "⚠️"} {alert.msg}
          <span style={{ marginLeft: "auto", fontSize: 12, opacity: 0.7 }}>click to dismiss</span>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        {STAT_CARDS.map((s) => (
          <div className="stat-card" key={s.label}>
            <div className={`stat-icon ${s.color}`}>{s.icon}</div>
            <div>
              <div className="stat-value" style={{ fontSize: 22 }}>
                {statsLoading ? <span className="spin" style={{ width: 16, height: 16, borderWidth: 2 }} /> : s.value}
              </div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="admin-toolbar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            placeholder="Search by name, phone, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="filter-select" value={filterAvail}
          onChange={(e) => setFilterAvail(e.target.value)}>
          <option value="">All Availability</option>
          <option value="online">🟢 Online</option>
          <option value="offline">⚫ Offline</option>
        </select>
        <button className="btn btn-secondary" onClick={() => { loadRiders(); loadStats(); }}>
          🔄 Refresh
        </button>
      </div>

      {/* Rider Cards */}
      {loading ? (
        <div className="admin-loading"><div className="spin" /> Loading riders...</div>
      ) : riders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏍️</div>
          <div className="empty-state-text">No riders found</div>
          <div className="empty-state-sub">
            {search || filterAvail ? "Try clearing filters" : "Click \"+ Add Rider\" to add your first rider"}
          </div>
          {(search || filterAvail) && (
            <button className="btn btn-secondary" style={{ marginTop: 12 }}
              onClick={() => { setSearch(""); setFilterAvail(""); }}>
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="riders-grid">
          {riders.map((rider) => (
            <div key={rider.id} className={`rider-card ${!rider.is_active ? "rider-card--inactive" : ""}`}>

              {/* Online/offline dot */}
              <div className={`rider-avail-dot ${rider.availability === "online" ? "online" : "offline"}`} />

              {/* Avatar */}
              <div className="rider-card-avatar">
                {rider.image_url
                  ? <img src={rider.image_url} alt={rider.name} />
                  : <span>{rider.name?.charAt(0)?.toUpperCase()}</span>}
              </div>

              {/* Info */}
              <div className="rider-card-body">
                <h3 className="rider-card-name">{rider.name}</h3>
                <p className="rider-card-phone">📞 {rider.phone}</p>
                {rider.vehicle_number && (
                  <p style={{ fontSize: 12, color: "var(--admin-text-muted)", margin: "0 0 8px" }}>
                    {VEHICLE_ICONS[rider.vehicle_type]} {rider.vehicle_number}
                  </p>
                )}
                <div className="rider-card-badges">
                  <span className={`badge ${AVAIL_CFG[rider.availability]?.cls}`} style={{ fontSize: 11 }}>
                    {rider.availability === "online" ? "🟢" : "⚫"} {AVAIL_CFG[rider.availability]?.label}
                  </span>
                  <span className="badge badge-gray" style={{ fontSize: 11 }}>
                    {VEHICLE_ICONS[rider.vehicle_type]} {rider.vehicle_type}
                  </span>
                  {!rider.is_active && (
                    <span className="badge badge-danger" style={{ fontSize: 11 }}>Inactive</span>
                  )}
                </div>

                {/* Mini stats */}
                <div className="rider-card-stats">
                  <div className="rider-mini-stat">
                    <span className="rider-mini-val">{rider.total_deliveries || 0}</span>
                    <span className="rider-mini-label">Assigned</span>
                  </div>
                  <div className="rider-mini-stat">
                    <span className="rider-mini-val">{rider.completed_deliveries || 0}</span>
                    <span className="rider-mini-label">Done</span>
                  </div>
                  <div className="rider-mini-stat">
                    <span className="rider-mini-val" style={{ color: "var(--admin-primary)", fontSize: 13 }}>
                      Rs.{Number(rider.total_tips || 0).toLocaleString()}
                    </span>
                    <span className="rider-mini-label">Tips</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="rider-card-actions">
                <button className="btn btn-sm btn-secondary" title="View Details"
                  onClick={() => openDetail(rider.id)}>
                  👁️ View
                </button>
                <button className="btn btn-sm btn-secondary" title="Edit"
                  onClick={() => { setEditRider(rider); setShowModal(true); }}>
                  ✏️ Edit
                </button>
                <button
                  className={`btn btn-sm ${rider.availability === "online" ? "btn-warning" : "btn-success"}`}
                  title={rider.availability === "online" ? "Set Offline" : "Set Online"}
                  onClick={() => handleToggleAvail(rider.id)}>
                  {rider.availability === "online" ? "⚫ Offline" : "🟢 Online"}
                </button>
              </div>

              {/* Active toggle + delete row */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                borderTop: "1px solid var(--admin-border-soft)", paddingTop: 10 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "var(--admin-text-muted)" }}>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={!!rider.is_active}
                      onChange={() => handleToggleActive(rider.id)} />
                    <span className="toggle-slider" />
                  </label>
                  {rider.is_active ? "Active" : "Inactive"}
                </label>
                <button className="btn btn-sm btn-danger" title="Delete rider"
                  onClick={() => handleDelete(rider.id, rider.name)}>
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <RiderModal
          rider={editRider}
          onClose={() => { setShowModal(false); setEditRider(null); }}
          onSaved={() => {
            setShowModal(false);
            setEditRider(null);
            setAlert({ type: "success", msg: editRider ? "Rider updated successfully" : "Rider added successfully" });
            loadRiders();
            loadStats();
          }}
        />
      )}

      {/* Detail Modal */}
      {detailLoading && (
        <div className="modal-overlay">
          <div className="admin-loading"><div className="spin" /> Loading...</div>
        </div>
      )}
      {detailRider && !detailLoading && (
        <RiderDetailModal rider={detailRider} onClose={() => setDetailRider(null)} />
      )}
    </AdminLayout>
  );
}
