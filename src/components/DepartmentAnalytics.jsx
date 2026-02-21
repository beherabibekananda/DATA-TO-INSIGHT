
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Building, Users, TrendingUp, Globe, Filter, Download, Calendar as CalendarIcon, FileSpreadsheet, Brain, Zap, Target, ArrowUpRight } from 'lucide-react';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear } from 'date-fns';
import { cn } from "@/lib/utils";
import * as XLSX from 'xlsx';

const DepartmentAnalytics = () => {
  const [departmentData, setDepartmentData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [customDateRange, setCustomDateRange] = useState({ from: null, to: null });
  const [loading, setLoading] = useState(true);
  const [showCustomDate, setShowCustomDate] = useState(false);
  const { toast } = useToast();

  const primaryColors = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95'];

  // Time period options
  const timePeriods = [
    { value: 'daily', label: 'Daily', days: 1 },
    { value: 'weekly', label: 'Weekly', days: 7 },
    { value: 'monthly', label: 'Monthly', days: 30 },
    { value: 'quarterly', label: 'Quarterly', days: 90 },
    { value: 'half-yearly', label: 'Half Yearly', days: 180 },
    { value: 'yearly', label: 'Yearly', days: 365 },
    { value: 'custom', label: 'Custom Range', days: 0 }
  ];

  useEffect(() => {
    fetchDepartmentData();
  }, []);

  useEffect(() => {
    filterDataByPeriod();
  }, [selectedPeriod, customDateRange, departmentData]);

  const fetchDepartmentData = async () => {
    try {
      setLoading(true);

      const { data: studentsData, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const departmentMap = new Map();

      studentsData?.forEach(student => {
        const dept = student.department;
        if (!departmentMap.has(dept)) {
          departmentMap.set(dept, {
            name: dept,
            students: [],
            total: 0,
            atRisk: 0,
            lowRisk: 0,
            mediumRisk: 0,
            highRisk: 0,
            avgGpa: 0,
            avgAttendance: 0,
            avgEngagement: 0
          });
        }

        const deptData = departmentMap.get(dept);
        deptData.students.push(student);
        deptData.total += 1;

        const riskLevel = student.risk_level?.toLowerCase() || 'low';
        if (riskLevel === 'high') {
          deptData.atRisk += 1;
          deptData.highRisk += 1;
        } else if (riskLevel === 'medium') {
          deptData.mediumRisk += 1;
        } else {
          deptData.lowRisk += 1;
        }

        deptData.avgGpa += student.gpa || 0;
        deptData.avgAttendance += student.attendance_rate || 0;
        deptData.avgEngagement += student.engagement_score || 0;
      });

      const processedData = Array.from(departmentMap.values()).map(dept => ({
        ...dept,
        percentage: dept.total > 0 ? Math.round((dept.atRisk / dept.total) * 100) : 0,
        avgGpa: dept.total > 0 ? (dept.avgGpa / dept.total).toFixed(2) : 0,
        avgAttendance: dept.total > 0 ? Math.round(dept.avgAttendance / dept.total) : 0,
        avgEngagement: dept.total > 0 ? Math.round(dept.avgEngagement / dept.total) : 0
      }));

      setDepartmentData(processedData);
      setFilteredData(processedData);

    } catch (error) {
      console.error('Error fetching department data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch department analytics data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterDataByPeriod = () => {
    if (!departmentData.length) return;

    let startDate, endDate;
    const now = new Date();

    if (selectedPeriod === 'custom') {
      if (!customDateRange.from || !customDateRange.to) {
        setFilteredData(departmentData);
        return;
      }
      startDate = customDateRange.from;
      endDate = customDateRange.to;
    } else {
      const period = timePeriods.find(p => p.value === selectedPeriod);
      if (!period) return;

      switch (selectedPeriod) {
        case 'daily':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          endDate = new Date(now.setHours(23, 59, 59, 999));
          break;
        case 'weekly':
          startDate = startOfWeek(now);
          endDate = endOfWeek(now);
          break;
        case 'monthly':
          startDate = startOfMonth(now);
          endDate = endOfMonth(now);
          break;
        case 'quarterly':
          startDate = startOfQuarter(now);
          endDate = endOfQuarter(now);
          break;
        case 'half-yearly':
          startDate = subDays(now, 180);
          endDate = now;
          break;
        case 'yearly':
          startDate = startOfYear(now);
          endDate = endOfYear(now);
          break;
        default:
          startDate = subDays(now, 30);
          endDate = now;
      }
    }

    const filtered = departmentData.map(dept => {
      const studentsInPeriod = dept.students.filter(student => {
        const createdDate = new Date(student.created_at);
        return createdDate >= startDate && createdDate <= endDate;
      });

      if (studentsInPeriod.length === 0) {
        return { ...dept, total: 0, atRisk: 0, percentage: 0, students: [] };
      }

      const atRiskCount = studentsInPeriod.filter(s => s.risk_level?.toLowerCase() === 'high').length;

      return {
        ...dept,
        students: studentsInPeriod,
        total: studentsInPeriod.length,
        atRisk: atRiskCount,
        percentage: Math.round((atRiskCount / studentsInPeriod.length) * 100),
        lowRisk: studentsInPeriod.filter(s => s.risk_level?.toLowerCase() === 'low').length,
        mediumRisk: studentsInPeriod.filter(s => s.risk_level?.toLowerCase() === 'medium').length,
        highRisk: atRiskCount,
        avgGpa: studentsInPeriod.length > 0 ? (studentsInPeriod.reduce((sum, s) => sum + (s.gpa || 0), 0) / studentsInPeriod.length).toFixed(2) : 0,
        avgAttendance: studentsInPeriod.length > 0 ? Math.round(studentsInPeriod.reduce((sum, s) => sum + (s.attendance_rate || 0), 0) / studentsInPeriod.length) : 0,
        avgEngagement: studentsInPeriod.length > 0 ? Math.round(studentsInPeriod.reduce((sum, s) => sum + (s.engagement_score || 0), 0) / studentsInPeriod.length) : 0
      };
    });

    setFilteredData(filtered);
  };

  const exportToExcel = () => {
    try {
      const excelData = filteredData.map(dept => ({
        'Department': dept.name,
        'Total Students': dept.total,
        'At Risk Students': dept.atRisk,
        'Low Risk Students': dept.lowRisk,
        'Medium Risk Students': dept.mediumRisk,
        'High Risk Students': dept.highRisk,
        'Risk Percentage': `${dept.percentage}%`,
        'Average GPA': dept.avgGpa,
        'Average Attendance': `${dept.avgAttendance}%`,
        'Average Engagement': `${dept.avgEngagement}%`,
        'Success Rate': `${Math.round((1 - dept.percentage / 100) * 100)}%`
      }));

      const totalStudents = filteredData.reduce((sum, dept) => sum + dept.total, 0);
      const totalAtRisk = filteredData.reduce((sum, dept) => sum + dept.atRisk, 0);
      const overallRiskPercentage = totalStudents > 0 ? Math.round((totalAtRisk / totalStudents) * 100) : 0;

      const summaryData = [{
        'Department': 'OVERALL SUMMARY',
        'Total Students': totalStudents,
        'At Risk Students': totalAtRisk,
        'Low Risk Students': filteredData.reduce((sum, dept) => sum + dept.lowRisk, 0),
        'Medium Risk Students': filteredData.reduce((sum, dept) => sum + dept.mediumRisk, 0),
        'High Risk Students': filteredData.reduce((sum, dept) => sum + dept.highRisk, 0),
        'Risk Percentage': `${overallRiskPercentage}%`,
        'Average GPA': filteredData.length > 0 ? (filteredData.reduce((sum, dept) => sum + parseFloat(dept.avgGpa), 0) / filteredData.length).toFixed(2) : 0,
        'Average Attendance': filteredData.length > 0 ? `${Math.round(filteredData.reduce((sum, dept) => sum + dept.avgAttendance, 0) / filteredData.length)}%` : '0%',
        'Average Engagement': filteredData.length > 0 ? `${Math.round(filteredData.reduce((sum, dept) => sum + dept.avgEngagement, 0) / filteredData.length)}%` : '0%',
        'Success Rate': `${Math.round((1 - overallRiskPercentage / 100) * 100)}%`
      }];

      const allData = [...summaryData, ...excelData];
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(allData);

      const wscols = Object.keys(allData[0] || {}).map(key => ({ wch: Math.max(key.length, 15) }));
      ws['!cols'] = wscols;

      XLSX.utils.book_append_sheet(wb, ws, "Department Analytics");
      const filename = `EduAnalytics_Export_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`;
      XLSX.writeFile(wb, filename);

      toast({ title: "Success", description: `Data exported as ${filename}` });
    } catch (error) {
      toast({ title: "Error", description: "Export failed", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin"></div>
          <Brain className="absolute inset-0 m-auto w-10 h-10 text-primary animate-pulse" />
        </div>
      </div>
    );
  }

  const chartData = filteredData.map(dept => ({
    department: dept.name.length > 12 ? dept.name.substring(0, 12) + '...' : dept.name,
    students: dept.total,
    atRisk: dept.atRisk,
    riskPercentage: dept.percentage,
    fullName: dept.name,
    avgGpa: parseFloat(dept.avgGpa),
    avgAttendance: dept.avgAttendance
  }));

  const riskDistributionData = [
    { name: 'Low Risk', value: filteredData.reduce((sum, dept) => sum + dept.lowRisk, 0), color: '#10b981' },
    { name: 'Medium Risk', value: filteredData.reduce((sum, dept) => sum + dept.mediumRisk, 0), color: '#f59e0b' },
    { name: 'High Risk', value: filteredData.reduce((sum, dept) => sum + dept.highRisk, 0), color: '#ef4444' }
  ];

  const totalStudents = filteredData.reduce((sum, dept) => sum + dept.total, 0);
  const totalAtRisk = filteredData.reduce((sum, dept) => sum + dept.atRisk, 0);
  const overallRiskPercentage = totalStudents > 0 ? Math.round((totalAtRisk / totalStudents) * 100) : 0;

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Target className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Sector Intelligence</span>
          </div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase">Department Analytics</h2>
          <p className="text-white/20 uppercase tracking-[0.2em] text-[10px] font-black mt-1">Multi-dimensional tracking of academic sectors</p>
        </div>

        <div className="flex flex-wrap gap-4 items-center bg-white/[0.02] p-2 rounded-2xl border border-white/5">
          <Select value={selectedPeriod} onValueChange={(value) => {
            setSelectedPeriod(value);
            setShowCustomDate(value === 'custom');
          }}>
            <SelectTrigger className="w-44 bg-white/[0.03] border-white/10 text-white rounded-xl h-11 focus:ring-1 focus:ring-primary/40">
              <SelectValue placeholder="Period Select" />
            </SelectTrigger>
            <SelectContent className="bg-[#0c0d12] border-white/10 text-white">
              {timePeriods.map(period => (
                <SelectItem key={period.value} value={period.value} className="focus:bg-primary/20">
                  {period.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedPeriod === 'custom' && (
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-36 justify-start text-left font-bold bg-white/[0.03] border-white/10 text-white/60 h-11 rounded-xl hover:text-white",
                      !customDateRange.from && "text-white/20"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customDateRange.from ? format(customDateRange.from, "MMM dd") : "From"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-white/10" align="start">
                  <Calendar
                    mode="single"
                    selected={customDateRange.from}
                    onSelect={(date) => setCustomDateRange(prev => ({ ...prev, from: date }))}
                    initialFocus
                    className="bg-[#0c0d12] text-white rounded-xl"
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-36 justify-start text-left font-bold bg-white/[0.03] border-white/10 text-white/60 h-11 rounded-xl hover:text-white",
                      !customDateRange.to && "text-white/20"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customDateRange.to ? format(customDateRange.to, "MMM dd") : "To"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-white/10" align="start">
                  <Calendar
                    mode="single"
                    selected={customDateRange.to}
                    onSelect={(date) => setCustomDateRange(prev => ({ ...prev, to: date }))}
                    initialFocus
                    className="bg-[#0c0d12] text-white rounded-xl"
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          <Button
            onClick={exportToExcel}
            className="bg-primary hover:bg-primary/90 text-white rounded-xl h-11 px-6 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Summary Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Sectors', value: filteredData.length, icon: Building, color: 'text-primary', glow: 'shadow-primary/10' },
          { label: 'Total Entities', value: totalStudents.toLocaleString(), icon: Users, color: 'text-secondary', glow: 'shadow-secondary/10' },
          { label: 'Variance Index', value: `${overallRiskPercentage}%`, icon: TrendingUp, color: 'text-destructive', glow: 'shadow-destructive/10' },
          { label: 'Retention Prob.', value: `${Math.round((1 - overallRiskPercentage / 100) * 100)}%`, icon: Globe, color: 'text-success', glow: 'shadow-success/10' },
        ].map((stat, i) => (
          <Card key={i} className="bg-card/40 backdrop-blur-3xl border-white/5 text-white overflow-hidden group hover:border-primary/20 transition-all">
            <div className="h-1 w-full bg-white/5 group-hover:bg-primary transition-colors"></div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-white/[0.03] border border-white/5 ${stat.color} group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-white/10 group-hover:text-white/30" />
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-black tracking-tighter">{stat.value}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/20">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics Visualization Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Composed Chart */}
        <Card className="lg:col-span-2 bg-card/40 backdrop-blur-3xl border-white/5 text-white overflow-hidden shadow-2xl">
          <CardHeader className="p-8 border-b border-white/5 bg-white/[0.01]">
            <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
              <Zap className="w-5 h-5 text-primary" />
              Comparative Sector Efficiency
            </CardTitle>
            <CardDescription className="text-white/20 uppercase tracking-widest text-[9px] font-black">Subject volume vs Heuristic risk variance</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="h-[380px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.2} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis
                    dataKey="department"
                    stroke="rgba(255,255,255,0.2)"
                    fontSize={10}
                    fontWeight="black"
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                    height={60}
                  />
                  <YAxis yAxisId="left" stroke="rgba(255,255,255,0.2)" fontSize={10} fontWeight="black" tickLine={false} axisLine={false} />
                  <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.2)" fontSize={10} fontWeight="black" tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0c0d12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px', fontWeight: 'black' }}
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  />
                  <Bar yAxisId="left" dataKey="students" fill="url(#barGradient)" radius={[6, 6, 0, 0]} name="Volume" barSize={32} />
                  <Bar yAxisId="left" dataKey="atRisk" fill="#ef4444" radius={[6, 6, 0, 0]} name="Critical" barSize={24} opacity={0.6} />
                  <Line yAxisId="right" type="monotone" dataKey="riskPercentage" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b', strokeWidth: 0 }} name="Risk Velocity" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Global Distribution Pie Chart */}
        <Card className="bg-card/40 backdrop-blur-3xl border-white/5 text-white overflow-hidden shadow-2xl">
          <CardHeader className="p-8 border-b border-white/5 bg-white/[0.01]">
            <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
              <Globe className="w-5 h-5 text-secondary" />
              Global Risk Allocation
            </CardTitle>
            <CardDescription className="text-white/20 uppercase tracking-widest text-[9px] font-black">Aggregate subject security breakdown</CardDescription>
          </CardHeader>
          <CardContent className="p-8 flex flex-col justify-between h-[calc(100%-110px)]">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {riskDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} opacity={0.8} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0c0d12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-4">
              {riskDistributionData.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{item.name}</span>
                  </div>
                  <span className="text-sm font-black tracking-tight">{item.value} Subjects</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sector Intelligence Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
        {filteredData.map((dept, index) => (
          <Card key={dept.name} className="bg-card/40 backdrop-blur-3xl border-white/5 text-white overflow-hidden hover:border-primary/40 transition-all duration-500 group">
            <div className={`h-1.5 w-full ${dept.percentage > 25 ? 'bg-destructive' :
                dept.percentage > 10 ? 'bg-warning' :
                  'bg-success'
              } opacity-40 group-hover:opacity-100 transition-opacity`}></div>
            <CardHeader className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg font-black uppercase tracking-tight group-hover:text-primary transition-colors">{dept.name}</CardTitle>
                  <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mt-1">Sector Node Alpha-{index}</p>
                </div>
                <Badge className={`rounded-lg px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border ${dept.percentage > 25 ? 'bg-destructive/10 text-destructive border-destructive/20' :
                    dept.percentage > 10 ? 'bg-warning/10 text-warning border-warning/20' :
                      'bg-success/10 text-success border-success/20'
                  }`}>
                  {dept.percentage}% Variance
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                    <div className="text-2xl font-black tracking-tighter text-white">{dept.total}</div>
                    <div className="text-[9px] text-white/20 font-black uppercase tracking-widest">Active Units</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                    <div className="text-2xl font-black tracking-tighter text-destructive">{dept.atRisk}</div>
                    <div className="text-[9px] text-white/20 font-black uppercase tracking-widest">Critical Alert</div>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { label: 'GPA Index', val: dept.avgGpa, max: 10, color: 'bg-primary' },
                    { label: 'Presence', val: dept.avgAttendance, max: 100, color: 'bg-secondary' },
                    { label: 'Synergy', val: dept.avgEngagement, max: 100, color: 'bg-accent' },
                  ].map((metric, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="text-white/40">{metric.label}</span>
                        <span className="text-white">{metric.val}{metric.max === 100 ? '%' : ''}</span>
                      </div>
                      <div className="h-1 w-full bg-white/[0.03] rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${metric.color}`} style={{ width: `${(metric.val / metric.max) * 100}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <div>
                    <div className="text-xl font-black text-success tracking-tighter">
                      {Math.round((1 - dept.percentage / 100) * 100)}%
                    </div>
                    <div className="text-[9px] text-white/20 font-black uppercase tracking-widest">Success Probability</div>
                  </div>
                  <Brain className="w-8 h-8 text-white/[0.02] group-hover:text-primary/10 transition-colors" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DepartmentAnalytics;
