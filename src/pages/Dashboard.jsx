import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
<<<<<<< HEAD
import { collection, doc, updateDoc, onSnapshot, query, orderBy, addDoc, serverTimestamp, where, getDocs } from "firebase/firestore";
=======
import { collection, doc, updateDoc, onSnapshot, query, orderBy, addDoc, serverTimestamp } from "firebase/firestore";
>>>>>>> 4b84aedac5ea083aff5a1d93e8affee87f716a17
import { db } from "../firebase";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

// at the top of your component file
import ReactCalendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

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
import servicesIcon from '../assets/services.png';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [analyticsData, setAnalyticsData] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('Today');
  const [appointmentFilter, setAppointmentFilter] = useState('all');
  const [upcomingFilter, setUpcomingFilter] = useState('All');

  //Appointments State
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());

<<<<<<< HEAD
  // Message states - Updated for real messenger
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedChatRoom, setSelectedChatRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [messageSearch, setMessageSearch] = useState('');
  const [isAdminOnline, setIsAdminOnline] = useState(true);
  const [adminLastSeen, setAdminLastSeen] = useState(new Date());
=======
  // Message states
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageSearch, setMessageSearch] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [isAdminOnline, setIsAdminOnline] = useState(false);
>>>>>>> 4b84aedac5ea083aff5a1d93e8affee87f716a17

  // Patient tab states
  const [patientSearch, setPatientSearch] = useState("");
  const [patientFilter, setPatientFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [appointmentCurrentPage, setAppointmentCurrentPage] = useState(1);
  
  const rowsPerPage = 5;

  // Services tab states
  const [services, setServices] = useState([
    { id: 's1', name: 'Teeth Cleaning', description: 'Professional cleaning', price: 1500 },
    { id: 's2', name: 'Tooth Extraction', description: 'Safe removal of teeth', price: 3000 },
  ]);

  const [editingService, setEditingService] = useState(null);
  const [newServiceName, setNewServiceName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPrice, setEditPrice] = useState('');

  const navigate = useNavigate();

  // Helper functions
  const formatDate = (value) => {
    if (!value) return '-';
    try {
      const d = new Date(value);
      if (isNaN(d)) return String(value);
      return d.toLocaleDateString();
    } catch {
      return String(value);
    }
  };

  const getServicesString = (appt) => {
    if (!appt) return '-';
    if (Array.isArray(appt.services)) return appt.services.join(', ');
    if (appt.services) return String(appt.services);
    if (appt.service) return String(appt.service);
    return '-';
  };

  const formatPhoneNumber = (raw) => {
    if (!raw && raw !== 0) return '';
    let s = String(raw).trim();
    s = s.replace(/[\s\-()]/g, '');
    if (s.startsWith('+63')) return '0' + s.slice(3);
    if (s.startsWith('63') && s.length > 2) return '0' + s.slice(2);
    if (s.startsWith('9') && s.length === 10) return '0' + s;
    return s;
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };

<<<<<<< HEAD
  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' }) + ' ' + 
             date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' +
             date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  // Get user status (online/offline based on last activity)
  const getUserStatus = (lastSeen) => {
    if (!lastSeen) return 'offline';
    const now = new Date();
    const lastSeenTime = new Date(lastSeen);
    const diffMins = Math.floor((now - lastSeenTime) / (1000 * 60));
    return diffMins <= 5 ? 'online' : 'offline';
  };

=======
>>>>>>> 4b84aedac5ea083aff5a1d93e8affee87f716a17
  // Derive approved appointments by date
  const approvedAppointmentsByDate = appointments
    .filter(a => a.status === 'approved')
    .reduce((acc, appt) => {
      const dateKey = formatDate(appt.appointmentDate || appt.date);
      acc[dateKey] = acc[dateKey] || [];
      acc[dateKey].push(appt);
      return acc;
    }, {});

<<<<<<< HEAD
  // Function to send a message in the chat room
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChatRoom) return;

    try {
      const messagesRef = collection(db, "chat_rooms", selectedChatRoom.id, "messages");
      await addDoc(messagesRef, {
        text: newMessage.trim(),
        senderId: 'admin',
        senderName: 'Dr. Jessica Fano',
        senderType: 'admin',
        timestamp: serverTimestamp(),
        isRead: false
      });

      // Update chat room's last message and timestamp
      const chatRoomRef = doc(db, "chat_rooms", selectedChatRoom.id);
      await updateDoc(chatRoomRef, {
        lastMessage: newMessage.trim(),
        lastMessageTime: serverTimestamp(),
        lastMessageSender: 'admin',
        adminLastSeen: serverTimestamp()
=======
  // Function to send a message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const messagesRef = collection(db, "artifacts", "default-app-id", "public", "data", "messages");
      await addDoc(messagesRef, {
        text: newMessage.trim(),
        senderId: isAdminOnline ? 'admin' : 'ai',
        senderName: isAdminOnline ? 'Dr. Jessica Fano' : 'AI Assistant',
        timestamp: serverTimestamp(),
        recipientId: selectedConversation.userId
>>>>>>> 4b84aedac5ea083aff5a1d93e8affee87f716a17
      });

      setNewMessage('');
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

<<<<<<< HEAD
  // Mark messages as read when admin views them
  const markMessagesAsRead = async (chatRoomId) => {
    try {
      const messagesRef = collection(db, "chat_rooms", chatRoomId, "messages");
      const unreadQuery = query(messagesRef, where("isRead", "==", false), where("senderType", "==", "user"));
      const unreadMessages = await getDocs(unreadQuery);
      
      const batch = [];
      unreadMessages.forEach((doc) => {
        batch.push(updateDoc(doc.ref, { isRead: true }));
      });

      await Promise.all(batch);

      // Update admin's last seen in chat room
      const chatRoomRef = doc(db, "chat_rooms", chatRoomId);
      await updateDoc(chatRoomRef, {
        adminLastSeen: serverTimestamp()
      });
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

=======
>>>>>>> 4b84aedac5ea083aff5a1d93e8affee87f716a17
  // Fetch appointments from Firebase (real-time)
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "appointments"), (querySnapshot) => {
      const data = querySnapshot.docs.map(d => {
        const appt = d.data() || {};
        return {
          id: d.id,
          ...appt,
          status: appt.status === 'approved' || appt.status === 'declined' ? appt.status : 'pending'
        };
      });
      setAppointments(data);
      computeAnalytics(data, selectedFilter);
    }, error => console.error("Appointments snapshot error:", error));

    return () => unsubscribe();
  }, [selectedFilter]);

  // Fetch patients from Firebase (real-time)
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (querySnapshot) => {
      const usersData = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

      const usersWithLast = usersData.map(user => {
        const userAppointments = appointments.filter(appt => {
          const matchById = appt.userId && user.id && appt.userId === user.id;
          const matchByEmail = (appt.userEmail || appt.email || '').toLowerCase() === (user.email || '').toLowerCase();
          const matchByName = (appt.userName || '').toLowerCase() === (user.name || user.fullName || '').toLowerCase();
          return matchById || matchByEmail || matchByName;
        });

        let lastAppointmentDate = null;
        if (userAppointments.length) {
          const validDates = userAppointments
            .map(a => new Date(a.appointmentDate || a.date || null))
            .filter(d => d instanceof Date && !isNaN(d));
          if (validDates.length) lastAppointmentDate = validDates.sort((a,b) => b - a)[0];
        }

        return {
          id: user.id,
          userName: user.name || user.fullName || user.userName || 'Unnamed',
          phoneNumber: user.phoneNumber || user.phone || user.contact || '',
          address: user.address || user.location || '',
          lastAppointmentDate,
          lastAppointment: lastAppointmentDate ? lastAppointmentDate.toLocaleDateString() : '-'
        };
      });

      usersWithLast.sort((a, b) => {
        if (a.lastAppointmentDate && b.lastAppointmentDate) return b.lastAppointmentDate - a.lastAppointmentDate;
        if (a.lastAppointmentDate) return -1;
        if (b.lastAppointmentDate) return 1;
        return 0;
      });

      setPatients(usersWithLast);
      setCurrentPage(1);
    }, error => console.error("Patients snapshot error:", error));

    return () => unsubscribe();
  }, [appointments]);

<<<<<<< HEAD
  // Fetch chat rooms from Firebase (real-time)
  useEffect(() => {
    const chatRoomsRef = collection(db, "chat_rooms");
    const chatRoomsQuery = query(chatRoomsRef, orderBy("lastMessageTime", "desc"));

    const unsubscribe = onSnapshot(chatRoomsQuery, async (snapshot) => {
      const rooms = [];
      
      for (const doc of snapshot.docs) {
        const roomData = doc.data();
        
        // Get unread messages count for this room
        const messagesRef = collection(db, "chat_rooms", doc.id, "messages");
        const unreadQuery = query(messagesRef, where("isRead", "==", false), where("senderType", "==", "user"));
        const unreadSnapshot = await getDocs(unreadQuery);
        
        rooms.push({
          id: doc.id,
          ...roomData,
          unreadCount: unreadSnapshot.size,
          lastMessageTime: roomData.lastMessageTime?.toDate ? roomData.lastMessageTime.toDate() : roomData.lastMessageTime,
          userLastSeen: roomData.userLastSeen?.toDate ? roomData.userLastSeen.toDate() : roomData.userLastSeen,
          adminLastSeen: roomData.adminLastSeen?.toDate ? roomData.adminLastSeen.toDate() : roomData.adminLastSeen
        });
      }

      setChatRooms(rooms);

      // Update selected chat room if it exists
      if (selectedChatRoom) {
        const updatedRoom = rooms.find(r => r.id === selectedChatRoom.id);
        if (updatedRoom) {
          setSelectedChatRoom(updatedRoom);
        }
      }
    }, error => console.error("Chat rooms snapshot error:", error));

    return () => unsubscribe();
  }, [selectedChatRoom?.id]);

  // Fetch messages for selected chat room (real-time)
  useEffect(() => {
    if (!selectedChatRoom) {
      setMessages([]);
      return;
    }

    const messagesRef = collection(db, "chat_rooms", selectedChatRoom.id, "messages");
    const messagesQuery = query(messagesRef, orderBy("timestamp", "asc"));
=======
  // Fetch messages from Firebase (real-time)
  useEffect(() => {
    const messagesRef = collection(db, "artifacts", "default-app-id", "public", "data", "messages");
    const messagesQuery = query(messagesRef, orderBy("timestamp", "desc"));
>>>>>>> 4b84aedac5ea083aff5a1d93e8affee87f716a17

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const msgs = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : data.timestamp,
          text: data.text || "",
          senderId: data.senderId || "",
<<<<<<< HEAD
          senderName: data.senderName || data.senderId || "",
          senderType: data.senderType || "user",
          isRead: data.isRead || false
=======
          senderName: data.senderName || data.senderId || ""
>>>>>>> 4b84aedac5ea083aff5a1d93e8affee87f716a17
        };
      });
      setMessages(msgs);
      
<<<<<<< HEAD
      // Mark messages as read when admin opens the chat
      if (msgs.length > 0) {
        markMessagesAsRead(selectedChatRoom.id);
=======
      // Group messages into conversations
      const conversationMap = {};
      msgs.forEach(msg => {
        const userId = msg.senderId === 'ai' || msg.senderId === 'admin' ? null : msg.senderId;
        if (!userId) return;
        
        if (!conversationMap[userId]) {
          conversationMap[userId] = {
            userId,
            userName: msg.senderName || msg.senderId,
            messages: [],
            lastMessage: null,
            lastMessageTime: null,
            unreadCount: 0
          };
        }
        conversationMap[userId].messages.push(msg);
      });

      // Add AI responses to conversations
      msgs.forEach(msg => {
        if (msg.senderId === 'ai' || msg.senderId === 'admin') {
          // Find the most recent user message before this AI/admin message
          const userMsgs = msgs.filter(m => 
            m.timestamp < msg.timestamp && 
            m.senderId !== 'ai' && 
            m.senderId !== 'admin'
          );
          if (userMsgs.length > 0) {
            const recentUser = userMsgs[0];
            if (conversationMap[recentUser.senderId]) {
              conversationMap[recentUser.senderId].messages.push(msg);
            }
          }
        }
      });

      // Sort messages within each conversation and set last message
      Object.values(conversationMap).forEach(conv => {
        conv.messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        if (conv.messages.length > 0) {
          const lastMsg = conv.messages[conv.messages.length - 1];
          conv.lastMessage = lastMsg.text;
          conv.lastMessageTime = lastMsg.timestamp;
        }
      });

      // Convert to array and sort by last message time
      const conversations = Object.values(conversationMap)
        .sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
      
      setConversations(conversations);

      // Update selected conversation if it exists
      if (selectedConversation) {
        const updatedConv = conversations.find(c => c.userId === selectedConversation.userId);
        if (updatedConv) {
          setSelectedConversation(updatedConv);
        }
>>>>>>> 4b84aedac5ea083aff5a1d93e8affee87f716a17
      }
    }, error => console.error("Messages snapshot error:", error));

    return () => unsubscribe();
<<<<<<< HEAD
  }, [selectedChatRoom?.id]);

  // Update admin's online status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (isAdminOnline) {
        setAdminLastSeen(new Date());
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [isAdminOnline]);
=======
  }, [selectedConversation?.userId]);
>>>>>>> 4b84aedac5ea083aff5a1d93e8affee87f716a17

  const computeAnalytics = (data, filter) => {
    const stats = {};
    const now = new Date();

    const filtered = data.filter(appt => {
      const apptDate = new Date(appt.appointmentDate || appt.date || null);
      if (!apptDate || isNaN(apptDate)) return false;
      if (filter === 'Today') return apptDate.toDateString() === now.toDateString();
      if (filter === 'This Week') {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0,0,0,0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23,59,59,999);
        return apptDate >= weekStart && apptDate <= weekEnd;
      }
      if (filter === 'This Month') return apptDate.getMonth() === now.getMonth() && apptDate.getFullYear() === now.getFullYear();
      if (filter === 'This Year') return apptDate.getFullYear() === now.getFullYear();
      return true;
    });

    filtered.forEach(appt => {
      const dateObj = new Date(appt.appointmentDate || appt.date || null);
      if (!dateObj || isNaN(dateObj)) return;
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

  const updateAppointmentStatus = async (id, newStatus) => {
    try {
      const apptRef = doc(db, "appointments", id);
      await updateDoc(apptRef, { status: newStatus });
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

<<<<<<< HEAD
  // Filter chat rooms based on search
  const filteredChatRooms = chatRooms.filter(room => {
    const searchLower = messageSearch.toLowerCase();
    return room.userName.toLowerCase().includes(searchLower) ||
           room.lastMessage?.toLowerCase().includes(searchLower);
=======
  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv => {
    const searchLower = messageSearch.toLowerCase();
    return conv.userName.toLowerCase().includes(searchLower) ||
           conv.lastMessage?.toLowerCase().includes(searchLower);
>>>>>>> 4b84aedac5ea083aff5a1d93e8affee87f716a17
  });

  const filteredPatients = patients.filter(p => {
    const q = (patientSearch || "").toLowerCase().trim();
    const matchesSearch = !q || (
      (p.userName || "").toLowerCase().includes(q) ||
      (p.phoneNumber || "").toLowerCase().includes(q) ||
      (p.address || "").toLowerCase().includes(q) ||
      (p.lastAppointment || "").toLowerCase().includes(q)
    );

    const matchesFilter =
      patientFilter === "all" ? true
      : (patientFilter === "with" ? (p.lastAppointment && p.lastAppointment !== '-') : false)
      || (patientFilter === "none" ? (!p.lastAppointment || p.lastAppointment === '-') : false);

    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.max(1, Math.ceil(filteredPatients.length / rowsPerPage));
  
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
    if (currentPage < 1) setCurrentPage(1);
  }, [currentPage, totalPages]);

  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const renderContent = () => {
    const today = new Date();
    const todayStr = today.toDateString();

    try {
      switch (activeTab) {
        case 'dashboard': {
          // existing stats
          const todayAppointments = appointments.filter(appt =>
            (appt.appointmentDate || appt.date) &&
            new Date(appt.appointmentDate || appt.date).toDateString() === todayStr &&
            appt.status === 'approved'
          );
          const cancelledAppointments = appointments.filter(appt => appt.status === 'declined');
          const pendingAppointments = appointments.filter(appt => appt.status === 'pending');

          // filter upcoming appointments
          const filteredUpcoming = appointments
            .filter(appt => {
              if (appt.status !== 'approved') return false;
              const ad = appt.appointmentDate || appt.date;
              if (!ad) return false;
              const apptDate = new Date(ad);
              if (isNaN(apptDate)) return false;
              if (upcomingFilter === 'Today') return apptDate.toDateString() === todayStr;
              if (upcomingFilter === 'This Week') {
                const weekStart = new Date(today);
                weekStart.setDate(today.getDate() - today.getDay());
                weekStart.setHours(0, 0, 0, 0);
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 6);
                weekEnd.setHours(23, 59, 59, 999);
                return apptDate >= weekStart && apptDate <= weekEnd;
              }
              return true;
            })
            .sort((a, b) => new Date(a.appointmentDate || a.date) - new Date(b.appointmentDate || b.date));

          // Top Services data (same logic as analytics)
          const serviceCount = {};
          appointments.forEach(a => {
            const services = Array.isArray(a.services) ? a.services : a.services ? [a.services] : [];
            services.forEach(s => { if (s) serviceCount[s] = (serviceCount[s] || 0) + 1; });
          });
          const pieData = Object.entries(serviceCount)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);

          const pieColors = ['#4caf50', '#ff9800', '#f44336', '#2196f3', '#9c27b0'];

          return (
            <div className="dashboard-content">
              {/* stat cards */}
              <div className="stats-grid">
                <div className="stat-card">
                  <p className="stat-number">{todayAppointments.length}</p>
                  <div className="stat-label">
                    <img src={appointmentIcon} alt="Appointments Icon" className="stat-icon" />
                    <span>Appointments Today</span>
                  </div>
                </div>
                <div className="stat-card">
                  <p className="stat-number">{cancelledAppointments.length}</p>
                  <div className="stat-label">
                    <img src={feedbackIcon} alt="Cancelled Icon" className="stat-icon" />
                    <span>Cancelled Appointments</span>
                  </div>
                </div>
                <div className="stat-card">
                  <p className="stat-number">{pendingAppointments.length}</p>
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

              {/* two charts side by side */}
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                {/* Number of Appointments */}
                <div className="analytics-card" style={{ flex: 1, minWidth: '300px' }}>
                  <div className="card-header">
                    <h3>Number of Appointments</h3>
                    <select className="filter-select" value={selectedFilter} onChange={handleFilterChange}>
                      <option>Today</option>
                      <option>This Week</option>
                      <option>This Month</option>
                      <option>This Year</option>
                    </select>
                  </div>
                  <div className="chart-container" style={{ height: 250 }}>
                    <ResponsiveContainer width="100%" height="100%">
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

                {/* Top Services */}
                <div className="analytics-card" style={{ flex: 1, minWidth: '300px' }}>
                  <div className="card-header">
                    <h3>Top Services</h3>
                  </div>
                  <div className="chart-container" style={{ height: 250 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          label
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Upcoming Appointments table */}
              <div className="appointments-card">
                <div className="card-header">
                  <h3>Upcoming Appointments</h3>
                  <select
                    className="filter-select"
                    value={upcomingFilter}
                    onChange={(e) => setUpcomingFilter(e.target.value)}
                  >
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
                    {filteredUpcoming.map(appt => (
                      <tr key={appt.id}>
                        <td>{appt.userName}</td>
                        <td>{getServicesString(appt)}</td>
                        <td>{formatDate(appt.appointmentDate || appt.date)}</td>
                        <td>{appt.time || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        }

        case 'analytics': {
          const serviceCount = {};
          appointments.forEach(a => {
            const services = Array.isArray(a.services) ? a.services : a.services ? [a.services] : [];
            services.forEach(s => { if (s) serviceCount[s] = (serviceCount[s] || 0) + 1; });
          });
          const pieData = Object.entries(serviceCount)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);

          const pieColors = ['#4caf50', '#ff9800', '#f44336', '#2196f3', '#9c27b0'];

          // Calculate analytics details
          const totalAppointments = analyticsData.reduce((sum, item) => sum + item.appointments, 0);
          const avgAppointments = analyticsData.length > 0 ? (totalAppointments / analyticsData.length).toFixed(1) : 0;
          const peakMonth = analyticsData.reduce((max, item) => item.appointments > max.appointments ? item : max, { month: 'N/A', appointments: 0 });
          
          const totalServices = pieData.reduce((sum, item) => sum + item.value, 0);
          const topService = pieData.length > 0 ? pieData[0] : { name: 'N/A', value: 0 };
          const servicePercentage = totalServices > 0 ? ((topService.value / totalServices) * 100).toFixed(1) : 0;

          return (
            <div className="dashboard-content">
              {/* Appointments Analytics */}
              <div className="analytics-card" style={{ marginBottom: '30px' }}>
                <div className="card-header">
                  <h3>Number of Appointments</h3>
                  <select className="filter-select" value={selectedFilter} onChange={handleFilterChange}>
                    <option>Today</option>
                    <option>This Week</option>
                    <option>This Month</option>
                    <option>This Year</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                  <div className="chart-container" style={{ height: 400, flex: '2' }}>
                    <ResponsiveContainer width="100%" height="100%">
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
                  
                  <div style={{ flex: '1', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', minWidth: '250px' }}>
                    <h4 style={{ margin: '0 0 15px 0', color: '#333', fontSize: '16px' }}>Appointment Insights</h4>
                    
                    <div style={{ marginBottom: '15px' }}>
                      <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Time Period</div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#4caf50' }}>{selectedFilter}</div>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                      <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Total Appointments</div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2196f3' }}>{totalAppointments}</div>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                      <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Average per Period</div>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ff9800' }}>{avgAppointments}</div>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                      <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Peak Month</div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#f44336' }}>
                        {peakMonth.month}
                      </div>
                      <div style={{ fontSize: '14px', color: '#666' }}>
                        ({peakMonth.appointments} appointments)
                      </div>
                    </div>

                    <div style={{ padding: '10px', backgroundColor: '#e3f2fd', borderRadius: '6px', marginTop: '15px' }}>
                      <div style={{ fontSize: '12px', color: '#1976d2', fontWeight: 'bold' }}>TREND</div>
                      <div style={{ fontSize: '13px', color: '#333', marginTop: '5px' }}>
                        {analyticsData.length >= 2 && analyticsData[analyticsData.length - 1].appointments > analyticsData[analyticsData.length - 2].appointments 
                          ? '📈 Increasing trend' 
                          : analyticsData.length >= 2 && analyticsData[analyticsData.length - 1].appointments < analyticsData[analyticsData.length - 2].appointments
                          ? '📉 Decreasing trend'
                          : '📊 Stable trend'
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Services Analytics */}
              <div className="analytics-card">
                <div className="card-header">
                  <h3>Top Services</h3>
                </div>

                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                  <div className="chart-container" style={{ height: 350, flex: '2' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          fill="#8884d8"
                          label
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div style={{ flex: '1', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', minWidth: '250px' }}>
                    <h4 style={{ margin: '0 0 15px 0', color: '#333', fontSize: '16px' }}>Service Statistics</h4>
                    
                    <div style={{ marginBottom: '15px' }}>
                      <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Total Services Booked</div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4caf50' }}>{totalServices}</div>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                      <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Most Popular Service</div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#2196f3' }}>
                        {topService.name}
                      </div>
                      <div style={{ fontSize: '14px', color: '#666' }}>
                        {topService.value} bookings ({servicePercentage}%)
                      </div>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                      <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>Service Variety</div>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ff9800' }}>
                        {pieData.length} Services
                      </div>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                      <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>Service Breakdown</div>
                      {pieData.slice(0, 3).map((service, index) => (
                        <div key={service.name} style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          marginBottom: '8px',
                          padding: '5px 8px',
                          backgroundColor: 'white',
                          borderRadius: '4px',
                          border: `2px solid ${pieColors[index]}`
                        }}>
                          <span style={{ fontSize: '13px', fontWeight: '500' }}>{service.name}</span>
                          <span style={{ fontSize: '13px', color: '#666' }}>{service.value}</span>
                        </div>
                      ))}
                    </div>

                    <div style={{ padding: '10px', backgroundColor: '#e8f5e8', borderRadius: '6px', marginTop: '15px' }}>
                      <div style={{ fontSize: '12px', color: '#2e7d32', fontWeight: 'bold' }}>INSIGHT</div>
                      <div style={{ fontSize: '13px', color: '#333', marginTop: '5px' }}>
                        {servicePercentage > 50 
                          ? `${topService.name} dominates with ${servicePercentage}% of bookings`
                          : 'Services are well-distributed across different types'
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        }

        case 'appointment': {
          // filter and paginate appointments
          const filteredAppointments = appointments.filter(appt => {
            if (appointmentFilter === 'all') return true;
            return appt.status === appointmentFilter;
          });

          const appointmentTotalPages = Math.max(
            1,
            Math.ceil(filteredAppointments.length / rowsPerPage)
          );

          const paginatedAppointments = filteredAppointments.slice(
            (appointmentCurrentPage - 1) * rowsPerPage,
            appointmentCurrentPage * rowsPerPage
          );

          // helper to style days with approved appts
          const tileContent = ({ date, view }) => {
            if (view !== 'month') return null;
            const dateKey = formatDate(date);
            const appts = approvedAppointmentsByDate[dateKey] || [];
            return appts.length > 0 ? (
              <div style={{ textAlign: 'center', color: 'white', background: '#4caf50', borderRadius: '50%', fontSize: '10px' }}>
                {appts.length}
              </div>
            ) : null;
          };

          return (
            <div className="dashboard-content">
              <div className="appointment-controls">
                <div className="filter-calendar">
                  <select
                    className="filter-select"
                    value={appointmentFilter}
                    onChange={(e) => setAppointmentFilter(e.target.value)}
                  >
                    <option value="all">All Appointments</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="declined">Declined</option>
                  </select>
                  <button
                    className="calendar-btn"
                    onClick={() => setShowCalendar(!showCalendar)}
                  >
                    📅 Calendar View
                  </button>
                </div>
              </div>

              {/* calendar modal */}
              {showCalendar && (
                <div
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                  }}
                  onClick={() => setShowCalendar(false)}
                >
                  <div
                    style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h3>Approved Appointments Calendar</h3>
                    <ReactCalendar
                      onChange={setCalendarDate}
                      value={calendarDate}
                      tileContent={tileContent}
                    />
                    <div style={{ marginTop: '10px' }}>
                      <strong>{formatDate(calendarDate)}</strong>
                      <ul style={{ marginTop: '5px' }}>
                        {(approvedAppointmentsByDate[formatDate(calendarDate)] || []).map(appt => (
                          <li key={appt.id}>
                            {appt.userName} – {getServicesString(appt)}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <button
                      style={{ marginTop: '10px' }}
                      onClick={() => setShowCalendar(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}

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
                    {paginatedAppointments.map(appt => (
                      <tr key={appt.id}>
                        <td>{appt.userName}</td>
                        <td>{appt.doctor || '-'}</td>
                        <td>{getServicesString(appt)}</td>
                        <td>{formatDate(appt.appointmentDate || appt.date)}</td>
                        <td>{appt.time || '-'}</td>
                        <td>
                          <span className={`status-badge ${appt.status}`}>
                            {appt.status
                              ? appt.status.charAt(0).toUpperCase() + appt.status.slice(1)
                              : '-'}
                          </span>
                        </td>
                        <td>
                          {appt.status === 'pending' && (
                            <>
                              <button
                                className="btn-sm btn-success"
                                onClick={() =>
                                  updateAppointmentStatus(appt.id, 'approved')
                                }
                              >
                                Approve
                              </button>
                              <button
                                className="btn-sm btn-danger"
                                onClick={() =>
                                  updateAppointmentStatus(appt.id, 'declined')
                                }
                              >
                                Decline
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* pagination */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginTop: '15px',
                  gap: '10px'
                }}
              >
                <button
                  className="calendar-btn"
                  disabled={appointmentCurrentPage === 1}
                  onClick={() =>
                    setAppointmentCurrentPage((p) => Math.max(1, p - 1))
                  }
                >
                  Prev
                </button>
                <span style={{ alignSelf: 'center' }}>
                  Page {appointmentCurrentPage} of {appointmentTotalPages}
                </span>
                <button
                  className="calendar-btn"
                  disabled={appointmentCurrentPage === appointmentTotalPages}
                  onClick={() =>
                    setAppointmentCurrentPage((p) =>
                      Math.min(appointmentTotalPages, p + 1)
                    )
                  }
                >
                  Next
                </button>
              </div>
            </div>
          );
        }

        case 'patient': {
          return (
            <div className="dashboard-content">
              <div className="patient-controls">
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                  className="search-input"
                />
                <select
                  className="filter-select"
                  value={patientFilter}
                  onChange={(e) => setPatientFilter(e.target.value)}
                >
                  <option value="all">All Patients</option>
                  <option value="with">With Appointments</option>
                  <option value="none">No Appointments</option>
                </select>
              </div>

              <div className="patient-list">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Phone</th>
                      <th>Address</th>
                      <th>Last Appointment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedPatients.map(patient => (
                      <tr key={patient.id}>
                        <td>{patient.userName}</td>
                        <td>{formatPhoneNumber(patient.phoneNumber)}</td>
                        <td>{patient.address}</td>
                        <td>{patient.lastAppointment}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* pagination */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginTop: '15px',
                  gap: '10px'
                }}
              >
                <button
                  className="calendar-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                >
                  Prev
                </button>
                <span style={{ alignSelf: 'center' }}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className="calendar-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                >
                  Next
                </button>
              </div>
            </div>
          );
        }

        case 'services': {
          return (
            <div className="dashboard-content">
              {/* Title and button on one line */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '15px',
                }}
              >
                <h3 style={{ margin: 0 }}>Services</h3>

                <button
                  onClick={() => {
                    // open modal with empty fields
                    setEditingService({ id: null, name: '', description: '', price: 0 });
                    setEditDescription('');
                    setEditPrice('');
                    setNewServiceName('');
                  }}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#094685', 
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  + Add Service
                </button>
              </div>
              
              <div
                className="services-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                  gap: '20px',
                  marginTop: '20px',
                }}
              >
                {services.map(service => (
                  <div
                    key={service.id}
                    className="service-card"
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      padding: '15px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <h4 style={{ margin: '0 0 10px 0' }}>{service.name}</h4>
                    <p style={{ flexGrow: 1, marginBottom: '10px' }}>{service.description}</p>
                    <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>
                      ₱ {service.price.toFixed(2)}
                    </p>
                    <button
                      onClick={() => {
                        setEditingService(service);
                        setEditDescription(service.description);
                        setEditPrice(service.price.toString());
                        setNewServiceName(service.name);
                      }}
                      style={{
                        alignSelf: 'flex-start',
                        padding: '6px 12px',
                        backgroundColor: '#094685',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      Edit
                    </button>
                  </div>
                ))}
              </div>

              {/* Pop-up modal */}
              {editingService && (
                <div
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.4)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 9999,
                  }}
                  onClick={() => setEditingService(null)}
                >
                  <div
                    style={{
                      background: 'white',
                      padding: '20px',
                      borderRadius: '8px',
                      minWidth: '320px',
                    }}
                    onClick={e => e.stopPropagation()}
                  >
                    <h3>
                      {editingService.id ? 'Edit Service' : 'Add New Service'}
                    </h3>

                    {/* name for new service */}
                    <label>Name</label>
                    <input
                      type="text"
                      value={newServiceName}
                      onChange={e => setNewServiceName(e.target.value)}
                      style={{ width: '100%', marginBottom: '10px' }}
                    />

                    <label>Description</label>
                    <textarea
                      value={editDescription}
                      onChange={e => setEditDescription(e.target.value)}
                      rows={4}
                      style={{ width: '100%', marginBottom: '10px' }}
                    />

                    <label>Price (₱)</label>
                    <input
                      type="number"
                      value={editPrice}
                      onChange={e => setEditPrice(e.target.value)}
                      style={{ width: '100%', marginBottom: '10px' }}
                    />

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                      <button
                        onClick={() => setEditingService(null)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#9e9e9e',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          if (editingService.id) {
                            // update existing
                            const updated = services.map(s =>
                              s.id === editingService.id
                                ? {
                                    ...s,
                                    name: newServiceName,
                                    description: editDescription,
                                    price: parseFloat(editPrice),
                                  }
                                : s
                            );
                            setServices(updated);
                          } else {
                            // add new
                            const newService = {
                              id: Date.now(),
                              name: newServiceName,
                              description: editDescription,
                              price: parseFloat(editPrice),
                            };
                            setServices([...services, newService]);
                          }
                          setEditingService(null);
                        }}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#4caf50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        }

        case 'message': {
          return (
            <div className="dashboard-content">
              <div className="messenger-container" style={{ display: 'flex', height: '600px', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
                <div className="conversations-panel" style={{ width: '350px', borderRight: '1px solid #ddd', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ padding: '15px', borderBottom: '1px solid #eee', backgroundColor: '#f8f9fa' }}>
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>Messages</h3>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        placeholder="Search conversations..."
                        value={messageSearch}
                        onChange={(e) => setMessageSearch(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #ddd',
                          borderRadius: '20px',
                          fontSize: '14px',
                          outline: 'none'
                        }}
                      />
                    </div>
                    <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
<<<<<<< HEAD
                      <label style={{ fontSize: '14px', color: '#666' }}>Status:</label>
=======
                      <label style={{ fontSize: '14px', color: '#666' }}>Admin Status:</label>
>>>>>>> 4b84aedac5ea083aff5a1d93e8affee87f716a17
                      <button
                        onClick={() => setIsAdminOnline(!isAdminOnline)}
                        style={{
                          padding: '4px 12px',
                          border: 'none',
                          borderRadius: '12px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          backgroundColor: isAdminOnline ? '#4caf50' : '#ccc',
                          color: 'white'
                        }}
                      >
                        {isAdminOnline ? '🟢 Online' : '🔴 Offline'}
                      </button>
                    </div>
                  </div>

                  <div style={{ flex: 1, overflowY: 'auto' }}>
<<<<<<< HEAD
                    {filteredChatRooms.length === 0 ? (
=======
                    {filteredConversations.length === 0 ? (
>>>>>>> 4b84aedac5ea083aff5a1d93e8affee87f716a17
                      <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                        No conversations found
                      </div>
                    ) : (
<<<<<<< HEAD
                      filteredChatRooms.map(room => {
                        const userStatus = getUserStatus(room.userLastSeen);
                        return (
                          <div
                            key={room.id}
                            onClick={() => setSelectedChatRoom(room)}
                            style={{
                              padding: '12px 15px',
                              borderBottom: '1px solid #eee',
                              cursor: 'pointer',
                              backgroundColor: selectedChatRoom?.id === room.id ? '#e3f2fd' : 'white'
                            }}
                            onMouseEnter={(e) => {
                              if (selectedChatRoom?.id !== room.id) {
                                e.target.style.backgroundColor = '#f5f5f5';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (selectedChatRoom?.id !== room.id) {
                                e.target.style.backgroundColor = 'white';
                              }
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ position: 'relative' }}>
                                <div style={{
                                  width: '40px',
                                  height: '40px',
                                  borderRadius: '50%',
                                  backgroundColor: '#4caf50',
                                  color: 'white',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '16px',
                                  fontWeight: 'bold'
                                }}>
                                  {room.userName.charAt(0).toUpperCase()}
                                </div>
                                {/* Online/Offline indicator */}
                                <div style={{
                                  position: 'absolute',
                                  bottom: '2px',
                                  right: '2px',
                                  width: '12px',
                                  height: '12px',
                                  borderRadius: '50%',
                                  backgroundColor: userStatus === 'online' ? '#4caf50' : '#ccc',
                                  border: '2px solid white'
                                }} />
                              </div>
                              
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <h4 style={{ 
                                    margin: 0, 
                                    fontSize: '14px', 
                                    fontWeight: '600',
                                    color: '#333',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}>
                                    {room.userName}
                                  </h4>
                                  <span style={{ 
                                    fontSize: '12px', 
                                    color: '#999',
                                    flexShrink: 0
                                  }}>
                                    {formatTime(room.lastMessageTime)}
                                  </span>
                                </div>
                                <p style={{ 
                                  margin: '2px 0 0 0', 
                                  fontSize: '13px', 
                                  color: '#666',
=======
                      filteredConversations.map(conv => (
                        <div
                          key={conv.userId}
                          onClick={() => setSelectedConversation(conv)}
                          style={{
                            padding: '12px 15px',
                            borderBottom: '1px solid #eee',
                            cursor: 'pointer',
                            backgroundColor: selectedConversation?.userId === conv.userId ? '#e3f2fd' : 'white'
                          }}
                          onMouseEnter={(e) => {
                            if (selectedConversation?.userId !== conv.userId) {
                              e.target.style.backgroundColor = '#f5f5f5';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (selectedConversation?.userId !== conv.userId) {
                              e.target.style.backgroundColor = 'white';
                            }
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              backgroundColor: '#4caf50',
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '16px',
                              fontWeight: 'bold'
                            }}>
                              {conv.userName.charAt(0).toUpperCase()}
                            </div>
                            
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h4 style={{ 
                                  margin: 0, 
                                  fontSize: '14px', 
                                  fontWeight: '600',
                                  color: '#333',
>>>>>>> 4b84aedac5ea083aff5a1d93e8affee87f716a17
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}>
<<<<<<< HEAD
                                  {room.lastMessageSender === 'admin' ? 'You: ' : ''}
                                  {room.lastMessage || 'No messages'}
                                </p>
                                <div style={{ 
                                  fontSize: '11px', 
                                  color: userStatus === 'online' ? '#4caf50' : '#999',
                                  marginTop: '2px'
                                }}>
                                  {userStatus === 'online' ? 'Online' : `Last seen ${formatTime(room.userLastSeen)}`}
                                </div>
                              </div>
                              
                              {room.unreadCount > 0 && (
                                <div style={{
                                  backgroundColor: '#f44336',
                                  color: 'white',
                                  borderRadius: '50%',
                                  width: '20px',
                                  height: '20px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '12px',
                                  fontWeight: 'bold'
                                }}>
                                  {room.unreadCount}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
=======
                                  {conv.userName}
                                </h4>
                                <span style={{ 
                                  fontSize: '12px', 
                                  color: '#999',
                                  flexShrink: 0
                                }}>
                                  {formatTime(conv.lastMessageTime)}
                                </span>
                              </div>
                              <p style={{ 
                                margin: '2px 0 0 0', 
                                fontSize: '13px', 
                                color: '#666',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}>
                                {conv.lastMessage || 'No messages'}
                              </p>
                            </div>
                            
                            {conv.unreadCount > 0 && (
                              <div style={{
                                backgroundColor: '#4caf50',
                                color: 'white',
                                borderRadius: '50%',
                                width: '20px',
                                height: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px',
                                fontWeight: 'bold'
                              }}>
                                {conv.unreadCount}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
>>>>>>> 4b84aedac5ea083aff5a1d93e8affee87f716a17
                    )}
                  </div>
                </div>

                <div className="chat-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
<<<<<<< HEAD
                  {selectedChatRoom ? (
=======
                  {selectedConversation ? (
>>>>>>> 4b84aedac5ea083aff5a1d93e8affee87f716a17
                    <>
                      <div style={{ 
                        padding: '15px 20px', 
                        borderBottom: '1px solid #eee', 
                        backgroundColor: '#f8f9fa',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}>
<<<<<<< HEAD
                        <div style={{ position: 'relative' }}>
                          <div style={{
                            width: '35px',
                            height: '35px',
                            borderRadius: '50%',
                            backgroundColor: '#4caf50',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            fontWeight: 'bold'
                          }}>
                            {selectedChatRoom.userName.charAt(0).toUpperCase()}
                          </div>
                          <div style={{
                            position: 'absolute',
                            bottom: '2px',
                            right: '2px',
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            backgroundColor: getUserStatus(selectedChatRoom.userLastSeen) === 'online' ? '#4caf50' : '#ccc',
                            border: '2px solid white'
                          }} />
                        </div>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '16px', color: '#333' }}>
                            {selectedChatRoom.userName}
                          </h3>
                          <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
                            {getUserStatus(selectedChatRoom.userLastSeen) === 'online' 
                              ? 'Online' 
                              : `Last seen ${formatTime(selectedChatRoom.userLastSeen)}`
                            }
                          </p>
                        </div>
                        <div style={{ marginLeft: 'auto' }}>
                          <div style={{
                            padding: '4px 8px',
                            backgroundColor: isAdminOnline ? '#4caf50' : '#ccc',
                            color: 'white',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 'bold'
                          }}>
                            {isAdminOnline ? 'You: Online' : 'You: Offline'}
                          </div>
                        </div>
=======
                        <div style={{
                          width: '35px',
                          height: '35px',
                          borderRadius: '50%',
                          backgroundColor: '#4caf50',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          fontWeight: 'bold'
                        }}>
                          {selectedConversation.userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '16px', color: '#333' }}>
                            {selectedConversation.userName}
                          </h3>
                          <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
                            {isAdminOnline ? 'Dr. Jessica Fano' : 'AI Assistant Available'}
                          </p>
                        </div>
>>>>>>> 4b84aedac5ea083aff5a1d93e8affee87f716a17
                      </div>

                      <div style={{ 
                        flex: 1, 
                        padding: '15px', 
                        overflowY: 'auto',
                        backgroundColor: '#f0f2f5',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                      }}>
<<<<<<< HEAD
                        {messages.map(msg => {
                          const isFromAdmin = msg.senderType === 'admin';
=======
                        {selectedConversation.messages.map(msg => {
                          const isFromPatient = msg.senderId !== 'ai' && msg.senderId !== 'admin';
                          const isFromAdmin = msg.senderId === 'admin';
>>>>>>> 4b84aedac5ea083aff5a1d93e8affee87f716a17
                          
                          return (
                            <div
                              key={msg.id}
                              style={{
<<<<<<< HEAD
                                alignSelf: isFromAdmin ? 'flex-end' : 'flex-start',
                                maxWidth: '70%'
                              }}
                            >
                              {!isFromAdmin && (
=======
                                alignSelf: isFromPatient ? 'flex-start' : 'flex-end',
                                maxWidth: '70%'
                              }}
                            >
                              {!isFromPatient && (
>>>>>>> 4b84aedac5ea083aff5a1d93e8affee87f716a17
                                <div style={{
                                  fontSize: '11px',
                                  color: '#666',
                                  marginBottom: '2px',
<<<<<<< HEAD
                                  marginLeft: '10px'
                                }}>
                                  {msg.senderName || 'Patient'}
=======
                                  textAlign: 'right'
                                }}>
                                  {isFromAdmin ? 'Dr. Jessica Fano' : 'AI Assistant'}
>>>>>>> 4b84aedac5ea083aff5a1d93e8affee87f716a17
                                </div>
                              )}
                              
                              <div style={{
<<<<<<< HEAD
                                background: isFromAdmin ? '#4caf50' : 'white',
                                color: isFromAdmin ? '#fff' : '#000',
                                padding: '10px 12px',
                                borderRadius: isFromAdmin ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                border: isFromAdmin ? 'none' : '1px solid #ddd'
=======
                                background: isFromPatient ? 'white' : (isFromAdmin ? '#4caf50' : '#2196f3'),
                                color: isFromPatient ? '#000' : '#fff',
                                padding: '10px 12px',
                                borderRadius: isFromPatient ? '18px 18px 18px 4px' : '18px 18px 4px 18px',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                border: isFromPatient ? '1px solid #ddd' : 'none'
>>>>>>> 4b84aedac5ea083aff5a1d93e8affee87f716a17
                              }}>
                                <div style={{ fontSize: '14px', lineHeight: '1.4' }}>
                                  {msg.text}
                                </div>
                                <div style={{ 
                                  fontSize: '11px', 
                                  marginTop: '4px', 
                                  opacity: 0.7,
                                  textAlign: 'right'
                                }}>
<<<<<<< HEAD
                                  {formatMessageTime(msg.timestamp)}
                                  {isFromAdmin && (
                                    <span style={{ marginLeft: '5px' }}>
                                      {msg.isRead ? '✓✓' : '✓'}
                                    </span>
                                  )}
=======
                                  {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  }) : '-'}
>>>>>>> 4b84aedac5ea083aff5a1d93e8affee87f716a17
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div style={{ 
                        padding: '15px', 
                        borderTop: '1px solid #eee',
                        backgroundColor: 'white'
                      }}>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                          <input
                            type="text"
<<<<<<< HEAD
                            placeholder={isAdminOnline ? "Type a message..." : "You are offline - go online to send messages"}
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={!isAdminOnline}
=======
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
>>>>>>> 4b84aedac5ea083aff5a1d93e8affee87f716a17
                            style={{
                              flex: 1,
                              padding: '10px 15px',
                              border: '1px solid #ddd',
                              borderRadius: '20px',
                              fontSize: '14px',
<<<<<<< HEAD
                              outline: 'none',
                              backgroundColor: isAdminOnline ? 'white' : '#f5f5f5'
=======
                              outline: 'none'
>>>>>>> 4b84aedac5ea083aff5a1d93e8affee87f716a17
                            }}
                          />
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              sendMessage();
                            }}
<<<<<<< HEAD
                            disabled={!newMessage.trim() || !isAdminOnline}
                            type="button"
                            style={{
                              backgroundColor: (newMessage.trim() && isAdminOnline) ? '#4caf50' : '#ccc',
=======
                            disabled={!newMessage.trim()}
                            type="button"
                            style={{
                              backgroundColor: newMessage.trim() ? '#4caf50' : '#ccc',
>>>>>>> 4b84aedac5ea083aff5a1d93e8affee87f716a17
                              color: 'white',
                              border: 'none',
                              borderRadius: '50%',
                              width: '40px',
                              height: '40px',
<<<<<<< HEAD
                              cursor: (newMessage.trim() && isAdminOnline) ? 'pointer' : 'not-allowed',
=======
                              cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
>>>>>>> 4b84aedac5ea083aff5a1d93e8affee87f716a17
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '18px'
                            }}
                          >
                            ➤
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      color: '#666',
                      backgroundColor: '#f8f9fa'
                    }}>
                      <div style={{ fontSize: '48px', marginBottom: '20px' }}>💬</div>
                      <h3 style={{ margin: '0 0 10px 0' }}>Select a conversation</h3>
                      <p style={{ margin: 0, textAlign: 'center' }}>
<<<<<<< HEAD
                        Choose from your existing conversations to start messaging with patients
=======
                        Choose from your existing conversations or start a new one
>>>>>>> 4b84aedac5ea083aff5a1d93e8affee87f716a17
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        }

        case 'feedback': {
          return (
            <div className="dashboard-content">
              <h3>Feedback</h3>
              <p>Here you can view patient feedback and ratings.</p>
            </div>
          );
        }

        case 'settings': {
          return (
            <div className="dashboard-content">
              <h3>Settings</h3>
              <p>Update clinic information, schedule, and preferences.</p>
            </div>
          );
        }

        default: {
          return (
            <div className="dashboard-content">
              <p>Welcome to Fano Dental Clinic Admin Panel</p>
            </div>
          );
        }
      }
    } catch (error) {
      console.error('Error rendering content:', error);
      return (
        <div className="dashboard-content">
          <div style={{ padding: '20px', textAlign: 'center' }}>
            <h3>Something went wrong</h3>
            <p>Please try refreshing the page or contact support.</p>
            <button onClick={() => window.location.reload()}>Refresh Page</button>
          </div>
        </div>
      );
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
          <button className={activeTab === 'services' ? 'nav-item active' : 'nav-item'} onClick={() => setActiveTab('services')}>
            <img src={servicesIcon} alt="Services Icon" className="nav-icon" />Services
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