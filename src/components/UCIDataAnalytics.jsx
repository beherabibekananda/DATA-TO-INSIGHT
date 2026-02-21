
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, ScatterChart, Scatter, ZAxis, PieChart, Pie, Cell
} from 'recharts';
import {
    Wine, Heart, Home, Users, BookOpen, AlertTriangle,
    TrendingDown, Activity, Info
} from 'lucide-react';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

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

                // Filter those who have uci_data in metadata
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

    if (loading) return <div className="text-white text-center p-10">Analyzing Dataset Patterns...</div>;

    if (data.length === 0) {
        return (
            <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
                <CardContent className="p-12 text-center">
                    <Info className="w-16 h-16 mx-auto mb-4 text-blue-400" />
                    <h2 className="text-2xl font-bold mb-2">No UCI Data Found</h2>
                    <p className="text-gray-300 max-w-md mx-auto">
                        Please upload your "Maths.csv" or "Portuguese.csv" files through the Admin Upload panel First.
                        The system will automatically detect and process these files.
                    </p>
                </CardContent>
            </Card>
        );
    }

    // 1. Alcohol Consumption vs Grades
    const alcoholStats = [1, 2, 3, 4, 5].map(level => {
        const studentsAtLevel = data.filter(s => s.metadata.uci_data.alcohol_daily === level);
        const avgGPA = studentsAtLevel.length > 0
            ? studentsAtLevel.reduce((acc, curr) => acc + curr.gpa, 0) / studentsAtLevel.length
            : 0;
        return { level: `Lv ${level}`, avgGPA: parseFloat(avgGPA.toFixed(2)), count: studentsAtLevel.length };
    });

    // 2. Romantic Relationship vs GPA
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

    // 3. Health Status vs Attendance
    const healthData = [1, 2, 3, 4, 5].map(h => ({
        health: `H${h}`,
        attendance: (data.filter(s => s.metadata.uci_data.health === h).reduce((a, b) => a + b.attendance_rate, 0) / Math.max(1, data.filter(s => s.metadata.uci_data.health === h).length)).toFixed(1)
    }));

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Advanced Dataset Insights</h1>
                    <p className="text-gray-400">Deep behavioral analysis based on 33 feature student performance dataset</p>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-lg">
                    <span className="text-blue-400 font-bold">{data.length}</span>
                    <span className="text-gray-400 ml-2">UCI Records Active</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Alcohol Impact */}
                <Card className="bg-white/5 border-white/10 text-white lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Wine className="w-5 h-5 text-red-400" />
                            Alcohol Consumption vs. Academic Performance
                        </CardTitle>
                        <CardDescription>Correlation between daily alcohol intake and average GPA</CardDescription>
                    </CardHeader>
                    <CardContent height={300}>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={alcoholStats}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="level" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" domain={[0, 4]} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend />
                                <Bar dataKey="avgGPA" name="Average GPA" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Romantic Status */}
                <Card className="bg-white/5 border-white/10 text-white">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Heart className="w-5 h-5 text-pink-400" />
                            Social Life vs. Focus
                        </CardTitle>
                        <CardDescription>How relationships correlate with GPA</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={romanticData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {romanticData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 space-y-3">
                            {romanticGPA.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center p-2 bg-white/5 rounded-lg">
                                    <span className="text-gray-300">{item.name}</span>
                                    <span className="text-blue-400 font-bold">{item.gpa} GPA</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Health vs Attendance */}
                <Card className="bg-white/5 border-white/10 text-white lg:col-span-3">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="w-5 h-5 text-green-400" />
                            Health & Attendance Matrix
                        </CardTitle>
                        <CardDescription>Impact of physical well-being (1:Very Poor to 5:Excellent) on class presence</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={healthData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="health" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" domain={[0, 100]} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                                />
                                <Line type="monotone" dataKey="attendance" name="Attendance %" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-yellow-500 shrink-0" />
                <div>
                    <h4 className="text-yellow-500 font-bold font-sm">Data Interpretation Warning</h4>
                    <p className="text-gray-400 text-xs">
                        These correlations are based on the uploaded secondary education dataset.
                        Variables like "Alcohol" and "Romantic Status" are self-reported and should be used
                        for sociological research and trend identification rather than individual judgment.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UCIDataAnalytics;
