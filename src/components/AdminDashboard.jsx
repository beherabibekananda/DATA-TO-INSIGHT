
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
import { Trash2, Edit, Plus, Users, GraduationCap, Database, Home, LogOut, Upload, Brain, Activity, ShieldCheck, Search } from 'lucide-react';
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
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error) {
        setUsers(data || []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
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
      <div className="min-h-screen bg-[#02040a] flex items-center justify-center">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin"></div>
          <Brain className="absolute inset-0 m-auto w-10 h-10 text-primary animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#02040a] text-white p-6 relative overflow-hidden">
      {/* Dynamic Background Effects */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[150px] rounded-full"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-secondary/10 blur-[150px] rounded-full"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-center group hover:bg-white/[0.05] transition-all">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-black tracking-tighter uppercase whitespace-nowrap">Admin Core</h1>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] font-black uppercase tracking-widest px-3">L4 Clearance</Badge>
              </div>
              <p className="text-white/20 uppercase tracking-[0.2em] text-[10px] font-black mt-1">
                Authorized Node: {profile?.full_name || user?.email}
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <Button
              onClick={handleBackToHome}
              className="bg-white/[0.03] border border-white/5 text-white/40 hover:text-white hover:bg-white/[0.05] rounded-xl px-6 h-12 transition-all font-bold uppercase tracking-widest text-xs"
            >
              <Home className="w-4 h-4 mr-2" />
              Terminal
            </Button>
            <Button
              onClick={handleSignOut}
              className="bg-destructive/10 border border-destructive/20 text-destructive hover:bg-destructive/20 rounded-xl px-6 h-12 transition-all font-bold uppercase tracking-widest text-xs"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sever Connection
            </Button>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <Button
            onClick={() => navigate('/createUser')}
            className="bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary h-20 rounded-2xl transition-all group overflow-hidden relative"
          >
            <Plus className="w-6 h-6 mr-3 relative z-10 group-hover:scale-110 transition-transform" />
            <span className="font-black uppercase tracking-widest text-sm relative z-10">Register Subject</span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-transparent opacity-0 group-hover:opacity-10 transition-opacity"></div>
          </Button>
          <Button
            onClick={() => navigate('/UploadStudentsDataFile')}
            className="bg-secondary/10 hover:bg-secondary/20 border border-secondary/20 text-secondary h-20 rounded-2xl transition-all group overflow-hidden relative"
          >
            <Upload className="w-6 h-6 mr-3 relative z-10 group-hover:scale-110 transition-transform" />
            <span className="font-black uppercase tracking-widest text-sm relative z-10">Inject Dataset</span>
            <div className="absolute inset-0 bg-gradient-to-r from-secondary to-transparent opacity-0 group-hover:opacity-10 transition-opacity"></div>
          </Button>
          <Button
            onClick={() => navigate('/')}
            className="bg-accent/10 hover:bg-accent/20 border border-accent/20 text-accent h-20 rounded-2xl transition-all group overflow-hidden relative"
          >
            <Database className="w-6 h-6 mr-3 relative z-10 group-hover:scale-110 transition-transform" />
            <span className="font-black uppercase tracking-widest text-sm relative z-10">Sync Mainframe</span>
            <div className="absolute inset-0 bg-gradient-to-r from-accent to-transparent opacity-0 group-hover:opacity-10 transition-opacity"></div>
          </Button>
          <Button
            onClick={() => setActiveTab('dropout-prediction')}
            className="bg-warning/10 hover:bg-warning/20 border border-warning/20 text-warning h-20 rounded-2xl transition-all group overflow-hidden relative"
          >
            <Brain className="w-6 h-6 mr-3 relative z-10 group-hover:scale-110 transition-transform" />
            <span className="font-black uppercase tracking-widest text-sm relative z-10">Neural Filter</span>
            <div className="absolute inset-0 bg-gradient-to-r from-warning to-transparent opacity-0 group-hover:opacity-10 transition-opacity"></div>
          </Button>
        </div>

        {/* High-Level Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-card/40 backdrop-blur-2xl border-white/5 text-white overflow-hidden group">
            <div className="h-1 w-full bg-primary/40"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Registered Nodes</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black group-hover:text-primary transition-colors">{users.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-card/40 backdrop-blur-2xl border-white/5 text-white overflow-hidden group">
            <div className="h-1 w-full bg-secondary/40"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Active Subjects</CardTitle>
              <GraduationCap className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black group-hover:text-secondary transition-colors">{students.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-card/40 backdrop-blur-2xl border-white/5 text-white overflow-hidden group">
            <div className="h-1 w-full bg-success/40"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Network Status</CardTitle>
              <Activity className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-success tracking-tighter">ONLINE</div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white/[0.02] p-2 rounded-2xl border border-white/5 inline-flex">
          <button
            onClick={() => setActiveTab('students')}
            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'students' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/20 hover:text-white hover:bg-white/[0.03]'}`}
          >
            Subject Directory
          </button>
          <button
            onClick={() => setActiveTab('add-student')}
            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'add-student' ? 'bg-secondary text-white shadow-lg shadow-secondary/20' : 'text-white/20 hover:text-white hover:bg-white/[0.03]'}`}
          >
            Creation Protocol
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'users' ? 'bg-success text-white shadow-lg shadow-success/20' : 'text-white/20 hover:text-white hover:bg-white/[0.03]'}`}
          >
            Node Management
          </button>
          <button
            onClick={() => setActiveTab('dropout-prediction')}
            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'dropout-prediction' ? 'bg-warning text-white shadow-lg shadow-warning/20' : 'text-white/20 hover:text-white hover:bg-white/[0.03]'}`}
          >
            Neural Diagnostics
          </button>
        </div>

        {/* Dynamic Content Area */}
        <div className="pb-20">
          {activeTab === 'add-student' && (
            <StudentManagementForm onStudentAdded={fetchStudents} />
          )}

          {activeTab === 'dropout-prediction' && (
            <DropoutPrediction />
          )}

          {activeTab === 'students' && (
            <Card className="bg-card/40 backdrop-blur-2xl border-white/5 text-white overflow-hidden shadow-2xl">
              <CardHeader className="p-8 border-b border-white/5 bg-white/[0.01]">
                <div className="flex justify-between items-end">
                  <div>
                    <CardTitle className="text-2xl font-black uppercase tracking-tighter">Subject Directory</CardTitle>
                    <CardDescription className="text-white/20 uppercase tracking-widest text-[9px] font-black mt-1">
                      Comprehensive record of active academic subjects
                    </CardDescription>
                  </div>
                  <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <Input placeholder="Filter records..." className="bg-white/[0.03] border-white/10 rounded-xl pl-10 h-10 text-xs placeholder:text-white/10" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-white/[0.02]">
                      <TableRow className="border-white/5 hover:bg-transparent">
                        <TableHead className="text-white/40 uppercase text-[9px] font-black tracking-widest p-6">Identifier</TableHead>
                        <TableHead className="text-white/40 uppercase text-[9px] font-black tracking-widest p-6">Subject Name</TableHead>
                        <TableHead className="text-white/40 uppercase text-[9px] font-black tracking-widest p-6">Sector</TableHead>
                        <TableHead className="text-white/40 uppercase text-[9px] font-black tracking-widest p-6">Cycle</TableHead>
                        <TableHead className="text-white/40 uppercase text-[9px] font-black tracking-widest p-6">GPA Index</TableHead>
                        <TableHead className="text-white/40 uppercase text-[9px] font-black tracking-widest p-6">Risk Profile</TableHead>
                        <TableHead className="text-white/40 uppercase text-[9px] font-black tracking-widest p-6 text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => (
                        <TableRow key={student.id} className="border-white/5 hover:bg-white/[0.02] transition-colors">
                          <TableCell className="p-6 font-mono text-[10px] text-white/40">{student.student_id}</TableCell>
                          <TableCell className="p-6 font-bold text-sm tracking-tight">{student.name}</TableCell>
                          <TableCell className="p-6 text-white/40 text-xs uppercase">{student.department}</TableCell>
                          <TableCell className="p-6 text-white/40 text-xs">YEAR {student.year}</TableCell>
                          <TableCell className="p-6 text-primary font-black font-mono">{student.gpa || '0.00'}</TableCell>
                          <TableCell className="p-6">
                            <Badge
                              className={`rounded-lg px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border ${student.risk_level === 'high' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                                  student.risk_level === 'medium' ? 'bg-warning/10 text-warning border-warning/20' :
                                    'bg-success/10 text-success border-success/20'
                                }`}
                            >
                              {student.risk_level}
                            </Badge>
                          </TableCell>
                          <TableCell className="p-6 text-right">
                            <Button
                              size="icon"
                              className="bg-destructive/10 text-destructive hover:bg-destructive shadow-lg shadow-destructive/10 rounded-xl transition-all"
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

          {activeTab === 'users' && (
            <Card className="bg-card/40 backdrop-blur-2xl border-white/5 text-white overflow-hidden shadow-2xl">
              <CardHeader className="p-8 border-b border-white/5 bg-white/[0.01]">
                <CardTitle className="text-2xl font-black uppercase tracking-tighter">Node Hierarchy</CardTitle>
                <CardDescription className="text-white/20 uppercase tracking-widest text-[9px] font-black mt-1">
                  Access level and permission matrix for network users
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-white/[0.02]">
                      <TableRow className="border-white/5 hover:bg-transparent">
                        <TableHead className="text-white/40 uppercase text-[9px] font-black tracking-widest p-6">Entity Identity</TableHead>
                        <TableHead className="text-white/40 uppercase text-[9px] font-black tracking-widest p-6">Digital Address</TableHead>
                        <TableHead className="text-white/40 uppercase text-[9px] font-black tracking-widest p-6">Authorization</TableHead>
                        <TableHead className="text-white/40 uppercase text-[9px] font-black tracking-widest p-6">Deployment Date</TableHead>
                        <TableHead className="text-white/40 uppercase text-[9px] font-black tracking-widest p-6 text-right">Ops</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id} className="border-white/5 hover:bg-white/[0.02] transition-colors">
                          <TableCell className="p-6 font-bold text-sm tracking-tight">
                            {user.full_name || 'UNDEFINED'}
                          </TableCell>
                          <TableCell className="p-6 text-white/40 font-mono text-xs">{user.email}</TableCell>
                          <TableCell className="p-6">
                            {editingUser === user.id ? (
                              <select
                                value={user.role}
                                onChange={(e) => updateUserRole(user.id, e.target.value)}
                                className="bg-[#0c0d12] border border-white/10 rounded-xl px-4 py-2 text-xs text-white uppercase font-black"
                              >
                                <option value="user">User Node</option>
                                <option value="admin">Admin Proxy</option>
                              </select>
                            ) : (
                              <Badge className={`rounded-lg px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border ${user.role === 'admin' ? 'bg-primary/20 text-primary border-primary/20' : 'bg-white/5 text-white/40 border-white/10'}`}>
                                {user.role} Authorization
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="p-6 text-white/40 text-[10px] uppercase font-bold">
                            {new Date(user.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="p-6 text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                size="icon"
                                className="bg-white/[0.03] border border-white/5 text-white/40 hover:text-white rounded-xl transition-all"
                                onClick={() => setEditingUser(editingUser === user.id ? null : user.id)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                className="bg-destructive/10 text-destructive hover:bg-destructive rounded-xl transition-all"
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
    </div>
  );
};

export default AdminDashboard;
