import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const LOGO_OPTIONS = [
  "/comsats-logo.png",
  "/comsats-logo.jpg",
  "/comsats%20logo.png",
  "/comsats%20logo.jpg",
  "/comsats_logo.png",
  "/logo.png",
];

const Sidebar = () => {
  const [logoIndex, setLogoIndex] = useState(0);
  const [logoFailed, setLogoFailed] = useState(false);
  const location = useLocation();

  const logoUrl = process.env.PUBLIC_URL + LOGO_OPTIONS[logoIndex];

  const handleLogoError = () => {
    if (logoIndex < LOGO_OPTIONS.length - 1) {
      setLogoIndex((i) => i + 1);
    } else {
      setLogoFailed(true);
    }
  };

  const links = [
    { path: "/", label: "Dashboard", icon: "📊" },
    { path: "/books", label: "Books", icon: "📖" },
    { path: "/members", label: "Members", icon: "👥" },
    { path: "/borrowed-books", label: "Borrowed Books", icon: "🔄" },
  ];

  return (
    <aside className="sidebar sidebar-app d-none d-md-flex flex-column">
      <div className="sidebar-brand">
        <Link to="/" className="d-flex align-items-center gap-2">
          {!logoFailed ? (
            <img
              key={logoUrl}
              src={logoUrl}
              alt="Comsats"
              onError={handleLogoError}
              style={{ height: 34, width: "auto", objectFit: "contain", flexShrink: 0 }}
            />
          ) : (
            <span className="brand-icon">📚</span>
          )}
          <span>Biblionex</span>
        </Link>
      </div>
      <nav className="flex-grow-1">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`nav-link-side ${location.pathname === link.path ? "active" : ""}`}
          >
            <span className="nav-icon">{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
