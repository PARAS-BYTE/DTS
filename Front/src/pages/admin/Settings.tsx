import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { User, Bell, Save } from 'lucide-react';
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
  const [notifications, setNotifications] = useState({
    newSubmissions: true,
    studentMessages: true,
    courseUpdates: false,
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

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-black">
                <User className="w-5 h-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="instructor-name" className="text-gray-700">Full Name</Label>
                <Input
                  id="instructor-name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="bg-white border-gray-300 text-black focus:border-black focus:ring-black/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instructor-email" className="text-gray-700">Email</Label>
                <Input
                  id="instructor-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-white border-gray-300 text-black focus:border-black focus:ring-black/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department" className="text-gray-700">Department</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="bg-white border-gray-300 text-black focus:border-black focus:ring-black/20"
                />
              </div>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-black hover:bg-gray-800 text-white shadow-lg shadow-black/20 hover:shadow-black/30"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-black">
                <Bell className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-black">New Submissions</p>
                  <p className="text-sm text-gray-600">Get notified of new student submissions</p>
                </div>
                <Switch
                  checked={notifications.newSubmissions}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, newSubmissions: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-black">Student Messages</p>
                  <p className="text-sm text-gray-600">Alerts for new messages from students</p>
                </div>
                <Switch
                  checked={notifications.studentMessages}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, studentMessages: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-black">Course Updates</p>
                  <p className="text-sm text-gray-600">Updates about your courses</p>
                </div>
                <Switch
                  checked={notifications.courseUpdates}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, courseUpdates: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminSettings;