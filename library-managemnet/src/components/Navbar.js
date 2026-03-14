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

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
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

  const navLinks = [
    { path: "/", label: "Dashboard" },
    { path: "/books", label: "Books" },
    { path: "/members", label: "Members" },
    { path: "/borrowed-books", label: "Borrowed Books" },
  ];

  return (
    <nav className="navbar navbar-expand-lg navbar-app">
      <div className="container-fluid navbar-app-container">
        <Link className="navbar-brand d-flex align-items-center gap-3" to="/">
          {!logoFailed ? (
            <img
              key={logoUrl}
              src={logoUrl}
              alt="Comsats"
              className="navbar-logo"
              onError={handleLogoError}
              style={{ height: 42, width: "auto", objectFit: "contain" }}
            />
          ) : (
            <span className="brand-icon">📚</span>
          )}
          <span className="navbar-brand-text">Biblionex – Smart Library Management System</span>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className={`collapse navbar-collapse ${isOpen ? "show" : ""}`}>
          <ul className="navbar-nav ms-auto gap-1">
            {navLinks.map((link) => (
              <li className="nav-item" key={link.path}>
                <Link
                  className={`nav-link ${location.pathname === link.path ? "active" : ""}`}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
