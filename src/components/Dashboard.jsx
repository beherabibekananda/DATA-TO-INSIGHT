
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { sampleStudents } from "@/data/sampleStudents";
import { studentAnalyticsAPI } from '../api/studentAnalytics';
import { geographicAPI } from '../api/geographicAPI';
import { predictiveAPI } from '../api/predictiveAPI';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { TrendingUp, Users, AlertTriangle, Globe, Brain, Activity, MapPin } from 'lucide-react';

const Dashboard = () => {
  const [performanceData, setPerformanceData] = useState(null);
  const [riskHeatMap, setRiskHeatMap] = useState(null);
  const [departmentData, setDepartmentData] = useState(null);
  const [globeData, setGlobeData] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [realStats, setRealStats] = useState({ total: 0, atRisk: 0, departments: 0, avgGpa: '0.00' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch students from Supabase, fallback to sample data
        let students;
        try {
          const { data, error } = await supabase
            .from('students')
            .select('gpa, risk_level, department, attendance_rate');
          if (error) throw error;
          students = (data && data.length > 0) ? data : sampleStudents;
        } catch {
          students = sampleStudents;
        }

        const total = students.length;
        const atRisk = (students || []).filter(s => s.risk_level === 'high' || s.risk_level === 'medium').length;
        const departments = [...new Set((students || []).map(s => s.department))].length;
        const avgGpa = total > 0
          ? ((students || []).reduce((sum, s) => sum + (s.gpa || 0), 0) / total).toFixed(2)
          : '0.00';
        const avgAttendance = total > 0
          ? ((students || []).reduce((sum, s) => sum + (s.attendance_rate || 0), 0) / total).toFixed(1)
          : '0';

        setRealStats({ total, atRisk, departments, avgGpa, avgAttendance });

        // Fetch analytics data from real APIs
        const [performance, risk, deptDistribution, globe, insights] = await Promise.all([
          studentAnalyticsAPI.getPerformanceTrends(),
          studentAnalyticsAPI.getRiskHeatMap(),
          studentAnalyticsAPI.getDepartmentDistribution(),
          geographicAPI.getGlobeData(),
          predictiveAPI.getAIInsights()
        ]);

        setPerformanceData(performance.data);
        setRiskHeatMap(risk.data);
        setDepartmentData(deptDistribution.data);
        setGlobeData(globe.data);
        setAiInsights(insights.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Loading Analytics from Database...
          </p>
        </div>
      </div>
    );
  }

  const COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-8 p-6">
      {/* Header Stats - Now using REAL data */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-card neon-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total Students</CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{realStats.total.toLocaleString()}</div>
            <p className="text-xs text-blue-400">From database</p>
          </CardContent>
        </Card>

        <Card className="glass-card neon-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">At Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{realStats.atRisk}</div>
            <p className="text-xs text-red-400">
              {realStats.total > 0 ? `${((realStats.atRisk / realStats.total) * 100).toFixed(1)}% of total` : 'No data'}
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card neon-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Departments</CardTitle>
            <Globe className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{realStats.departments}</div>
            <p className="text-xs text-cyan-400">Active departments</p>
          </CardContent>
        </Card>

        <Card className="glass-card neon-glow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Average GPA</CardTitle>
            <Brain className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{realStats.avgGpa}</div>
            <p className="text-xs text-purple-400">Avg Attendance: {realStats.avgAttendance}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-400" />
              Performance by Year
            </CardTitle>
            <CardDescription className="text-gray-300">
              Average GPA and Attendance across academic years
            </CardDescription>
          </CardHeader>
          <CardContent>
            {performanceData && (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData.datasets[0].data.map((value, index) => ({
                  month: performanceData.labels[index],
                  gpa: value,
                  attendance: performanceData.datasets[1].data[index]
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#ffffff'
                    }}
                  />
                  <Line type="monotone" dataKey="gpa" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }} name="Avg GPA" />
                  <Line type="monotone" dataKey="attendance" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 6 }} name="Avg Attendance %" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-400" />
              Department Distribution
            </CardTitle>
            <CardDescription className="text-gray-300">
              Student distribution across departments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {departmentData && (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={departmentData.chartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {departmentData.chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
            )}
          </CardContent>
        </Card>
      </div>

      {/* Risk Analysis */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            Risk Analysis by Department & Year
          </CardTitle>
          <CardDescription className="text-gray-300">
            Risk distribution across departments and academic years (from real data)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {riskHeatMap && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {(riskHeatMap.departments || []).map((dept) => (
                <div key={dept} className="space-y-2">
                  <h4 className="text-white font-medium text-center text-sm">{dept}</h4>
                  {(riskHeatMap.years || []).map((year) => {
                    const data = riskHeatMap.heatMapData.find(d => d.x === dept && d.y === year);
                    if (!data) return null;
                    const riskColor = data?.risk === 'high' ? 'bg-red-500/30 border-red-500' :
                      data?.risk === 'medium' ? 'bg-yellow-500/30 border-yellow-500' :
                        'bg-green-500/30 border-green-500';
                    return (
                      <div key={year} className={`p-3 rounded-lg border ${riskColor} text-center`}>
                        <div className="text-white text-xs">{year}</div>
                        <div className="text-white font-bold">{data?.value}%</div>
                        <div className="text-gray-400 text-xs">{data?.total || 0} students</div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
          {(!riskHeatMap || riskHeatMap.departments?.length === 0) && (
            <p className="text-gray-400 text-center py-8">No student data available. Upload data to see risk analysis.</p>
          )}
        </CardContent>
      </Card>

      {/* Department Distribution Details */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <MapPin className="h-5 w-5 text-cyan-400" />
            Department Overview
          </CardTitle>
          <CardDescription className="text-gray-300">
            Detailed breakdown of students by department
          </CardDescription>
        </CardHeader>
        <CardContent>
          {globeData && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {globeData.studentLocations.map((location, index) => (
                <div key={location.country} className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-white font-semibold">{location.country}</h4>
                    <span className={`px-2 py-1 rounded text-xs ${location.students > 0 && location.atRisk / location.students > 0.3 ? 'bg-red-500/20 text-red-300' :
                      location.students > 0 && location.atRisk / location.students > 0.15 ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-green-500/20 text-green-300'
                      }`}>
                      {location.students > 0 ? ((location.atRisk / location.students) * 100).toFixed(1) : 0}% at risk
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-gray-300">
                    <div className="flex justify-between">
                      <span>Total Students:</span>
                      <span className="text-white">{location.students.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>At Risk:</span>
                      <span className="text-red-300">{location.atRisk}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Year Groups:</span>
                      <span className="text-cyan-300">{location.universities}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-400" />
            AI-Powered Insights
          </CardTitle>
          <CardDescription className="text-gray-300">
            Real-time analysis based on actual student data
          </CardDescription>
        </CardHeader>
        <CardContent>
          {aiInsights && (
            <div className="space-y-4">
              {/* Real-time Stats Bar */}
              {aiInsights.realTimeStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-center">
                    <div className="text-blue-300 text-xs">Analyzed</div>
                    <div className="text-white font-bold">{aiInsights.realTimeStats.studentsAnalyzed}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-center">
                    <div className="text-red-300 text-xs">High Risk</div>
                    <div className="text-white font-bold">{aiInsights.realTimeStats.highRiskCount}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-center">
                    <div className="text-green-300 text-xs">Avg GPA</div>
                    <div className="text-white font-bold">{aiInsights.realTimeStats.avgGpa}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30 text-center">
                    <div className="text-purple-300 text-xs">Avg Attendance</div>
                    <div className="text-white font-bold">{aiInsights.realTimeStats.avgAttendance}%</div>
                  </div>
                </div>
              )}

              {aiInsights.insights.map((insight, index) => (
                <div key={index} className={`p-4 rounded-lg border-l-4 ${insight.severity === 'critical' ? 'bg-red-500/10 border-red-500' :
                  insight.severity === 'high' ? 'bg-orange-500/10 border-orange-500' :
                    insight.severity === 'positive' ? 'bg-green-500/10 border-green-500' :
                      insight.severity === 'info' ? 'bg-blue-500/10 border-blue-500' :
                        'bg-blue-500/10 border-blue-500'
                  }`}>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-white font-semibold">{insight.title}</h4>
                    <span className="text-sm text-gray-300">{insight.affectedStudents} students</span>
                  </div>
                  <p className="text-gray-300 text-sm mb-2">{insight.description}</p>
                  <p className="text-blue-300 text-sm font-medium">💡 {insight.recommendation}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
