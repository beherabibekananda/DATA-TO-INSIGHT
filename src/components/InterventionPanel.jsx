
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { predictiveAPI } from '../api/predictiveAPI';
import { studentAnalyticsAPI } from '../api/studentAnalytics';
import { Send, AlertTriangle, CheckCircle, Clock, Target, Zap, Users, MessageSquare, Brain, Search, Info, Trash2, ArrowRight } from 'lucide-react';

const InterventionPanel = () => {
  const [interventions, setInterventions] = useState([]);
  const [aiInsights, setAiInsights] = useState(null);
  const [newIntervention, setNewIntervention] = useState({
    title: '',
    description: '',
    targetGroup: 'high-risk',
    type: 'academic',
    priority: 'medium'
  });
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInterventionData = async () => {
      try {
        const [insights] = await Promise.all([
          predictiveAPI.getAIInsights()
        ]);

        setAiInsights(insights.data);

        setInterventions([
          {
            id: 1,
            title: 'Attendance Improvement Program',
            description: 'Targeted program for students with attendance below 75%',
            targetGroup: 'medium-risk',
            type: 'behavioral',
            priority: 'high',
            status: 'active',
            studentsAffected: 45,
            createdAt: '2024-01-15',
            effectiveness: 73
          },
          {
            id: 2,
            title: 'Academic Tutoring Support',
            description: 'One-on-one tutoring for struggling students in STEM subjects',
            targetGroup: 'high-risk',
            type: 'academic',
            priority: 'critical',
            status: 'active',
            studentsAffected: 28,
            createdAt: '2024-01-10',
            effectiveness: 85
          },
          {
            id: 3,
            title: 'Mental Health Wellness Check',
            description: 'Regular counseling sessions for students showing stress indicators',
            targetGroup: 'all',
            type: 'wellness',
            priority: 'medium',
            status: 'completed',
            studentsAffected: 156,
            createdAt: '2024-01-05',
            effectiveness: 68
          }
        ]);

        setNotifications([
          {
            id: 1,
            message: 'New high-risk student identified in Computer Science',
            type: 'alert',
            timestamp: new Date().toISOString(),
            studentId: 'CS2024001'
          },
          {
            id: 2,
            message: 'Intervention program showing 15% improvement',
            type: 'success',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            programId: 'INT001'
          }
        ]);

      } catch (error) {
        console.error('Error fetching intervention data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInterventionData();
  }, []);

  const handleCreateIntervention = () => {
    const intervention = {
      id: interventions.length + 1,
      ...newIntervention,
      status: 'planning',
      studentsAffected: 0,
      createdAt: new Date().toISOString().split('T')[0],
      effectiveness: 0
    };

    setInterventions([intervention, ...interventions]);
    setNewIntervention({
      title: '',
      description: '',
      targetGroup: 'high-risk',
      type: 'academic',
      priority: 'medium'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-success/10 text-success border-success/20';
      case 'planning': return 'bg-warning/10 text-warning border-warning/20';
      case 'completed': return 'bg-primary/10 text-primary border-primary/20';
      default: return 'bg-white/5 text-white/40 border-white/10';
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'critical': return <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-[9px] font-black uppercase tracking-widest">CRITICAL</Badge>;
      case 'high': return <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20 text-[9px] font-black uppercase tracking-widest">HIGH</Badge>;
      case 'medium': return <Badge className="bg-warning/10 text-warning border-warning/20 text-[9px] font-black uppercase tracking-widest">MEDIUM</Badge>;
      default: return <Badge className="bg-success/10 text-success border-success/20 text-[9px] font-black uppercase tracking-widest">LOW</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin"></div>
          <Brain className="absolute inset-0 m-auto w-10 h-10 text-primary animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Target className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Mission Strategy</span>
          </div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase">Intervention Hub</h2>
          <p className="text-white/20 uppercase tracking-[0.2em] text-[10px] font-black mt-1">Heuristic remediation & support protocols</p>
        </div>
        <div className="flex gap-3">
          <Button className="bg-white/[0.03] border border-white/5 text-white/40 hover:text-white rounded-xl px-6 h-11 text-[10px] font-black uppercase tracking-widest transition-all">
            <Clock className="w-4 h-4 mr-2" />
            History
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl h-11 px-6 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
            <Brain className="w-4 h-4 mr-2" />
            AI Synthesize
          </Button>
        </div>
      </div>

      {/* Summary Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Protocols', value: interventions.filter(i => i.status === 'active').length, icon: Target, color: 'text-success', bg: 'bg-success/10' },
          { label: 'Entities Protected', value: interventions.reduce((sum, i) => sum + i.studentsAffected, 0), icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Success Velocity', value: `${interventions.length > 0 ? Math.round(interventions.reduce((sum, i) => sum + i.effectiveness, 0) / interventions.length) : 0}%`, icon: Zap, color: 'text-warning', bg: 'bg-warning/10' },
          { label: 'AI Directives', value: aiInsights?.insights.length || 0, icon: MessageSquare, color: 'text-secondary', bg: 'bg-secondary/10' },
        ].map((stat, i) => (
          <Card key={i} className="bg-card/40 backdrop-blur-3xl border-white/5 text-white overflow-hidden group hover:border-primary/20 transition-all">
            <div className={`h-1 w-full bg-white/5 group-hover:${stat.bg.replace('/10', '')} transition-colors`}></div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <Info className="w-4 h-4 text-white/10 group-hover:text-white/30" />
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-black tracking-tighter">{stat.value}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/20">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Intervention Constructor */}
        <Card className="lg:col-span-2 bg-card/40 backdrop-blur-3xl border-white/5 text-white overflow-hidden shadow-2xl">
          <CardHeader className="p-8 border-b border-white/5 bg-white/[0.01]">
            <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
              <Send className="w-6 h-6 text-primary" />
              Protocol Designer
            </CardTitle>
            <CardDescription className="text-white/20 uppercase tracking-widest text-[9px] font-black">Design heuristic support frameworks for academic nodes</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Protocol Designation</label>
                  <Input
                    value={newIntervention.title}
                    onChange={(e) => setNewIntervention({ ...newIntervention, title: e.target.value })}
                    placeholder="e.g. STEM Recovery Alpha"
                    className="bg-white/[0.03] border-white/10 text-white rounded-xl h-12 focus:ring-1 focus:ring-primary/40 placeholder:text-white/10"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Target Sector</label>
                    <select
                      value={newIntervention.targetGroup}
                      onChange={(e) => setNewIntervention({ ...newIntervention, targetGroup: e.target.value })}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl h-12 px-4 text-xs text-white uppercase font-black outline-none focus:ring-1 focus:ring-primary/40 appearance-none"
                    >
                      <option value="high-risk" className="bg-[#0c0d12]">Critical Variance</option>
                      <option value="medium-risk" className="bg-[#0c0d12]">Moderate Divergence</option>
                      <option value="low-risk" className="bg-[#0c0d12]">Stable Nodes</option>
                      <option value="all" className="bg-[#0c0d12]">Global Network</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Protocol Type</label>
                    <select
                      value={newIntervention.type}
                      onChange={(e) => setNewIntervention({ ...newIntervention, type: e.target.value })}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl h-12 px-4 text-xs text-white uppercase font-black outline-none focus:ring-1 focus:ring-primary/40 appearance-none"
                    >
                      <option value="academic" className="bg-[#0c0d12]">Academic Sync</option>
                      <option value="behavioral" className="bg-[#0c0d12]">Behavioral Correction</option>
                      <option value="wellness" className="bg-[#0c0d12]">Resilience Wellness</option>
                      <option value="financial" className="bg-[#0c0d12]">Resource Subsidy</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Threat Priority</label>
                  <div className="flex gap-2">
                    {['low', 'medium', 'high', 'critical'].map(p => (
                      <button
                        key={p}
                        onClick={() => setNewIntervention({ ...newIntervention, priority: p })}
                        className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${newIntervention.priority === p ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white/[0.03] border-white/5 text-white/40 hover:text-white hover:bg-white/[0.05]'}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Mission Parameters</label>
                  <Textarea
                    value={newIntervention.description}
                    onChange={(e) => setNewIntervention({ ...newIntervention, description: e.target.value })}
                    placeholder="Define remediation steps & objectives..."
                    className="bg-white/[0.03] border-white/10 text-white rounded-xl h-[124px] focus:ring-1 focus:ring-primary/40 placeholder:text-white/10 resize-none p-4 text-sm"
                  />
                </div>

                <Button
                  onClick={handleCreateIntervention}
                  disabled={!newIntervention.title || !newIntervention.description}
                  className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl h-14 font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-98 disabled:opacity-20"
                >
                  Initiate Deployment
                  <ArrowRight className="w-4 h-4 ml-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Directives */}
        <Card className="bg-card/40 backdrop-blur-3xl border-white/5 text-white overflow-hidden shadow-2xl">
          <CardHeader className="p-8 border-b border-white/5 bg-white/[0.01]">
            <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
              <Zap className="w-6 h-6 text-warning" />
              Machine Directive
            </CardTitle>
            <CardDescription className="text-white/20 uppercase tracking-widest text-[9px] font-black">Heuristic-optimized remediation targets</CardDescription>
          </CardHeader>
          <CardContent className="p-0 max-h-[460px] overflow-y-auto custom-scrollbar">
            <div className="divide-y divide-white/5">
              {aiInsights?.insights.map((insight, index) => (
                <div key={index} className="p-6 group hover:bg-white/[0.02] transition-colors relative">
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${insight.severity === 'critical' ? 'bg-destructive' :
                      insight.severity === 'high' ? 'bg-orange-500' :
                        insight.severity === 'positive' ? 'bg-success' :
                          'bg-primary'
                    } opacity-20 group-hover:opacity-100 transition-opacity`}></div>
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-sm font-black tracking-tight leading-tight">{insight.title}</h4>
                    <Badge className={`rounded-lg px-2 py-0.5 text-[8px] font-black uppercase tracking-widest border ${insight.severity === 'critical' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                        insight.severity === 'high' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                          'bg-primary/10 text-primary border-primary/20'
                      }`}>
                      {insight.severity}
                    </Badge>
                  </div>
                  <p className="text-white/30 text-[10px] font-bold uppercase tracking-tight mb-4 leading-relaxed">{insight.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-primary uppercase tracking-widest">💡 Recommended Action</span>
                    <button className="text-[10px] font-bold text-white/40 hover:text-white transition-colors flex items-center gap-1 group/btn">
                      Auto-Draft <ChevronRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Frameworks */}
      <Card className="bg-card/40 backdrop-blur-3xl border-white/5 text-white overflow-hidden shadow-2xl">
        <CardHeader className="p-8 border-b border-white/5 bg-white/[0.01]">
          <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
            <Target className="w-6 h-6 text-success" />
            Operational Protocols
          </CardTitle>
          <CardDescription className="text-white/20 uppercase tracking-widest text-[9px] font-black">Live & scheduled remediation frameworks</CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {interventions.map((intervention) => (
              <div key={intervention.id} className="group p-6 rounded-2xl bg-white/[0.01] border border-white/5 hover:border-primary/40 transition-all relative overflow-hidden">
                {/* Background Spark */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-all"></div>

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-1">
                      <h4 className="text-lg font-black tracking-tighter uppercase group-hover:text-primary transition-colors">{intervention.title}</h4>
                      <div className="flex gap-2">
                        <span className={`text-[8px] font-black uppercase tracking-widest border px-2 py-0.5 rounded-md ${getStatusColor(intervention.status)}`}>
                          {intervention.status}
                        </span>
                        {getPriorityBadge(intervention.priority)}
                      </div>
                    </div>
                  </div>

                  <p className="text-white/20 text-[10px] font-bold uppercase tracking-tight mb-6 leading-relaxed line-clamp-2">{intervention.description}</p>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                      <p className="text-[8px] font-black text-white/10 uppercase tracking-widest mb-1">Impact Group</p>
                      <p className="text-xs font-bold text-white/60 capitalize">{intervention.targetGroup.replace('-', ' ')}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                      <p className="text-[8px] font-black text-white/10 uppercase tracking-widest mb-1">Efficiency Delta</p>
                      <p className={`text-xs font-black ${intervention.effectiveness > 80 ? 'text-success' :
                          intervention.effectiveness > 60 ? 'text-warning' :
                            'text-destructive'
                        }`}>{intervention.effectiveness}%</p>
                    </div>
                  </div>

                  {/* Progressive Meter */}
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                      <span className="text-white/20">Mission Progress</span>
                      <span className="text-white">{intervention.effectiveness}% Recovery</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/[0.03] rounded-full overflow-hidden p-[1px] border border-white/5">
                      <div
                        className={`h-full rounded-full transition-all duration-[2000ms] ${intervention.effectiveness > 80 ? 'bg-gradient-to-r from-success to-emerald-400' :
                            intervention.effectiveness > 60 ? 'bg-gradient-to-r from-warning to-orange-400' :
                              'bg-gradient-to-r from-destructive to-red-400'
                          }`}
                        style={{ width: `${intervention.effectiveness}%` }}
                      >
                        <div className="w-full h-full bg-white/20 animate-shimmer"></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 bg-white/[0.02] border-white/10 text-white/40 hover:text-white rounded-xl h-10 text-[9px] font-black uppercase tracking-widest transition-all">
                      Diagnostics
                    </Button>
                    <Button className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-xl h-10 text-[9px] font-black uppercase tracking-widest shadow-lg shadow-primary/10">
                      Sync
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Persistence Log */}
      <Card className="bg-card/40 backdrop-blur-3xl border-white/5 text-white overflow-hidden shadow-2xl pb-20">
        <CardHeader className="p-8 border-b border-white/5 bg-white/[0.01]">
          <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-warning" />
            Strategic Persistence Log
          </CardTitle>
          <CardDescription className="text-white/20 uppercase tracking-widest text-[9px] font-black">Real-time telemetry & network alerts</CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div key={notification.id} className="group flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all">
                <div className="flex items-center gap-5">
                  <div className={`p-4 rounded-xl ${notification.type === 'alert' ? 'bg-destructive/10 text-destructive' :
                      notification.type === 'success' ? 'bg-success/10 text-success' :
                        'bg-primary/10 text-primary'
                    } group-hover:scale-110 transition-transform`}>
                    {notification.type === 'alert' ? <AlertTriangle className="w-5 h-5" /> :
                      notification.type === 'success' ? <CheckCircle className="w-5 h-5" /> :
                        <Clock className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold tracking-tight text-white group-hover:text-primary transition-colors">{notification.message}</p>
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mt-1">
                      TELEMETRY SYNC: {new Date(notification.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <Button className="bg-white/[0.05] hover:bg-white/10 text-white/40 hover:text-white rounded-xl px-4 h-9 text-[9px] font-black uppercase tracking-widest transition-all">
                  Detail
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InterventionPanel;
