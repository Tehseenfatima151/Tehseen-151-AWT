import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const NAV_ITEMS = [
  { to: "/admin",              label: "Dashboard",      icon: "🏠", end: true },
  { to: "/admin/restaurants",  label: "Restaurants",    icon: "🍽️" },
  { to: "/admin/menu",         label: "Menu Items",     icon: "📋" },
  { to: "/admin/orders",       label: "Orders",         icon: "📦" },
  { to: "/admin/order-assign", label: "Assign Riders",  icon: "🚚" },
  { to: "/admin/riders",       label: "Riders",         icon: "🏍️" },
  { to: "/admin/users",        label: "Users",          icon: "👥" },
  { to: "/admin/deals",        label: "Deals",          icon: "🏷️" },
  { to: "/admin/top-shops",    label: "Top Shops",      icon: "⭐" },
  { to: "/admin/home-chefs",   label: "Home Chefs",     icon: "👨‍🍳" },
  { to: "/admin/brands",       label: "Top Brands",     icon: "🏆" },
  { to: "/admin/analytics",    label: "Analytics",      icon: "📊" },
];

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <div className="admin-shell">
      {/* Sidebar */}
      <aside className={`admin-sidebar${sidebarOpen ? "" : " collapsed"}`}>
        <div className="sidebar-brand">
          <span className="brand-logo">🍕</span>
          {sidebarOpen && <span className="brand-name">Foodify Admin</span>}
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <span className="nav-icon">{item.icon}</span>
              {sidebarOpen && <span className="nav-label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          {sidebarOpen && (
            <div className="admin-user-info">
              <div className="admin-avatar">
                {user?.name?.charAt(0)?.toUpperCase() || "A"}
              </div>
              <div>
                <div className="admin-user-name">{user?.name}</div>
                <div className="admin-user-role">Administrator</div>
              </div>
            </div>
          )}
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            <span>🚪</span>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="admin-main" style={{ marginLeft: sidebarOpen ? "var(--admin-sidebar-width)" : "var(--admin-sidebar-collapsed)" }}>
        {/* Top navbar */}
        <header className="admin-topbar">
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Toggle sidebar"
          >
            <span className="hamburger-icon">☰</span>
          </button>
          <div className="topbar-title">Foodify Admin Panel</div>
          <div className="topbar-right">
            <span className="topbar-badge">Admin</span>
            <span className="topbar-user">{user?.email}</span>
          </div>
        </header>

        {/* Page content */}
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
