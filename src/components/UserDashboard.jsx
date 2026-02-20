
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Users, AlertTriangle, TrendingUp, GraduationCap, Search, BookOpen, Activity } from 'lucide-react';

const COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6'];

const UserDashboard = () => {
  const { user, profile, signOut } = useAuth();
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    setFullName(profile?.full_name || '');
  }, [profile]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const { data, error } = await supabase.from('students').select('*');
        if (error) throw error;
        setStudents((data && data.length > 0) ? data : sampleStudents);
      } catch {
        setStudents(sampleStudents);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    window.location.reload();
  };

  // Compute analytics from students
  const totalStudents = students.length;
  const departments = [...new Set(students.map(s => s.department))].sort();
  const avgGpa = totalStudents > 0 ? (students.reduce((sum, s) => sum + (s.gpa || 0), 0) / totalStudents).toFixed(2) : '0.00';
  const avgAttendance = totalStudents > 0 ? (students.reduce((sum, s) => sum + (s.attendance_rate || 0), 0) / totalStudents).toFixed(1) : '0';
  const highRiskCount = students.filter(s => s.risk_level === 'high').length;
  const medRiskCount = students.filter(s => s.risk_level === 'medium').length;
  const lowRiskCount = students.filter(s => s.risk_level === 'low').length;

  // Department distribution for pie chart
  const deptData = departments.map((dept, i) => ({
    name: dept,
    value: students.filter(s => s.department === dept).length,
    color: COLORS[i % COLORS.length]
  }));

  // Risk by department for bar chart
  const riskByDept = departments.map(dept => {
    const deptStudents = students.filter(s => s.department === dept);
    return {
      name: dept.length > 12 ? dept.substring(0, 12) + '...' : dept,
      fullName: dept,
      low: deptStudents.filter(s => s.risk_level === 'low').length,
      medium: deptStudents.filter(s => s.risk_level === 'medium').length,
      high: deptStudents.filter(s => s.risk_level === 'high').length,
    };
  });

  // Filter students for table
  const filteredStudents = students.filter(s => {
    const matchSearch = !searchTerm ||
      s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.department?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDept = selectedDept === 'all' || s.department === selectedDept;
    return matchSearch && matchDept;
  });

  // Top at-risk students
  const atRiskStudents = students
    .filter(s => s.risk_level === 'high')
    .sort((a, b) => (a.gpa || 0) - (b.gpa || 0))
    .slice(0, 5);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-blue-400" />
              EduAnalytics Dashboard
            </h1>
            <p className="text-gray-400 mt-1">Welcome back, <span className="text-blue-300 font-medium">{profile?.full_name || user?.email || 'User'}</span></p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30 px-3 py-1">
              {profile?.role || 'user'}
            </Badge>
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Sign Out
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-3 rounded-lg bg-blue-500/20">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalStudents}</p>
                <p className="text-xs text-gray-400">Total Students</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-3 rounded-lg bg-red-500/20">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{highRiskCount}</p>
                <p className="text-xs text-gray-400">High Risk</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-3 rounded-lg bg-green-500/20">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{avgGpa}</p>
                <p className="text-xs text-gray-400">Avg GPA</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-3 rounded-lg bg-purple-500/20">
                <Activity className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{avgAttendance}%</p>
                <p className="text-xs text-gray-400">Avg Attendance</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Department Distribution */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="w-5 h-5 text-blue-400" />
                Department Distribution
              </CardTitle>
              <CardDescription className="text-gray-400">Students across departments</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={deptData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${name.substring(0, 8)}: ${value}`}>
                    {deptData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Risk by Department */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                Risk Levels by Department
              </CardTitle>
              <CardDescription className="text-gray-400">Student risk distribution per department</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={riskByDept}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }} />
                  <Bar dataKey="low" stackId="risk" fill="#10b981" name="Low Risk" />
                  <Bar dataKey="medium" stackId="risk" fill="#f59e0b" name="Medium Risk" />
                  <Bar dataKey="high" stackId="risk" fill="#ef4444" name="High Risk" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Risk Summary + Profile Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Risk Summary */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader>
              <CardTitle className="text-lg">Risk Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                  Low Risk
                </span>
                <span className="font-bold text-green-400">{lowRiskCount} ({totalStudents > 0 ? ((lowRiskCount / totalStudents) * 100).toFixed(0) : 0}%)</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2"><div className="bg-green-500 h-2 rounded-full" style={{ width: `${totalStudents > 0 ? (lowRiskCount / totalStudents) * 100 : 0}%` }}></div></div>

              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                  Medium Risk
                </span>
                <span className="font-bold text-yellow-400">{medRiskCount} ({totalStudents > 0 ? ((medRiskCount / totalStudents) * 100).toFixed(0) : 0}%)</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2"><div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${totalStudents > 0 ? (medRiskCount / totalStudents) * 100 : 0}%` }}></div></div>

              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500"></span>
                  High Risk
                </span>
                <span className="font-bold text-red-400">{highRiskCount} ({totalStudents > 0 ? ((highRiskCount / totalStudents) * 100).toFixed(0) : 0}%)</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2"><div className="bg-red-500 h-2 rounded-full" style={{ width: `${totalStudents > 0 ? (highRiskCount / totalStudents) * 100 : 0}%` }}></div></div>
            </CardContent>
          </Card>

          {/* At-Risk Students */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                Top At-Risk Students
              </CardTitle>
              <CardDescription className="text-gray-400">Students requiring immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              {atRiskStudents.length > 0 ? (
                <div className="space-y-3">
                  {atRiskStudents.map((student, index) => (
                    <div key={student.id || index} className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-red-600/30 text-red-300 text-sm font-bold">
                            {(student.name || 'S').charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-white">{student.name}</p>
                          <p className="text-xs text-gray-400">{student.department} • Year {student.year}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-red-300 font-semibold">GPA: {student.gpa}</p>
                        <p className="text-xs text-gray-400">Attendance: {student.attendance_rate}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-4">No high-risk students found</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Student Search & Table */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-400" />
              Student Directory
            </CardTitle>
            <div className="flex flex-col md:flex-row gap-3 mt-3">
              <Input
                placeholder="Search by name, ID, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 flex-1"
              />
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="bg-white/10 border border-white/20 text-white rounded-md px-3 py-2 text-sm"
              >
                <option value="all" className="bg-gray-800">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept} className="bg-gray-800">{dept}</option>
                ))}
              </select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-2 text-gray-400 font-medium">Name</th>
                    <th className="text-left py-3 px-2 text-gray-400 font-medium">ID</th>
                    <th className="text-left py-3 px-2 text-gray-400 font-medium">Department</th>
                    <th className="text-center py-3 px-2 text-gray-400 font-medium">Year</th>
                    <th className="text-center py-3 px-2 text-gray-400 font-medium">GPA</th>
                    <th className="text-center py-3 px-2 text-gray-400 font-medium">Attendance</th>
                    <th className="text-center py-3 px-2 text-gray-400 font-medium">Engagement</th>
                    <th className="text-center py-3 px-2 text-gray-400 font-medium">Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.slice(0, 15).map((student, index) => (
                    <tr key={student.id || index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-2 font-medium">{student.name}</td>
                      <td className="py-3 px-2 text-gray-300">{student.student_id}</td>
                      <td className="py-3 px-2 text-gray-300">{student.department}</td>
                      <td className="py-3 px-2 text-center">{student.year}</td>
                      <td className="py-3 px-2 text-center">
                        <span className={student.gpa >= 3.0 ? 'text-green-400' : student.gpa >= 2.0 ? 'text-yellow-400' : 'text-red-400'}>
                          {student.gpa}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className={student.attendance_rate >= 75 ? 'text-green-400' : student.attendance_rate >= 60 ? 'text-yellow-400' : 'text-red-400'}>
                          {student.attendance_rate}%
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center">{student.engagement_score}/100</td>
                      <td className="py-3 px-2 text-center">
                        <Badge variant={student.risk_level === 'high' ? 'destructive' : student.risk_level === 'medium' ? 'default' : 'secondary'}
                          className={
                            student.risk_level === 'high' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                              student.risk_level === 'medium' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                                'bg-green-500/20 text-green-300 border-green-500/30'
                          }>
                          {student.risk_level}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredStudents.length > 15 && (
                <p className="text-gray-400 text-sm mt-3 text-center">Showing 15 of {filteredStudents.length} students</p>
              )}
              {filteredStudents.length === 0 && (
                <p className="text-gray-400 text-center py-6">No students found matching your search.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserDashboard;
