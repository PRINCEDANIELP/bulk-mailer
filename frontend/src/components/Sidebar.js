import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const { username, logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="brand" style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          fill="currentColor"
          viewBox="0 0 24 24"
          style={{ color: "var(--rust)" }}
        >
          <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m-8.61 10.79c.18.14.4.21.61.21s.43-.07.61-.21l1.55-1.21L18.58 18H5.41l4.42-4.42 1.55 1.21ZM20 6v.51l-8 6.22-8-6.22V6zm0 3.04v7.54l-4.24-4.24zm-11.76 3.3L4 16.58V9.04zM20 18"></path>
        </svg>
        <span>Bulk Mailer</span>
      </div>
      <div className="brand-sub">BULK MAIL LEDGER</div>

      <nav>
        <NavLink to="/send" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
          Send mail
        </NavLink>
        <NavLink to="/history" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
          History
        </NavLink>
      </nav>

      <div className="signed-in">
        Signed in as <strong>{username}</strong>
        <div>
          <button className="logout-btn" onClick={logout}>
            Log out
          </button>
        </div>
      </div>
    </aside>
  );
}
