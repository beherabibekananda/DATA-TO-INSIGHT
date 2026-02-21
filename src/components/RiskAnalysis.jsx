
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { sampleStudents } from "@/data/sampleStudents";
import { studentAnalyticsAPI } from '../api/studentAnalytics';
import { predictiveAPI } from '../api/predictiveAPI';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, AreaChart, Area } from 'recharts';
import { AlertTriangle, TrendingDown, TrendingUp, Brain, Target, Zap, Cpu, ChevronRight, Activity, Fingerprint } from 'lucide-react';

const RiskAnalysis = () => {
  const [riskData, setRiskData] = useState(null);
  const [predictiveResults, setPredictiveResults] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [modelMetrics, setModelMetrics] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRiskData = async () => {
      try {
        let studentIds;
        try {
          const { data: studentList, error } = await supabase
            .from('students')
            .select('id')
            .limit(50);
          if (error) throw error;
          studentIds = (studentList && studentList.length > 0)
            ? studentList.map(s => s.id)
            : sampleStudents.map(s => s.id);
        } catch {
          studentIds = sampleStudents.map(s => s.id);
        }

        const [heatMap, predictions, comparison, metrics] = await Promise.all([
          studentAnalyticsAPI.getRiskHeatMap(selectedDepartment),
          predictiveAPI.getBatchPredictions(studentIds),
          studentAnalyticsAPI.getRiskComparison(),
          predictiveAPI.getModelMetrics()
        ]);

        setRiskData(heatMap.data);
        setPredictiveResults(predictions.data);
        setComparisonData(comparison.data);
        setModelMetrics(metrics.data);
      } catch (error) {
        console.error('Error fetching risk analysis data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRiskData();
  }, [selectedDepartment]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin"></div>
          <Brain className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Synthesizing Neural Logic</p>
      </div>
    );
  }

  const radarData = modelMetrics?.featureImportance.map(item => ({
    feature: item.feature.split(' ')[0],
    importance: item.importance * 100,
    fullName: item.feature
  })) || [];

  const scatterData = predictiveResults?.predictions.map((pred, index) => ({
    x: pred.gpa ? (pred.gpa / 4.0) * 100 : 50,
    y: pred.riskScore * 100,
    risk: pred.riskLevel,
    confidence: pred.confidence,
    name: pred.studentName
  })) || [];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-destructive/10 border border-destructive/20 mb-4">
            <Cpu className="w-3.5 h-3.5 text-destructive" />
            <span className="text-[10px] font-black uppercase tracking-widest text-destructive">Risk Intelligence Engine</span>
          </div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase">Pattern Analysis</h2>
          <p className="text-white/20 uppercase tracking-[0.2em] text-[10px] font-black mt-1">Heuristic screening & predictive drift detection</p>
        </div>

        <div className="flex gap-2 p-1 bg-white/[0.03] border border-white/5 rounded-2xl">
          <button
            onClick={() => setSelectedDepartment('all')}
            className={`h-11 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${selectedDepartment === 'all' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
          >
            Global Sync
          </button>
          <button
            onClick={() => setSelectedDepartment('cs')}
            className={`h-11 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${selectedDepartment === 'cs' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
          >
            Engineering
          </button>
        </div>
      </div>

      {/* Logic Summary Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Critical Variance', value: predictiveResults?.summary.highRisk || 0, icon: AlertTriangle, status: 'Intervention Required', color: 'text-destructive', bg: 'bg-destructive/10' },
          { label: 'Alert Level 02', value: predictiveResults?.summary.mediumRisk || 0, icon: TrendingDown, status: 'Moderate Drift', color: 'text-warning', bg: 'bg-warning/10' },
          { label: 'Optimal Status', value: predictiveResults?.summary.lowRisk || 0, icon: TrendingUp, status: 'Stable Phase', color: 'text-success', bg: 'bg-success/10' },
          { label: 'Network Sample', value: modelMetrics?.totalStudents || 0, icon: Fingerprint, status: 'Entities Indexed', color: 'text-primary', bg: 'bg-primary/10' },
        ].map((stat, i) => (
          <Card key={i} className="bg-card/40 backdrop-blur-3xl border-white/5 text-white overflow-hidden group hover:border-primary/20 transition-all">
            <div className={`h-1 w-full bg-white/5 group-hover:${stat.bg.replace('/10', '')} transition-colors`}></div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-white/30" />
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-black tracking-tighter">{stat.value}</p>
                <div className="flex items-center gap-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/20">{stat.label}</p>
                  <div className="w-1 h-1 bg-white/10 rounded-full"></div>
                  <p className={`text-[8px] font-black uppercase tracking-widest ${stat.color}`}>{stat.status}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Radar Matrix */}
        <Card className="bg-card/40 backdrop-blur-3xl border-white/5 text-white overflow-hidden shadow-2xl">
          <CardHeader className="p-8 border-b border-white/5 bg-white/[0.01]">
            <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
              <Target className="w-5 h-5 text-primary" />
              Neural Weight Matrix
            </CardTitle>
            <CardDescription className="text-white/20 uppercase tracking-widest text-[9px] font-black">AI decision-making feature importance distribution</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[340px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.05)" />
                  <PolarAngleAxis
                    dataKey="feature"
                    tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.2)', fontWeight: 'black', letterSpacing: '0.1em' }}
                  />
                  <Radar
                    name="Importance"
                    dataKey="importance"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.1}
                    strokeWidth={3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {radarData.slice(0, 4).map((item, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-white/[0.02] border border-white/5">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/40"></div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/40">{item.fullName.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Vector Mapping */}
        <Card className="lg:col-span-2 bg-card/40 backdrop-blur-3xl border-white/5 text-white overflow-hidden shadow-2xl">
          <CardHeader className="p-8 border-b border-white/5 bg-white/[0.01]">
            <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
              <Zap className="w-6 h-6 text-accent" />
              Risk Vector Constellation
            </CardTitle>
            <CardDescription className="text-white/20 uppercase tracking-widest text-[9px] font-black">Performative Output (GPA) vs. Dropout Probability Correlation</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                  <XAxis
                    dataKey="x"
                    name="Performance"
                    stroke="rgba(255,255,255,0.2)"
                    fontSize={10}
                    fontWeight="black"
                    tickLine={false}
                    axisLine={false}
                    label={{ value: 'Performance Density', position: 'bottom', fill: 'rgba(255,255,255,0.1)', fontSize: 9, fontWeight: 'black' }}
                  />
                  <YAxis
                    dataKey="y"
                    name="Risk"
                    stroke="rgba(255,255,255,0.2)"
                    fontSize={10}
                    fontWeight="black"
                    tickLine={false}
                    axisLine={false}
                    label={{ value: 'Drift Velocity', angle: -90, position: 'left', fill: 'rgba(255,255,255,0.1)', fontSize: 9, fontWeight: 'black' }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0c0d12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    cursor={{ strokeDasharray: '4 4', stroke: '#8b5cf6' }}
                  />
                  <Scatter
                    data={scatterData}
                    fill={(d) => d.risk === 'high' ? '#ef4444' : d.risk === 'medium' ? '#f59e0b' : '#10b981'}
                    opacity={0.6}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
        {/* Sector Analytics Stack */}
        <Card className="lg:col-span-2 bg-card/40 backdrop-blur-3xl border-white/5 text-white overflow-hidden shadow-2xl">
          <CardHeader className="p-8 border-b border-white/5">
            <CardTitle className="text-xl font-black uppercase tracking-tighter">Sector Resilience Mapping</CardTitle>
            <CardDescription className="text-white/20 uppercase tracking-widest text-[9px] font-black">Aggregated variance per organizational sector</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            {comparisonData && (
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData.comparison}>
                    <XAxis dataKey="category" stroke="rgba(255,255,255,0.2)" fontSize={10} fontWeight="black" tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0c0d12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      cursor={{ fill: 'rgba(255,255,255,0.01)' }}
                    />
                    <Bar dataKey="lowRisk" stackId="stack" fill="#10b981" opacity={0.5} barSize={40} />
                    <Bar dataKey="mediumRisk" stackId="stack" fill="#f59e0b" opacity={0.5} />
                    <Bar dataKey="highRisk" stackId="stack" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Heuristic Logic */}
        <Card className="bg-card/40 backdrop-blur-3xl border-white/5 text-white overflow-hidden shadow-2xl relative">
          <div className="absolute top-0 right-0 p-8">
            <Activity className="w-12 h-12 text-primary opacity-5 animate-pulse" />
          </div>
          <CardHeader className="p-8">
            <CardTitle className="text-xl font-black uppercase tracking-tighter">Deep Synthesis</CardTitle>
            <CardDescription className="text-white/20 uppercase tracking-widest text-[9px] font-black">Probabilistic neural breakdown</CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-10 space-y-8">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 group hover:border-primary/40 transition-all">
                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Baseline</p>
                <p className="text-4xl font-black text-white tracking-tighter">{modelMetrics?.riskPercentages?.low || 0}%</p>
              </div>
              <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 group hover:border-destructive/40 transition-all">
                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Unstable</p>
                <p className="text-4xl font-black text-destructive tracking-tighter">{modelMetrics?.riskPercentages?.high || 0}%</p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 relative overflow-hidden">
              <div className="absolute top-[-20%] left-[-20%] w-32 h-32 bg-primary/20 blur-3xl rounded-full"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary">Model Architecture</span>
                </div>
                <p className="text-white/40 text-[11px] font-bold leading-relaxed uppercase tracking-tight">
                  {modelMetrics?.modelDescription}
                </p>
              </div>
            </div>

            <Button className="w-full bg-white/[0.03] border border-white/10 hover:bg-white/5 text-white/40 hover:text-white h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
              View Entropy Log
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RiskAnalysis;
