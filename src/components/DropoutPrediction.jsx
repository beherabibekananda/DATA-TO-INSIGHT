
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { sampleStudents } from "@/data/sampleStudents";
import { predictiveAPI } from '../api/predictiveAPI';
import {
    Search, AlertTriangle, TrendingUp, TrendingDown, Shield, Target,
    User, BookOpen, Clock, Activity, ChevronRight, Zap, Brain, CheckCircle2, XCircle,
    FileText, PenLine, GraduationCap, Percent, BarChart3, Fingerprint, Database, Sparkles
} from 'lucide-react';
import {
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
    ResponsiveContainer
} from 'recharts';

const DEPARTMENTS = [
    'Computer Science', 'Electrical Engineering', 'Mechanical Engineering',
    'Civil Engineering', 'Electronics', 'Information Technology',
    'Chemical Engineering', 'Biotechnology', 'Mathematics', 'Physics', 'Other'
];

const DropoutPrediction = () => {
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [predicting, setPredicting] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [mode, setMode] = useState('manual'); // 'search' or 'manual'

    const [formData, setFormData] = useState({
        name: '',
        studentId: '',
        department: 'Computer Science',
        year: '1',
        gpa: '',
        attendance: '',
        engagement: '',
    });
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const { data, error } = await supabase.from('students').select('*');
                if (error) throw error;
                setStudents((data && data.length > 0) ? data : sampleStudents);
            } catch {
                setStudents(sampleStudents);
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, []);

    const filteredStudents = searchTerm.length >= 1
        ? students.filter(s =>
            s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.department?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : [];

    const generatePrediction = (studentData) => {
        const gpa = parseFloat(studentData.gpa) || 0;
        const attendance = parseFloat(studentData.attendance) || 0;
        const engagement = parseFloat(studentData.engagement) || 0;
        const year = parseInt(studentData.year) || 1;

        const gpaScore = Math.min(gpa / 4.0, 1.0);
        const attendanceScore = attendance / 100;
        const engagementScore = engagement / 100;
        const yearScore = Math.max(0, 1 - (year - 1) * 0.2);
        const overallScore = 1 - (gpaScore * 0.4 + attendanceScore * 0.3 + engagementScore * 0.2 + yearScore * 0.1);

        const riskLevel = overallScore > 0.6 ? 'high' : overallScore > 0.35 ? 'medium' : 'low';

        const factors = [
            { name: 'Operational GPA', weight: 0.4, score: gpaScore, impact: gpaScore >= 0.7 ? 'positive' : 'negative', actual: gpa.toFixed(2) },
            { name: 'Attendance Density', weight: 0.3, score: attendanceScore, impact: attendanceScore >= 0.75 ? 'positive' : 'negative', actual: `${attendance}%` },
            { name: 'Synergy Coeff', weight: 0.2, score: engagementScore, impact: engagementScore >= 0.6 ? 'positive' : 'negative', actual: `${engagement}/100` },
            { name: 'Academic Cycle', weight: 0.1, score: yearScore, impact: year <= 2 ? 'positive' : 'neutral', actual: `Cycle ${year}` }
        ];

        const recommendations = [];
        if (attendanceScore < 0.75) recommendations.push({ priority: 'high', action: 'Attendance Sync', description: `Presence density is critical. Initiate mandatory session tracking protocols.`, expectedImpact: 0.25 });
        if (gpaScore < 0.6) recommendations.push({ priority: 'high', action: 'Heuristic Support', description: `Node GPA deviation detected. Assign academic remediation and tutoring.`, expectedImpact: 0.35 });

        if (recommendations.length === 0) {
            recommendations.push({ priority: 'low', action: 'Nominal Maintenance', description: 'Subject performance is within stable parameters. Continue current observation.', expectedImpact: 0 });
        }

        return {
            studentName: studentData.name || 'Manual Probe',
            department: studentData.department,
            year: year,
            overallRisk: {
                score: +overallScore.toFixed(3),
                level: riskLevel,
                confidence: 0.85,
                factors
            },
            recommendations
        };
    };

    const handleManualSubmit = () => {
        if (!formData.name.trim()) return;
        setPredicting(true);
        setShowResults(false);

        const predictionResult = generatePrediction(formData);
        setPrediction(predictionResult);

        setTimeout(() => {
            setPredicting(false);
            setShowResults(true);
        }, 1800);
    };

    const handleSelectStudent = (student) => {
        setSearchTerm(student.name);
        setPredicting(true);
        setShowResults(false);

        const pred = generatePrediction({
            name: student.name,
            department: student.department,
            year: student.year,
            gpa: student.gpa,
            attendance: student.attendance_rate,
            engagement: student.engagement_score
        });
        setPrediction(pred);

        setTimeout(() => {
            setPredicting(false);
            setShowResults(true);
        }, 1500);
    };

    const resetAll = () => {
        setSelectedStudent(null);
        setPrediction(null);
        setShowResults(false);
        setSearchTerm('');
    };

    const getRiskColors = (level) => {
        switch (level) {
            case 'high': return 'text-destructive border-destructive/20 bg-destructive/5';
            case 'medium': return 'text-warning border-warning/20 bg-warning/5';
            case 'low': return 'text-success border-success/20 bg-success/5';
            default: return 'text-white/40 border-white/5 bg-white/5';
        }
    };

    const radarData = prediction?.overallRisk?.factors?.map(f => ({
        factor: f.name.split(' ')[0],
        score: Math.round(f.score * 100),
    })) || [];

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
                    <Target className="w-3.5 h-3.5 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">Precision Diagnostics</span>
                </div>
                <h1 className="text-5xl font-black text-white tracking-tighter uppercase mb-4">Dropout Prediction Terminal</h1>
                <p className="text-white/20 uppercase tracking-[0.2em] text-[10px] font-black mt-1">High-fidelity heuristic analysis of academic persistence markers</p>
            </div>

            {/* Mode Controls */}
            <div className="flex justify-center">
                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-1 flex gap-2">
                    <button
                        onClick={() => { setMode('manual'); resetAll(); }}
                        className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'manual' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                    >
                        Manual Probe
                    </button>
                    <button
                        onClick={() => { setMode('search'); resetAll(); }}
                        className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'search' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                    >
                        Network Scan
                    </button>
                </div>
            </div>

            {/* Manual Entry */}
            {mode === 'manual' && !showResults && !predicting && (
                <Card className="bg-card/40 backdrop-blur-3xl border-white/5 text-white overflow-hidden shadow-2xl max-w-4xl mx-auto">
                    <CardHeader className="p-8 border-b border-white/5 bg-white/[0.01]">
                        <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
                            <PenLine className="w-6 h-6 text-primary" />
                            Diagnostic Input
                        </CardTitle>
                        <CardDescription className="text-white/20 uppercase tracking-widest text-[9px] font-black">Define operational parameters for neural synthesis</CardDescription>
                    </CardHeader>
                    <CardContent className="p-10 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Subject Designation</Label>
                                <Input
                                    placeholder="Enter full identity string"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="bg-white/[0.03] border-white/10 h-14 rounded-2xl focus:ring-1 focus:ring-primary/40 placeholder:text-white/10"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Sector Assignment</Label>
                                <select
                                    value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl h-14 px-4 text-xs text-white uppercase font-black outline-none focus:ring-1 focus:ring-primary/40 appearance-none"
                                >
                                    {DEPARTMENTS.map(dept => (
                                        <option key={dept} value={dept} className="bg-[#0c0d12]">{dept}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Merit Index (0.0 - 4.0)</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="GPA"
                                    value={formData.gpa}
                                    onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                                    className="bg-white/[0.03] border-white/10 h-14 rounded-2xl focus:ring-1 focus:ring-primary/40 text-lg font-mono"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Presence Density (%)</Label>
                                <Input
                                    type="number"
                                    placeholder="Attendance Rate"
                                    value={formData.attendance}
                                    onChange={(e) => setFormData({ ...formData, attendance: e.target.value })}
                                    className="bg-white/[0.03] border-white/10 h-14 rounded-2xl focus:ring-1 focus:ring-primary/40 text-lg font-mono"
                                />
                            </div>
                        </div>

                        <Button
                            onClick={handleManualSubmit}
                            disabled={!formData.name}
                            className="w-full h-16 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-primary/20 transition-all hover:scale-[1.01] active:scale-98"
                        >
                            <Brain className="w-5 h-5 mr-3" />
                            Initiate Heuristic Probe
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Network Scan */}
            {mode === 'search' && !showResults && !predicting && (
                <div className="max-w-2xl mx-auto space-y-6">
                    <div className="relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-white/10 group-hover:text-primary transition-colors" />
                        <Input
                            placeholder="Search network nodes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white/[0.03] border-white/10 h-20 rounded-3xl pl-16 text-xl placeholder:text-white/5 focus:ring-1 focus:ring-primary/40"
                        />
                    </div>

                    <div className="space-y-3">
                        {filteredStudents.slice(0, 5).map(student => (
                            <button
                                key={student.id}
                                onClick={() => handleSelectStudent(student)}
                                className="w-full p-6 rounded-3xl bg-white/[0.01] border border-white/5 hover:border-primary/40 hover:bg-white/[0.04] transition-all flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-4 text-left">
                                    <div className="w-12 h-12 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-center text-primary font-black">
                                        {student.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-lg font-black text-white/80 group-hover:text-white transition-colors uppercase tracking-tight">{student.name}</p>
                                        <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">{student.student_id} • {student.department}</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-white/10 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Results */}
            {showResults && prediction && (
                <div className="space-y-10 animate-in slide-in-from-bottom-10 duration-700 max-w-6xl mx-auto">
                    <Card className={`bg-card/40 backdrop-blur-3xl border-2 ${getRiskColors(prediction.overallRisk.level).split(' ')[1]} overflow-hidden shadow-2xl relative`}>
                        <div className="absolute top-0 right-0 p-10 opacity-5">
                            <Shield className="w-64 h-64 text-white" />
                        </div>
                        <CardContent className="p-12 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-5xl font-black text-white tracking-tighter uppercase">{prediction.studentName}</h2>
                                        <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                                    </div>
                                    <p className="text-white/20 uppercase tracking-[0.2em] text-xs font-black">{prediction.department} • CYCLE {prediction.year}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 flex flex-col gap-1">
                                        <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Risk Index</span>
                                        <span className={`text-4xl font-black ${getRiskColors(prediction.overallRisk.level).split(' ')[0]}`}>{Math.round(prediction.overallRisk.score * 100)}%</span>
                                    </div>
                                    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 flex flex-col gap-1">
                                        <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Inference State</span>
                                        <span className={`text-4xl font-black uppercase tracking-tighter ${getRiskColors(prediction.overallRisk.level).split(' ')[0]}`}>{prediction.overallRisk.level}</span>
                                    </div>
                                </div>

                                <Button onClick={resetAll} variant="outline" className="bg-white/[0.02] border-white/5 text-white/40 hover:text-white rounded-xl h-12 px-8 text-[10px] font-black uppercase tracking-widest transition-all">
                                    Reset Diagnostic Terminal
                                </Button>
                            </div>

                            <div className="flex justify-center">
                                <div className="h-[320px] w-full max-w-[400px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart data={radarData}>
                                            <PolarGrid stroke="rgba(255,255,255,0.05)" />
                                            <PolarAngleAxis
                                                dataKey="factor"
                                                tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)', fontWeight: 'black', letterSpacing: '0.1em' }}
                                            />
                                            <Radar
                                                name="Impact"
                                                dataKey="score"
                                                stroke="#8b5cf6"
                                                fill="#8b5cf6"
                                                fillOpacity={0.1}
                                                strokeWidth={3}
                                            />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {prediction.recommendations.map((rec, i) => (
                            <Card key={i} className="bg-card/40 backdrop-blur-3xl border-white/5 overflow-hidden group hover:border-primary/40 transition-all">
                                <CardContent className="p-8 flex gap-6">
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border transition-all group-hover:scale-110 ${rec.priority === 'high' ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                                        {rec.priority === 'high' ? <AlertTriangle className="w-8 h-8" /> : <Shield className="w-8 h-8" />}
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <h4 className="text-xl font-black text-white tracking-tighter uppercase">{rec.action}</h4>
                                            <Badge className="bg-white/5 text-white/40 border-white/10 text-[8px] font-black uppercase tracking-widest">{rec.priority} Priority</Badge>
                                        </div>
                                        <p className="text-white/40 text-xs font-bold leading-relaxed tracking-tight uppercase">{rec.description}</p>
                                        {rec.expectedImpact > 0 && (
                                            <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-[9px] font-black text-primary uppercase tracking-widest">
                                                <Zap className="w-3 h-3" />
                                                Efficiency Delta: +{Math.round(rec.expectedImpact * 100)}%
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Animation */}
            {predicting && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#02040a]/90 backdrop-blur-xl transition-all duration-700">
                    <div className="text-center space-y-8">
                        <div className="w-24 h-24 border-2 border-primary/10 border-t-primary rounded-full animate-spin mx-auto flex items-center justify-center">
                            <Brain className="w-12 h-12 text-primary animate-pulse" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-white tracking-widest uppercase">Initializing Neural Synthesis</h3>
                            <p className="text-white/20 text-[10px] font-black tracking-[0.4em] uppercase">Analyzing primary risk vectors</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DropoutPrediction;
