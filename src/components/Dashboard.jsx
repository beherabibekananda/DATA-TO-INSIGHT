
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { sampleStudents } from "@/data/sampleStudents";
import { studentAnalyticsAPI } from '../api/studentAnalytics';
import { geographicAPI } from '../api/geographicAPI';
import { predictiveAPI } from '../api/predictiveAPI';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, AlertTriangle, Globe, Brain, Activity, MapPin, Zap, Cpu, Sparkles, Fingerprint, Target } from 'lucide-react';

const Dashboard = () => {
  const [performanceData, setPerformanceData] = useState(null);
  const [departmentData, setDepartmentData] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [realStats, setRealStats] = useState({ total: 0, atRisk: 0, departments: 0, avgGpa: '0.00', avgAttendance: '0' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
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

        const [performance, risk, deptDistribution, insights] = await Promise.all([
          studentAnalyticsAPI.getPerformanceTrends(),
          studentAnalyticsAPI.getRiskHeatMap(),
          studentAnalyticsAPI.getDepartmentDistribution(),
          predictiveAPI.getAIInsights()
        ]);

        setPerformanceData(performance.data);
        setDepartmentData(deptDistribution.data);
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin"></div>
          <Cpu className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Initializing Neural Mesh</p>
      </div>
    );
  }

  const COLORS = ['#8b5cf6', '#d946ef', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Entities', value: realStats.total, icon: Users, color: 'text-primary', bg: 'bg-primary/10', sub: 'Verified Nodes' },
          { label: 'Risk Propagation', value: realStats.atRisk, icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10', sub: `${((realStats.atRisk / realStats.total) * 100).toFixed(1)}% Saturation` },
          { label: 'Active Sectors', value: realStats.departments, icon: Target, color: 'text-accent', bg: 'bg-accent/10', sub: 'Academic Blocks' },
          { label: 'Neural Index', value: realStats.avgGpa, icon: Brain, color: 'text-secondary', bg: 'bg-secondary/10', sub: `AVG Pres: ${realStats.avgAttendance}%` },
        ].map((stat, i) => (
          <Card key={i} className="bg-card/40 backdrop-blur-3xl border-white/5 text-white overflow-hidden group hover:border-primary/20 transition-all">
            <div className={`h-1 w-full opacity-20 group-hover:opacity-100 transition-opacity bg-current ${stat.color}`}></div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div className="w-8 h-8 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Activity className="w-3 h-3 text-white/20" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-black tracking-tighter">{stat.value}</p>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/20">{stat.label}</p>
                  <span className={`text-[8px] font-black uppercase tracking-widest ${stat.color}`}>{stat.sub}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Vector Analysis */}
        <Card className="lg:col-span-2 bg-card/40 backdrop-blur-3xl border-white/5 text-white overflow-hidden shadow-2xl">
          <CardHeader className="p-8 border-b border-white/5 bg-white/[0.01]">
            <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-primary" />
              Longitudinal Variance
            </CardTitle>
            <CardDescription className="text-white/20 uppercase tracking-widest text-[9px] font-black">Neural mapping of merit & engagement trajectories</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            {performanceData && (
              <div className="h-[340px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData.datasets[0].data.map((value, index) => ({
                    month: performanceData.labels[index],
                    gpa: value * 25, // scaling for visual consistency
                    attendance: performanceData.datasets[1].data[index]
                  }))}>
                    <defs>
                      <linearGradient id="colorGpa" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                    <XAxis dataKey="month" stroke="rgba(255,255,255,0.2)" fontSize={10} fontWeight="black" tickLine={false} axisLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} fontWeight="black" tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0c0d12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    />
                    <Area type="monotone" dataKey="gpa" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorGpa)" />
                    <Line type="monotone" dataKey="attendance" stroke="#d946ef" strokeWidth={3} dot={{ fill: '#d946ef', r: 4 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sector Distribution */}
        <Card className="bg-card/40 backdrop-blur-3xl border-white/5 text-white overflow-hidden shadow-2xl">
          <CardHeader className="p-8 border-b border-white/5 bg-white/[0.01]">
            <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
              <Activity className="w-5 h-5 text-accent" />
              Sector Saturation
            </CardTitle>
            <CardDescription className="text-white/20 uppercase tracking-widest text-[9px] font-black">Entity density per operational circuit</CardDescription>
          </CardHeader>
          <CardContent className="p-8 flex items-center justify-center">
            {departmentData && (
              <div className="h-[340px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={departmentData.chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {departmentData.chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} opacity={0.8} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0c0d12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 m-auto w-16 h-16 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xs font-black text-white/20 uppercase">Total</span>
                  <span className="text-xl font-black text-white">{realStats.total}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI Intelligence Surface */}
      <Card className="bg-card/40 backdrop-blur-3xl border-white/5 text-white overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-accent"></div>
        <CardHeader className="p-8 border-b border-white/5">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                <Brain className="w-7 h-7 text-primary" />
                Inference Matrix
              </CardTitle>
              <CardDescription className="text-white/20 uppercase tracking-widest text-[10px] font-black">Synthesized anomaly detection and heuristic patterns</CardDescription>
            </div>
            <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1.5 rounded-xl font-black uppercase tracking-widest text-[9px]">Neural Pulse Active</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          {aiInsights && (
            <div className="space-y-10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Network Scan', value: aiInsights.realTimeStats.studentsAnalyzed, color: 'text-primary' },
                  { label: 'Anomalies', value: aiInsights.realTimeStats.highRiskCount, color: 'text-destructive' },
                  { label: 'Merit Avg', value: aiInsights.realTimeStats.avgGpa, color: 'text-success' },
                  { label: 'Sync Rate', value: `${aiInsights.realTimeStats.avgAttendance}%`, color: 'text-secondary' },
                ].map((stat, i) => (
                  <div key={i} className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 text-center group hover:bg-white/[0.04] transition-all">
                    <p className={`text-[9px] font-black uppercase tracking-widest ${stat.color} mb-1`}>{stat.label}</p>
                    <p className="text-2xl font-black text-white">{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {aiInsights.insights.map((insight, index) => (
                  <div key={index} className={`p-8 rounded-[32px] border transition-all hover:scale-[1.01] duration-500 relative overflow-hidden group ${insight.severity === 'critical' ? 'bg-destructive/5 border-destructive/10' :
                      insight.severity === 'high' ? 'bg-warning/5 border-warning/10' :
                        'bg-white/[0.02] border-white/5'
                    }`}>
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                      {insight.severity === 'critical' ? <AlertTriangle className="w-16 h-16" /> : <Sparkles className="w-16 h-16" />}
                    </div>

                    <div className="relative z-10 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full animate-pulse ${insight.severity === 'critical' ? 'bg-destructive' : 'bg-primary'
                          }`}></div>
                        <h4 className="text-xl font-black text-white tracking-tighter uppercase">{insight.title}</h4>
                      </div>
                      <p className="text-white/40 text-sm font-bold leading-relaxed uppercase tracking-tight">{insight.description}</p>
                      <div className="pt-4 flex items-center gap-3">
                        <div className="px-4 py-2 rounded-xl bg-white/[0.02] border border-white/10 flex items-center gap-2">
                          <Zap className="w-3.5 h-3.5 text-primary" />
                          <span className="text-[10px] font-black text-primary uppercase tracking-widest">{insight.recommendation}</span>
                        </div>
                        <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">{insight.affectedStudents} Nodes Affected</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
