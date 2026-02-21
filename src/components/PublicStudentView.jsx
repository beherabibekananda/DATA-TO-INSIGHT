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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground font-black uppercase tracking-widest text-xs">Loading student data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-black text-foreground tracking-tighter uppercase mb-1">EduAnalytics</h1>
            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">Public Student Information System</p>
          </div>
          <div className="flex gap-3">
            {!user ? (
              <>
                <Button
                  onClick={handleAdminClick}
                  variant="outline"
                  className="border-destructive/20 text-destructive hover:bg-destructive/10 rounded-2xl font-black uppercase tracking-widest text-[10px] h-11 px-5 transition-all"
                >
                  Admin Login
                </Button>
                <Button
                  onClick={onLoginClick}
                  className="h-11 px-6 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/10 transition-all active:scale-95"
                >
                  Login / Register
                </Button>
              </>
            ) : (
              <div className="text-foreground text-sm font-bold">
                Welcome, {user.email}
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-card backdrop-blur-3xl border-border text-foreground shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-black tracking-tighter">{stats.total}</p>
                  <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">Total Students</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card backdrop-blur-3xl border-border text-foreground shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-success/10 flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-black tracking-tighter">{stats.departments}</p>
                  <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">Departments</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card backdrop-blur-3xl border-border text-foreground shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-black tracking-tighter">{stats.avgGpa}</p>
                  <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">Average GPA</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="bg-card backdrop-blur-3xl border-border mb-6 shadow-xl">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="text"
                placeholder="Search students by name, department, or student ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-14 bg-muted border-border text-foreground placeholder:text-muted-foreground/30 rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              />
            </div>
          </CardContent>
        </Card>

        {/* Students Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <Card key={student.id} className="bg-card backdrop-blur-3xl border-border text-foreground hover:border-primary/40 transition-all shadow-sm hover:shadow-xl group">
              <CardHeader className="p-6 border-b border-border bg-muted/20">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-black tracking-tighter uppercase">{student.name}</CardTitle>
                    <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mt-1">ID: {student.student_id}</p>
                  </div>
                  <Badge className={`${getRiskColor(student.risk_level)} bg-opacity-10 text-current border border-current/20 px-3 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest`}>
                    {student.risk_level || 'Low'} Risk
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span className="text-muted-foreground">Department</span>
                    <span className="text-foreground">{student.department}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span className="text-muted-foreground">Year</span>
                    <span className="text-foreground">{student.year}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span className="text-muted-foreground">GPA</span>
                    <span className="text-primary font-black">{student.gpa || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span className="text-muted-foreground">Attendance</span>
                    <span className="text-foreground">{student.attendance_rate ? `${student.attendance_rate}%` : 'N/A'}</span>
                  </div>
                  {student.engagement_score && (
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                      <span className="text-muted-foreground">Engagement</span>
                      <span className="text-foreground">{student.engagement_score}/100</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">No students found matching your search.</p>
          </div>
        )}

        {/* Notice - only show for non-logged in users */}
        {!user && (
          <div className="mt-12 text-center">
            <Card className="bg-primary/5 border-primary/20 inline-block shadow-sm">
              <CardContent className="p-6">
                <p className="text-primary text-sm font-bold">
                  Want to request changes to student data?
                  <Button variant="link" onClick={onLoginClick} className="text-primary font-black hover:text-primary/80 p-0 ml-1 underline">
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
