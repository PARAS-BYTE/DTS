import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Save } from 'lucide-react';
import { toast } from 'sonner';

const AdminSettings = () => {
  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    department: '',
  });

  // Get Admin Token
  const getAdminToken = () => {
    return localStorage.getItem('adminToken');
  };

  // Fetch Admin Profile
  const fetchAdminProfile = async () => {
    try {
      setLoading(true);
      const token = getAdminToken();
      const { data } = await axios.get('http://localhost:5000/api/admin/auth/profile', {
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (data.success && data.admin) {
        setAdmin(data.admin);
        setFormData({
          fullName: data.admin.fullName || '',
          email: data.admin.email || '',
          department: data.admin.department || '',
        });
      }
    } catch (err: any) {
      console.error('Fetch Admin Profile Error:', err);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  // Update Admin Profile
  const handleSave = async () => {
    try {
      setSaving(true);
      const token = getAdminToken();
      const { data } = await axios.put(
        'http://localhost:5000/api/admin/auth/profile',
        formData,
        {
          withCredentials: true,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      if (data.success) {
        setAdmin(data.admin);
        toast.success('Profile updated successfully');
      }
    } catch (err: any) {
      console.error('Update Profile Error:', err);
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchAdminProfile();
  }, []);

  if (loading) {
    return (
      <div className="p-8 space-y-8 bg-white">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-white">
      <div>
        <h1 className="text-4xl font-bold mb-2 text-black">Settings</h1>
        <p className="text-gray-700 text-lg">Manage your instructor account and preferences</p>
      </div>

      {/* Profile Settings - Full Width */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-3xl"
      >
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-black">
              <User className="w-5 h-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="instructor-name" className="text-gray-700 font-medium">Full Name</Label>
                <Input
                  id="instructor-name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="bg-white border-gray-300 text-black focus:border-black focus:ring-black/20 h-11"
                  placeholder="Enter your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instructor-email" className="text-gray-700 font-medium">Email</Label>
                <Input
                  id="instructor-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-white border-gray-300 text-black focus:border-black focus:ring-black/20 h-11"
                  placeholder="Enter your email"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="department" className="text-gray-700 font-medium">Department</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="bg-white border-gray-300 text-black focus:border-black focus:ring-black/20 h-11"
                placeholder="Enter your department"
              />
            </div>
            <div className="pt-4 border-t border-gray-200">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-black hover:bg-gray-800 text-white shadow-lg shadow-black/20 hover:shadow-black/30 px-8 h-11"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminSettings;