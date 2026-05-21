import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import { fetchAdminOrders, fetchAdminOrderDetails } from "../../api/adminApi";

const STATUS_BADGE = {
  pending:   "badge-warning",
  accepted:  "badge-info",
  preparing: "badge-purple",
  ready:     "badge-success",
  completed: "badge-success",
  rejected:  "badge-danger",
};

const DELIVERY_BADGE = {
  pending:    "badge-gray",
  confirmed:  "badge-info",
  preparing:  "badge-orange",
  picked_up:  "badge-purple",
  on_the_way: "badge-pink",
  delivered:  "badge-success",
};

const DELIVERY_ICONS = {
  pending: "⏳", confirmed: "✅", preparing: "🍳",
  picked_up: "🏍️", on_the_way: "🛣️", delivered: "🏠",
};

const parseAddress = (raw) => {
  if (!raw) return "—";
  try {
    const a = typeof raw === "string" ? JSON.parse(raw) : raw;
    return a.address || a.label || JSON.stringify(a);
  } catch { return raw; }
};

export default function AdminOrdersPage() {
  const [orders, setOrders]           = useState([]);
  const [total, setTotal]             = useState(0);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage]               = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [alert, setAlert]             = useState(null);
  const navigate                      = useNavigate();
  const LIMIT = 20;

  const load = () => {
    setLoading(true);
    fetchAdminOrders({ search, status: filterStatus, page, limit: LIMIT })
      .then((r) => { setOrders(r.data.orders); setTotal(r.data.total); })
      .catch(() => setAlert({ type: "error", msg: "Failed to load orders" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search, filterStatus, page]);

  const openDetail = async (id) => {
    setDetailLoading(true);
    try {
      const r = await fetchAdminOrderDetails(id);
      setSelectedOrder(r.data);
    } catch {
      setAlert({ type: "error", msg: "Failed to load order details" });
    } finally { setDetailLoading(false); }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">📦 Orders</h1>
          <p className="admin-page-subtitle">View and track all platform orders ({total} total)</p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate("/admin/order-assign")}>
          🚚 Assign Riders
        </button>
      </div>

      {alert && (
        <button
          type="button"
          className={`admin-alert ${alert.type}`}
          onClick={() => setAlert(null)}
          style={{ width: "100%", textAlign: "left", cursor: "pointer" }}
        >
          {alert.type === "success" ? "✅" : "⚠️"} {alert.msg}
        </button>
      )}

      <div className="admin-toolbar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            placeholder="Search by customer, restaurant, ID..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select className="filter-select" value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          {["pending","accepted","preparing","ready","completed","rejected"].map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="admin-loading"><div className="spin" /> Loading...</div>
      ) : (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#ID</th>
                  <th>Customer</th>
                  <th>Restaurant</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Rider</th>
                  <th>Delivery</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td><strong>#{o.id}</strong></td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{o.customer_name}</div>
                      <div style={{ fontSize: 11, color: "var(--admin-text-muted)" }}>{o.customer_email}</div>
                    </td>
                    <td>{o.restaurant_name}</td>
                    <td>
                      <strong>Rs. {Number(o.total_price).toLocaleString()}</strong>
                      {o.rider_tip > 0 && (
                        <div style={{ fontSize: 11, color: "var(--admin-primary)", fontWeight: 600 }}>
                          💰 Tip: Rs.{o.rider_tip}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="badge badge-gray">{o.payment_method || "COD"}</span>
                    </td>
                    <td>
                      {o.rider_name
                        ? <span className="assigned-rider-tag" style={{ fontSize: 11 }}>🏍️ {o.rider_name}</span>
                        : <span style={{ fontSize: 11, color: "var(--admin-text-muted)" }}>—</span>}
                    </td>
                    <td>
                      {o.delivery_status && o.delivery_status !== "pending" ? (
                        <span className={`badge ${DELIVERY_BADGE[o.delivery_status] || "badge-gray"}`} style={{ fontSize: 11 }}>
                          {DELIVERY_ICONS[o.delivery_status]} {o.delivery_status?.replace("_", " ")}
                        </span>
                      ) : (
                        <span style={{ fontSize: 11, color: "var(--admin-text-muted)" }}>—</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${STATUS_BADGE[o.status] || "badge-gray"}`}>
                        {o.status}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: "var(--admin-text-muted)" }}>
                      {new Date(o.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button className="btn btn-sm btn-secondary" onClick={() => openDetail(o.id)}>
                          👁️ View
                        </button>
                        <button className="btn btn-sm btn-secondary"
                          title="Assign rider"
                          onClick={() => navigate("/admin/order-assign")}>
                          🏍️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!orders.length && (
                  <tr>
                    <td colSpan={10}>
                      <div className="empty-state">
                        <div className="empty-state-icon">📦</div>
                        <div className="empty-state-text">No orders found</div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button className="page-btn" disabled={page === 1} onClick={() => setPage(page - 1)}>← Prev</button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
                <button key={p} className={`page-btn ${p === page ? "active" : ""}`} onClick={() => setPage(p)}>{p}</button>
              ))}
              <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next →</button>
            </div>
          )}
        </>
      )}

      {/* Order Detail Modal */}
      {(selectedOrder || detailLoading) && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-box modal-lg">
            <div className="modal-header">
              <h3 className="modal-title">Order #{selectedOrder?.id} Details</h3>
              <button className="modal-close" onClick={() => setSelectedOrder(null)}>✕</button>
            </div>
            <div className="modal-body">
              {detailLoading ? (
                <div className="admin-loading"><div className="spin" /></div>
              ) : selectedOrder && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                  {/* Rider info banner if assigned */}
                  {selectedOrder.rider_name && (
                    <div style={{
                      background: "var(--admin-primary-soft)",
                      border: "1px solid var(--admin-border)",
                      borderRadius: 10, padding: "12px 16px",
                      display: "flex", alignItems: "center", gap: 12,
                    }}>
                      <span style={{ fontSize: 28 }}>🏍️</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>
                          Rider: {selectedOrder.rider_name}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--admin-text-muted)" }}>
                          {selectedOrder.rider_phone && `📞 ${selectedOrder.rider_phone}`}
                          {selectedOrder.rider_vehicle_type && ` • ${DELIVERY_ICONS.picked_up} ${selectedOrder.rider_vehicle_type}`}
                          {selectedOrder.rider_vehicle_number && ` ${selectedOrder.rider_vehicle_number}`}
                        </div>
                      </div>
                      <div style={{ marginLeft: "auto" }}>
                        <span className={`badge ${DELIVERY_BADGE[selectedOrder.delivery_status] || "badge-gray"}`}>
                          {DELIVERY_ICONS[selectedOrder.delivery_status] || "⏳"} {selectedOrder.delivery_status?.replace("_", " ") || "pending"}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Order info grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {[
                      ["Customer",       selectedOrder.customer_name],
                      ["Email",          selectedOrder.customer_email],
                      ["Restaurant",     selectedOrder.restaurant_name],
                      ["Order Status",   <span key="os" className={`badge ${STATUS_BADGE[selectedOrder.status] || "badge-gray"}`}>{selectedOrder.status}</span>],
                      ["Payment Method", selectedOrder.payment_method || "COD"],
                      ["Payment Status", selectedOrder.payment_status || "—"],
                      ["Delivery Fee",   `Rs. ${selectedOrder.delivery_fee || 0}`],
                      ["Service Fee",    `Rs. ${selectedOrder.service_fee || 0}`],
                      ["VAT",            `Rs. ${selectedOrder.vat || 0}`],
                      ["Rider Tip",      <span key="rt" style={{ color: "var(--admin-primary)", fontWeight: 700 }}>Rs. {selectedOrder.rider_tip || 0}</span>],
                      ["Total",          <strong key="tot" style={{ color: "var(--admin-primary)", fontSize: 16 }}>Rs. {Number(selectedOrder.total_price).toLocaleString()}</strong>],
                      ["Date",           new Date(selectedOrder.created_at).toLocaleString()],
                    ].map(([label, val]) => (
                      <div key={label} style={{ background: "#f8fafc", borderRadius: 8, padding: "10px 14px" }}>
                        <div style={{ fontSize: 10, color: "var(--admin-text-muted)", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
                        <div style={{ fontSize: 14, fontWeight: 500 }}>{val}</div>
                      </div>
                    ))}
                  </div>

                  {selectedOrder.delivery_address && (
                    <div style={{ background: "#f8fafc", borderRadius: 8, padding: "10px 14px" }}>
                      <div style={{ fontSize: 10, color: "var(--admin-text-muted)", fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Delivery Address</div>
                      <div style={{ fontSize: 14 }}>{parseAddress(selectedOrder.delivery_address)}</div>
                    </div>
                  )}

                  {/* Order items */}
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 14 }}>Order Items</div>
                    <div className="admin-table-wrap">
                      <table className="admin-table">
                        <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr></thead>
                        <tbody>
                          {(selectedOrder.items || []).map((item, i) => (
                            <tr key={`item-${item.name}-${i}`}>
                              <td>{item.name}</td>
                              <td>{item.quantity}</td>
                              <td>Rs. {Number(item.price).toLocaleString()}</td>
                              <td><strong>Rs. {(Number(item.price) * item.quantity).toLocaleString()}</strong></td>
                            </tr>
                          ))}
                          {!selectedOrder.items?.length && (
                            <tr><td colSpan={4} style={{ textAlign: "center", color: "var(--admin-text-muted)" }}>No items</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedOrder(null)}>Close</button>
              <button className="btn btn-primary" onClick={() => { setSelectedOrder(null); navigate("/admin/order-assign"); }}>
                🏍️ Assign Rider
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
