
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Building, Users, TrendingUp, Globe, Filter, Download, Calendar as CalendarIcon, FileSpreadsheet } from 'lucide-react';
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
      
      // Fetch students data with creation dates
      const { data: studentsData, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Process the data by department
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
        
        // Calculate risk levels
        const riskLevel = student.risk_level?.toLowerCase() || 'low';
        if (riskLevel === 'high') {
          deptData.atRisk += 1;
          deptData.highRisk += 1;
        } else if (riskLevel === 'medium') {
          deptData.mediumRisk += 1;
        } else {
          deptData.lowRisk += 1;
        }
        
        // Add to averages
        deptData.avgGpa += student.gpa || 0;
        deptData.avgAttendance += student.attendance_rate || 0;
        deptData.avgEngagement += student.engagement_score || 0;
      });

      // Calculate final averages and percentages
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
          startDate = startOfDay(now);
          endDate = endOfDay(now);
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

    // Filter departments based on student creation dates within the period
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

  const startOfDay = (date) => {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  };

  const endOfDay = (date) => {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
  };

  const exportToExcel = () => {
    try {
      // Prepare data for Excel
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
        'Success Rate': `${Math.round((1 - dept.percentage/100) * 100)}%`
      }));

      // Add summary data
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
        'Success Rate': `${Math.round((1 - overallRiskPercentage/100) * 100)}%`
      }];

      const allData = [...summaryData, ...excelData];

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(allData);

      // Add some styling
      const range = XLSX.utils.decode_range(ws['!ref']);
      for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
          if (!ws[cellAddress]) continue;
          
          // Style the summary row
          if (R === 0) {
            ws[cellAddress].s = {
              font: { bold: true, color: { rgb: "FFFFFF" } },
              fill: { bgColor: { rgb: "4F46E5" } }
            };
          }
        }
      }

      // Auto-width columns
      const wscols = Object.keys(allData[0] || {}).map(key => ({ wch: Math.max(key.length, 15) }));
      ws['!cols'] = wscols;

      XLSX.utils.book_append_sheet(wb, ws, "Department Analytics");

      // Generate filename with current date and period
      const periodLabel = selectedPeriod === 'custom' && customDateRange.from && customDateRange.to 
        ? `${format(customDateRange.from, 'yyyy-MM-dd')}_to_${format(customDateRange.to, 'yyyy-MM-dd')}`
        : selectedPeriod;
      
      const filename = `Department_Analytics_${periodLabel}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
      
      // Save file
      XLSX.writeFile(wb, filename);
      
      toast({
        title: "Success",
        description: `Department analytics exported to ${filename}`,
      });
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast({
        title: "Error",
        description: "Failed to export data to Excel.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Loading Department Analytics...
          </p>
        </div>
      </div>
    );
  }

  // Transform data for charts
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
    <div className="space-y-8 p-6">
      {/* Header with Enhanced Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Department Analytics</h2>
          <p className="text-gray-300">Comprehensive analysis with time-based tracking and export capabilities</p>
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
          <Select value={selectedPeriod} onValueChange={(value) => {
            setSelectedPeriod(value);
            setShowCustomDate(value === 'custom');
          }}>
            <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              {timePeriods.map(period => (
                <SelectItem key={period.value} value={period.value}>
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
                      "w-32 justify-start text-left font-normal bg-white/10 border-white/20 text-white",
                      !customDateRange.from && "text-gray-400"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customDateRange.from ? format(customDateRange.from, "MMM dd") : "From"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={customDateRange.from}
                    onSelect={(date) => setCustomDateRange(prev => ({ ...prev, from: date }))}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-32 justify-start text-left font-normal bg-white/10 border-white/20 text-white",
                      !customDateRange.to && "text-gray-400"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customDateRange.to ? format(customDateRange.to, "MMM dd") : "To"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={customDateRange.to}
                    onSelect={(date) => setCustomDateRange(prev => ({ ...prev, to: date }))}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          <Button 
            onClick={exportToExcel}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-card neon-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total Departments</CardTitle>
            <Building className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{filteredData.length}</div>
            <p className="text-xs text-blue-400">Active departments</p>
          </CardContent>
        </Card>

        <Card className="glass-card neon-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total Students</CardTitle>
            <Users className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalStudents.toLocaleString()}</div>
            <p className="text-xs text-green-400">In selected period</p>
          </CardContent>
        </Card>

        <Card className="glass-card neon-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Overall Risk</CardTitle>
            <TrendingUp className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{overallRiskPercentage}%</div>
            <p className="text-xs text-yellow-400">{totalAtRisk} students at risk</p>
          </CardContent>
        </Card>

        <Card className="glass-card neon-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Success Rate</CardTitle>
            <Globe className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{Math.round((1 - overallRiskPercentage/100) * 100)}%</div>
            <p className="text-xs text-cyan-400">Overall success</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Performance Chart */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Building className="h-5 w-5 text-purple-400" />
              Department Performance
            </CardTitle>
            <CardDescription className="text-gray-300">
              Students vs Risk Analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="department" 
                  stroke="#9ca3af"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis yAxisId="left" stroke="#9ca3af" />
                <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }}
                />
                <Bar yAxisId="left" dataKey="students" fill="#3b82f6" name="Total Students" />
                <Bar yAxisId="left" dataKey="atRisk" fill="#ef4444" name="At Risk" />
                <Line yAxisId="right" type="monotone" dataKey="riskPercentage" stroke="#f59e0b" strokeWidth={2} name="Risk %" />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Risk Distribution Pie Chart */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-yellow-400" />
              Risk Distribution
            </CardTitle>
            <CardDescription className="text-gray-300">
              Overall student risk levels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={riskDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {riskDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Department Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredData.map((dept, index) => (
          <Card key={dept.name} className="glass-card hover-scale transition-all duration-300">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-white text-lg">{dept.name}</CardTitle>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  dept.percentage > 20 ? 'bg-red-500/20 text-red-300' :
                  dept.percentage > 10 ? 'bg-yellow-500/20 text-yellow-300' :
                  'bg-green-500/20 text-green-300'
                }`}>
                  {dept.percentage}% risk
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{dept.total}</div>
                    <div className="text-xs text-gray-400">Total Students</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-400">{dept.atRisk}</div>
                    <div className="text-xs text-gray-400">At Risk</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Avg GPA</span>
                    <span className="text-white font-medium">{dept.avgGpa}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Avg Attendance</span>
                    <span className="text-white font-medium">{dept.avgAttendance}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Avg Engagement</span>
                    <span className="text-white font-medium">{dept.avgEngagement}%</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10">
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-400">
                      {Math.round((1 - dept.percentage/100) * 100)}%
                    </div>
                    <div className="text-xs text-gray-400">Success Rate</div>
                  </div>
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
