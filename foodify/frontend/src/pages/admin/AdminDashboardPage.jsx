import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import { fetchDashboardStats } from "../../api/adminApi";

const STATUS_BADGE = {
  pending:   "badge-warning",
  accepted:  "badge-info",
  preparing: "badge-purple",
  ready:     "badge-success",
  completed: "badge-success",
  rejected:  "badge-danger",
};

/* ── Smooth SVG Line + Area Chart ─────────────────────────────────────────── */
function RevenueLineChart({ data }) {
  // Debug: log what we receive
  console.log("[RevenueLineChart] data:", data);

  if (!data?.length) return (
    <div className="chart-empty">
      <span>📈</span>
      <p>No revenue data yet — make sure backend is restarted</p>
    </div>
  );

  const W = 700, H = 220, PAD = { top: 20, right: 20, bottom: 48, left: 64 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const revenues = data.map((d) => Number(d.revenue));
  const maxRev   = Math.max(...revenues, 1);
  const minRev   = 0;

  const xStep = innerW / Math.max(data.length - 1, 1);

  const pts = data.map((d, i) => ({
    x: PAD.left + i * xStep,
    y: PAD.top + innerH - ((Number(d.revenue) - minRev) / (maxRev - minRev)) * innerH,
    label: d.label,
    revenue: Number(d.revenue),
    orders: Number(d.orders),
  }));

  // Smooth bezier path
  const linePath = pts.reduce((acc, pt, i) => {
    if (i === 0) return `M ${pt.x},${pt.y}`;
    const prev = pts[i - 1];
    const cpx = (prev.x + pt.x) / 2;
    return `${acc} C ${cpx},${prev.y} ${cpx},${pt.y} ${pt.x},${pt.y}`;
  }, "");

  const areaPath = `${linePath} L ${pts[pts.length - 1].x},${PAD.top + innerH} L ${pts[0].x},${PAD.top + innerH} Z`;

  // Y-axis ticks
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
    y: PAD.top + innerH - t * innerH,
    val: Math.round(maxRev * t),
  }));

  const [tooltip, setTooltip] = useState(null);

  return (
    <div className="chart-svg-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#d70f64" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#d70f64" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#ff6eb4" />
            <stop offset="100%" stopColor="#d70f64" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Grid lines */}
        {yTicks.map((t) => (
          <g key={t.val}>
            <line x1={PAD.left} y1={t.y} x2={W - PAD.right} y2={t.y}
              stroke="#f0d6e4" strokeWidth="1" strokeDasharray="4,4" />
            <text x={PAD.left - 8} y={t.y + 4} textAnchor="end"
              fontSize="10" fill="#8a5070" fontFamily="Inter,sans-serif">
              {t.val >= 1000 ? `${(t.val / 1000).toFixed(0)}k` : t.val}
            </text>
          </g>
        ))}

        {/* Area fill */}
        <path d={areaPath} fill="url(#revGrad)" />

        {/* Line */}
        <path d={linePath} fill="none" stroke="url(#lineGrad)"
          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          filter="url(#glow)" />

        {/* Data points + labels */}
        {pts.map((pt, i) => (
          <g key={i}
            onMouseEnter={() => setTooltip(pt)}
            onMouseLeave={() => setTooltip(null)}
            style={{ cursor: "pointer" }}>
            <circle cx={pt.x} cy={pt.y} r="14" fill="transparent" />
            <circle cx={pt.x} cy={pt.y} r="4" fill="#d70f64"
              stroke="#fff" strokeWidth="2" filter="url(#glow)" />
            {/* X-axis label */}
            <text x={pt.x} y={H - 8} textAnchor="middle"
              fontSize="9" fill="#8a5070" fontFamily="Inter,sans-serif"
              transform={`rotate(-35, ${pt.x}, ${H - 8})`}>
              {pt.label?.replace(" 20", " '")}
            </text>
          </g>
        ))}

        {/* Tooltip */}
        {tooltip && (() => {
          const tx = Math.min(Math.max(tooltip.x - 55, 4), W - 120);
          const ty = Math.max(tooltip.y - 68, 4);
          return (
            <g>
              <rect x={tx} y={ty} width="115" height="58"
                rx="8" fill="#1a0a10" opacity="0.92" />
              <text x={tx + 10} y={ty + 16} fontSize="10" fill="#ff6eb4"
                fontWeight="700" fontFamily="Inter,sans-serif">
                {tooltip.label}
              </text>
              <text x={tx + 10} y={ty + 32} fontSize="11" fill="#fff"
                fontFamily="Inter,sans-serif">
                Rs. {tooltip.revenue.toLocaleString()}
              </text>
              <text x={tx + 10} y={ty + 48} fontSize="10" fill="#c9a0b4"
                fontFamily="Inter,sans-serif">
                {tooltip.orders} orders
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}

/* ── Bar Chart (orders per month) ─────────────────────────────────────────── */
function OrdersBarChart({ data }) {
  if (!data?.length) return (
    <div className="chart-empty"><span>📊</span><p>No order data yet</p></div>
  );

  const maxOrders = Math.max(...data.map((d) => Number(d.orders)), 1);
  const [hovered, setHovered] = useState(null);

  return (
    <div className="bar-chart-wrap">
      {data.map((d, i) => {
        const pct = (Number(d.orders) / maxOrders) * 100;
        const isHov = hovered === i;
        return (
          <div key={i} className="bar-col"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}>
            {isHov && (
              <div className="bar-tooltip">
                <div className="bar-tooltip-label">{d.label}</div>
                <div className="bar-tooltip-val">{d.orders} orders</div>
                <div className="bar-tooltip-rev">Rs. {Number(d.revenue).toLocaleString()}</div>
              </div>
            )}
            <div className="bar-track">
              <div className="bar-fill" style={{ height: `${Math.max(pct, 3)}%` }} />
            </div>
            <div className="bar-label">{d.label?.split(" ")[0]}</div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Donut Chart (order status) ───────────────────────────────────────────── */
function StatusDonut({ data }) {
  if (!data?.length) return (
    <div className="chart-empty"><span>🍩</span><p>No data</p></div>
  );

  const COLORS = {
    pending:   "#f59e0b",
    accepted:  "#3b82f6",
    preparing: "#8b5cf6",
    ready:     "#10b981",
    completed: "#d70f64",
    rejected:  "#ef4444",
  };

  const total = data.reduce((s, d) => s + Number(d.count), 0);
  const R = 60, CX = 80, CY = 80, stroke = 22;
  const circumference = 2 * Math.PI * R;

  let offset = 0;
  const slices = data.map((d) => {
    const pct = Number(d.count) / total;
    const dash = pct * circumference;
    const slice = { ...d, pct, dash, offset, color: COLORS[d.status] || "#ccc" };
    offset += dash;
    return slice;
  });

  const [hov, setHov] = useState(null);

  return (
    <div className="donut-wrap">
      <svg viewBox="0 0 160 160" width="160" height="160" style={{ flexShrink: 0 }}>
        <circle cx={CX} cy={CY} r={R} fill="none"
          stroke="#fce4ef" strokeWidth={stroke} />
        {slices.map((s, i) => (
          <circle key={i} cx={CX} cy={CY} r={R} fill="none"
            stroke={s.color} strokeWidth={hov === i ? stroke + 4 : stroke}
            strokeDasharray={`${s.dash} ${circumference - s.dash}`}
            strokeDashoffset={-s.offset + circumference * 0.25}
            strokeLinecap="butt"
            style={{ cursor: "pointer", transition: "stroke-width 0.15s" }}
            onMouseEnter={() => setHov(i)}
            onMouseLeave={() => setHov(null)}
          />
        ))}
        <text x={CX} y={CY - 6} textAnchor="middle" fontSize="18"
          fontWeight="800" fill="#1a0a10" fontFamily="Inter,sans-serif">
          {total}
        </text>
        <text x={CX} y={CY + 12} textAnchor="middle" fontSize="9"
          fill="#8a5070" fontFamily="Inter,sans-serif">
          TOTAL
        </text>
      </svg>
      <div className="donut-legend">
        {slices.map((s, i) => (
          <div key={i} className={`donut-item ${hov === i ? "hov" : ""}`}
            onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}>
            <span className="donut-dot" style={{ background: s.color }} />
            <span className="donut-name">{s.status}</span>
            <span className="donut-count">{s.count}</span>
            <span className="donut-pct">{(s.pct * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Top Restaurants Mini Bar ─────────────────────────────────────────────── */
function TopRestaurantsChart({ data }) {
  if (!data?.length) return (
    <div className="chart-empty"><span>🏆</span><p>No data</p></div>
  );
  const maxRev = Math.max(...data.map((d) => Number(d.revenue)), 1);
  return (
    <div className="top-rest-list">
      {data.map((r, i) => {
        const pct = (Number(r.revenue) / maxRev) * 100;
        const medals = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];
        return (
          <div key={i} className="top-rest-row">
            <span className="top-rest-medal">{medals[i]}</span>
            <div className="top-rest-info">
              <div className="top-rest-name">{r.name}</div>
              <div className="top-rest-bar-track">
                <div className="top-rest-bar-fill"
                  style={{ width: `${pct}%`, opacity: 1 - i * 0.12 }} />
              </div>
            </div>
            <div className="top-rest-rev">
              <div className="top-rest-rev-val">Rs. {Number(r.revenue).toLocaleString()}</div>
              <div className="top-rest-rev-orders">{r.orders} orders</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Main Dashboard Page ──────────────────────────────────────────────────── */
export default function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    setError("");
    fetchDashboardStats()
      .then((r) => {
        console.log("[Dashboard] API response keys:", Object.keys(r.data));
        console.log("[Dashboard] monthlyRevenue:", r.data.monthlyRevenue);
        console.log("[Dashboard] statusBreakdown:", r.data.statusBreakdown);
        console.log("[Dashboard] topRestaurants:", r.data.topRestaurants);
        setData(r.data);
      })
      .catch((e) => setError(e.response?.data?.message || "Failed to load stats"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const stats = data?.stats || {};

  const STAT_CARDS = [
    { label: "Total Customers",   value: stats.totalCustomers,   icon: "👥", color: "blue" },
    { label: "Total Restaurants", value: stats.totalRestaurants, icon: "🍽️", color: "red" },
    { label: "Total Orders",      value: stats.totalOrders,      icon: "📦", color: "green" },
    { label: "Active Deals",      value: stats.activeDeals,      icon: "🏷️", color: "orange" },
    { label: "Home Chefs",        value: stats.homeChefs,        icon: "👨‍🍳", color: "purple" },
    { label: "Top Shops",         value: stats.topShops,         icon: "⭐", color: "yellow" },
    { label: "Pending Orders",    value: stats.pendingOrders,    icon: "⏳", color: "pink" },
    {
      label: "Total Revenue",
      value: `Rs. ${Number(stats.totalRevenue || 0).toLocaleString()}`,
      icon: "💰",
      color: "teal",
    },
  ];

  return (
    <AdminLayout>
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">📊 Dashboard</h1>
          <p className="admin-page-subtitle">Welcome back! Here's what's happening on Foodify.</p>
        </div>
        <button className="btn btn-primary" onClick={load}>🔄 Refresh</button>
      </div>

      {error && <div className="admin-alert error">⚠️ {error}</div>}

      {loading ? (
        <div className="admin-loading"><div className="spin" /> Loading dashboard...</div>
      ) : (
        <>
          {/* ── Stat Cards ── */}
          <div className="stats-grid">
            {STAT_CARDS.map((card) => (
              <div className="stat-card" key={card.label}>
                <div className={`stat-icon ${card.color}`}>{card.icon}</div>
                <div>
                  <div className="stat-value">{card.value ?? 0}</div>
                  <div className="stat-label">{card.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Revenue Line Chart (full width) ── */}
          <div className="admin-card db-chart-card" style={{ marginBottom: 20 }}>
            <div className="admin-card-header">
              <div>
                <h3 className="admin-card-title">💰 Monthly Revenue</h3>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--admin-text-muted)" }}>
                  Last 12 months — hover points for details
                </p>
              </div>
              <div className="chart-total-badge">
                Rs. {Number(stats.totalRevenue || 0).toLocaleString()}
                <span>All time</span>
              </div>
            </div>
            <div className="admin-card-body" style={{ padding: "16px 20px 8px" }}>
              <RevenueLineChart data={data?.monthlyRevenue} />
            </div>
          </div>

          {/* ── Orders Bar + Donut row ── */}
          <div className="db-two-col" style={{ marginBottom: 20 }}>
            {/* Orders per month bar */}
            <div className="admin-card db-chart-card">
              <div className="admin-card-header">
                <div>
                  <h3 className="admin-card-title">📦 Orders per Month</h3>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--admin-text-muted)" }}>
                    Last 12 months
                  </p>
                </div>
                <span className="chart-total-badge" style={{ fontSize: 18 }}>
                  {stats.totalOrders}
                  <span>total</span>
                </span>
              </div>
              <div className="admin-card-body">
                <OrdersBarChart data={data?.monthlyRevenue} />
              </div>
            </div>

            {/* Status donut */}
            <div className="admin-card db-chart-card">
              <div className="admin-card-header">
                <div>
                  <h3 className="admin-card-title">🍩 Order Status</h3>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--admin-text-muted)" }}>
                    All time breakdown
                  </p>
                </div>
              </div>
              <div className="admin-card-body">
                <StatusDonut data={data?.statusBreakdown} />
              </div>
            </div>
          </div>

          {/* ── Top Restaurants + Quick Actions row ── */}
          <div className="db-two-col" style={{ marginBottom: 20 }}>
            <div className="admin-card db-chart-card">
              <div className="admin-card-header">
                <h3 className="admin-card-title">🏆 Top Restaurants by Revenue</h3>
              </div>
              <div className="admin-card-body">
                <TopRestaurantsChart data={data?.topRestaurants} />
              </div>
            </div>

            <div className="admin-card db-chart-card">
              <div className="admin-card-header">
                <h3 className="admin-card-title">⚡ Quick Actions</h3>
              </div>
              <div className="admin-card-body">
                <div className="quick-actions-grid">
                  {[
                    { label: "Add Restaurant", path: "/admin/restaurants", icon: "🍽️", desc: "Create new listing" },
                    { label: "View Orders",    path: "/admin/orders",      icon: "📦", desc: "Track all orders" },
                    { label: "Manage Deals",   path: "/admin/deals",       icon: "🏷️", desc: "Feature deals" },
                    { label: "Manage Users",   path: "/admin/users",       icon: "👥", desc: "Block / unblock" },
                    { label: "Top Brands",     path: "/admin/brands",      icon: "🏆", desc: "Edit brand logos" },
                    { label: "Analytics",      path: "/admin/analytics",   icon: "📊", desc: "Deep insights" },
                  ].map((a) => (
                    <button key={a.path} className="quick-action-btn"
                      onClick={() => navigate(a.path)}>
                      <span className="qa-icon">{a.icon}</span>
                      <span className="qa-label">{a.label}</span>
                      <span className="qa-desc">{a.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Recent Orders table ── */}
          <div className="admin-card" style={{ marginBottom: 20 }}>
            <div className="admin-card-header">
              <h3 className="admin-card-title">🕐 Recent Orders</h3>
              <button className="btn btn-sm btn-secondary" onClick={() => navigate("/admin/orders")}>
                View All →
              </button>
            </div>
            <div className="admin-table-wrap" style={{ border: "none", boxShadow: "none" }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#ID</th><th>Customer</th><th>Restaurant</th>
                    <th>Amount</th><th>Payment</th><th>Status</th><th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.recentOrders || []).map((o) => (
                    <tr key={o.id}>
                      <td><strong>#{o.id}</strong></td>
                      <td>{o.customer_name}</td>
                      <td>{o.restaurant_name}</td>
                      <td><strong>Rs. {Number(o.total_price).toLocaleString()}</strong></td>
                      <td><span className="badge badge-gray">{o.payment_method || "COD"}</span></td>
                      <td>
                        <span className={`badge ${STATUS_BADGE[o.status] || "badge-gray"}`}>
                          {o.status}
                        </span>
                      </td>
                      <td style={{ color: "var(--admin-text-muted)", fontSize: 12 }}>
                        {new Date(o.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {!data?.recentOrders?.length && (
                    <tr><td colSpan={7} style={{ textAlign: "center", color: "var(--admin-text-muted)", padding: 28 }}>
                      No orders yet
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Recent Restaurants ── */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h3 className="admin-card-title">🍽️ Recent Restaurant Registrations</h3>
              <button className="btn btn-sm btn-secondary" onClick={() => navigate("/admin/restaurants")}>
                View All →
              </button>
            </div>
            <div className="admin-table-wrap" style={{ border: "none", boxShadow: "none" }}>
              <table className="admin-table">
                <thead>
                  <tr><th>#ID</th><th>Restaurant</th><th>Owner</th><th>Email</th><th>Category</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {(data?.recentRestaurants || []).map((r) => (
                    <tr key={r.id}>
                      <td><strong>#{r.id}</strong></td>
                      <td>{r.name}</td>
                      <td>{r.owner_name}</td>
                      <td style={{ color: "var(--admin-text-muted)" }}>{r.owner_email}</td>
                      <td>{r.category || <span style={{ color: "var(--admin-text-muted)" }}>—</span>}</td>
                      <td>
                        <span className={`badge ${r.is_active ? "badge-success" : "badge-danger"}`}>
                          {r.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {!data?.recentRestaurants?.length && (
                    <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--admin-text-muted)", padding: 28 }}>
                      No restaurants yet
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
