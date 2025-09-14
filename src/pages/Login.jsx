import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ import for navigation
import './Login.css';

const Login = () => {
  const navigate = useNavigate(); // ✅ hook for redirect

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

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
      if (!value) {
        error = 'Password is required';
      } else if (value.length < 6) {
        error = 'Password must be at least 6 characters';
      } else if (!/[A-Z]/.test(value)) {
        error = 'Password must contain at least 1 uppercase letter';
      } else if (!/[0-9]/.test(value)) {
        error = 'Password must contain at least 1 number';
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
      [name]: validateField(name, newValue)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsLoading(true);

    // simulate API call
    setTimeout(() => {
      setIsLoading(false);

      console.log('Login attempt with:', formData);

      // ✅ Redirect to dashboard after success
      navigate('/dashboard');
    }, 1500);
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
              {errors.password && <div className="error-message">{errors.password}</div>}
            </div>

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
