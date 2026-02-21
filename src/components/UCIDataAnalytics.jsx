
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
    Wine, Heart, Home, Users, BookOpen, AlertTriangle,
    TrendingDown, Activity, Info, Brain, Fingerprint, Database, Zap
} from 'lucide-react';

const COLORS = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#7c3aed'];

const UCIDataAnalytics = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: students, error } = await supabase
                    .from('students')
                    .select('*')
                    .not('metadata', 'is', null);

                if (error) throw error;

                const uciStudents = students.filter(s => s.metadata?.uci_data);
                setData(uciStudents);
            } catch (err) {
                console.error('Error fetching UCI data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin"></div>
                    <Brain className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Synthesizing Dataset Patterns</p>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <Card className="bg-card/40 backdrop-blur-3xl border-white/5 text-white overflow-hidden shadow-2xl">
                <CardContent className="p-20 text-center flex flex-col items-center">
                    <div className="w-20 h-20 bg-white/[0.02] border border-white/5 rounded-3xl flex items-center justify-center mb-8">
                        <Database className="w-10 h-10 text-white/20" />
                    </div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter mb-4">No Neural Data Detected</h2>
                    <p className="text-white/20 uppercase tracking-widest text-[10px] font-black max-w-md leading-loose">
                        Please upload "Maths.csv" or "Portuguese.csv" via the administrative console. The heuristic engine requires these data-points for deep behavioral analysis.
                    </p>
                </CardContent>
            </Card>
        );
    }

    // Calculations
    const alcoholStats = [1, 2, 3, 4, 5].map(level => {
        const studentsAtLevel = data.filter(s => s.metadata.uci_data.alcohol_daily === level);
        const avgGPA = studentsAtLevel.length > 0
            ? studentsAtLevel.reduce((acc, curr) => acc + curr.gpa, 0) / studentsAtLevel.length
            : 0;
        return { level: `LV ${level}`, avgGPA: parseFloat(avgGPA.toFixed(2)), count: studentsAtLevel.length };
    });

    const romanticData = [
        { name: 'Social Linked', value: data.filter(s => s.metadata.uci_data.romantic === 'yes').length },
        { name: 'Independent', value: data.filter(s => s.metadata.uci_data.romantic === 'no').length }
    ];

    const romanticGPA = [
        {
            name: 'Linked',
            gpa: (data.filter(s => s.metadata.uci_data.romantic === 'yes').reduce((a, b) => a + b.gpa, 0) / Math.max(1, data.filter(s => s.metadata.uci_data.romantic === 'yes').length)).toFixed(2)
        },
        {
            name: 'Independent',
            gpa: (data.filter(s => s.metadata.uci_data.romantic === 'no').reduce((a, b) => a + b.gpa, 0) / Math.max(1, data.filter(s => s.metadata.uci_data.romantic === 'no').length)).toFixed(2)
        }
    ];

    const healthData = [1, 2, 3, 4, 5].map(h => ({
        health: `H${h}`,
        presence: (data.filter(s => s.metadata.uci_data.health === h).reduce((a, b) => a + b.attendance_rate, 0) / Math.max(1, data.filter(s => s.metadata.uci_data.health === h).length)).toFixed(1)
    }));

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 mb-4">
                        <Fingerprint className="w-3.5 h-3.5 text-secondary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-secondary">Behavioral Intelligence</span>
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Deep Dataset Insights</h1>
                    <p className="text-white/20 uppercase tracking-[0.2em] text-[10px] font-black mt-1">Sociological analysis from 33-feature performative datasets</p>
                </div>
                <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 px-6 py-3 rounded-2xl shadow-xl">
                    <div className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse"></div>
                    <span className="text-xl font-black tracking-tighter text-white">{data.length}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Active Neural Records</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Alcohol Consumption Impact */}
                <Card className="bg-card/40 backdrop-blur-3xl border-white/5 text-white overflow-hidden shadow-2xl lg:col-span-2">
                    <CardHeader className="p-8 border-b border-white/5 bg-white/[0.01]">
                        <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                            <Wine className="w-6 h-6 text-destructive" />
                            Behavioral Variable Analysis
                        </CardTitle>
                        <CardDescription className="text-white/20 uppercase tracking-widest text-[9px] font-black">Correlation: Daily alcohol intake vs. Performative GPA</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="h-[320px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={alcoholStats}>
                                    <defs>
                                        <linearGradient id="alcoholBar" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
                                            <stop offset="100%" stopColor="#ef4444" stopOpacity={0.2} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                    <XAxis dataKey="level" stroke="rgba(255,255,255,0.2)" fontSize={11} fontWeight="black" axisLine={false} tickLine={false} />
                                    <YAxis stroke="rgba(255,255,255,0.2)" fontSize={11} fontWeight="black" axisLine={false} tickLine={false} domain={[0, 4]} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0c0d12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                        cursor={{ fill: 'rgba(255,255,255,0.01)' }}
                                    />
                                    <Bar dataKey="avgGPA" name="Mean GPA" fill="url(#alcoholBar)" radius={[6, 6, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Social Linked Status */}
                <Card className="bg-card/40 backdrop-blur-3xl border-white/5 text-white overflow-hidden shadow-2xl">
                    <CardHeader className="p-8 border-b border-white/5 bg-white/[0.01]">
                        <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                            <Heart className="w-6 h-6 text-pink-500" />
                            Social Integration
                        </CardTitle>
                        <CardDescription className="text-white/20 uppercase tracking-widest text-[9px] font-black">Interpersonal status vs Operational focus</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="h-[200px] mb-8">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={romanticData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={65}
                                        outerRadius={90}
                                        paddingAngle={10}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        <Cell fill="#ec4899" opacity={0.8} />
                                        <Cell fill="rgba(255,255,255,0.05)" />
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0c0d12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="space-y-3">
                            {romanticGPA.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center p-4 bg-white/[0.02] border border-white/5 rounded-2xl group hover:border-pink-500/30 transition-all">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{item.name}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-black tracking-tighter">{item.gpa}</span>
                                        <span className="text-[9px] font-bold text-white/20">GPA</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Biological Integrity Matrix */}
                <Card className="bg-card/40 backdrop-blur-3xl border-white/5 text-white overflow-hidden shadow-2xl lg:col-span-3">
                    <CardHeader className="p-8 border-b border-white/5 bg-white/[0.01]">
                        <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                            <Activity className="w-6 h-6 text-success" />
                            Biological Resilience Grid
                        </CardTitle>
                        <CardDescription className="text-white/20 uppercase tracking-widest text-[9px] font-black">Impact of physiological integrity (H1:Low → H5:High) on classpresence density</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={healthData}>
                                    <defs>
                                        <linearGradient id="presenceArea" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="90%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                                    <XAxis dataKey="health" stroke="rgba(255,255,255,0.2)" fontSize={10} fontWeight="black" axisLine={false} tickLine={false} />
                                    <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} fontWeight="black" axisLine={false} tickLine={false} domain={[0, 100]} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0c0d12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="presence"
                                        name="Presence Density"
                                        stroke="#10b981"
                                        strokeWidth={4}
                                        fill="url(#presenceArea)"
                                        dot={{ r: 5, fill: '#10b981', strokeWidth: 0 }}
                                        activeDot={{ r: 8, fill: '#10b981', stroke: 'rgba(255,255,255,0.2)', strokeWidth: 6 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Heuristic Notice */}
            <div className="bg-warning/5 border border-warning/20 p-6 rounded-3xl flex items-start gap-5 backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-warning/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10 p-3 rounded-2xl bg-warning/10">
                    <AlertTriangle className="w-6 h-6 text-warning" />
                </div>
                <div className="relative z-10">
                    <h4 className="text-warning font-black uppercase tracking-widest text-xs mb-1">Theoretical Interpretation Notice</h4>
                    <p className="text-white/30 text-[10px] uppercase font-black tracking-wider leading-relaxed max-w-3xl">
                        These heuristics are synthesized from uploaded secondary educational datasets.
                        Variables such as "Social Exposure" and "Social Link Proxy" are subjectively reported and should be utilized for trend-forecasting and sociological profiling rather than individual node assessment.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UCIDataAnalytics;
