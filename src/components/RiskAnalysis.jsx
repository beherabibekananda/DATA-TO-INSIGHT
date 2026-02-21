
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { sampleStudents } from "@/data/sampleStudents";
import { studentAnalyticsAPI } from '../api/studentAnalytics';
import { predictiveAPI } from '../api/predictiveAPI';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';
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
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Analyzing Risk Patterns...</p>
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
            <span className="text-[10px] font-black uppercase tracking-widest text-destructive">Risk Analysis Active</span>
          </div>
          <h2 className="text-4xl font-black text-foreground tracking-tighter uppercase">Risk Analysis</h2>
          <p className="text-muted-foreground uppercase tracking-[0.2em] text-[10px] font-black mt-1">Predictive analysis and student risk detection</p>
        </div>

        <div className="flex gap-2 p-1 bg-muted/50 border border-border rounded-2xl">
          <button
            onClick={() => setSelectedDepartment('all')}
            className={`h-11 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${selectedDepartment === 'all' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
          >
            All Departments
          </button>
          <button
            onClick={() => setSelectedDepartment('cs')}
            className={`h-11 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${selectedDepartment === 'cs' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
          >
            Engineering
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'High Risk', value: predictiveResults?.summary.highRisk || 0, icon: AlertTriangle, status: 'Action Required', color: 'text-destructive', bg: 'bg-destructive/10' },
          { label: 'Medium Risk', value: predictiveResults?.summary.mediumRisk || 0, icon: TrendingDown, status: 'Monitoring', color: 'text-warning', bg: 'bg-warning/10' },
          { label: 'Low Risk', value: predictiveResults?.summary.lowRisk || 0, icon: TrendingUp, status: 'On Track', color: 'text-success', bg: 'bg-success/10' },
          { label: 'Total Students', value: modelMetrics?.totalStudents || 0, icon: Fingerprint, status: 'Analyzed', color: 'text-primary', bg: 'bg-primary/10' },
        ].map((stat, i) => (
          <Card key={i} className="bg-card backdrop-blur-3xl border-border text-foreground overflow-hidden group hover:border-primary/40 transition-all">
            <div className={`h-1 w-full bg-border group-hover:${stat.bg.replace('/10', '')} transition-colors`}></div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform shadow-sm`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <ChevronRight className="w-4 h-4 text-border group-hover:text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-black tracking-tighter">{stat.value}</p>
                <div className="flex items-center gap-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                  <div className="w-1 h-1 bg-border rounded-full"></div>
                  <p className={`text-[8px] font-black uppercase tracking-widest ${stat.color}`}>{stat.status}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Risk Factors */}
        <Card className="bg-card backdrop-blur-3xl border-border text-foreground overflow-hidden shadow-2xl">
          <CardHeader className="p-8 border-b border-border bg-muted/10">
            <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
              <Target className="w-5 h-5 text-primary" />
              Impact Factors
            </CardTitle>
            <CardDescription className="text-muted-foreground uppercase tracking-widest text-[9px] font-black">Key factors influencing student performance risk</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[340px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(0,0,0,0.05)" />
                  <PolarAngleAxis
                    dataKey="feature"
                    tick={{ fontSize: 9, fill: 'rgba(0,0,0,0.4)', fontWeight: 'black', letterSpacing: '0.1em' }}
                  />
                  <Radar
                    name="Importance"
                    dataKey="importance"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.1}
                    strokeWidth={3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {radarData.slice(0, 4).map((item, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted border border-border">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/40"></div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{item.fullName.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Risk vs Performance */}
        <Card className="lg:col-span-2 bg-card backdrop-blur-3xl border-border text-foreground overflow-hidden shadow-2xl">
          <CardHeader className="p-8 border-b border-border bg-muted/10">
            <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
              <Zap className="w-6 h-6 text-accent" />
              Risk vs Performance
            </CardTitle>
            <CardDescription className="text-muted-foreground uppercase tracking-widest text-[9px] font-black">Correlation between student GPA and calculated risk score</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                  <XAxis
                    dataKey="x"
                    name="Performance"
                    stroke="rgba(0,0,0,0.3)"
                    fontSize={10}
                    fontWeight="black"
                    tickLine={false}
                    axisLine={false}
                    label={{ value: 'GPA Score', position: 'bottom', fill: 'rgba(0,0,0,0.3)', fontSize: 9, fontWeight: 'black' }}
                  />
                  <YAxis
                    dataKey="y"
                    name="Risk"
                    stroke="rgba(0,0,0,0.3)"
                    fontSize={10}
                    fontWeight="black"
                    tickLine={false}
                    axisLine={false}
                    label={{ value: 'Risk Score', angle: -90, position: 'left', fill: 'rgba(0,0,0,0.3)', fontSize: 9, fontWeight: 'black' }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'white', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    cursor={{ strokeDasharray: '4 4', stroke: 'hsl(var(--primary))' }}
                  />
                  <Scatter
                    data={scatterData}
                    fill={(d) => d.risk === 'high' ? 'hsl(var(--destructive))' : d.risk === 'medium' ? 'hsl(var(--warning))' : 'hsl(var(--success))'}
                    opacity={0.6}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
        {/* Department Analytics Stack */}
        <Card className="lg:col-span-2 bg-card backdrop-blur-2xl border-border text-foreground overflow-hidden shadow-2xl">
          <CardHeader className="p-8 border-b border-border bg-muted/10">
            <CardTitle className="text-xl font-black uppercase tracking-tighter">Department Risk Analysis</CardTitle>
            <CardDescription className="text-muted-foreground uppercase tracking-widest text-[9px] font-black">Comparing risk levels across different departments</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            {comparisonData && (
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData.comparison}>
                    <XAxis dataKey="category" stroke="rgba(0,0,0,0.3)" fontSize={10} fontWeight="black" tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'white', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                      cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                    />
                    <Bar dataKey="lowRisk" stackId="stack" fill="hsl(var(--success))" opacity={0.6} barSize={40} />
                    <Bar dataKey="mediumRisk" stackId="stack" fill="hsl(var(--warning))" opacity={0.6} />
                    <Bar dataKey="highRisk" stackId="stack" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Card */}
        <Card className="bg-card backdrop-blur-2xl border-border text-foreground overflow-hidden shadow-2xl relative">
          <div className="absolute top-0 right-0 p-8">
            <Activity className="w-12 h-12 text-primary opacity-10 animate-pulse" />
          </div>
          <CardHeader className="p-8">
            <CardTitle className="text-xl font-black uppercase tracking-tighter">Analysis Summary</CardTitle>
            <CardDescription className="text-muted-foreground uppercase tracking-widest text-[9px] font-black">Overview of overall student risk percentages</CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-10 space-y-8">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-3xl bg-muted/50 border border-border group hover:border-primary/40 transition-all">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Stable</p>
                <p className="text-4xl font-black text-foreground tracking-tighter">{modelMetrics?.riskPercentages?.low || 0}%</p>
              </div>
              <div className="p-6 rounded-3xl bg-muted/50 border border-border group hover:border-destructive/40 transition-all">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Critical</p>
                <p className="text-4xl font-black text-destructive tracking-tighter">{modelMetrics?.riskPercentages?.high || 0}%</p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-primary/5 border border-primary/20 relative overflow-hidden">
              <div className="absolute top-[-20%] left-[-20%] w-32 h-32 bg-primary/10 blur-3xl rounded-full"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary">Analysis Model</span>
                </div>
                <p className="text-muted-foreground text-[11px] font-bold leading-relaxed uppercase tracking-tight">
                  {modelMetrics?.modelDescription}
                </p>
              </div>
            </div>

            <Button className="w-full bg-muted border border-border hover:bg-muted/80 text-muted-foreground hover:text-foreground h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
              View Detailed Log
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RiskAnalysis;
