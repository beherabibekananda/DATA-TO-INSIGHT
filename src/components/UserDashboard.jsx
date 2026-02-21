
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
import { Users, AlertTriangle, TrendingUp, GraduationCap, Search, BookOpen, Activity, LayoutDashboard, LogOut, ChevronRight, Brain } from 'lucide-react';

const COLORS = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95'];

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin"></div>
          <Brain className="absolute inset-0 m-auto w-10 h-10 text-primary animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6 relative overflow-hidden">
      {/* Dynamic Background Effects */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[150px] rounded-full"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-secondary/5 blur-[150px] rounded-full"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-muted border border-border rounded-2xl flex items-center justify-center group hover:bg-muted/80 transition-all shadow-sm">
              <LayoutDashboard className="w-8 h-8 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-black tracking-tighter uppercase whitespace-nowrap">EduIntelligence</h1>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] font-black uppercase tracking-widest px-3">Subject Mode</Badge>
              </div>
              <p className="text-muted-foreground uppercase tracking-[0.2em] text-[10px] font-black mt-1">
                Authorized Node: {profile?.full_name || user?.email || 'Guest Subject'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 rounded-xl bg-muted border border-border hidden sm:flex items-center gap-2 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Secure Connection</span>
            </div>
            <Button
              onClick={handleSignOut}
              className="bg-destructive/10 border border-destructive/20 text-destructive hover:bg-destructive/20 rounded-xl px-6 h-12 transition-all font-bold uppercase tracking-widest text-xs"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sever Connection
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Total Subjects', value: totalStudents, icon: Users, color: 'primary', bg: 'bg-primary/10', text: 'text-primary' },
            { label: 'Critical Alert', value: highRiskCount, icon: AlertTriangle, color: 'destructive', bg: 'bg-destructive/10', text: 'text-destructive' },
            { label: 'Aggregate GPA', value: avgGpa, icon: TrendingUp, color: 'success', bg: 'bg-success/10', text: 'text-success' },
            { label: 'Network Presence', value: `${avgAttendance}%`, icon: Activity, color: 'secondary', bg: 'bg-secondary/10', text: 'text-secondary' },
          ].map((stat, i) => (
            <Card key={i} className="bg-card backdrop-blur-2xl border-border text-foreground overflow-hidden group hover:border-primary/20 transition-all shadow-sm">
              <div className={`h-1 w-full opacity-20 bg-current ${stat.text}`}></div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${stat.bg} ${stat.text} group-hover:scale-110 transition-transform shadow-sm`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/10 group-hover:text-muted-foreground/30" />
                </div>
                <div className="space-y-1">
                  <p className="text-3xl font-black tracking-tighter">{stat.value}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* Department Distribution */}
          <Card className="bg-card backdrop-blur-2xl border-border text-foreground overflow-hidden shadow-2xl">
            <CardHeader className="p-8 border-b border-border bg-muted/30">
              <CardTitle className="flex items-center gap-3 text-xl font-black uppercase tracking-tighter">
                <BookOpen className="w-6 h-6 text-primary" />
                Sector Distribution
              </CardTitle>
              <CardDescription className="text-muted-foreground uppercase tracking-widest text-[9px] font-black">Multi-sector subject allocation</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={deptData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={60}
                      stroke="none"
                      paddingAngle={5}
                    >
                      {deptData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: 'white', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                      itemStyle={{ color: 'hsl(var(--primary))' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-4 mt-6">
                {deptData.slice(0, 4).map((dept, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: dept.color }}></div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{dept.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Risk by Department */}
          <Card className="bg-card backdrop-blur-2xl border-border text-foreground overflow-hidden shadow-2xl">
            <CardHeader className="p-8 border-b border-border bg-muted/30">
              <CardTitle className="flex items-center gap-3 text-xl font-black uppercase tracking-tighter">
                <AlertTriangle className="w-6 h-6 text-warning" />
                Threat Matrix
              </CardTitle>
              <CardDescription className="text-muted-foreground uppercase tracking-widest text-[9px] font-black">Heuristic risk distribution per sector</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={riskByDept}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                    <XAxis dataKey="name" stroke="rgba(0,0,0,0.3)" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                    <YAxis stroke="rgba(0,0,0,0.3)" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'white', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                      cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                    />
                    <Bar dataKey="low" stackId="risk" fill="#10b981" radius={[0, 0, 0, 0]} opacity={0.6} />
                    <Bar dataKey="medium" stackId="risk" fill="#f59e0b" radius={[0, 0, 0, 0]} opacity={0.6} />
                    <Bar dataKey="high" stackId="risk" fill="#ef4444" radius={[4, 4, 0, 0]} opacity={0.8} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          {/* Risk Summary Progress */}
          <Card className="bg-card backdrop-blur-2xl border-border text-foreground overflow-hidden h-fit shadow-lg">
            <CardHeader className="p-8">
              <CardTitle className="text-xl font-black uppercase tracking-tighter">Risk Aggregate</CardTitle>
            </CardHeader>
            <CardContent className="px-8 pb-10 space-y-8">
              {[
                { label: 'Low Risk Profile', count: lowRiskCount, color: 'bg-success', text: 'text-success', total: totalStudents },
                { label: 'Moderate Divergence', count: medRiskCount, color: 'bg-warning', text: 'text-warning', total: totalStudents },
                { label: 'Critical Variance', count: highRiskCount, color: 'bg-destructive', text: 'text-destructive', total: totalStudents },
              ].map((risk, i) => (
                <div key={i} className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{risk.label}</span>
                    <span className={`text-sm font-black tracking-tight ${risk.text}`}>
                      {risk.count} ({risk.total > 0 ? ((risk.count / risk.total) * 100).toFixed(0) : 0}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden border border-border">
                    <div className={`h-full rounded-full ${risk.color}`} style={{ width: `${risk.total > 0 ? (risk.count / risk.total) * 100 : 0}%` }}></div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Top At-Risk Students */}
          <Card className="bg-card backdrop-blur-2xl border-border text-foreground lg:col-span-2 overflow-hidden shadow-lg">
            <CardHeader className="p-8 border-b border-border relative bg-muted/20">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                    Priority Interventions
                  </CardTitle>
                  <CardDescription className="text-muted-foreground uppercase tracking-widest text-[9px] font-black mt-1">Subjects requiring immediate heuristic correction</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {atRiskStudents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {atRiskStudents.map((student, index) => (
                    <div key={student.id || index} className="group flex items-center justify-between p-4 rounded-2xl bg-muted border border-border hover:bg-muted/80 transition-all shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-destructive/10 rounded-xl flex items-center justify-center text-destructive font-black group-hover:scale-110 transition-transform shadow-sm">
                          {(student.name || 'S').charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-sm tracking-tight">{student.name}</p>
                          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{student.department}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="px-2 py-0.5 rounded-lg bg-destructive/10 text-destructive text-[9px] font-black uppercase tracking-widest mb-1">Critical</div>
                        <p className="font-mono text-[10px] text-muted-foreground font-bold">GPA: {student.gpa}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mb-4">
                    <Activity className="w-8 h-8 text-success" />
                  </div>
                  <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">Zero Critical Deviations Detected</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Directory Section */}
        <Card className="bg-card backdrop-blur-2xl border-border text-foreground overflow-hidden shadow-2xl mb-20">
          <CardHeader className="p-8 border-b border-border bg-muted/20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <CardTitle className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                  <Search className="w-6 h-6 text-primary" />
                  Subject Directory
                </CardTitle>
                <CardDescription className="text-muted-foreground uppercase tracking-widest text-[9px] font-black mt-1">Authorized record of academic entities</CardDescription>
              </div>
              <div className="flex gap-4">
                <div className="relative w-full md:w-80 group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                  <Input
                    placeholder="Execute search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-muted border-border rounded-xl pl-10 h-10 text-xs placeholder:text-muted-foreground/20 focus:ring-1 focus:ring-primary/20 shadow-sm"
                  />
                </div>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="bg-muted border border-border text-foreground rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest appearance-none outline-none focus:ring-1 focus:ring-primary/20 shadow-sm"
                >
                  <option value="all">Global Sector</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left py-6 px-6 text-muted-foreground uppercase text-[9px] font-black tracking-widest">Designation</th>
                    <th className="text-left py-6 px-6 text-muted-foreground uppercase text-[9px] font-black tracking-widest">ID</th>
                    <th className="text-left py-6 px-6 text-muted-foreground uppercase text-[9px] font-black tracking-widest">Sector</th>
                    <th className="text-center py-6 px-6 text-muted-foreground uppercase text-[9px] font-black tracking-widest">Cycle</th>
                    <th className="text-center py-6 px-6 text-muted-foreground uppercase text-[9px] font-black tracking-widest">GPA</th>
                    <th className="text-center py-6 px-6 text-muted-foreground uppercase text-[9px] font-black tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.slice(0, 15).map((student, index) => (
                    <tr key={student.id || index} className="border-b border-border hover:bg-muted/30 transition-colors group">
                      <td className="py-6 px-6 font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">{student.name}</td>
                      <td className="py-6 px-6 text-muted-foreground/40 font-mono text-[10px]">{student.student_id}</td>
                      <td className="py-6 px-6 text-muted-foreground/60 uppercase text-[10px] font-bold tracking-tighter">{student.department}</td>
                      <td className="py-6 px-6 text-center text-muted-foreground/60 uppercase text-[10px] font-bold">YR {student.year}</td>
                      <td className="py-6 px-6 text-center">
                        <span className={`font-black font-mono ${student.gpa >= 3.0 ? 'text-success' : student.gpa >= 2.0 ? 'text-warning' : 'text-destructive'}`}>
                          {student.gpa}
                        </span>
                      </td>
                      <td className="py-6 px-6 text-center">
                        <Badge
                          className={`rounded-lg px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border shadow-sm ${student.risk_level === 'high' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                            student.risk_level === 'medium' ? 'bg-warning/10 text-warning border-warning/20' :
                              'bg-success/10 text-success border-success/20'
                            }`}
                        >
                          {student.risk_level}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredStudents.length > 15 && (
              <div className="p-6 text-center border-t border-border bg-muted/10">
                <p className="text-muted-foreground/40 font-black uppercase tracking-[0.2em] text-[9px]">End of Stream — {filteredStudents.length - 15} additional entities suppressed</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserDashboard;
