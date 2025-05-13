import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Auth = ({ type }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: type === 'signup' ? '' : undefined
  });
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();

  const validatePassword = (password) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters";
    }
    if (!/[A-Z]/.test(password)) {
      return "Must contain at least one uppercase letter";
    }
    if (!/[0-9]/.test(password)) {
      return "Must contain at least one number";
    }
    if (!/[!@#$%^&*]/.test(password)) {
      return "Must contain at least one special character (!@#$%^&*)";
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'password' && type == 'signup') {
      setPasswordError(validatePassword(value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Final password validation check before submission
    if(type == 'signup'){
    const passwordValidation = validatePassword(formData.password);
    if (passwordValidation) {
      setPasswordError(passwordValidation);
      return;
    }}

    try {
      const endpoint = type === 'login' ? '/api/login' : '/api/signup';
      const response = await axios.post(`http://localhost:5000${endpoint}`, formData);

      localStorage.setItem('token', response.data.token);
      navigate('/search');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {type === 'login' ? 'Login' : 'Sign Up'}
        </h2>

        {error && <div className="mb-4 text-red-500 text-center">{error}</div>}

        <form onSubmit={handleSubmit}>
          {type === 'signup' && (
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
          )}

          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded ${
                passwordError ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {passwordError && (
              <div className="text-red-500 text-sm mt-1">{passwordError}</div>
            )}
            {/* <div className="text-gray-500 text-sm mt-1">
              Password must contain:
              <ul className="list-disc pl-5">
                <li>At least 8 characters</li>
                <li>One uppercase letter</li>
                <li>One number</li>
                <li>One special character (!@#$%^&*)</li>
              </ul>
            </div> */}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            {type === 'login' ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-4 text-center">
          {type === 'login' ? (
            <p>Don't have an account? <a href="/signup" className="text-blue-500">Sign up</a></p>
          ) : (
            <p>Already have an account? <a href="/" className="text-blue-500">Login</a></p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;