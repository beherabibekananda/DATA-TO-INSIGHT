import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { sampleStudents } from "@/data/sampleStudents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Users, GraduationCap, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PublicStudentView = ({ onLoginClick, onAdminClick, user }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    const filtered = students.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student_id.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStudents(filtered);
  }, [students, searchTerm]);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('name');

      if (error) throw error;
      setStudents((data && data.length > 0) ? data : sampleStudents);
    } catch (error) {
      console.error('Error fetching students:', error);
      // Fallback to sample data
      setStudents(sampleStudents);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminClick = () => {
    navigate('/admin-login');
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStats = () => {
    const total = students.length;
    const departments = [...new Set(students.map(s => s.department))].length;
    const avgGpa = students.length > 0
      ? (students.reduce((sum, s) => sum + (s.gpa || 0), 0) / students.length).toFixed(2)
      : '0.00';

    return { total, departments, avgGpa };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading student data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">EduAnalytics</h1>
            <p className="text-gray-300">Public Student Information System</p>
          </div>
          <div className="flex gap-3">
            {!user ? (
              <>
                <Button
                  onClick={handleAdminClick}
                  variant="outline"
                  className="bg-red-500/20 border-red-500/50 text-red-300 hover:bg-red-500/30"
                >
                  Admin Login
                </Button>
                <Button
                  onClick={onLoginClick}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Login / Register
                </Button>
              </>
            ) : (
              <div className="text-white text-sm">
                Welcome, {user.email}
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Users className="w-8 h-8 text-blue-400" />
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-gray-300">Total Students</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <GraduationCap className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-2xl font-bold">{stats.departments}</p>
                  <p className="text-gray-300">Departments</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-8 h-8 text-purple-400" />
                <div>
                  <p className="text-2xl font-bold">{stats.avgGpa}</p>
                  <p className="text-gray-300">Average GPA</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search students by name, department, or student ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />
            </div>
          </CardContent>
        </Card>

        {/* Students Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <Card key={student.id} className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 transition-all">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{student.name}</CardTitle>
                    <p className="text-gray-300 text-sm">ID: {student.student_id}</p>
                  </div>
                  <Badge className={`${getRiskColor(student.risk_level)} text-white`}>
                    {student.risk_level || 'Low'} Risk
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Department:</span>
                    <span>{student.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Year:</span>
                    <span>{student.year}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">GPA:</span>
                    <span>{student.gpa || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Attendance:</span>
                    <span>{student.attendance_rate ? `${student.attendance_rate}%` : 'N/A'}</span>
                  </div>
                  {student.engagement_score && (
                    <div className="flex justify-between">
                      <span className="text-gray-300">Engagement:</span>
                      <span>{student.engagement_score}/100</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No students found matching your search.</p>
          </div>
        )}

        {/* Notice - only show for non-logged in users */}
        {!user && (
          <div className="mt-12 text-center">
            <Card className="bg-blue-500/20 border-blue-500/50 inline-block">
              <CardContent className="p-4">
                <p className="text-blue-300">
                  Want to request changes to student data?
                  <Button variant="link" onClick={onLoginClick} className="text-blue-400 hover:text-blue-300 p-0 ml-1">
                    Please login or register
                  </Button>
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicStudentView;
