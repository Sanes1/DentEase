import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
// Import Firestore functions and the database instance
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase"; // Make sure this path is correct

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // ✅ SIMPLIFIED VALIDATION LOGIC
  const validateField = (name, value) => {
    let error = '';

    if (name === 'email') {
      if (!value) {
        error = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        error = 'Please enter a valid email address';
      }
    }

    if (name === 'password') {
      // The only pre-submission check is to see if the field is empty.
      // The "correctness" of the password will be checked after submitting.
      if (!value) {
        error = 'Password is required';
      }
    }

    return error;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    let newValue = value;
    if (name === 'email') {
      newValue = newValue.replace(/\s/g, '');
      if (newValue.length > 50) return;
    }
    if (name === 'password' && newValue.length > 30) return;

    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    setErrors(prev => ({
      ...prev,
      [name]: validateField(name, newValue),
      form: '' // Clear general form error when user types again
    }));
  };

  // This function now only checks for empty fields before submission
  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });
    return newErrors;
  };

  // ✅ UPDATED handleSubmit with more specific error messages
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const adminDocRef = doc(db, "admin_acc", "admin");
      const adminDocSnap = await getDoc(adminDocRef);

      if (!adminDocSnap.exists()) {
        console.error("Admin document not found in Firestore.");
        setErrors({ form: "Admin account is not configured correctly." });
        setIsLoading(false);
        return;
      }

      const adminData = adminDocSnap.data();
      const storedEmail = (adminData.email || '').trim();
      const storedPassword = (adminData.password || '').trim();

      const enteredEmail = formData.email.trim();
      const enteredPassword = formData.password.trim();

      // Check email first, then password, to provide better feedback
      if (storedEmail !== enteredEmail) {
        setErrors({ form: "No account found with that email address." });
      } else if (storedPassword !== enteredPassword) {
        setErrors({ form: "The password you entered is incorrect." });
      } else {
        // Success!
        console.log("Login successful!");
        navigate('/dashboard');
      }

    } catch (error) {
      console.error("Firebase login error:", error);
      setErrors({ form: "An error occurred. Please check your connection and try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-left-section"></div>

      <div className="login-right-section">
        <div className="login-content">
          <div className="brand-header">
            <h1>DentEase</h1>
            <p>Admin Portal</p>
          </div>
          <div className="welcome-text">
            <h2>Welcome Back</h2>
            <p>Sign in to access your admin dashboard</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email address"
                disabled={isLoading}
                required
              />
              {errors.email && <div className="error-message">{errors.email}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                disabled={isLoading}
                required
              />
              {/* This error will now only show "Password is required" */}
              {errors.password && <div className="error-message">{errors.password}</div>}
            </div>

            {/* This is where "incorrect password" or other server errors will appear */}
            {errors.form && (
              <div className="error-message" style={{ textAlign: 'center', marginBottom: '15px' }}>
                {errors.form}
              </div>
            )}

            <button
              type="submit"
              className="login-button"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;