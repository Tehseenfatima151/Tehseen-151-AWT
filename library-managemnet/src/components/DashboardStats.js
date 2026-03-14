import React from "react";

const statCards = [
  {
    title: "Total Books",
    valueKey: "totalBooks",
    icon: "📚",
    iconBg: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
    iconColor: "#fff",
  },
  {
    title: "Total Members",
    valueKey: "totalMembers",
    icon: "👥",
    iconBg: "linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)",
    iconColor: "#fff",
  },
  {
    title: "Borrowed",
    valueKey: "borrowedCount",
    icon: "📤",
    iconBg: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
    iconColor: "#fff",
  },
  {
    title: "Available Copies",
    valueKey: "availableCount",
    icon: "✅",
    iconBg: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
    iconColor: "#fff",
  },
  {
    title: "Overdue Books",
    valueKey: "overdueCount",
    icon: "⚠️",
    iconBg: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
    iconColor: "#fff",
  },
];

const DashboardStats = ({ stats }) => {
  return (
    <div className="row g-3 g-md-4">
      {statCards.map((card) => (
        <div key={card.valueKey} className="col-12 col-sm-6 col-lg-4 col-xl-3">
          <div className="card stat-card h-100 border-0">
            <div className="card-body d-flex align-items-center">
              <div
                className="stat-icon-wrap me-3 flex-shrink-0"
                style={{
                  background: card.iconBg,
                  color: card.iconColor,
                }}
              >
                {card.icon}
              </div>
              <div className="flex-grow-1 min-w-0">
                <p className="stat-label mb-0">{card.title}</p>
                <p className="stat-value mb-0 mt-1">
                  {stats[card.valueKey] ?? 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
