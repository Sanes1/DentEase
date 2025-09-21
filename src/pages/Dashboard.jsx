import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import {
  collection,
  doc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  serverTimestamp,
  where,
  getDocs,
  deleteDoc,
  setDoc
} from "firebase/firestore";
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

//appointment export file
import jsPDF from "jspdf";

//service image upload
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { storage } from "../firebase"; 

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
  const navigate = useNavigate();
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

  //Feedback states
  const [showReplyFor, setShowReplyFor] = useState(new Set());
  const [feedbackCurrentPage, setFeedbackCurrentPage] = useState(1);
  const [feedbacks, setFeedbacks] = useState([]);
  const [ratingStats, setRatingStats] = useState({
  total: 0,
  average: 0,
  counts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
});

useEffect(() => {
  const fetchFeedbacks = async () => {
    try {
      const qSnap = await getDocs(collection(db, 'surveys'));
      const items = qSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Only completed surveys
      const completed = items.filter(i => i.surveyStage === 'completed');

      // Compute stats
      const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      let totalRating = 0;

      completed.forEach(item => {
        const rating = item.overallSatisfaction || 0;
        counts[rating] = (counts[rating] || 0) + 1;
        totalRating += rating;
      });

      const total = completed.length;
      const average = total > 0 ? totalRating / total : 0;

      setFeedbacks(completed);
      setRatingStats({ total, average, counts });
    } catch (err) {
      console.error('Error fetching surveys:', err);
    }
  };

  fetchFeedbacks();
}, []);

//settings states
const [settingsForm, setSettingsForm] = useState({
    // Email change form
    currentPasswordForEmail: '',
    newEmail: '',
    
    // Password change form
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState('admin@fanodental.com'); // You can get this from your auth system

  // Password validation function
  const validatePassword = (password) => {
    if (password.length < 12) {
      return 'Password must be at least 12 characters long';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/\d/.test(password)) {
      return 'Password must contain at least one number';
    }
    return null;
  };

  // Handle email change
  const handleEmailChange = async () => {
    if (!settingsForm.currentPasswordForEmail) {
      alert('Please enter your current password');
      return;
    }
    
    if (!settingsForm.newEmail) {
      alert('Please enter a new email address');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(settingsForm.newEmail)) {
      alert('Please enter a valid email address');
      return;
    }
    
    if (settingsForm.newEmail === currentUserEmail) {
      alert('New email must be different from current email');
      return;
    }

    setIsUpdating(true);
    
    try {
      // Here you would integrate with your authentication system
      // For now, this is a placeholder for the actual implementation
      
      // Example with Firebase Auth:
      // const user = auth.currentUser;
      // const credential = EmailAuthProvider.credential(currentUserEmail, settingsForm.currentPasswordForEmail);
      // await reauthenticateWithCredential(user, credential);
      // await updateEmail(user, settingsForm.newEmail);
      
      console.log('Email change request:', {
        currentPassword: settingsForm.currentPasswordForEmail,
        newEmail: settingsForm.newEmail
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Email updated successfully! Please check your new email for verification.');
      
      // Reset form
      setSettingsForm(prev => ({
        ...prev,
        currentPasswordForEmail: '',
        newEmail: ''
      }));
      setShowEmailForm(false);
      setCurrentUserEmail(settingsForm.newEmail);
      
    } catch (error) {
      console.error('Email change error:', error);
      alert('Failed to update email. Please check your password and try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    if (!settingsForm.currentPassword) {
      alert('Please enter your current password');
      return;
    }
    
    if (!settingsForm.newPassword) {
      alert('Please enter a new password');
      return;
    }
    
    // Validate new password
    const passwordError = validatePassword(settingsForm.newPassword);
    if (passwordError) {
      alert(passwordError);
      return;
    }
    
    if (settingsForm.newPassword !== settingsForm.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    
    if (settingsForm.currentPassword === settingsForm.newPassword) {
      alert('New password must be different from current password');
      return;
    }

    setIsUpdating(true);
    
    try {
      // Here you would integrate with your authentication system
      // For now, this is a placeholder for the actual implementation
      
      // Example with Firebase Auth:
      // const user = auth.currentUser;
      // const credential = EmailAuthProvider.credential(user.email, settingsForm.currentPassword);
      // await reauthenticateWithCredential(user, credential);
      // await updatePassword(user, settingsForm.newPassword);
      
      console.log('Password change request:', {
        currentPassword: settingsForm.currentPassword,
        newPassword: settingsForm.newPassword
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Password updated successfully!');
      
      // Reset form
      setSettingsForm(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      setShowPasswordForm(false);
      
    } catch (error) {
      console.error('Password change error:', error);
      alert('Failed to update password. Please check your current password and try again.');
    } finally {
      setIsUpdating(false);
    }
  };


  // Message states - Updated for real messenger with Firebase
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedChatRoom, setSelectedChatRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [messageSearch, setMessageSearch] = useState('');
  const [isAdminOnline, setIsAdminOnline] = useState(true);
  const [adminLastSeen, setAdminLastSeen] = useState(new Date());
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [newChatForm, setNewChatForm] = useState({
    userName: '',
    userEmail: '',
    userId: ''
  });

  // Current admin doctor (you can change this based on your login system)
  const currentDoctor = 'dr-jessica'; // This should come from your authentication

  // Patient tab states
  const [patientSearch, setPatientSearch] = useState("");
  const [patientFilter, setPatientFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  
  // Appointment tab states
  const [appointmentSearch, setAppointmentSearch] = useState(''); // distinct name
  const [appointmentCurrentPage, setAppointmentCurrentPage] = useState(1);

  const rowsPerPage = 5;

  //PDF export
 const exportAppointmentsToPDF = async (appointmentsToExport) => {
  if (!appointmentsToExport || appointmentsToExport.length === 0) {
    alert("No appointments to export");
    return;
  }

  // Dynamically import autoTable
  const { default: autoTable } = await import("jspdf-autotable");
  const doc = new jsPDF();

  const tableColumn = ["Patient Name", "Doctor", "Service", "Date", "Time", "Status"];
  const tableRows = [];

  appointmentsToExport.forEach(appt => {
    const apptData = [
      appt.userName,
      appt.doctor || "-",
      getServicesString(appt),
      formatDate(appt.appointmentDate || appt.date),
      appt.time || "-",
      appt.status ? appt.status.charAt(0).toUpperCase() + appt.status.slice(1) : "-"
    ];
    tableRows.push(apptData);
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 20,
    theme: "grid",
  });

  doc.text("Appointments List", 14, 15);
  doc.save("appointments.pdf");
};

  // Services tab states - UPDATED TO MATCH YOUR DATABASE STRUCTURE
  const [services, setServices] = useState([]);
  const [editingService, setEditingService] = useState(null);
  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    icon: '',
    order: 0,
    isActive: true
  });

  // Image upload states
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Add missing refs
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);

  // Handle image file selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      
      setSelectedImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload image to Firebase Storage
  const uploadServiceImage = async (imageFile) => {
    try {
      console.log('🔍 Step 1: Validating file...');
      if (!imageFile) {
        throw new Error('No image file provided');
      }
      console.log('✅ File provided:', imageFile.name, 'Size:', imageFile.size, 'Type:', imageFile.type);

      // Check file size (5MB limit)
      if (imageFile.size > 5 * 1024 * 1024) {
        throw new Error('Image size must be less than 5MB');
      }
      console.log('✅ File size OK');

      // Check file type
      if (!imageFile.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }
      console.log('✅ File type OK');

      console.log('🔍 Step 2: Checking Firebase Storage...');
      console.log('Storage instance:', storage);
      if (!storage) {
        throw new Error('Firebase Storage not initialized');
      }
      console.log('✅ Firebase Storage initialized');

      console.log('🔍 Step 3: Creating storage reference...');
      const timestamp = Date.now();
      const cleanFileName = imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `service_${timestamp}_${cleanFileName}`;
      const storagePath = `services/${fileName}`;
      
      console.log('📁 Storage path:', storagePath);
      
      const imageRef = ref(storage, storagePath);
      console.log('✅ Storage reference created:', imageRef);

      console.log('🔍 Step 4: Starting upload...');
      console.log('📤 Uploading to Firebase Storage...');
      
      const metadata = {
        contentType: imageFile.type,
        customMetadata: {
          uploadedBy: 'admin',
          uploadedAt: new Date().toISOString(),
          originalName: imageFile.name
        }
      };
      
      const snapshot = await uploadBytes(imageRef, imageFile, metadata);
      console.log('✅ Upload completed successfully!');
      console.log('📋 Upload snapshot:', snapshot);
      
      console.log('🔍 Step 5: Getting download URL...');
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log('✅ Download URL obtained:', downloadURL);
      
      return downloadURL;
      
    } catch (error) {
      console.error('❌ Upload failed:', error.message);
      console.error('🔧 Full error details:', error);
      
      if (error.code) {
        switch (error.code) {
          case 'storage/unauthorized':
            throw new Error('Upload failed: You do not have permission to upload files. Please check Firebase Storage security rules.');
          case 'storage/canceled':
            throw new Error('Upload was cancelled');
          case 'storage/unknown':
            throw new Error('Upload failed due to unknown error. Check your internet connection and try again.');
          case 'storage/invalid-format':
            throw new Error('Invalid file format');
          case 'storage/object-not-found':
            throw new Error('Storage path not found');
          case 'storage/bucket-not-found':
            throw new Error('Firebase Storage bucket not found. Check your Firebase configuration.');
          case 'storage/project-not-found':
            throw new Error('Firebase project not found. Check your Firebase configuration.');
          case 'storage/quota-exceeded':
            throw new Error('Storage quota exceeded. Contact administrator.');
          case 'storage/unauthenticated':
            throw new Error('User not authenticated. Please log in and try again.');
          case 'storage/retry-limit-exceeded':
            throw new Error('Upload failed after multiple attempts. Try again later.');
          default:
            throw new Error(`Upload failed: ${error.message} (Code: ${error.code})`);
        }
      } else {
        throw new Error(`Upload failed: ${error.message}`);
      }
    }
  };

  // Delete image from Firebase Storage
  const deleteServiceImage = async (imageUrl) => {
    if (!imageUrl) return;
    
    try {
      // Extract the path from the URL
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1].split('?')[0];
      const imagePath = `services/${decodeURIComponent(fileName)}`;
      
      const imageRef = ref(storage, imagePath);
      await deleteObject(imageRef);
    } catch (error) {
      console.error('Error deleting image:', error);
      // Don't throw error as service deletion should continue even if image deletion fails
    }
  };

  // Load services when component mounts
  const loadServices = () => {
    console.log('Loading services...');
  };

  useEffect(() => {
    if (activeTab === 'services') {
      loadServices();
    }
  }, [activeTab]);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Helper functions
  const formatDate = (value) => {
    if (!value) return '-';
    try {
      // Handle Firebase Timestamps or JS Date objects
      const d = value.toDate ? value.toDate() : new Date(value);
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
    if (!timestamp) return 'never';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffHours = Math.floor((now - date) / (1000 * 60 * 60));
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

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
    const lastSeenTime = lastSeen.toDate ? lastSeen.toDate() : new Date(lastSeen);
    const diffMins = Math.floor((now - lastSeenTime) / (1000 * 60));
    return diffMins <= 5 ? 'online' : 'offline';
  };

  // Derive approved appointments by date
  const approvedAppointmentsByDate = appointments
    .filter(a => a.status === 'approved')
    .reduce((acc, appt) => {
      const dateKey = formatDate(appt.appointmentDate || appt.date);
      acc[dateKey] = acc[dateKey] || [];
      acc[dateKey].push(appt);
      return acc;
    }, {});

  // Create new conversation - Updated to use correct Firebase path structure
  const createNewConversation = async () => {
    if (!newChatForm.userName.trim() || !newChatForm.userEmail.trim()) {
      alert("Please fill in required fields");
      return;
    }

    try {
      const userId = newChatForm.userId.trim() || `${newChatForm.userName.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;

      // Create conversation using the correct path: chat_rooms/{doctor}/user_conversations/{userId}
      const conversationRef = doc(db, "chat_rooms", currentDoctor, "user_conversations", userId);

      await setDoc(conversationRef, {
        createdAt: serverTimestamp(),
        lastMessage: "Conversation started",
        lastMessageSender: "admin",
        lastMessageTime: serverTimestamp(),
        userEmail: newChatForm.userEmail.trim(),
        userId: userId,
        userName: newChatForm.userName.trim(),
        adminLastSeen: serverTimestamp(),
        userLastSeen: null
      });

      // Add initial message using the correct path: chat_rooms/{doctor}/user_conversations/{userId}/messages
      await addDoc(collection(db, "chat_rooms", currentDoctor, "user_conversations", userId, "messages"), {
        text: "Hello! How can I help you today?",
        senderId: 'admin',
        senderName: 'Dr. Jessica Fano',
        senderType: 'admin',
        timestamp: serverTimestamp(),
        isRead: false
      });

      alert("New conversation created successfully!");
      setShowNewChatDialog(false);
      setNewChatForm({ userName: '', userEmail: '', userId: '' });
    } catch (error) {
      console.error("Error creating conversation:", error);
      alert("Failed to create conversation");
    }
  };

  // Delete conversation - Updated to use correct Firebase path structure
  const deleteConversation = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this conversation? This action cannot be undone.")) {
      return;
    }

    try {
      // Delete all messages first using correct path: chat_rooms/{doctor}/user_conversations/{userId}/messages
      const messagesRef = collection(db, "chat_rooms", currentDoctor, "user_conversations", userId, "messages");
      const messagesSnapshot = await getDocs(messagesRef);

      const deletePromises = messagesSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      // Delete the conversation using correct path: chat_rooms/{doctor}/user_conversations/{userId}
      await deleteDoc(doc(db, "chat_rooms", currentDoctor, "user_conversations", userId));

      alert("Conversation deleted successfully!");

      // Clear selected chat if it was the deleted one
      if (selectedChatRoom?.userId === userId) {
        setSelectedChatRoom(null);
        setMessages([]);
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
      alert("Failed to delete conversation");
    }
  };

  // Function to send a message in the chat room - Updated to use correct Firebase path structure
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChatRoom) return;

    try {
      // Send message using correct path: chat_rooms/{doctor}/user_conversations/{userId}/messages
      const messagesRef = collection(db, "chat_rooms", currentDoctor, "user_conversations", selectedChatRoom.userId, "messages");
      await addDoc(messagesRef, {
        text: newMessage.trim(),
        senderId: 'admin',
        senderName: 'Dr. Jessica Fano',
        senderType: 'admin',
        timestamp: serverTimestamp(),
        isRead: false
      });

      // Update conversation's last message using correct path: chat_rooms/{doctor}/user_conversations/{userId}
      const conversationRef = doc(db, "chat_rooms", currentDoctor, "user_conversations", selectedChatRoom.userId);
      await updateDoc(conversationRef, {
        lastMessage: newMessage.trim(),
        lastMessageTime: serverTimestamp(),
        lastMessageSender: 'admin',
        adminLastSeen: serverTimestamp()
      });

      setNewMessage('');
      messageInputRef.current?.focus();
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message");
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Mark messages as read when admin views them - Updated to use correct Firebase path structure
  const markMessagesAsRead = async (userId) => {
    try {
      // Access messages using correct path: chat_rooms/{doctor}/user_conversations/{userId}/messages
      const messagesRef = collection(db, "chat_rooms", currentDoctor, "user_conversations", userId, "messages");
      const unreadQuery = query(messagesRef, where("isRead", "==", false), where("senderType", "==", "user"));
      const unreadMessages = await getDocs(unreadQuery);

      const updatePromises = [];
      unreadMessages.forEach((doc) => {
        updatePromises.push(updateDoc(doc.ref, { isRead: true }));
      });

      await Promise.all(updatePromises);

      // Update admin's last seen using correct path: chat_rooms/{doctor}/user_conversations/{userId}
      const conversationRef = doc(db, "chat_rooms", currentDoctor, "user_conversations", userId);
      await updateDoc(conversationRef, {
        adminLastSeen: serverTimestamp()
      });
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  // UPDATED: Fetch services with correct database structure
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "services"), (querySnapshot) => {
      const servicesData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || '',
          description: data.description || '',
          price: data.price || 0,
          category: data.category || '',
          icon: data.icon || '',
          imageUrl: data.imageUrl || '',
          localImage: data.localImage || '',
          order: data.order || 0,
          isActive: data.isActive !== undefined ? data.isActive : true
        };
      });

      // Sort services by order, then by name
      servicesData.sort((a, b) => {
        if (a.order !== b.order) return a.order - b.order;
        return a.name.localeCompare(b.name);
      });
      setServices(servicesData);
    }, error => console.error("Services snapshot error:", error));

    return () => unsubscribe();
  }, []);

  // UPDATED: Function to add a new service to Firebase with correct structure
  const addService = async (serviceData) => {
    try {
      await addDoc(collection(db, "services"), {
        name: serviceData.name.trim(),
        description: serviceData.description.trim(),
        price: parseFloat(serviceData.price) || 0,
        category: serviceData.category.trim(),
        icon: serviceData.icon.trim(),
        imageUrl: serviceData.imageUrl || '',
        localImage: serviceData.localImage || '',
        order: parseInt(serviceData.order) || 0,
        isActive: serviceData.isActive !== undefined ? serviceData.isActive : true
      });
    } catch (error) {
      console.error("Error adding service:", error);
      throw error;
    }
  };

  // UPDATED: Function to update a service in Firebase with correct structure
  const updateService = async (serviceId, serviceData) => {
    try {
      const serviceRef = doc(db, "services", serviceId);
      await updateDoc(serviceRef, {
        name: serviceData.name.trim(),
        description: serviceData.description.trim(),
        price: parseFloat(serviceData.price) || 0,
        category: serviceData.category.trim(),
        icon: serviceData.icon.trim(),
        imageUrl: serviceData.imageUrl || '',
        localImage: serviceData.localImage || '',
        order: parseInt(serviceData.order) || 0,
        isActive: serviceData.isActive !== undefined ? serviceData.isActive : true
      });
    } catch (error) {
      console.error("Error updating service:", error);
      throw error;
    }
  };

  // Function to delete a service from Firebase
  const deleteService = async (serviceId) => {
    try {
      // Find the service to get its image URL
      const serviceToDelete = services.find(s => s.id === serviceId);
      
      // Delete the image from storage if it exists
      if (serviceToDelete?.imageUrl) {
        await deleteServiceImage(serviceToDelete.imageUrl);
      }
      
      // Delete the service from Firestore
      await deleteDoc(doc(db, "services", serviceId));
    } catch (error) {
      console.error("Error deleting service:", error);
    }
  };

  // FIXED: Fetch appointments from Firebase (real-time) - Updated to handle all status values including "finished"
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "appointments"), (querySnapshot) => {
      const data = querySnapshot.docs.map(d => {
        const appt = d.data() || {};
        // FIXED: Don't override the status if it's already set correctly in the database
        // Keep the original status from database, including "finished"
        return {
          id: d.id,
          ...appt,
          // Only set to pending if status is undefined/null, otherwise keep the database value
          status: appt.status || 'pending'
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

  // Fetch chat rooms from Firebase (real-time) - Updated for correct path structure
  useEffect(() => {
    // Access conversations using correct path: chat_rooms/{doctor}/user_conversations
    const conversationsRef = collection(db, "chat_rooms", currentDoctor, "user_conversations");
    const conversationsQuery = query(conversationsRef, orderBy("lastMessageTime", "desc"));

    const unsubscribe = onSnapshot(conversationsQuery, async (snapshot) => {
      const conversations = [];

      for (const doc of snapshot.docs) {
        const conversationData = doc.data();

        // Get unread messages count using correct path: chat_rooms/{doctor}/user_conversations/{userId}/messages
        const messagesRef = collection(db, "chat_rooms", currentDoctor, "user_conversations", doc.id, "messages");
        const unreadQuery = query(messagesRef, where("isRead", "==", false), where("senderType", "==", "user"));
        const unreadSnapshot = await getDocs(unreadQuery);

        conversations.push({
          userId: doc.id,
          ...conversationData,
          unreadCount: unreadSnapshot.size,
          lastMessageTime: conversationData.lastMessageTime?.toDate ? conversationData.lastMessageTime.toDate() : conversationData.lastMessageTime,
          userLastSeen: conversationData.userLastSeen?.toDate ? conversationData.userLastSeen.toDate() : conversationData.userLastSeen,
          adminLastSeen: conversationData.adminLastSeen?.toDate ? conversationData.adminLastSeen.toDate() : conversationData.adminLastSeen
        });
      }

      setChatRooms(conversations);

      // Update selected chat room if it exists
      if (selectedChatRoom) {
        const updatedRoom = conversations.find(r => r.userId === selectedChatRoom.userId);
        if (updatedRoom) {
          setSelectedChatRoom(updatedRoom);
        }
      }
    }, error => console.error("Chat rooms snapshot error:", error));

    return () => unsubscribe();
  }, [currentDoctor, selectedChatRoom?.userId]);

  // Fetch messages for selected chat room (real-time) - Updated for correct path structure
  useEffect(() => {
    if (!selectedChatRoom) {
      setMessages([]);
      return;
    }

    // Access messages using correct path: chat_rooms/{doctor}/user_conversations/{userId}/messages
    const messagesRef = collection(db, "chat_rooms", currentDoctor, "user_conversations", selectedChatRoom.userId, "messages");
    const messagesQuery = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const msgs = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : data.timestamp,
          text: data.text || "",
          senderId: data.senderId || "",
          senderName: data.senderName || data.senderId || "",
          senderType: data.senderType || "user",
          isRead: data.isRead || false
        };
      });
      setMessages(msgs);

      // Mark messages as read when admin opens the chat
      if (msgs.length > 0) {
        markMessagesAsRead(selectedChatRoom.userId);
      }
    }, error => console.error("Messages snapshot error:", error));

    return () => unsubscribe();
  }, [currentDoctor, selectedChatRoom?.userId]);

  // Update admin's online status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (isAdminOnline) {
        setAdminLastSeen(new Date());
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [isAdminOnline]);

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

  // Filter chat rooms based on search
  const filteredChatRooms = chatRooms.filter(room => {
    const searchLower = messageSearch.toLowerCase();
    return room.userName?.toLowerCase().includes(searchLower) ||
           room.userEmail?.toLowerCase().includes(searchLower) ||
           room.lastMessage?.toLowerCase().includes(searchLower);
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

  // Format rating display - use the same ratingStats from feedback
  const displayRating = ratingStats.total > 0 
    ? `${ratingStats.average.toFixed(1)}⭐` 
    : 'No ratings';

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
          <p className="stat-number">{displayRating}</p>
          <div className="stat-label">
            <img src={analyticsIcon} alt="Rating Icon" className="stat-icon" />
            <span>Average Rating</span>
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
          // FIXED: Updated filter to include "finished" status
          const filteredAppointments = appointments
            .filter(appt => appointmentFilter === 'all' || appt.status === appointmentFilter)
            .filter(appt => {
              const searchText = appointmentSearch.toLowerCase();
              const patientName = appt.userName.toLowerCase();
              const services = getServicesString(appt).toLowerCase();
              return patientName.includes(searchText) || services.includes(searchText);
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
              <div style={{ 
                position: 'absolute',
                top: '4px',
                right: '4px',
                textAlign: 'center', 
                color: 'white', 
                background: 'linear-gradient(135deg, #10b981, #059669)', 
                borderRadius: '50%', 
                fontSize: '10px',
                fontWeight: 'bold',
                minWidth: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(16, 185, 129, 0.4)',
                border: '2px solid white',
                zIndex: 1
              }}>
                {appts.length}
              </div>
            ) : null;
          };

          return (
            <div className="dashboard-content">
              <div className="controls-wrapper">
                <div className="left-controls">
                  <input
                    type="text"
                    placeholder="Search patients..."
                    value={appointmentSearch}
                    onChange={(e) => setAppointmentSearch(e.target.value)}
                    className="search-input"
                  />
                  <button
                    className="export-btn"
                    onClick={async () => await exportAppointmentsToPDF(filteredAppointments)}
                  >
                    Export PDF
                  </button>
                </div>

                <div className="right-controls">
                  {/* FIXED: Updated filter select to include "finished" option */}
                  <select
                    className="filter-select"
                    value={appointmentFilter}
                    onChange={(e) => setAppointmentFilter(e.target.value)}
                  >
                    <option value="all">All Appointments</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="declined">Declined</option>
                    <option value="finished">Finished</option>
                  </select>
                  <button
                    className="calendar-btn"
                    onClick={() => setShowCalendar(!showCalendar)}
                  >
                    📅 Calendar View
                  </button>
                </div>
              </div>

              {/* ENHANCED CALENDAR MODAL */}
              {showCalendar && (
                <div
                  style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000,
                    backdropFilter: 'blur(4px)'
                  }}
                  onClick={() => setShowCalendar(false)}
                >
                  <div
                    style={{
                      backgroundColor: 'white',
                      padding: '0',
                      borderRadius: '16px',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                      maxWidth: '500px',
                      width: '90%',
                      maxHeight: '90vh',
                      overflow: 'auto',
                      border: '1px solid #e5e7eb',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Calendar Header */}
                    <div style={{
                      background: '#094685',
                      padding: '24px',
                      color: 'white'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <h3 style={{
                          margin: '0',
                          fontSize: '24px',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          color: 'white'
                        }}>
                          <span style={{ fontSize: '28px' }}>📅</span>
                          Appointments Calendar
                        </h3>
                        <button
                          style={{
                            background: 'rgba(255, 255, 255, 0.2)',
                            border: 'none',
                            color: 'white',
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '18px',
                            transition: 'background-color 0.2s'
                          }}
                          onClick={() => setShowCalendar(false)}
                          onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    {/* Calendar Content */}
                    <div style={{ 
                      padding: '24px',
                      flex: '1',
                      overflowY: 'auto'
                    }}>
                      <div style={{
                        backgroundColor: '#f8fafc',
                        borderRadius: '12px',
                        padding: '16px',
                        marginBottom: '10px'
                      }}>
                        <style>
                          {`
                            .react-calendar {
                              width: 100% !important;
                              background: transparent !important;
                              border: none !important;
                              font-family: inherit !important;
                            }
                            
                            .react-calendar__navigation {
                              display: flex !important;
                              height: 48px !important;
                              margin-bottom: 16px !important;
                            }
                            
                            .react-calendar__navigation button {
                              background: #094685 !important;
                              color: white !important;
                              border: none !important;
                              border-radius: 8px !important;
                              font-weight: 600 !important;
                              font-size: 14px !important;
                              transition: all 0.2s ease !important;
                              margin: 0 4px !important;
                              min-width: 40px !important;
                            }
                            
                            .react-calendar__navigation button:hover {
                              transform: translateY(-1px) !important;
                              box-shadow: #094685 !important;
                            }
                            
                            .react-calendar__navigation button:disabled {
                              background: #e5e7eb !important;
                              color: #9ca3af !important;
                              transform: none !important;
                              box-shadow: none !important;
                            }
                            
                            .react-calendar__month-view__weekdays {
                              background: #f1f5f9 !important;
                              border-radius: 8px !important;
                              margin-bottom: 8px !important;
                            }
                            
                            .react-calendar__month-view__weekdays__weekday {
                              padding: 12px 8px !important;
                              font-weight: 600 !important;
                              font-size: 12px !important;
                              color: #475569 !important;
                              text-transform: uppercase !important;
                              letter-spacing: 0.5px !important;
                            }
                            
                            .react-calendar__month-view__days {
                              display: grid !important;
                              grid-template-columns: repeat(7, 1fr) !important;
                              gap: 4px !important;
                            }
                            
                            .react-calendar__tile {
                              background: white !important;
                              border: 1px solid #e2e8f0 !important;
                              border-radius: 8px !important;
                              height: 48px !important;
                              font-weight: 500 !important;
                              font-size: 14px !important;
                              color: #374151 !important;
                              display: flex !important;
                              align-items: center !important;
                              justify-content: center !important;
                              position: relative !important;
                              transition: all 0.2s ease !important;
                            }
                            
                            .react-calendar__tile:hover {
                              background: #f0f9ff !important;
                              border-color: #0ea5e9 !important;
                              transform: translateY(-1px) !important;
                              box-shadow: #094685 !important;
                            }
                            
                            .react-calendar__tile--active {
                              background: #094685 !important;
                              color: white !important;
                              border-color: #0284c7 !important;
                              box-shadow: #094685 !important;
                            }
                            
                            .react-calendar__tile--now {
                              background: #fef3c7 !important;
                              border-color: #f59e0b !important;
                              color: #92400e !important;
                              font-weight: 600 !important;
                            }
                            
                            .react-calendar__tile--now:hover {
                              background: #fde68a !important;
                            }
                            
                            .react-calendar__tile--neighboringMonth {
                              color: #9ca3af !important;
                              background: #f9fafb !important;
                            }
                            
                            .react-calendar__tile--hasActive {
                              background: #dbeafe !important;
                              border-color: #3b82f6 !important;
                            }
                          `}
                        </style>
                        <ReactCalendar
                          onChange={setCalendarDate}
                          value={calendarDate}
                          tileContent={tileContent}
                        />
                      </div>
                      
                      {/* APPOINTMENT DETAILS SECTION - FINAL DESIGN */}
                      <div style={{ 
                        marginTop: '20px',
                        padding: '20px',
                        backgroundColor: '#f0f9ff',
                        borderRadius: '12px',
                        border: '1px solid #e0f2fe'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          marginBottom: '16px'
                        }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            backgroundColor: '#0ea5e9',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '18px'
                          }}>
                            📆
                          </div>
                          <div>
                            <h4 style={{
                              margin: '0 0 4px 0',
                              fontSize: '18px',
                              fontWeight: '600',
                              color: '#0c4a6e'
                            }}>
                              {formatDate(calendarDate)}
                            </h4>
                            <p style={{
                              margin: '0',
                              fontSize: '14px',
                              color: '#64748b'
                            }}>
                              {(() => {
                                const appointments = approvedAppointmentsByDate[formatDate(calendarDate)] || [];
                                console.log('Appointments for', formatDate(calendarDate), ':', appointments);
                                return `${appointments.length} appointment${appointments.length !== 1 ? 's' : ''} scheduled`;
                              })()}
                            </p>
                          </div>
                        </div>

                        {(() => {
                          const appointments = approvedAppointmentsByDate[formatDate(calendarDate)] || [];
                          
                          if (appointments.length > 0) {
                            return (
                              <div style={{ marginTop: '16px' }}>
                                <div style={{
                                  fontSize: '14px',
                                  fontWeight: '500',
                                  color: '#374151',
                                  marginBottom: '12px'
                                }}>
                                  Scheduled Appointments:
                                </div>
                                <div style={{
                                  maxHeight: '200px',
                                  overflowY: 'auto'
                                }}>
                                  {appointments.map(appt => (
                                    <div key={appt.id} style={{
                                      backgroundColor: 'white',
                                      borderRadius: '8px',
                                      padding: '12px 16px',
                                      marginBottom: '8px',
                                      border: '1px solid #e2e8f0',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '12px'
                                    }}>
                                      <div style={{
                                        width: '8px',
                                        height: '8px',
                                        backgroundColor: '#10b981',
                                        borderRadius: '50%',
                                        flexShrink: 0
                                      }}></div>
                                      <div style={{ flex: 1 }}>
                                        <div style={{
                                          fontWeight: '500',
                                          color: '#1f2937',
                                          fontSize: '14px'
                                        }}>
                                          {appt.userName}
                                        </div>
                                        <div style={{
                                          fontSize: '13px',
                                          color: '#6b7280',
                                          marginTop: '2px'
                                        }}>
                                          {getServicesString(appt)}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          } else {
                            return (
                              <div style={{
                                textAlign: 'center',
                                padding: '20px',
                                color: '#6b7280',
                                fontSize: '14px'
                              }}>
                                <div style={{
                                  fontSize: '32px',
                                  marginBottom: '8px',
                                  opacity: 0.5
                                }}>
                                  📅
                                </div>
                                No appointments scheduled for this date
                              </div>
                            );
                          }
                        })()}
                      </div>
                    </div>
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
                          {/* FIXED: Only show action buttons for pending appointments, hide for finished */}
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
                          {/* FIXED: Show no buttons for finished appointments */}
                          {appt.status === 'finished' && (
                            <span style={{ color: '#666', fontStyle: 'italic' }}>
                              Completed
                            </span>
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
            // Reset form for new service
            setEditingService({ id: null });
            setServiceForm({
              name: '',
              description: '',
              price: '',
              category: 'restorative',
              icon: 'ellipse-outline',
              order: services.length + 1,
              isActive: true
            });
            setSelectedImage(null);
            setImagePreview('');
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

      {/* Services grid */}
      <div
        className="services-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
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
              minHeight: '350px',
              opacity: service.isActive ? 1 : 0.6
            }}
          >
            {/* Service Image */}
            <div style={{ marginBottom: '10px' }}>
              {service.imageUrl ? (
                <img
                  src={service.imageUrl}
                  alt={service.name}
                  style={{
                    width: '100%',
                    height: '120px',
                    objectFit: 'cover',
                    borderRadius: '6px',
                    backgroundColor: '#f5f5f5',
                  }}
                />
              ) : service.localImage ? (
                <div
                  style={{
                    width: '100%',
                    height: '120px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#666',
                    fontSize: '12px',
                    textAlign: 'center',
                    padding: '10px'
                  }}
                >
                  Local Image: {service.localImage}
                </div>
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '120px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#999',
                    fontSize: '14px',
                  }}
                >
                  No Image
                </div>
              )}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <h4 style={{ margin: 0, color: '#333', flex: 1 }}>{service.name}</h4>
                <span style={{
                  fontSize: '12px',
                  padding: '2px 6px',
                  backgroundColor: service.isActive ? '#4caf50' : '#f44336',
                  color: 'white',
                  borderRadius: '10px'
                }}>
                  {service.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
                Category: {service.category} | Order: {service.order}
              </div>
              
              {service.icon && (
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
                  Icon: {service.icon}
                </div>
              )}
              
              <p style={{ 
                flexGrow: 1, 
                marginBottom: '10px', 
                color: '#666', 
                lineHeight: '1.4',
                fontSize: '14px'
              }}>
                {service.description}
              </p>
              
              <p style={{ 
                fontWeight: 'bold', 
                marginBottom: '15px', 
                fontSize: '18px', 
                color: '#4caf50' 
              }}>
                ₱{service.price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => {
                  setEditingService(service);
                  setServiceForm({
                    name: service.name,
                    description: service.description,
                    price: service.price.toString(),
                    category: service.category,
                    icon: service.icon,
                    order: service.order,
                    isActive: service.isActive
                  });
                  setSelectedImage(null);
                  setImagePreview(service.imageUrl || '');
                }}
                style={{
                  flex: 1,
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
              <button
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete "${service.name}"?`)) {
                    deleteService(service.id);
                  }
                }}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {services.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '50px 20px',
          color: '#666',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          marginTop: '20px'
        }}>
          <h3>No Services Found</h3>
          <p>Start by adding your first dental service using the "Add Service" button above.</p>
        </div>
      )}

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
              padding: '25px',
              borderRadius: '8px',
              minWidth: '500px',
              maxWidth: '90vw',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>
              {editingService.id ? 'Edit Service' : 'Add New Service'}
            </h3>

            {/* Image Upload Section */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Service Image</label>
              
              {/* Image Preview */}
              {imagePreview && (
                <div style={{ marginBottom: '10px' }}>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{
                      width: '100%',
                      maxWidth: '200px',
                      height: '120px',
                      objectFit: 'cover',
                      borderRadius: '6px',
                      border: '1px solid #ddd',
                    }}
                  />
                </div>
              )}
              
              {/* File Input */}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                }}
              />
              <small style={{ color: '#666', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                Supported formats: JPG, PNG, GIF (Max: 5MB)
              </small>
            </div>

            {/* Service Name */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Name *</label>
              <input
                type="text"
                value={serviceForm.name}
                onChange={e => setServiceForm({...serviceForm, name: e.target.value})}
                placeholder="Enter service name"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* Description */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Description *</label>
              <textarea
                value={serviceForm.description}
                onChange={e => setServiceForm({...serviceForm, description: e.target.value})}
                rows={4}
                placeholder="Describe the service"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Price */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Price (₱) *</label>
              <input
                type="number"
                value={serviceForm.price}
                onChange={e => setServiceForm({...serviceForm, price: e.target.value})}
                min="0"
                step="0.01"
                placeholder="0.00"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* Category */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Category</label>
              <select
                value={serviceForm.category}
                onChange={e => setServiceForm({...serviceForm, category: e.target.value})}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <option value="restorative">Restorative</option>
                <option value="preventive">Preventive</option>
                <option value="cosmetic">Cosmetic</option>
                <option value="orthodontic">Orthodontic</option>
                <option value="surgical">Surgical</option>
                <option value="periodontal">Periodontal</option>
                <option value="endodontic">Endodontic</option>
              </select>
            </div>

            {/* Icon */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Icon</label>
              <input
                type="text"
                value={serviceForm.icon}
                onChange={e => setServiceForm({...serviceForm, icon: e.target.value})}
                placeholder="e.g., ellipse-outline"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* Order and Active Status */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Order</label>
                <input
                  type="number"
                  value={serviceForm.order}
                  onChange={e => setServiceForm({...serviceForm, order: parseInt(e.target.value) || 0})}
                  min="0"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Status</label>
                <select
                  value={serviceForm.isActive}
                  onChange={e => setServiceForm({...serviceForm, isActive: e.target.value === 'true'})}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                >
                  <option value={true}>Active</option>
                  <option value={false}>Inactive</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setEditingService(null)}
                style={{
                  padding: '8px 16px',
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
                onClick={async () => {
                  // Validation
                  if (!serviceForm.name.trim()) {
                    alert('Please enter a service name');
                    return;
                  }
                  if (!serviceForm.description.trim()) {
                    alert('Please enter a description');
                    return;
                  }
                  if (!serviceForm.price || parseFloat(serviceForm.price) < 0) {
                    alert('Please enter a valid price');
                    return;
                  }

                  setUploadingImage(true);
                  
                  try {
                    let imageUrl = '';
                    let localImage = '';
                    
                    // If editing an existing service and no new image is selected, keep the old image
                    if (editingService.id && !selectedImage) {
                      imageUrl = editingService.imageUrl || '';
                      localImage = editingService.localImage || '';
                    }
                    
                    // Upload new image if selected
                    if (selectedImage) {
                      console.log('Starting image upload...', selectedImage.name);
                      try {
                        imageUrl = await uploadServiceImage(selectedImage);
                        localImage = selectedImage.name; // Store original filename
                        console.log('Image uploaded successfully:', imageUrl);
                      } catch (uploadError) {
                        console.error('Image upload failed:', uploadError);
                        alert(`Image upload failed: ${uploadError.message}`);
                        return;
                      }
                    }

                    // Prepare service data with correct structure
                    const serviceData = {
                      name: serviceForm.name,
                      description: serviceForm.description,
                      price: serviceForm.price,
                      category: serviceForm.category,
                      icon: serviceForm.icon,
                      imageUrl: imageUrl,
                      localImage: localImage,
                      order: serviceForm.order,
                      isActive: serviceForm.isActive
                    };

                    // Save service to database
                    try {
                      if (editingService.id) {
                        // Update existing service
                        console.log('Updating existing service...');
                        await updateService(editingService.id, serviceData);
                        console.log('Service updated successfully');
                      } else {
                        // Add new service
                        console.log('Adding new service...');
                        await addService(serviceData);
                        console.log('Service added successfully');
                      }
                      
                      // Reset form and close modal
                      setEditingService(null);
                      setSelectedImage(null);
                      setImagePreview('');
                      setServiceForm({
                        name: '',
                        description: '',
                        price: '',
                        category: 'restorative',
                        icon: 'ellipse-outline',
                        order: 0,
                        isActive: true
                      });
                      
                    } catch (dbError) {
                      console.error('Database operation failed:', dbError);
                      alert(`Failed to save service: ${dbError.message}`);
                    }
                    
                  } catch (error) {
                    console.error('General error saving service:', error);
                    alert(`Error saving service: ${error.message}`);
                  } finally {
                    setUploadingImage(false);
                  }
                }}
                disabled={uploadingImage}
                style={{
                  padding: '8px 16px',
                  backgroundColor: uploadingImage ? '#ccc' : '#4caf50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: uploadingImage ? 'not-allowed' : 'pointer',
                }}
              >
                {uploadingImage 
                  ? 'Uploading...' 
                  : `${editingService.id ? 'Update' : 'Add'} Service`
                }
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <h3 style={{ margin: 0, fontSize: '18px' }}>Messages</h3>
                      <button
                        onClick={() => setShowNewChatDialog(true)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#4caf50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        + New Chat
                      </button>
                    </div>
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
                      <label style={{ fontSize: '14px', color: '#666' }}>Status:</label>
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
                    {filteredChatRooms.length === 0 ? (
                      <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                        No conversations found
                      </div>
                    ) : (
                      filteredChatRooms.map(room => {
                        const userStatus = getUserStatus(room.userLastSeen);
                        return (
                          <div
                            key={room.userId}
                            onClick={() => setSelectedChatRoom(room)}
                            style={{
                              padding: '12px 15px',
                              borderBottom: '1px solid #eee',
                              cursor: 'pointer',
                              backgroundColor: selectedChatRoom?.userId === room.userId ? '#e3f2fd' : 'white'
                            }}
                            onMouseEnter={(e) => {
                              if (selectedChatRoom?.userId !== room.userId) {
                                e.currentTarget.style.backgroundColor = '#f5f5f5';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (selectedChatRoom?.userId !== room.userId) {
                                e.currentTarget.style.backgroundColor = 'white';
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
                                  {room.userName?.charAt(0)?.toUpperCase() || 'U'}
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
                                    {room.userName || 'Unknown User'}
                                  </h4>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <span style={{
                                      fontSize: '12px',
                                      color: '#999',
                                      flexShrink: 0
                                    }}>
                                      {formatTime(room.lastMessageTime)}
                                    </span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteConversation(room.userId);
                                      }}
                                      style={{
                                        padding: '2px 6px',
                                        backgroundColor: '#f44336',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '3px',
                                        cursor: 'pointer',
                                        fontSize: '10px'
                                      }}
                                    >
                                      ×
                                    </button>
                                  </div>
                                </div>
                                <p style={{
                                  margin: '2px 0 0 0',
                                  fontSize: '13px',
                                  color: '#666',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}>
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
                    )}
                  </div>
                </div>

                <div className="chat-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {selectedChatRoom ? (
                    <>
                      <div style={{
                        padding: '15px 20px',
                        borderBottom: '1px solid #eee',
                        backgroundColor: '#f8f9fa',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}>
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
                            {selectedChatRoom.userName?.charAt(0)?.toUpperCase() || 'U'}
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
                            {selectedChatRoom.userName || 'Unknown User'}
                          </h3>
                          <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
                            {selectedChatRoom.userEmail || 'No email'}
                          </p>
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
                        {messages.map(msg => {
                          const isFromAdmin = msg.senderType === 'admin';

                          return (
                            <div
                              key={msg.id}
                              style={{
                                alignSelf: isFromAdmin ? 'flex-end' : 'flex-start',
                                maxWidth: '70%'
                              }}
                            >
                              {!isFromAdmin && (
                                <div style={{
                                  fontSize: '11px',
                                  color: '#666',
                                  marginBottom: '2px',
                                  marginLeft: '10px'
                                }}>
                                  {msg.senderName || 'Patient'}
                                </div>
                              )}

                              <div style={{
                                background: isFromAdmin ? '#4caf50' : 'white',
                                color: isFromAdmin ? '#fff' : '#000',
                                padding: '10px 12px',
                                borderRadius: isFromAdmin ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                border: isFromAdmin ? 'none' : '1px solid #ddd'
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
                                  {formatMessageTime(msg.timestamp)}
                                  {isFromAdmin && (
                                    <span style={{ marginLeft: '5px' }}>
                                      {msg.isRead ? '✓✓' : '✓'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </div>

                      <div style={{
                        padding: '15px',
                        borderTop: '1px solid #eee',
                        backgroundColor: 'white'
                      }}>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                          <input
                            ref={messageInputRef}
                            type="text"
                            placeholder={isAdminOnline ? "Type a message..." : "You are offline - go online to send messages"}
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={!isAdminOnline}
                            style={{
                              flex: 1,
                              padding: '10px 15px',
                              border: '1px solid #ddd',
                              borderRadius: '20px',
                              fontSize: '14px',
                              outline: 'none',
                              backgroundColor: isAdminOnline ? 'white' : '#f5f5f5'
                            }}
                          />
                          <button
                            onClick={sendMessage}
                            disabled={!newMessage.trim() || !isAdminOnline}
                            type="button"
                            style={{
                              backgroundColor: (newMessage.trim() && isAdminOnline) ? '#4caf50' : '#ccc',
                              color: 'white',
                              border: 'none',
                              borderRadius: '50%',
                              width: '40px',
                              height: '40px',
                              cursor: (newMessage.trim() && isAdminOnline) ? 'pointer' : 'not-allowed',
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
                      <p style={{ margin: '0 0 15px 0', textAlign: 'center' }}>
                        Choose from your existing conversations to start messaging with patients
                      </p>
                      <button
                        onClick={() => setShowNewChatDialog(true)}
                        style={{
                          padding: '10px 20px',
                          backgroundColor: '#4caf50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        + Start New Conversation
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* New chat dialog modal */}
              {showNewChatDialog && (
                <div
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 9999,
                  }}
                  onClick={() => setShowNewChatDialog(false)}
                >
                  <div
                    style={{
                      background: 'white',
                      padding: '25px',
                      borderRadius: '8px',
                      minWidth: '400px',
                      maxWidth: '90vw',
                    }}
                    onClick={e => e.stopPropagation()}
                  >
                    <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>Start New Conversation</h3>

                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Customer Name *</label>
                      <input
                        type="text"
                        value={newChatForm.userName}
                        onChange={e => setNewChatForm({...newChatForm, userName: e.target.value})}
                        placeholder="Enter customer name"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email Address *</label>
                      <input
                        type="email"
                        value={newChatForm.userEmail}
                        onChange={e => setNewChatForm({...newChatForm, userEmail: e.target.value})}
                        placeholder="Enter email address"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>User ID (Optional)</label>
                      <input
                        type="text"
                        value={newChatForm.userId}
                        onChange={e => setNewChatForm({...newChatForm, userId: e.target.value})}
                        placeholder="Auto-generated if empty"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #ddd',
                          borderRadius: '4px',
                          fontSize: '14px'
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                      <button
                        onClick={() => setShowNewChatDialog(false)}
                        style={{
                          padding: '8px 16px',
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
                        onClick={createNewConversation}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#4caf50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        Create Conversation
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        }

 case 'feedback': {
  // Pagination setup
  const feedbackRowsPerPage = 5;
  const feedbackTotalPages = Math.max(1, Math.ceil(feedbacks.length / feedbackRowsPerPage));
  
  // Paginated feedbacks
  const paginatedFeedbacks = feedbacks.slice(
    (feedbackCurrentPage - 1) * feedbackRowsPerPage,
    feedbackCurrentPage * feedbackRowsPerPage
  );

  return (
    <div className="feedback-container">
      {/* Top row */}
      <div className="feedback-top">
        {/* Total Reviews */}
        <div className="feedback-stat">
          <div className="feedback-stat-number">{ratingStats.total}</div>
          <div className="feedback-stat-label">Total Reviews</div>
        </div>

        {/* Average Rating */}
        <div className="feedback-average">
          <div className="feedback-average-number">
            {ratingStats.average.toFixed(1)}
          </div>
          <div className="feedback-stars">
            {'⭐'.repeat(Math.floor(ratingStats.average)) +
              (ratingStats.average % 1 >= 0.5 ? '⭐' : '')}
          </div>
          <div className="feedback-stat-label">Average Rating</div>
        </div>

        {/* Rating breakdown */}
        <div className="rating-breakdown">
          {[5, 4, 3, 2, 1].map(star => (
            <div key={star} className="rating-row">
              <span className="rating-number">{star}</span>
              <div className="bar-bg">
                <div
                  className="bar-fill"
                  style={{
                    width: `${
                      ratingStats.total
                        ? (ratingStats.counts[star] / ratingStats.total) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feedback list */}
      <div className="feedback-list">
        {paginatedFeedbacks.map((fb, idx) => {
          const actualIdx = (feedbackCurrentPage - 1) * feedbackRowsPerPage + idx;
          
          return (
            <div key={fb.id || actualIdx} className="feedback-card">
              <div className="feedback-card-header">
                <strong>{fb.userEmail}</strong>
                <span>
                  {fb.completedAt?.seconds
                    ? new Date(fb.completedAt.seconds * 1000).toLocaleDateString()
                    : ''}
                </span>
              </div>

              <div className="feedback-stars">
                {'⭐'.repeat(fb.overallSatisfaction)}
              </div>

              <div className="feedback-message">{fb.openFeedback}</div>

              {/* Show all admin replies if they exist */}
              {fb.adminReplies && fb.adminReplies.length > 0 && (
                <div className="admin-replies" style={{ marginTop: '15px' }}>
                  {fb.adminReplies.map((reply, replyIdx) => (
                    <div key={replyIdx} className="admin-reply" style={{
                      backgroundColor: '#f0f8ff',
                      padding: '10px',
                      borderRadius: '6px',
                      marginBottom: '10px',
                      borderLeft: '4px solid #094685'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <strong>Your reply:</strong> {reply.text}
                        </div>
                        <small style={{ color: '#666', fontSize: '12px' }}>
                          {reply.replyAt?.seconds 
                            ? new Date(reply.replyAt.seconds * 1000).toLocaleString()
                            : reply.replyAt instanceof Date
                            ? reply.replyAt.toLocaleString()
                            : 'Just now'
                          }
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply button - always show unless reply field is currently open */}
              {!showReplyFor.has(fb.id) && (
                <button
                  className="reply-btn"
                  onClick={() => {
                    const newSet = new Set(showReplyFor);
                    newSet.add(fb.id);
                    setShowReplyFor(newSet);
                  }}
                  style={{
                    marginTop: '10px',
                    padding: '8px 16px',
                    backgroundColor: '#094685',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {fb.adminReplies && fb.adminReplies.length > 0 ? 'Reply Again' : 'Reply'}
                </button>
              )}

              {/* Reply section - only show if reply button was clicked */}
              {showReplyFor.has(fb.id) && (
                <div className="reply-section" style={{ marginTop: '15px' }}>
                  <textarea
                    className="reply-input"
                    placeholder="Write a reply..."
                    value={fb.replyText || ''}
                    onChange={e => {
                      const val = e.target.value;
                      setFeedbacks(prev =>
                        prev.map((item, i) =>
                          i === actualIdx ? { ...item, replyText: val } : item
                        )
                      );
                    }}
                    style={{
                      width: '100%',
                      minHeight: '80px',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      marginBottom: '10px',
                      resize: 'vertical'
                    }}
                  />
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      className="reply-btn"
                      onClick={async () => {
                        const replyText = fb.replyText || '';
                        if (!replyText.trim()) {
                          alert('Please enter a reply message');
                          return;
                        }
                        
                        try {
                          // Get existing replies or create empty array
                          const existingReplies = fb.adminReplies || [];
                          
                          // Create new reply object with Firestore Timestamp
                          const newReply = {
                            text: replyText.trim(),
                            replyAt: new Date() // Use regular Date object instead of serverTimestamp()
                          };
                          
                          // Add new reply to the array
                          const updatedReplies = [...existingReplies, newReply];
                          
                          // Update Firestore
                          await updateDoc(doc(db, 'surveys', fb.id), {
                            adminReplies: updatedReplies,
                            // Keep the old adminReply field for backward compatibility
                            adminReply: replyText.trim(),
                            replyAt: serverTimestamp(), // This is outside the array, so it's allowed
                          });
                          
                          // Update local state
                          setFeedbacks(prev =>
                            prev.map((item, i) =>
                              i === actualIdx
                                ? { 
                                    ...item, 
                                    adminReplies: updatedReplies,
                                    adminReply: replyText.trim(), 
                                    replyText: '' 
                                  }
                                : item
                            )
                          );
                          
                          // Hide reply field
                          const newSet = new Set(showReplyFor);
                          newSet.delete(fb.id);
                          setShowReplyFor(newSet);
                          
                        } catch (error) {
                          console.error('Error sending reply:', error);
                          alert(`Failed to send reply: ${error.message}`);
                        }
                      }}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#4caf50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Send Reply
                    </button>
                    
                    <button
                      onClick={() => {
                        // Cancel reply and hide field
                        const newSet = new Set(showReplyFor);
                        newSet.delete(fb.id);
                        setShowReplyFor(newSet);
                        
                        // Clear any text that was typed
                        setFeedbacks(prev =>
                          prev.map((item, i) =>
                            i === actualIdx ? { ...item, replyText: '' } : item
                          )
                        );
                      }}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#9e9e9e',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination */}
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
          disabled={feedbackCurrentPage === 1}
          onClick={() =>
            setFeedbackCurrentPage((p) => Math.max(1, p - 1))
          }
        >
          Prev
        </button>
        <span style={{ alignSelf: 'center' }}>
          Page {feedbackCurrentPage} of {feedbackTotalPages}
        </span>
        <button
          className="calendar-btn"
          disabled={feedbackCurrentPage === feedbackTotalPages}
          onClick={() =>
            setFeedbackCurrentPage((p) =>
              Math.min(feedbackTotalPages, p + 1)
            )
          }
        >
          Next
        </button>
      </div>
    </div>
  );
}
        case 'settings': {
          return (
    <div className="dashboard-content">
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h3 style={{ marginBottom: '30px' }}>Account Settings</h3>

        {/* Current Account Info */}
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '30px'
        }}>
          <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>Current Account Information</h4>
          <div style={{ marginBottom: '10px' }}>
            <strong>Email:</strong> {currentUserEmail}
          </div>
          <div style={{ color: '#666', fontSize: '14px' }}>
            Last updated: {new Date().toLocaleDateString()}
          </div>
        </div>

        {/* Email Change Section */}
        <div style={{
          border: '1px solid #ddd',
          borderRadius: '8px',
          marginBottom: '20px',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '15px 20px',
            backgroundColor: '#f8f9fa',
            borderBottom: '1px solid #ddd',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h4 style={{ margin: 0 }}>Change Email Address</h4>
            <button
              onClick={() => {
                setShowEmailForm(!showEmailForm);
                if (!showEmailForm) {
                  setSettingsForm(prev => ({
                    ...prev,
                    currentPasswordForEmail: '',
                    newEmail: ''
                  }));
                }
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: showEmailForm ? '#9e9e9e' : '#094685',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {showEmailForm ? 'Cancel' : 'Change Email'}
            </button>
          </div>
          
          {showEmailForm && (
            <div style={{ padding: '20px' }}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Current Password *
                </label>
                <input
                  type="password"
                  value={settingsForm.currentPasswordForEmail}
                  onChange={(e) => setSettingsForm(prev => ({
                    ...prev,
                    currentPasswordForEmail: e.target.value
                  }))}
                  placeholder="Enter your current password"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  New Email Address *
                </label>
                <input
                  type="email"
                  value={settingsForm.newEmail}
                  onChange={(e) => setSettingsForm(prev => ({
                    ...prev,
                    newEmail: e.target.value
                  }))}
                  placeholder="Enter new email address"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <button
                onClick={handleEmailChange}
                disabled={isUpdating}
                style={{
                  padding: '10px 20px',
                  backgroundColor: isUpdating ? '#ccc' : '#4caf50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isUpdating ? 'not-allowed' : 'pointer'
                }}
              >
                {isUpdating ? 'Updating...' : 'Update Email'}
              </button>
            </div>
          )}
        </div>

        {/* Password Change Section */}
        <div style={{
          border: '1px solid #ddd',
          borderRadius: '8px',
          marginBottom: '20px',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '15px 20px',
            backgroundColor: '#f8f9fa',
            borderBottom: '1px solid #ddd',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h4 style={{ margin: 0 }}>Change Password</h4>
            <button
              onClick={() => {
                setShowPasswordForm(!showPasswordForm);
                if (!showPasswordForm) {
                  setSettingsForm(prev => ({
                    ...prev,
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                  }));
                }
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: showPasswordForm ? '#9e9e9e' : '#094685',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {showPasswordForm ? 'Cancel' : 'Change Password'}
            </button>
          </div>
          
          {showPasswordForm && (
            <div style={{ padding: '20px' }}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Current Password *
                </label>
                <input
                  type="password"
                  value={settingsForm.currentPassword}
                  onChange={(e) => setSettingsForm(prev => ({
                    ...prev,
                    currentPassword: e.target.value
                  }))}
                  placeholder="Enter your current password"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  New Password *
                </label>
                <input
                  type="password"
                  value={settingsForm.newPassword}
                  onChange={(e) => setSettingsForm(prev => ({
                    ...prev,
                    newPassword: e.target.value
                  }))}
                  placeholder="Enter new password"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
                <small style={{ color: '#666', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                  Password must be at least 12 characters, contain 1 uppercase letter and 1 number
                </small>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  value={settingsForm.confirmPassword}
                  onChange={(e) => setSettingsForm(prev => ({
                    ...prev,
                    confirmPassword: e.target.value
                  }))}
                  placeholder="Confirm new password"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <button
                onClick={handlePasswordChange}
                disabled={isUpdating}
                style={{
                  padding: '10px 20px',
                  backgroundColor: isUpdating ? '#ccc' : '#4caf50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isUpdating ? 'not-allowed' : 'pointer'
                }}
              >
                {isUpdating ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          )}
        </div>

        {/* Additional Settings Info */}
        <div style={{
          backgroundColor: '#e3f2fd',
          padding: '15px',
          borderRadius: '8px',
          marginTop: '30px'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>Security Information</h4>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#333' }}>
            <li>Always use a strong, unique password for your account</li>
            <li>Email changes require verification before taking effect</li>
            <li>You will be logged out after changing your password</li>
            <li>Contact support if you have trouble accessing your account</li>
          </ul>
        </div>
      </div>
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
          <button className="nav-item logout-btn" onClick={handleLogout}>
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