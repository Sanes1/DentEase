import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

// Sidebar Icons
import dashboardIcon from '../assets/dashboard.png'; 
import appointmentIcon from '../assets/appointment.png'; 
import patientIcon from '../assets/patient.png'; 
import messageIcon from '../assets/message.png';
import feedbackIcon from '../assets/feedback.png'; 
import analyticsIcon from '../assets/analytics.png'; 
import settingsIcon from '../assets/setting.png';  
import logoutIcon from '../assets/logout.png';
import denteaseIcon from '../assets/dentease.png';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [analyticsData, setAnalyticsData] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('Today'); // Today, This Week, This Month, This Year
  const navigate = useNavigate();

  // === Fetch appointments from Firebase ===
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "appointments"));
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAppointments(data);

       /* ---------- REPLACED uniquePatients WITH patients-lastAppointment-per-service LOGIC ---------- */
       // Build patients list allowing same name+date but different service to be separate rows
       const patientMap = new Map();

       data.forEach(appt => {
         const name = appt.userName;
         // prefer appointmentDate, fallback to date
         const dateValue = appt.appointmentDate || appt.date;
         // normalize date string for grouping/display
         const dateStr = dateValue ? new Date(dateValue).toLocaleDateString() : '';
         // normalize services to a string (handles array or string)
         const services = appt.services
           ? (Array.isArray(appt.services) ? appt.services.join(", ") : String(appt.services))
           : '-';

         // skip entries without a name
         if (!name) return;

         // Use combo key: name + date + services — this allows same name+date but different service to be separate
         const key = `${name}__${dateStr}__${services}`;

         if (!patientMap.has(key)) {
           patientMap.set(key, {
             id: appt.id,
             userName: name,
             services,
             lastAppointmentDate: dateValue ? new Date(dateValue) : new Date(0),
           });
         } else {
           // if duplicate exact key exists, keep the one with later time if you want — currently we ignore duplicates
         }
       });

       // Convert to array, sort by newest lastAppointmentDate first, and format lastAppointment for display
       const patientsList = Array.from(patientMap.values())
         .sort((a, b) => new Date(b.lastAppointmentDate) - new Date(a.lastAppointmentDate))
         .map(p => ({
           id: p.id,
           userName: p.userName,
           services: p.services,
           lastAppointment: p.lastAppointmentDate instanceof Date && p.lastAppointmentDate.getTime() !== 0
             ? p.lastAppointmentDate.toLocaleDateString()
             : '',
         }));

       setPatients(patientsList);
       /* ---------- END patients-lastAppointment-per-service LOGIC ---------- */

        // Compute analytics
        computeAnalytics(data, selectedFilter);

      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };

    fetchAppointments();
  }, []);

  // === Compute analytics based on filter ===
  const computeAnalytics = (data, filter) => {
    const stats = {};
    const now = new Date();

    const filtered = data.filter(appt => {
      const apptDate = new Date(appt.appointmentDate || appt.date);
      if (filter === 'Today') {
        return apptDate.toDateString() === now.toDateString();
      } else if (filter === 'This Week') {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return apptDate >= weekStart && apptDate <= weekEnd;
      } else if (filter === 'This Month') {
        return apptDate.getMonth() === now.getMonth() && apptDate.getFullYear() === now.getFullYear();
      } else if (filter === 'This Year') {
        return apptDate.getFullYear() === now.getFullYear();
      }
      return true;
    });

    filtered.forEach(appt => {
      const dateObj = new Date(appt.appointmentDate || appt.date);
      const monthYear = dateObj.toLocaleString('default', { month: 'short' }) + ' ' + dateObj.getFullYear();
      stats[monthYear] = (stats[monthYear] || 0) + 1;
    });

    const statsArray = Object.keys(stats).map(monthYear => ({
      month: monthYear,
      appointments: stats[monthYear]
    }));

    setAnalyticsData(statsArray.length ? statsArray : [{ month: 'N/A', appointments: 0 }]);
  };

  const handleFilterChange = (e) => {
    const filter = e.target.value;
    setSelectedFilter(filter);
    computeAnalytics(appointments, filter);
  };

  // === Update appointment status in Firestore & local state ===
  const updateAppointmentStatus = async (id, newStatus) => {
    try {
      const apptRef = doc(db, "appointments", id);
      await updateDoc(apptRef, { status: newStatus });

      // Update local state so the UI reflects the change immediately
      setAppointments(prev =>
        prev.map(appt =>
          appt.id === id ? { ...appt, status: newStatus } : appt
        )
      );

      // Optionally, recompute patients/analytics if needed:
      // (if you want to reflect status-based filters in analytics/patients)
      // computeAnalytics(appointments.map(a => a.id === id ? { ...a, status: newStatus } : a), selectedFilter);

    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="dashboard-content">
            {/* Stats Cards */}
            <div className="stats-grid">
              <div className="stat-card">
                <p className="stat-number">{appointments.length}</p>
                <div className="stat-label">
                  <img src={appointmentIcon} alt="Appointments Icon" className="stat-icon" />
                  <span>Appointments Today</span>
                </div>
              </div>
              <div className="stat-card">
                <p className="stat-number">3</p>
                <div className="stat-label">
                  <img src={feedbackIcon} alt="Cancelled Icon" className="stat-icon" />
                  <span>Cancelled Appointments</span>
                </div>
              </div>
              <div className="stat-card">
                <p className="stat-number">5</p>
                <div className="stat-label">
                  <img src={settingsIcon} alt="Pending Icon" className="stat-icon" />
                  <span>Pending Approval</span>
                </div>
              </div>
              <div className="stat-card">
                <p className="stat-number">4.8⭐</p>
                <div className="stat-label">
                  <img src={analyticsIcon} alt="Rating Icon" className="stat-icon" />
                  <span>Rating</span>
                </div>
              </div>
            </div>

            {/* Analytics Chart */}
            <div className="analytics-card">
              <div className="card-header">
                <h3>Number of Appointments</h3>
                <select className="filter-select" value={selectedFilter} onChange={handleFilterChange}>
                  <option>Today</option>
                  <option>This Week</option>
                  <option>This Month</option>
                  <option>This Year</option>
                </select>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="appointments" fill="#4caf50" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Upcoming Appointments Table */}
            <div className="appointments-card">
              <div className="card-header">
                <h3>Upcoming Appointments</h3>
                <select className="filter-select">
                  <option>All</option>
                  <option>Today</option>
                  <option>This Week</option>
                </select>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Patient Name</th>
                    <th>Service</th>
                    <th>Date</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map(appt => (
                    <tr key={appt.id}>
                      <td>{appt.userName}</td>
                      <td>{appt.services ? appt.services.join(", ") : '-'}</td>
                      <td>{appt.appointmentDate}</td>
                      <td>{appt.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="dashboard-content">
            <div className="analytics-card">
              <div className="card-header">
                <h3>Number of Appointments</h3>
                <select className="filter-select" value={selectedFilter} onChange={handleFilterChange}>
                  <option>Today</option>
                  <option>This Week</option>
                  <option>This Month</option>
                </select>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="appointments" fill="#4caf50" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );

      // Keep all your other tabs unchanged
      case 'appointment':
        return (
          <div className="dashboard-content">
            <div className="appointment-controls">
              <div className="filter-calendar">
                <select className="filter-select">
                  <option>All Appointments</option>
                  <option>Scheduled</option>
                  <option>Completed</option>
                  <option>Cancelled</option>
                </select>
                <button className="calendar-btn">📅 Calendar View</button>
              </div>
            </div>
            <div className="appointment-list">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Patient Name</th>
                    <th>Doctor</th>
                    <th>Service</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map(appt => (
                    <tr key={appt.id}>
                      <td>{appt.userName}</td>
                      <td>{appt.doctor}</td>
                      <td>{appt.services ? appt.services.join(", ") : '-'}</td>
                      <td>{appt.appointmentDate}</td>
                      <td>{appt.time}</td>
                      <td><span className={`status-badge ${appt.status}`}>{appt.status}</span></td>
                      <td>
                        <button
                          className="btn-sm btn-success"
                          onClick={() => updateAppointmentStatus(appt.id, "approved")}
                        >
                          Approve
                        </button>
                        <button
                          className="btn-sm btn-danger"
                          onClick={() => updateAppointmentStatus(appt.id, "declined")}
                        >
                          Decline
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'patient':
        return (
          <div className="dashboard-content">
            <div className="patient-controls">
              <input type="text" placeholder="Search patients..." className="search-input" />
            </div>
            <div className="patient-list">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Service</th>
                    <th>Last Appointment</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map(patient => (
                    <tr key={patient.id}>
                      <td>{patient.userName}</td>
                      <td>{patient.services}</td>
                      <td>{patient.lastAppointment}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      default:
        return <p>Welcome to Fano Dental Clinic Admin Panel</p>;
    }
  };

  const handleLogout = () => {
    console.log('Logging out...');
    navigate('/');
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="clinic-brand">
            <img src={denteaseIcon} alt="Clinic Logo" className="brand-icon" />
            <h2 className="brand-name">Fano Dental Clinic</h2>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button className={activeTab === 'dashboard' ? 'nav-item active' : 'nav-item'} onClick={() => setActiveTab('dashboard')}>
            <img src={dashboardIcon} alt="Dashboard Icon" className="nav-icon" />Dashboard
          </button>
          <button className={activeTab === 'appointment' ? 'nav-item active' : 'nav-item'} onClick={() => setActiveTab('appointment')}>
            <img src={appointmentIcon} alt="Appointment Icon" className="nav-icon" />Appointment
          </button>
          <button className={activeTab === 'patient' ? 'nav-item active' : 'nav-item'} onClick={() => setActiveTab('patient')}>
            <img src={patientIcon} alt="Patient Icon" className="nav-icon" />Patient
          </button>
          <button className={activeTab === 'message' ? 'nav-item active' : 'nav-item'} onClick={() => setActiveTab('message')}>
            <img src={messageIcon} alt="Message Icon" className="nav-icon" />Message
          </button>
          <button className={activeTab === 'feedback' ? 'nav-item active' : 'nav-item'} onClick={() => setActiveTab('feedback')}>
            <img src={feedbackIcon} alt="Feedback Icon" className="nav-icon" />Feedback
          </button>
          <button className={activeTab === 'analytics' ? 'nav-item active' : 'nav-item'} onClick={() => setActiveTab('analytics')}>
            <img src={analyticsIcon} alt="Analytics Icon" className="nav-icon" />Analytics
          </button>
          <button className={activeTab === 'settings' ? 'nav-item active' : 'nav-item'} onClick={() => setActiveTab('settings')}>
            <img src={settingsIcon} alt="Settings Icon" className="nav-icon" />Settings
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <img src={logoutIcon} alt="Logout Icon" className="nav-icon" />
            <span className="logout-text">Log Out</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="content-header">
          <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
        </div>
        <div className="content-body">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
