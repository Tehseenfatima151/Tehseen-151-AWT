import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { fetchAdminOrders } from "../../api/adminApi";
import { fetchRiders, assignRiderToOrder, updateDeliveryStatus } from "../../api/riderApi";

const DELIVERY_STEPS = [
  { key: "pending",    label: "Pending",       icon: "⏳", color: "#9ca3af" },
  { key: "confirmed",  label: "Confirmed",     icon: "✅", color: "#3b82f6" },
  { key: "preparing",  label: "Preparing",     icon: "🍳", color: "#f97316" },
  { key: "picked_up",  label: "Picked Up",     icon: "🏍️", color: "#8b5cf6" },
  { key: "on_the_way", label: "On the Way",    icon: "🛣️", color: "#d70f64" },
  { key: "delivered",  label: "Delivered",     icon: "🏠", color: "#10b981" },
];

const STATUS_BADGE = {
  pending:    "badge-gray",
  confirmed:  "badge-info",
  preparing:  "badge-orange",
  picked_up:  "badge-purple",
  on_the_way: "badge-pink",
  delivered:  "badge-success",
};

/* ── Delivery Pipeline ── */
function DeliveryPipeline({ status }) {
  const idx = DELIVERY_STEPS.findIndex((s) => s.key === status);
  return (
    <div className="delivery-pipeline">
      {DELIVERY_STEPS.map((step, i) => {
        const done   = i < idx;
        const active = i === idx;
        return (
          <div key={step.key} className="dp-step">
            <div
              className={`dp-dot ${done ? "done" : active ? "active" : "future"}`}
              style={done || active ? { background: step.color, borderColor: step.color } : {}}
              title={step.label}
            >
              {done ? "✓" : step.icon}
            </div>
            <span className={`dp-label ${active ? "dp-label--active" : done ? "dp-label--done" : ""}`}>
              {step.label}
            </span>
            {i < DELIVERY_STEPS.length - 1 && (
              <div className={`dp-line ${i < idx ? "dp-line--done" : ""}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Assign Rider Modal ── */
function AssignModal({ order, riders, onClose, onSaved }) {
  const [selectedRider, setSelectedRider] = useState(order.assigned_rider_id || "");
  const [delivStatus, setDelivStatus]     = useState(order.delivery_status || "pending");
  const [saving, setSaving]               = useState(false);
  const [err, setErr]                     = useState("");

  const onlineRiders = riders.filter((r) => r.is_active);

  const handleSave = async () => {
    setSaving(true); setErr("");
    try {
      await assignRiderToOrder(order.id, selectedRider || null);
      if (delivStatus !== order.delivery_status) {
        await updateDeliveryStatus(order.id, delivStatus);
      }
      onSaved();
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to save");
    } finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <h3 className="modal-title">🏍️ Assign Rider — Order #{order.id}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {err && <div className="admin-alert error" style={{ marginBottom: 12 }}>⚠️ {err}</div>}

          {/* Order summary */}
          <div className="assign-order-summary">
            <div><span>Customer</span><strong>{order.customer_name}</strong></div>
            <div><span>Restaurant</span><strong>{order.restaurant_name}</strong></div>
            <div><span>Amount</span><strong>Rs. {Number(order.total_price).toLocaleString()}</strong></div>
            <div><span>Rider Tip</span><strong style={{ color: "var(--admin-primary)" }}>Rs. {order.rider_tip || 0}</strong></div>
          </div>

          <div className="admin-form" style={{ marginTop: 16 }}>
            <div className="form-group">
              <label className="form-label">Assign Rider</label>
              <select className="form-select" value={selectedRider} onChange={(e) => setSelectedRider(e.target.value)}>
                <option value="">— No rider assigned —</option>
                {onlineRiders.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.availability === "online" ? "🟢" : "⚫"} {r.name} — {r.vehicle_type} {r.vehicle_number ? `(${r.vehicle_number})` : ""}
                  </option>
                ))}
              </select>
              {onlineRiders.length === 0 && (
                <span className="form-hint" style={{ color: "var(--admin-primary)" }}>
                  No active riders available. Add riders first.
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Delivery Status</label>
              <select className="form-select" value={delivStatus} onChange={(e) => setDelivStatus(e.target.value)}>
                {DELIVERY_STEPS.map((s) => (
                  <option key={s.key} value={s.key}>{s.icon} {s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Pipeline preview */}
          <div style={{ marginTop: 20 }}>
            <label className="form-label" style={{ marginBottom: 12, display: "block" }}>Delivery Progress</label>
            <DeliveryPipeline status={delivStatus} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Assignment"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function AdminOrderAssignPage() {
  const [orders, setOrders]   = useState([]);
  const [riders, setRiders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDelivery, setFilterDelivery] = useState("");
  const [assignOrder, setAssignOrder] = useState(null);
  const [alert, setAlert]     = useState(null);
  const [page, setPage]       = useState(1);
  const LIMIT = 20;

  const load = () => {
    setLoading(true);
    Promise.all([
      fetchAdminOrders({ search, status: filterStatus, page, limit: LIMIT }),
      fetchRiders(),
    ])
      .then(([oRes, rRes]) => { setOrders(oRes.data.orders || []); setRiders(rRes.data); })
      .catch(() => setAlert({ type: "error", msg: "Failed to load data" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search, filterStatus, page]);

  // Filter by delivery status client-side
  const displayed = filterDelivery
    ? orders.filter((o) => (o.delivery_status || "pending") === filterDelivery)
    : orders;

  const getRiderName = (id) => {
    const r = riders.find((x) => x.id === id);
    return r ? r.name : null;
  };

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">🚚 Order Assignment</h1>
          <p className="admin-page-subtitle">Assign riders to orders and track delivery status</p>
        </div>
      </div>

      {alert && <div className={`admin-alert ${alert.type}`} onClick={() => setAlert(null)}>{alert.type === "success" ? "✅" : "⚠️"} {alert.msg}</div>}

      <div className="admin-toolbar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input placeholder="Search orders..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className="filter-select" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}>
          <option value="">All Order Status</option>
          {["pending","accepted","preparing","ready","completed","rejected"].map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
        <select className="filter-select" value={filterDelivery} onChange={(e) => setFilterDelivery(e.target.value)}>
          <option value="">All Delivery Status</option>
          {DELIVERY_STEPS.map((s) => <option key={s.key} value={s.key}>{s.icon} {s.label}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="admin-loading"><div className="spin" /> Loading...</div>
      ) : (
        <div className="assign-orders-list">
          {displayed.map((order) => {
            const riderName = order.assigned_rider_id ? getRiderName(order.assigned_rider_id) : null;
            const delivStatus = order.delivery_status || "pending";
            const stepCfg = DELIVERY_STEPS.find((s) => s.key === delivStatus) || DELIVERY_STEPS[0];
            return (
              <div key={order.id} className="assign-order-card">
                {/* Left accent */}
                <div className="assign-order-accent" style={{ background: stepCfg.color }} />

                <div className="assign-order-main">
                  {/* Row 1: ID + customer + amount */}
                  <div className="assign-order-top">
                    <div className="assign-order-id">
                      <strong>#{order.id}</strong>
                      <span className={`badge ${STATUS_BADGE[delivStatus] || "badge-gray"}`} style={{ fontSize: 11 }}>
                        {stepCfg.icon} {stepCfg.label}
                      </span>
                    </div>
                    <div className="assign-order-meta">
                      <span>👤 {order.customer_name}</span>
                      <span>🍽️ {order.restaurant_name}</span>
                      <span style={{ fontWeight: 700, color: "var(--admin-primary)" }}>
                        Rs. {Number(order.total_price).toLocaleString()}
                      </span>
                      {order.rider_tip > 0 && (
                        <span className="badge badge-orange" style={{ fontSize: 11 }}>
                          💰 Tip: Rs.{order.rider_tip}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Delivery pipeline */}
                  <div className="assign-order-pipeline">
                    <DeliveryPipeline status={delivStatus} />
                  </div>

                  {/* Row 3: Rider + action */}
                  <div className="assign-order-bottom">
                    <div className="assign-rider-info">
                      {riderName ? (
                        <span className="assigned-rider-tag">
                          🏍️ <strong>{riderName}</strong>
                        </span>
                      ) : (
                        <span className="unassigned-tag">⚠️ No rider assigned</span>
                      )}
                    </div>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => setAssignOrder(order)}
                    >
                      {riderName ? "✏️ Reassign" : "🏍️ Assign Rider"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {!displayed.length && (
            <div className="empty-state">
              <div className="empty-state-icon">🚚</div>
              <div className="empty-state-text">No orders found</div>
            </div>
          )}
        </div>
      )}

      {assignOrder && (
        <AssignModal
          order={assignOrder}
          riders={riders}
          onClose={() => setAssignOrder(null)}
          onSaved={() => {
            setAssignOrder(null);
            setAlert({ type: "success", msg: "Assignment saved" });
            load();
          }}
        />
      )}
    </AdminLayout>
  );
}
