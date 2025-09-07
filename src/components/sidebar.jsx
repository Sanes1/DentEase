// src/components/Sidebar.jsx
import React from "react";
import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="clinic-brand">
          <img src="/logo.png" alt="icon" className="brand-icon" />
          <span className="brand-name">Fano Dental Clinic</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        <Link to="/" className="nav-item">Dashboard</Link>
        <Link to="/appointments" className="nav-item">Appointments</Link>
        <Link to="/patients" className="nav-item">Patients</Link>
        <Link to="/messages" className="nav-item">Messages</Link>
        <Link to="/feedback" className="nav-item">Feedback</Link>
        <Link to="/analytics" className="nav-item">Analytics</Link>
      </nav>
    </aside>
  );
};

export default Sidebar;
