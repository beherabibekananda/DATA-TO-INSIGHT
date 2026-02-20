import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from "@/integrations/supabase/client";
import { sampleStudents } from "@/data/sampleStudents";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Trash2, Edit, Plus, Users, GraduationCap, Database, Home, LogOut, Upload, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StudentManagementForm from './StudentManagementForm';
import DropoutPrediction from './DropoutPrediction';

const AdminDashboard = () => {
  const { signOut, user, profile } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('students');
  const [editingUser, setEditingUser] = useState(null);

  // Verify admin access
  useEffect(() => {
    // Check for hardcoded admin session
    const adminSession = localStorage.getItem('admin_session');
    let isHardcodedAdmin = false;

    if (adminSession) {
      try {
        const session = JSON.parse(adminSession);
        isHardcodedAdmin = session.user.email === 'bibek@admin.com' &&
          session.expires_at > Date.now();
      } catch (error) {
        localStorage.removeItem('admin_session');
      }
    }

    // Allow access if user is regular admin OR hardcoded admin
    if (!((user && profile?.role === 'admin') || isHardcodedAdmin)) {
      navigate('/admin-login');
      return;
    }
  }, [user, profile, navigate]);

  useEffect(() => {
    fetchUsers();
    fetchStudents();

    // Set up real-time subscriptions
    const usersSubscription = supabase
      .channel('users-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => fetchUsers()
      )
      .subscribe();

    const studentsSubscription = supabase
      .channel('students-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'students' },
        () => fetchStudents()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(usersSubscription);
      supabase.removeChannel(studentsSubscription);
    };
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) {
      setUsers(data || []);
    }
    setLoading(false);
  };

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStudents((data && data.length > 0) ? data : sampleStudents);
    } catch {
      // Fallback to sample data
      setStudents(sampleStudents);
    }
  };

  const deleteUser = async (userId) => {
    if (confirm('Are you sure you want to delete this user?')) {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (!error) {
        fetchUsers();
      }
    }
  };

  const deleteStudent = async (studentId) => {
    if (confirm('Are you sure you want to delete this student?')) {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', studentId);

      if (!error) {
        fetchStudents();
      }
    }
  };

  const updateUserRole = async (userId, newRole) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (!error) {
      fetchUsers();
      setEditingUser(null);
    }
  };

  const handleSignOut = async () => {
    try {
      // Check if this is hardcoded admin session
      const adminSession = localStorage.getItem('admin_session');
      if (adminSession) {
        try {
          const session = JSON.parse(adminSession);
          if (session.user.email === 'bibek@admin.com') {
            // Clear hardcoded admin session
            localStorage.removeItem('admin_session');
            navigate('/');
            return;
          }
        } catch (error) {
          localStorage.removeItem('admin_session');
        }
      }

      // Regular Supabase admin logout
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-gray-300 mt-1">Welcome back, {profile?.full_name || user?.email}</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleBackToHome}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="bg-red-500/20 border-red-500/50 text-red-300 hover:bg-red-500/30"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Button
            onClick={() => navigate('/createUser')}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 h-16"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Student
          </Button>
          <Button
            onClick={() => navigate('/UploadStudentsDataFile')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-16"
          >
            <Upload className="w-5 h-5 mr-2" />
            Upload Data File
          </Button>
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 h-16"
          >
            <Database className="w-5 h-5 mr-2" />
            View Public Dashboard
          </Button>
          <Button
            onClick={() => setActiveTab('dropout-prediction')}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 h-16"
          >
            <Brain className="w-5 h-5 mr-2" />
            Dropout Checker
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <GraduationCap className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{students.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Database Status</CardTitle>
              <Database className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">Online</div>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-6">
          <Button
            onClick={() => setActiveTab('students')}
            variant={activeTab === 'students' ? 'default' : 'outline'}
            className={activeTab === 'students' ?
              'bg-blue-600 hover:bg-blue-700' :
              'bg-white/10 border-white/20 text-white hover:bg-white/20'
            }
          >
            Manage Students
          </Button>
          <Button
            onClick={() => setActiveTab('add-student')}
            variant={activeTab === 'add-student' ? 'default' : 'outline'}
            className={activeTab === 'add-student' ?
              'bg-purple-600 hover:bg-purple-700' :
              'bg-white/10 border-white/20 text-white hover:bg-white/20'
            }
          >
            Add Students
          </Button>
          <Button
            onClick={() => setActiveTab('users')}
            variant={activeTab === 'users' ? 'default' : 'outline'}
            className={activeTab === 'users' ?
              'bg-green-600 hover:bg-green-700' :
              'bg-white/10 border-white/20 text-white hover:bg-white/20'
            }
          >
            Manage Users
          </Button>
          <Button
            onClick={() => setActiveTab('dropout-prediction')}
            variant={activeTab === 'dropout-prediction' ? 'default' : 'outline'}
            className={activeTab === 'dropout-prediction' ?
              'bg-cyan-600 hover:bg-cyan-700' :
              'bg-white/10 border-white/20 text-white hover:bg-white/20'
            }
          >
            🧠 Dropout Checker
          </Button>
        </div>

        {/* Add Students Tab */}
        {activeTab === 'add-student' && (
          <StudentManagementForm onStudentAdded={fetchStudents} />
        )}

        {/* Dropout Prediction Tab */}
        {activeTab === 'dropout-prediction' && (
          <DropoutPrediction />
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader>
              <CardTitle>Student Management</CardTitle>
              <CardDescription className="text-gray-300">
                View and manage all students in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/20">
                      <TableHead className="text-white">Student ID</TableHead>
                      <TableHead className="text-white">Name</TableHead>
                      <TableHead className="text-white">Department</TableHead>
                      <TableHead className="text-white">Year</TableHead>
                      <TableHead className="text-white">GPA</TableHead>
                      <TableHead className="text-white">Risk Level</TableHead>
                      <TableHead className="text-white">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id} className="border-white/20">
                        <TableCell className="text-white">{student.student_id}</TableCell>
                        <TableCell className="text-white">{student.name}</TableCell>
                        <TableCell className="text-white">{student.department}</TableCell>
                        <TableCell className="text-white">{student.year}</TableCell>
                        <TableCell className="text-white">{student.gpa || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              student.risk_level === 'high' ? 'destructive' :
                                student.risk_level === 'medium' ? 'default' : 'secondary'
                            }
                          >
                            {student.risk_level}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteStudent(student.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription className="text-gray-300">
                Manage all registered users and their roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/20">
                      <TableHead className="text-white">Name</TableHead>
                      <TableHead className="text-white">Email</TableHead>
                      <TableHead className="text-white">Role</TableHead>
                      <TableHead className="text-white">Created</TableHead>
                      <TableHead className="text-white">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id} className="border-white/20">
                        <TableCell className="text-white">
                          {user.full_name || 'N/A'}
                        </TableCell>
                        <TableCell className="text-white">{user.email}</TableCell>
                        <TableCell>
                          {editingUser === user.id ? (
                            <select
                              value={user.role}
                              onChange={(e) => updateUserRole(user.id, e.target.value)}
                              className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white"
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                          ) : (
                            <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                              {user.role}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-white">
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingUser(editingUser === user.id ? null : user.id)}
                              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteUser(user.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
