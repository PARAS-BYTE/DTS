import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Eye, EyeOff, User, Mail, Lock, Shield, BookOpen, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

const AdminSignup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    department: '',
    role: 'admin'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Redirect if already logged in as admin
  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    const adminData = localStorage.getItem('adminData');
    if (adminToken && adminData) {
      navigate('/admin');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/admin/auth/register',
        formData,
        { 
          withCredentials: true
        }
      );

      if (response.data.success) {
        setSuccess('Admin account created successfully!');
        setFormData({
          username: '',
          email: '',
          password: '',
          fullName: '',
          department: '',
          role: 'admin'
        });
        
        // Redirect to admin login after 2 seconds
        setTimeout(() => {
          navigate('/admin/login');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create admin account');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white overflow-hidden relative flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-black/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-black/3 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Back Button */}
        <Link to="/" className="absolute -top-16 left-0 flex items-center gap-2 text-gray-700 hover:text-black transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Home</span>
        </Link>

        <Card className="shadow-2xl border border-gray-200 bg-white">
          <CardHeader className="text-center space-y-4 pb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto w-16 h-16 bg-black/10 rounded-2xl flex items-center justify-center shadow-lg shadow-black/10"
            >
              <Shield className="w-8 h-8 text-black" />
            </motion.div>
            <div>
              <CardTitle className="text-2xl font-bold text-black mb-2">
                Admin Registration
              </CardTitle>
              <CardDescription className="text-gray-700 text-base">
                Create administrator account
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name Field */}
              <div className="space-y-2">
                <label className="text-gray-700 text-sm font-medium">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-blue-300" />
                  <Input
                    name="fullName"
                    type="text"
                    placeholder="Enter full name"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="pl-10 h-12 text-black bg-white border-gray-300 placeholder:text-gray-500 focus:border-black focus:ring-black/20"
                  />
                </div>
              </div>

              {/* Username Field */}
              <div className="space-y-2">
                <label className="text-gray-700 text-sm font-medium">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-blue-300" />
                  <Input
                    name="username"
                    type="text"
                    placeholder="Choose username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="pl-10 h-12 text-black bg-white border-gray-300 placeholder:text-gray-500 focus:border-black focus:ring-black/20"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-gray-700 text-sm font-medium">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-blue-300" />
                  <Input
                    name="email"
                    type="email"
                    placeholder="admin@institution.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="pl-10 h-12 text-black bg-white border-gray-300 placeholder:text-gray-500 focus:border-black focus:ring-black/20"
                  />
                </div>
              </div>

              {/* Department Field */}
              <div className="space-y-2">
                <label className="text-gray-700 text-sm font-medium">Department</label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-4 w-4 text-blue-300" />
                  <Select 
                    value={formData.department} 
                    onValueChange={(value) => handleSelectChange('department', value)}
                  >
                    <SelectTrigger className="pl-10 h-12 text-white bg-white/5 border-white/20 focus:border-blue-400">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-white/20 text-white">
                      <SelectItem value="Computer Science">Computer Science</SelectItem>
                      <SelectItem value="Mathematics">Mathematics</SelectItem>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Business">Business</SelectItem>
                      <SelectItem value="General">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Role Field */}
              <div className="space-y-2">
                <label className="text-gray-700 text-sm font-medium">Role</label>
                <Select 
                  value={formData.role} 
                  onValueChange={(value) => handleSelectChange('role', value)}
                >
                  <SelectTrigger className="h-12 text-white bg-white/5 border-white/20 focus:border-blue-400">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-white/20 text-white">
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="super_admin">Super Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-gray-700 text-sm font-medium">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-blue-300" />
                  <Input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password (min 8 characters)"
                    minLength={8}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="pl-10 pr-10 h-12 text-black bg-white border-gray-300 placeholder:text-gray-500 focus:border-black focus:ring-black/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-blue-300 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-gray-600 text-xs">
                  Must be at least 8 characters long
                </p>
              </div>

              {/* Success Message */}
              {success && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg"
                >
                  {success}
                </motion.div>
              )}

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg"
                >
                  {error}
                </motion.div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-black hover:bg-gray-800 text-white font-semibold text-base shadow-lg shadow-black/20 hover:shadow-black/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating admin account...
                  </div>
                ) : (
                  'Create Admin Account'
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-600">Already have an account?</span>
              </div>
            </div>

            {/* Login Link */}
            <div className="text-center">
              <Link
                to="/admin/login"
                className="text-gray-700 hover:text-black font-medium text-sm transition-colors inline-flex items-center gap-1"
              >
                Sign in to admin portal
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Security Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center"
        >
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-8 h-8 bg-black/10 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Shield className="w-4 h-4 text-black" />
            </div>
            <p className="text-sm text-gray-700 font-medium">Role-Based Access</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-8 h-8 bg-black/10 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Lock className="w-4 h-4 text-black" />
            </div>
            <p className="text-sm text-gray-700 font-medium">Secure Authentication</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-8 h-8 bg-black/10 rounded-lg flex items-center justify-center mx-auto mb-2">
              <BookOpen className="w-4 h-4 text-black" />
            </div>
            <p className="text-sm text-gray-700 font-medium">Course Management</p>
          </div>
        </motion.div>

        {/* Back to Main Site */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center mt-6"
        >
          <Link
            to="/"
            className="text-gray-700 hover:text-black text-sm transition-colors inline-flex items-center gap-1"
          >
            ← Back to main site
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AdminSignup;