import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { fetchAdminUsers, toggleUserBlock } from "../../api/adminApi";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [alert, setAlert] = useState(null);

  const load = () => {
    setLoading(true);
    fetchAdminUsers({ search, role: filterRole })
      .then((r) => setUsers(r.data))
      .catch(() => setAlert({ type: "error", msg: "Failed to load users" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search, filterRole]);

  const handleToggleBlock = async (id, name, isBlocked) => {
    const action = isBlocked ? "unblock" : "block";
    if (!window.confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} user "${name}"?`)) return;
    try {
      const r = await toggleUserBlock(id);
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, is_blocked: r.data.is_blocked } : u));
      setAlert({ type: "success", msg: `User ${action}ed successfully` });
    } catch {
      setAlert({ type: "error", msg: "Failed to update user" });
    }
  };

  const customers = users.filter((u) => u.role === "customer").length;
  const restaurants = users.filter((u) => u.role === "restaurant").length;
  const blocked = users.filter((u) => u.is_blocked).length;

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">👥 Users</h1>
          <p className="admin-page-subtitle">Manage all platform users</p>
        </div>
      </div>

      {alert && <div className={`admin-alert ${alert.type}`} onClick={() => setAlert(null)}>{alert.type === "success" ? "✅" : "⚠️"} {alert.msg}</div>}

      {/* Summary */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        {[
          { label: "Total Users", value: users.length, icon: "👥", color: "blue" },
          { label: "Customers", value: customers, icon: "🛒", color: "green" },
          { label: "Restaurants", value: restaurants, icon: "🍽️", color: "orange" },
          { label: "Blocked", value: blocked, icon: "🚫", color: "red" },
        ].map((s) => (
          <div className="stat-card" key={s.label}>
            <div className={`stat-icon ${s.color}`}>{s.icon}</div>
            <div><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>

      <div className="admin-toolbar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="filter-select" value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
          <option value="">All Roles</option>
          <option value="customer">Customers</option>
          <option value="restaurant">Restaurants</option>
        </select>
      </div>

      {loading ? (
        <div className="admin-loading"><div className="spin" /> Loading...</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>#ID</th><th>Name</th><th>Email</th><th>Role</th><th>Restaurant</th><th>Joined</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td><strong>#{u.id}</strong></td>
                  <td>{u.name}</td>
                  <td style={{ color: "var(--admin-text-muted)" }}>{u.email}</td>
                  <td>
                    <span className={`badge ${u.role === "customer" ? "badge-info" : "badge-orange"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>{u.restaurant_name || <span style={{ color: "var(--admin-text-muted)" }}>—</span>}</td>
                  <td style={{ fontSize: 12, color: "var(--admin-text-muted)" }}>
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <span className={`badge ${u.is_blocked ? "badge-danger" : "badge-success"}`}>
                      {u.is_blocked ? "Blocked" : "Active"}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`btn btn-sm ${u.is_blocked ? "btn-success" : "btn-danger"}`}
                      onClick={() => handleToggleBlock(u.id, u.name, u.is_blocked)}
                    >
                      {u.is_blocked ? "✅ Unblock" : "🚫 Block"}
                    </button>
                  </td>
                </tr>
              ))}
              {!users.length && (
                <tr><td colSpan={8}><div className="empty-state"><div className="empty-state-icon">👥</div><div className="empty-state-text">No users found</div></div></td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
