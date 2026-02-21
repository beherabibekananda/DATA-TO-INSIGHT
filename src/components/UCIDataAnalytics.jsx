
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
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Analyzing Dataset...</p>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <Card className="bg-card backdrop-blur-3xl border-border text-foreground overflow-hidden shadow-2xl">
                <CardContent className="p-20 text-center flex flex-col items-center">
                    <div className="w-20 h-20 bg-muted border border-border rounded-3xl flex items-center justify-center mb-8">
                        <Database className="w-10 h-10 text-muted-foreground/20" />
                    </div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter mb-4">No UCI Data Available</h2>
                    <p className="text-muted-foreground uppercase tracking-widest text-[10px] font-black max-w-md leading-loose">
                        Please upload a Math or Language dataset via the Admin dashboard. The analytics engine requires this data for behavioral analysis.
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
        return { level: `Level ${level}`, avgGPA: parseFloat(avgGPA.toFixed(2)), count: studentsAtLevel.length };
    });

    const romanticData = [
        { name: 'In Relationship', value: data.filter(s => s.metadata.uci_data.romantic === 'yes').length },
        { name: 'Single', value: data.filter(s => s.metadata.uci_data.romantic === 'no').length }
    ];

    const romanticGPA = [
        {
            name: 'In Relationship',
            gpa: (data.filter(s => s.metadata.uci_data.romantic === 'yes').reduce((a, b) => a + b.gpa, 0) / Math.max(1, data.filter(s => s.metadata.uci_data.romantic === 'yes').length)).toFixed(2)
        },
        {
            name: 'Single',
            gpa: (data.filter(s => s.metadata.uci_data.romantic === 'no').reduce((a, b) => a + b.gpa, 0) / Math.max(1, data.filter(s => s.metadata.uci_data.romantic === 'no').length)).toFixed(2)
        }
    ];

    const healthData = [1, 2, 3, 4, 5].map(h => ({
        health: `Level ${h}`,
        presence: (data.filter(s => s.metadata.uci_data.health === h).reduce((a, b) => a + b.attendance_rate, 0) / Math.max(1, data.filter(s => s.metadata.uci_data.health === h).length)).toFixed(1)
    }));

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
                        <Database className="w-3.5 h-3.5 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">Student behavior Analysis</span>
                    </div>
                    <h1 className="text-5xl font-black text-foreground tracking-tighter uppercase leading-none">UCI Insights</h1>
                    <p className="text-muted-foreground uppercase tracking-[0.2em] text-[10px] font-black mt-3">Statistical correlation between behavioral factors and academic performance</p>
                </div>
                <div className="flex items-center gap-4 bg-muted border border-border px-6 py-4 rounded-3xl shadow-sm">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></div>
                    <span className="text-2xl font-black tracking-tighter text-foreground">{data.length}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Records Analyzed</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Lifestyle Impact */}
                <Card className="bg-card backdrop-blur-3xl border-border text-foreground overflow-hidden shadow-2xl lg:col-span-2">
                    <CardHeader className="p-8 border-b border-border bg-muted/30">
                        <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                            <Wine className="w-6 h-6 text-primary" />
                            Lifestyle vs Performance
                        </CardTitle>
                        <CardDescription className="text-muted-foreground uppercase tracking-widest text-[9px] font-black">Daily alcohol consumption level vs average Student GPA</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="h-[320px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={alcoholStats}>
                                    <defs>
                                        <linearGradient id="alcoholBar" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                                            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                                    <XAxis dataKey="level" stroke="rgba(0,0,0,0.3)" fontSize={11} fontWeight="black" axisLine={false} tickLine={false} />
                                    <YAxis stroke="rgba(0,0,0,0.3)" fontSize={11} fontWeight="black" axisLine={false} tickLine={false} domain={[0, 4]} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'white', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '12px', fontSize: '12px', fontWeight: 'black', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                        cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                                    />
                                    <Bar dataKey="avgGPA" name="Average GPA" fill="url(#alcoholBar)" radius={[6, 6, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Relationship Status */}
                <Card className="bg-card backdrop-blur-3xl border-border text-foreground overflow-hidden shadow-2xl">
                    <CardHeader className="p-8 border-b border-border bg-muted/30">
                        <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                            <Heart className="w-6 h-6 text-destructive" />
                            Relationship Status
                        </CardTitle>
                        <CardDescription className="text-muted-foreground uppercase tracking-widest text-[9px] font-black">Relationship status vs academic performance</CardDescription>
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
                                        <Cell fill="hsl(var(--destructive))" opacity={0.8} />
                                        <Cell fill="hsl(var(--muted))" />
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'white', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '12px', fontSize: '12px', fontWeight: 'black', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="space-y-3">
                            {romanticGPA.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center p-4 bg-muted border border-border rounded-2xl group hover:border-destructive/30 transition-all shadow-sm">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{item.name}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-black tracking-tighter text-foreground">{item.gpa}</span>
                                        <span className="text-[9px] font-bold text-muted-foreground/40 text-xs uppercase">GPA</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Health & Attendance */}
                <Card className="bg-card backdrop-blur-3xl border-border text-foreground overflow-hidden shadow-2xl lg:col-span-3">
                    <CardHeader className="p-8 border-b border-border bg-muted/30">
                        <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                            <Activity className="w-6 h-6 text-success" />
                            Health & Attendance
                        </CardTitle>
                        <CardDescription className="text-muted-foreground uppercase tracking-widest text-[9px] font-black">Impact of student health level (Poor to Excellent) on class attendance</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={healthData}>
                                    <defs>
                                        <linearGradient id="presenceArea" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                                            <stop offset="90%" stopColor="hsl(var(--success))" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                                    <XAxis dataKey="health" stroke="rgba(0,0,0,0.3)" fontSize={10} fontWeight="black" axisLine={false} tickLine={false} />
                                    <YAxis stroke="rgba(0,0,0,0.3)" fontSize={10} fontWeight="black" axisLine={false} tickLine={false} domain={[0, 100]} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'white', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '12px', fontSize: '12px', fontWeight: 'black', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="presence"
                                        name="Attendance Rate"
                                        stroke="hsl(var(--success))"
                                        strokeWidth={4}
                                        fill="url(#presenceArea)"
                                        dot={{ r: 5, fill: 'hsl(var(--success))', strokeWidth: 0 }}
                                        activeDot={{ r: 8, fill: 'hsl(var(--success))', stroke: 'rgba(0,0,0,0.1)', strokeWidth: 6 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Note */}
            <div className="bg-warning/5 border border-warning/20 p-6 rounded-3xl flex items-start gap-5 backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-warning/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10 p-3 rounded-2xl bg-warning/10">
                    <AlertTriangle className="w-6 h-6 text-warning" />
                </div>
                <div className="relative z-10">
                    <h4 className="text-warning font-black uppercase tracking-widest text-xs mb-1">Data Interpretation Note</h4>
                    <p className="text-muted-foreground text-[10px] uppercase font-black tracking-wider leading-relaxed max-w-3xl">
                        These insights are generated from student educational datasets.
                        Factors such as relationship status are subjectively reported and should be used to identify general trends and patterns rather than for individual assessment.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UCIDataAnalytics;
