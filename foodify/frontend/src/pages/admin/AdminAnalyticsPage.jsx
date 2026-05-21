import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { fetchAnalytics } from "../../api/adminApi";

export default function AdminAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchAnalytics(days)
      .then((r) => setData(r.data))
      .catch(() => setAlert({ type: "error", msg: "Failed to load analytics" }))
      .finally(() => setLoading(false));
  }, [days]);

  const maxOrders = Math.max(...(data?.ordersPerDay?.map((d) => d.orders) || [1]));
  const maxRevenue = Math.max(...(data?.ordersPerDay?.map((d) => Number(d.revenue)) || [1]));
  const maxRestOrders = Math.max(...(data?.topRestaurants?.map((r) => r.order_count) || [1]));

  const totalRevenue = data?.ordersPerDay?.reduce((s, d) => s + Number(d.revenue), 0) || 0;
  const totalOrders = data?.ordersPerDay?.reduce((s, d) => s + Number(d.orders), 0) || 0;

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">📊 Analytics</h1>
          <p className="admin-page-subtitle">Platform performance overview</p>
        </div>
        <select className="filter-select" value={days} onChange={(e) => setDays(Number(e.target.value))}>
          <option value={7}>Last 7 days</option>
          <option value={14}>Last 14 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {alert && <div className={`admin-alert ${alert.type}`} onClick={() => setAlert(null)}>⚠️ {alert.msg}</div>}

      {loading ? (
        <div className="admin-loading"><div className="spin" /> Loading analytics...</div>
      ) : (
        <>
          {/* Summary */}
          <div className="stats-grid" style={{ marginBottom: 24 }}>
            {[
              { label: `Orders (${days}d)`, value: totalOrders, icon: "📦", color: "blue" },
              { label: `Revenue (${days}d)`, value: `Rs. ${Number(totalRevenue).toLocaleString()}`, icon: "💰", color: "green" },
              { label: "Top Restaurant", value: data?.topRestaurants?.[0]?.name || "—", icon: "🏆", color: "orange" },
              { label: "Top Item", value: data?.topMenuItems?.[0]?.name || "—", icon: "🍔", color: "purple" },
            ].map((s) => (
              <div className="stat-card" key={s.label}>
                <div className={`stat-icon ${s.color}`}>{s.icon}</div>
                <div><div className="stat-value" style={{ fontSize: 18 }}>{s.value}</div><div className="stat-label">{s.label}</div></div>
              </div>
            ))}
          </div>

          <div className="dashboard-grid">
            {/* Orders per day chart */}
            <div className="admin-card full-width">
              <div className="admin-card-header">
                <h3 className="admin-card-title">📈 Orders & Revenue per Day</h3>
              </div>
              <div className="admin-card-body">
                {data?.ordersPerDay?.length ? (
                  <div style={{ overflowX: "auto" }}>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, minWidth: data.ordersPerDay.length * 40, height: 200, padding: "0 8px" }}>
                      {data.ordersPerDay.map((d) => (
                        <div key={d.date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                          <div style={{ fontSize: 10, color: "var(--admin-text-muted)", fontWeight: 600 }}>{d.orders}</div>
                          <div
                            style={{
                              width: "100%",
                              height: `${Math.max(4, (d.orders / maxOrders) * 160)}px`,
                              background: "linear-gradient(to top, var(--admin-primary), #ff6b6b)",
                              borderRadius: "4px 4px 0 0",
                              transition: "height 0.3s",
                              cursor: "pointer",
                              position: "relative",
                            }}
                            title={`${d.date}: ${d.orders} orders, Rs.${Number(d.revenue).toLocaleString()}`}
                          />
                          <div style={{ fontSize: 9, color: "var(--admin-text-muted)", transform: "rotate(-45deg)", transformOrigin: "top left", whiteSpace: "nowrap", marginTop: 4 }}>
                            {new Date(d.date).toLocaleDateString("en", { month: "short", day: "numeric" })}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 8, fontSize: 12, color: "var(--admin-text-muted)", textAlign: "center" }}>
                      Hover bars for details • Red bars = order count
                    </div>
                  </div>
                ) : (
                  <div className="empty-state"><div className="empty-state-icon">📈</div><div className="empty-state-text">No data for this period</div></div>
                )}
              </div>
            </div>

            {/* Top Restaurants */}
            <div className="admin-card">
              <div className="admin-card-header">
                <h3 className="admin-card-title">🏆 Top Restaurants</h3>
              </div>
              <div className="admin-card-body" style={{ padding: 0 }}>
                <table className="admin-table">
                  <thead><tr><th>Restaurant</th><th>Orders</th><th>Revenue</th></tr></thead>
                  <tbody>
                    {(data?.topRestaurants || []).map((r, i) => (
                      <tr key={i}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ width: 22, height: 22, borderRadius: "50%", background: i === 0 ? "#fef3c7" : i === 1 ? "#f3f4f6" : "#ffedd5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
                              {i + 1}
                            </span>
                            {r.name}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{ height: 8, width: `${(r.order_count / maxRestOrders) * 80}px`, background: "var(--admin-primary)", borderRadius: 4 }} />
                            <span>{r.order_count}</span>
                          </div>
                        </td>
                        <td>Rs. {Number(r.revenue).toLocaleString()}</td>
                      </tr>
                    ))}
                    {!data?.topRestaurants?.length && (
                      <tr><td colSpan={3}><div className="empty-state" style={{ padding: 20 }}><div className="empty-state-text">No data</div></div></td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Menu Items */}
            <div className="admin-card">
              <div className="admin-card-header">
                <h3 className="admin-card-title">🍔 Top Menu Items</h3>
              </div>
              <div className="admin-card-body" style={{ padding: 0 }}>
                <table className="admin-table">
                  <thead><tr><th>Item</th><th>Restaurant</th><th>Ordered</th></tr></thead>
                  <tbody>
                    {(data?.topMenuItems || []).map((item, i) => (
                      <tr key={i}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>{i + 1}</span>
                            {item.name}
                          </div>
                        </td>
                        <td style={{ fontSize: 12, color: "var(--admin-text-muted)" }}>{item.restaurant_name}</td>
                        <td><span className="badge badge-info">{item.total_ordered}x</span></td>
                      </tr>
                    ))}
                    {!data?.topMenuItems?.length && (
                      <tr><td colSpan={3}><div className="empty-state" style={{ padding: 20 }}><div className="empty-state-text">No data</div></div></td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Revenue by Payment Method */}
            <div className="admin-card full-width">
              <div className="admin-card-header">
                <h3 className="admin-card-title">💳 Revenue by Payment Method</h3>
              </div>
              <div className="admin-card-body">
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  {(data?.revenueByPayment || []).map((p) => (
                    <div key={p.method} style={{ flex: "1 1 200px", background: "#f8fafc", borderRadius: 10, padding: "16px 20px", border: "1px solid var(--admin-border)" }}>
                      <div style={{ fontSize: 28, marginBottom: 8 }}>{p.method === "stripe" ? "💳" : "💵"}</div>
                      <div style={{ fontWeight: 700, fontSize: 18, textTransform: "capitalize" }}>{p.method || "COD"}</div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: "var(--admin-primary)", margin: "6px 0" }}>
                        Rs. {Number(p.revenue).toLocaleString()}
                      </div>
                      <div style={{ fontSize: 13, color: "var(--admin-text-muted)" }}>{p.count} orders</div>
                    </div>
                  ))}
                  {!data?.revenueByPayment?.length && (
                    <div className="empty-state"><div className="empty-state-text">No payment data</div></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
