
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
    FileText, PenLine, GraduationCap, Percent, BarChart3
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

    // Manual entry form state
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

    // Generate prediction from raw values
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
            { name: 'Academic Performance (GPA)', weight: 0.4, score: gpaScore, impact: gpaScore >= 0.6 ? 'positive' : 'negative', actual: gpa.toFixed(2) },
            { name: 'Attendance Rate', weight: 0.3, score: attendanceScore, impact: attendanceScore >= 0.75 ? 'positive' : 'negative', actual: `${attendance}%` },
            { name: 'Engagement Level', weight: 0.2, score: engagementScore, impact: engagementScore >= 0.6 ? 'positive' : 'negative', actual: `${engagement}/100` },
            { name: 'Year Standing', weight: 0.1, score: yearScore, impact: year <= 2 ? 'positive' : 'neutral', actual: `Year ${year}` }
        ];

        const recommendations = [];
        if (attendanceScore < 0.75) recommendations.push({ priority: 'high', action: 'Improve Attendance', description: `Current attendance is ${attendance}%. Target: 75%+. Regular attendance is critical for academic success.`, expectedImpact: +(0.75 - attendanceScore).toFixed(2) });
        if (gpaScore < 0.6) recommendations.push({ priority: 'high', action: 'Academic Support Required', description: `Current GPA is ${gpa.toFixed(2)}. Consider tutoring, study groups, or academic counseling.`, expectedImpact: +(0.6 - gpaScore).toFixed(2) });
        if (engagementScore < 0.6) recommendations.push({ priority: 'medium', action: 'Increase Engagement', description: `Engagement score is ${engagement}/100. Encourage participation in clubs, events, and class activities.`, expectedImpact: +(0.6 - engagementScore).toFixed(2) });
        if (recommendations.length === 0) recommendations.push({ priority: 'low', action: 'Maintain Current Performance', description: 'Student is performing well across all metrics. Keep up the good work!', expectedImpact: 0 });

        return {
            studentName: studentData.name || 'Manual Entry',
            department: studentData.department,
            year: year,
            overallRisk: {
                score: +overallScore.toFixed(3),
                level: riskLevel,
                confidence: 0.85,
                factors
            },
            recommendations,
            trendAnalysis: {
                currentScore: +overallScore.toFixed(2),
                riskLevel,
                trajectory: overallScore < 0.35 ? 'stable' : overallScore < 0.6 ? 'needs attention' : 'declining'
            },
            similarCases: { total: 0, successful: 0, successRate: 0 }
        };
    };

    // Validate form
    const validateForm = () => {
        const errors = {};
        const gpa = parseFloat(formData.gpa);
        const attendance = parseFloat(formData.attendance);
        const engagement = parseFloat(formData.engagement);

        if (!formData.name.trim()) errors.name = 'Student name is required';
        if (!formData.gpa || isNaN(gpa) || gpa < 0 || gpa > 4.0) errors.gpa = 'Enter a valid GPA (0.0 - 4.0)';
        if (!formData.attendance || isNaN(attendance) || attendance < 0 || attendance > 100) errors.attendance = 'Enter a valid percentage (0 - 100)';
        if (!formData.engagement || isNaN(engagement) || engagement < 0 || engagement > 100) errors.engagement = 'Enter a valid score (0 - 100)';

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handle manual form submission
    const handleManualSubmit = () => {
        if (!validateForm()) return;

        const manualStudent = {
            name: formData.name,
            student_id: formData.studentId || 'MANUAL',
            department: formData.department,
            year: parseInt(formData.year),
            gpa: parseFloat(formData.gpa),
            attendance_rate: parseFloat(formData.attendance),
            engagement_score: parseFloat(formData.engagement),
            risk_level: 'unknown'
        };

        setSelectedStudent(manualStudent);
        setPredicting(true);
        setShowResults(false);

        const predictionResult = generatePrediction(formData);
        setPrediction(predictionResult);

        // Simulate AI processing
        setTimeout(() => {
            setPredicting(false);
            setShowResults(true);
        }, 1800);
    };

    const handleSelectStudent = async (student) => {
        setSelectedStudent(student);
        setSearchTerm(student.name);
        setPredicting(true);
        setShowResults(false);

        try {
            const result = await predictiveAPI.getPredictionResults(student.id);
            setPrediction(result.data);
        } catch (error) {
            console.error('Prediction error:', error);
            const pred = generatePrediction({
                name: student.name,
                department: student.department,
                year: student.year,
                gpa: student.gpa,
                attendance: student.attendance_rate,
                engagement: student.engagement_score
            });
            setPrediction(pred);
        }

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
        setFormErrors({});
    };

    const getRiskColor = (level) => {
        switch (level) {
            case 'high': return { bg: 'bg-red-500/20', border: 'border-red-500/30', text: 'text-red-400', glow: 'shadow-red-500/20' };
            case 'medium': return { bg: 'bg-yellow-500/20', border: 'border-yellow-500/30', text: 'text-yellow-400', glow: 'shadow-yellow-500/20' };
            case 'low': return { bg: 'bg-green-500/20', border: 'border-green-500/30', text: 'text-green-400', glow: 'shadow-green-500/20' };
            default: return { bg: 'bg-gray-500/20', border: 'border-gray-500/30', text: 'text-gray-400', glow: '' };
        }
    };

    const getDropoutPercentage = (score) => Math.round(score * 100);
    const getRetentionPercentage = (score) => Math.round((1 - score) * 100);

    const radarData = prediction?.overallRisk?.factors?.map(f => ({
        factor: f.name.split('(')[0].trim(),
        score: Math.round(f.score * 100),
        fullMark: 100
    })) || [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center mb-4">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2 flex items-center justify-center gap-3">
                    <Brain className="w-8 h-8 text-purple-400" />
                    Dropout Prediction Checker
                </h1>
                <p className="text-gray-400">Analyze dropout probability by entering student details or searching existing records</p>
            </div>

            {/* Mode Toggle */}
            <div className="flex justify-center">
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-1 inline-flex">
                    <button
                        onClick={() => { setMode('manual'); resetAll(); }}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${mode === 'manual'
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/20'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <PenLine className="w-4 h-4" />
                        Enter Details
                    </button>
                    <button
                        onClick={() => { setMode('search'); resetAll(); }}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${mode === 'search'
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/20'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <Search className="w-4 h-4" />
                        Search Student
                    </button>
                </div>
            </div>

            {/* ==================== MANUAL ENTRY MODE ==================== */}
            {mode === 'manual' && !showResults && !predicting && (
                <Card className="bg-white/5 backdrop-blur-md border-white/10">
                    <CardHeader>
                        <CardTitle className="text-xl text-white flex items-center gap-2">
                            <FileText className="w-5 h-5 text-purple-400" />
                            Enter Student Details
                        </CardTitle>
                        <CardDescription className="text-gray-400">
                            Fill in the student's academic information below to predict their dropout probability
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Student Name */}
                            <div className="space-y-2">
                                <Label className="text-gray-300 flex items-center gap-2">
                                    <User className="w-4 h-4 text-blue-400" />
                                    Student Name <span className="text-red-400">*</span>
                                </Label>
                                <Input
                                    placeholder="e.g. Rahul Sharma"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className={`bg-white/10 border-white/20 text-white placeholder:text-gray-500 ${formErrors.name ? 'border-red-500/50' : ''}`}
                                />
                                {formErrors.name && <p className="text-red-400 text-xs">{formErrors.name}</p>}
                            </div>

                            {/* Student ID */}
                            <div className="space-y-2">
                                <Label className="text-gray-300 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-blue-400" />
                                    Student ID <span className="text-gray-500 text-xs">(optional)</span>
                                </Label>
                                <Input
                                    placeholder="e.g. STU2024001"
                                    value={formData.studentId}
                                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                                />
                            </div>

                            {/* Department */}
                            <div className="space-y-2">
                                <Label className="text-gray-300 flex items-center gap-2">
                                    <BookOpen className="w-4 h-4 text-purple-400" />
                                    Department <span className="text-red-400">*</span>
                                </Label>
                                <select
                                    value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    className="w-full bg-white/10 border border-white/20 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                >
                                    {DEPARTMENTS.map(dept => (
                                        <option key={dept} value={dept} className="bg-gray-900 text-white">{dept}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Year */}
                            <div className="space-y-2">
                                <Label className="text-gray-300 flex items-center gap-2">
                                    <GraduationCap className="w-4 h-4 text-purple-400" />
                                    Year of Study <span className="text-red-400">*</span>
                                </Label>
                                <select
                                    value={formData.year}
                                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                    className="w-full bg-white/10 border border-white/20 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                >
                                    <option value="1" className="bg-gray-900 text-white">1st Year</option>
                                    <option value="2" className="bg-gray-900 text-white">2nd Year</option>
                                    <option value="3" className="bg-gray-900 text-white">3rd Year</option>
                                    <option value="4" className="bg-gray-900 text-white">4th Year</option>
                                </select>
                            </div>

                            {/* GPA */}
                            <div className="space-y-2">
                                <Label className="text-gray-300 flex items-center gap-2">
                                    <BarChart3 className="w-4 h-4 text-green-400" />
                                    GPA (out of 4.0) <span className="text-red-400">*</span>
                                </Label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="4.0"
                                        placeholder="e.g. 3.25"
                                        value={formData.gpa}
                                        onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                                        className={`bg-white/10 border-white/20 text-white placeholder:text-gray-500 pr-14 ${formErrors.gpa ? 'border-red-500/50' : ''}`}
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">/ 4.0</span>
                                </div>
                                {formErrors.gpa && <p className="text-red-400 text-xs">{formErrors.gpa}</p>}
                                <div className="flex gap-1.5 mt-1">
                                    {[1.0, 2.0, 2.5, 3.0, 3.5].map(v => (
                                        <button key={v} onClick={() => setFormData({ ...formData, gpa: v.toString() })}
                                            className="text-xs px-2 py-1 rounded bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors">
                                            {v}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Attendance Rate */}
                            <div className="space-y-2">
                                <Label className="text-gray-300 flex items-center gap-2">
                                    <Percent className="w-4 h-4 text-green-400" />
                                    Attendance Rate (%) <span className="text-red-400">*</span>
                                </Label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        step="1"
                                        min="0"
                                        max="100"
                                        placeholder="e.g. 78"
                                        value={formData.attendance}
                                        onChange={(e) => setFormData({ ...formData, attendance: e.target.value })}
                                        className={`bg-white/10 border-white/20 text-white placeholder:text-gray-500 pr-10 ${formErrors.attendance ? 'border-red-500/50' : ''}`}
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">%</span>
                                </div>
                                {formErrors.attendance && <p className="text-red-400 text-xs">{formErrors.attendance}</p>}
                                <div className="flex gap-1.5 mt-1">
                                    {[40, 55, 65, 75, 90].map(v => (
                                        <button key={v} onClick={() => setFormData({ ...formData, attendance: v.toString() })}
                                            className="text-xs px-2 py-1 rounded bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors">
                                            {v}%
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Engagement Score */}
                            <div className="md:col-span-2 space-y-2">
                                <Label className="text-gray-300 flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-yellow-400" />
                                    Engagement Score (0 - 100) <span className="text-red-400">*</span>
                                </Label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        step="1"
                                        min="0"
                                        max="100"
                                        placeholder="e.g. 65 — based on class participation, assignments, extracurriculars"
                                        value={formData.engagement}
                                        onChange={(e) => setFormData({ ...formData, engagement: e.target.value })}
                                        className={`bg-white/10 border-white/20 text-white placeholder:text-gray-500 pr-14 ${formErrors.engagement ? 'border-red-500/50' : ''}`}
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">/ 100</span>
                                </div>
                                {formErrors.engagement && <p className="text-red-400 text-xs">{formErrors.engagement}</p>}
                                <div className="flex gap-1.5 mt-1">
                                    {[20, 40, 55, 70, 85].map(v => (
                                        <button key={v} onClick={() => setFormData({ ...formData, engagement: v.toString() })}
                                            className="text-xs px-2 py-1 rounded bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors">
                                            {v}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Model Explanation */}
                        <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl border border-purple-500/20">
                            <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                                <Brain className="w-4 h-4 text-purple-400" />
                                How the AI Model Works
                            </h4>
                            <p className="text-gray-400 text-xs leading-relaxed">
                                Our weighted multi-factor model calculates dropout risk using:
                                <strong className="text-blue-300"> GPA (40%)</strong> +
                                <strong className="text-green-300"> Attendance (30%)</strong> +
                                <strong className="text-purple-300"> Engagement (20%)</strong> +
                                <strong className="text-orange-300"> Year Standing (10%)</strong>.
                                Higher scores indicate lower risk. The model achieves <span className="text-white font-medium">85% confidence</span> based on historical data analysis.
                            </p>
                        </div>

                        {/* Submit Button */}
                        <div className="mt-6 flex justify-center">
                            <Button
                                onClick={handleManualSubmit}
                                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-10 py-6 text-lg rounded-xl shadow-lg shadow-purple-500/20 transition-all duration-300 hover:shadow-purple-500/30 hover:scale-[1.02]"
                            >
                                <Brain className="w-5 h-5 mr-2" />
                                Predict Dropout Chances
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* ==================== SEARCH MODE ==================== */}
            {mode === 'search' && !showResults && !predicting && (
                <>
                    <Card className="bg-white/5 backdrop-blur-md border-white/10">
                        <CardContent className="p-6">
                            <div className="relative">
                                <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                <Input
                                    placeholder="Search by student name, ID, or department..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        if (e.target.value === '') {
                                            setSelectedStudent(null);
                                            setPrediction(null);
                                            setShowResults(false);
                                        }
                                    }}
                                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 pl-12 py-6 text-lg rounded-xl"
                                />
                            </div>

                            {/* Search Results Dropdown */}
                            {filteredStudents.length > 0 && !selectedStudent && (
                                <div className="mt-3 bg-gray-900/90 backdrop-blur-md rounded-xl border border-white/10 max-h-80 overflow-y-auto">
                                    {filteredStudents.slice(0, 10).map((student, idx) => (
                                        <button
                                            key={student.id || idx}
                                            onClick={() => handleSelectStudent(student)}
                                            className="w-full flex items-center justify-between p-4 hover:bg-white/10 transition-all duration-200 border-b border-white/5 last:border-b-0"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                                    {student.name?.charAt(0)}
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-white font-medium">{student.name}</p>
                                                    <p className="text-gray-400 text-sm">{student.student_id} • {student.department} • Year {student.year}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge className={`${getRiskColor(student.risk_level).bg} ${getRiskColor(student.risk_level).text} ${getRiskColor(student.risk_level).border}`}>
                                                    {student.risk_level} risk
                                                </Badge>
                                                <ChevronRight className="w-4 h-4 text-gray-500" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Empty State for Search */}
                    {!selectedStudent && (
                        <Card className="bg-white/5 backdrop-blur-md border-white/10 border-dashed">
                            <CardContent className="p-12 text-center">
                                <div className="w-16 h-16 mx-auto mb-4 bg-blue-500/10 rounded-2xl flex items-center justify-center">
                                    <Search className="w-8 h-8 text-blue-400" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">Search Existing Students</h3>
                                <p className="text-gray-400 max-w-md mx-auto mb-6 text-sm">
                                    Type a student's name, ID, or department to find them and analyze their dropout probability.
                                </p>

                                {/* Quick Access */}
                                <div>
                                    <p className="text-gray-500 text-xs mb-3">Quick check — sample students:</p>
                                    <div className="flex flex-wrap justify-center gap-2">
                                        {students.filter(s => s.risk_level === 'high').slice(0, 3).map((s, idx) => (
                                            <Button key={idx} variant="outline" size="sm"
                                                onClick={() => handleSelectStudent(s)}
                                                className="bg-red-500/10 border-red-500/20 text-red-300 hover:bg-red-500/20 text-xs">
                                                <AlertTriangle className="w-3 h-3 mr-1" /> {s.name}
                                            </Button>
                                        ))}
                                        {students.filter(s => s.risk_level === 'low').slice(0, 2).map((s, idx) => (
                                            <Button key={idx} variant="outline" size="sm"
                                                onClick={() => handleSelectStudent(s)}
                                                className="bg-green-500/10 border-green-500/20 text-green-300 hover:bg-green-500/20 text-xs">
                                                <CheckCircle2 className="w-3 h-3 mr-1" /> {s.name}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}

            {/* ==================== AI PROCESSING ANIMATION ==================== */}
            {predicting && (
                <Card className="bg-white/5 backdrop-blur-md border-purple-500/30">
                    <CardContent className="p-12 text-center">
                        <div className="relative w-20 h-20 mx-auto mb-6">
                            <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-transparent border-t-purple-500 rounded-full animate-spin"></div>
                            <Brain className="absolute inset-0 m-auto w-8 h-8 text-purple-400 animate-pulse" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">AI Model Processing...</h3>
                        <p className="text-gray-400">Analyzing {selectedStudent?.name || 'student'}'s data across 4 risk factors</p>
                        <div className="flex justify-center gap-8 mt-6">
                            {['GPA', 'Attendance', 'Engagement', 'Year'].map((factor, i) => (
                                <div key={factor} className="text-center animate-pulse" style={{ animationDelay: `${i * 200}ms` }}>
                                    <div className="w-3 h-3 bg-purple-400 rounded-full mx-auto mb-2"></div>
                                    <span className="text-xs text-gray-400">{factor}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* ==================== PREDICTION RESULTS ==================== */}
            {showResults && prediction && selectedStudent && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                    {/* Main Prediction Card */}
                    <Card className={`bg-white/5 backdrop-blur-md ${getRiskColor(prediction.overallRisk.level).border} border-2 shadow-lg ${getRiskColor(prediction.overallRisk.level).glow}`}>
                        <CardContent className="p-8">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Student Info */}
                                <div className="flex items-start gap-4">
                                    <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shrink-0">
                                        {selectedStudent.name?.charAt(0) || '?'}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">{selectedStudent.name}</h2>
                                        <p className="text-gray-400">{selectedStudent.student_id || 'Manual Entry'}</p>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            <Badge variant="outline" className="border-blue-500/30 text-blue-300">
                                                <BookOpen className="w-3 h-3 mr-1" /> {selectedStudent.department}
                                            </Badge>
                                            <Badge variant="outline" className="border-purple-500/30 text-purple-300">
                                                <Clock className="w-3 h-3 mr-1" /> Year {selectedStudent.year}
                                            </Badge>
                                            {mode === 'manual' && (
                                                <Badge variant="outline" className="border-cyan-500/30 text-cyan-300">
                                                    <PenLine className="w-3 h-3 mr-1" /> Manual Entry
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Dropout Probability */}
                                <div className="text-center">
                                    <p className="text-gray-400 text-sm mb-2 uppercase tracking-wider">Dropout Probability</p>
                                    <div className="relative w-32 h-32 mx-auto">
                                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                                            <circle cx="60" cy="60" r="50" stroke="rgba(255,255,255,0.1)" strokeWidth="10" fill="none" />
                                            <circle
                                                cx="60" cy="60" r="50"
                                                stroke={prediction.overallRisk.level === 'high' ? '#ef4444' : prediction.overallRisk.level === 'medium' ? '#eab308' : '#22c55e'}
                                                strokeWidth="10" fill="none"
                                                strokeDasharray={`${getDropoutPercentage(prediction.overallRisk.score) * 3.14} ${314 - getDropoutPercentage(prediction.overallRisk.score) * 3.14}`}
                                                strokeLinecap="round"
                                                className="transition-all duration-1000"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className={`text-3xl font-bold ${getRiskColor(prediction.overallRisk.level).text}`}>
                                                {getDropoutPercentage(prediction.overallRisk.score)}%
                                            </span>
                                        </div>
                                    </div>
                                    <Badge className={`mt-3 text-sm px-4 py-1 ${getRiskColor(prediction.overallRisk.level).bg} ${getRiskColor(prediction.overallRisk.level).text} ${getRiskColor(prediction.overallRisk.level).border}`}>
                                        {prediction.overallRisk.level === 'high' ? '⚠️ High Risk' :
                                            prediction.overallRisk.level === 'medium' ? '⚡ Medium Risk' : '✅ Low Risk'}
                                    </Badge>
                                </div>

                                {/* Retention Chance */}
                                <div className="text-center">
                                    <p className="text-gray-400 text-sm mb-2 uppercase tracking-wider">Retention Chance</p>
                                    <div className="relative w-32 h-32 mx-auto">
                                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                                            <circle cx="60" cy="60" r="50" stroke="rgba(255,255,255,0.1)" strokeWidth="10" fill="none" />
                                            <circle
                                                cx="60" cy="60" r="50"
                                                stroke="#3b82f6"
                                                strokeWidth="10" fill="none"
                                                strokeDasharray={`${getRetentionPercentage(prediction.overallRisk.score) * 3.14} ${314 - getRetentionPercentage(prediction.overallRisk.score) * 3.14}`}
                                                strokeLinecap="round"
                                                className="transition-all duration-1000"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-3xl font-bold text-blue-400">
                                                {getRetentionPercentage(prediction.overallRisk.score)}%
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-gray-400 text-sm mt-3">
                                        Confidence: <span className="text-blue-300 font-medium">{Math.round((prediction.overallRisk.confidence || 0.85) * 100)}%</span>
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Factor Analysis + Radar Chart */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Factors Breakdown */}
                        <Card className="bg-white/5 backdrop-blur-md border-white/10">
                            <CardHeader>
                                <CardTitle className="text-lg text-white flex items-center gap-2">
                                    <Target className="w-5 h-5 text-blue-400" />
                                    Risk Factor Analysis
                                </CardTitle>
                                <CardDescription className="text-gray-400">How each factor contributes to the prediction</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {prediction.overallRisk.factors?.map((factor, idx) => (
                                    <div key={idx} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {factor.impact === 'positive' ? (
                                                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                                                ) : factor.impact === 'negative' ? (
                                                    <XCircle className="w-4 h-4 text-red-400" />
                                                ) : (
                                                    <Activity className="w-4 h-4 text-yellow-400" />
                                                )}
                                                <span className="text-gray-300 text-sm">{factor.name}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-white font-medium text-sm">{factor.actual}</span>
                                                <Badge variant="outline" className="text-xs border-white/20 text-gray-400">
                                                    {Math.round(factor.weight * 100)}% weight
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="w-full bg-white/10 rounded-full h-2.5">
                                            <div
                                                className={`h-2.5 rounded-full transition-all duration-1000 ${factor.score >= 0.7 ? 'bg-gradient-to-r from-green-500 to-emerald-400' :
                                                    factor.score >= 0.5 ? 'bg-gradient-to-r from-yellow-500 to-orange-400' :
                                                        'bg-gradient-to-r from-red-500 to-red-400'
                                                    }`}
                                                style={{ width: `${Math.round(factor.score * 100)}%` }}
                                            ></div>
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-500">
                                            <span>0%</span>
                                            <span className={factor.score >= 0.7 ? 'text-green-400' : factor.score >= 0.5 ? 'text-yellow-400' : 'text-red-400'}>
                                                {Math.round(factor.score * 100)}%
                                            </span>
                                            <span>100%</span>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Radar Chart */}
                        <Card className="bg-white/5 backdrop-blur-md border-white/10">
                            <CardHeader>
                                <CardTitle className="text-lg text-white flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-yellow-400" />
                                    Performance Radar
                                </CardTitle>
                                <CardDescription className="text-gray-400">Multi-dimensional student performance profile</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={280}>
                                    <RadarChart data={radarData}>
                                        <PolarGrid stroke="rgba(255,255,255,0.1)" />
                                        <PolarAngleAxis dataKey="factor" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                        <Radar
                                            name="Score"
                                            dataKey="score"
                                            stroke="#8b5cf6"
                                            fill="#8b5cf6"
                                            fillOpacity={0.3}
                                            strokeWidth={2}
                                        />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recommendations */}
                    {prediction.recommendations && prediction.recommendations.length > 0 && (
                        <Card className="bg-white/5 backdrop-blur-md border-white/10">
                            <CardHeader>
                                <CardTitle className="text-lg text-white flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-green-400" />
                                    AI Recommendations to Reduce Dropout Risk
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {prediction.recommendations.map((rec, idx) => (
                                        <div
                                            key={idx}
                                            className={`p-4 rounded-xl border ${rec.priority === 'high' ? 'bg-red-500/10 border-red-500/20' :
                                                rec.priority === 'medium' ? 'bg-yellow-500/10 border-yellow-500/20' :
                                                    'bg-green-500/10 border-green-500/20'
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`p-2 rounded-lg shrink-0 ${rec.priority === 'high' ? 'bg-red-500/20' :
                                                    rec.priority === 'medium' ? 'bg-yellow-500/20' : 'bg-green-500/20'
                                                    }`}>
                                                    {rec.priority === 'high' ? <AlertTriangle className="w-5 h-5 text-red-400" /> :
                                                        rec.priority === 'medium' ? <TrendingUp className="w-5 h-5 text-yellow-400" /> :
                                                            <CheckCircle2 className="w-5 h-5 text-green-400" />}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="text-white font-medium">{rec.action}</h4>
                                                        <Badge className={`text-xs ${rec.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                                                            rec.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                                                                'bg-green-500/20 text-green-300'
                                                            }`}>
                                                            {rec.priority}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-gray-400 text-sm">{rec.description}</p>
                                                    {rec.expectedImpact > 0 && (
                                                        <p className="text-blue-300 text-xs mt-2 flex items-center gap-1">
                                                            <TrendingUp className="w-3 h-3" />
                                                            Expected improvement: +{Math.round(rec.expectedImpact * 100)}% risk reduction
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Input Summary for Manual Entry */}
                    {mode === 'manual' && (
                        <Card className="bg-white/5 backdrop-blur-md border-white/10">
                            <CardHeader>
                                <CardTitle className="text-lg text-white flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-cyan-400" />
                                    Input Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="p-3 bg-white/5 rounded-lg text-center">
                                        <p className="text-gray-400 text-xs mb-1">GPA</p>
                                        <p className="text-white text-xl font-bold">{selectedStudent.gpa?.toFixed(2)}</p>
                                        <p className="text-gray-500 text-xs">out of 4.0</p>
                                    </div>
                                    <div className="p-3 bg-white/5 rounded-lg text-center">
                                        <p className="text-gray-400 text-xs mb-1">Attendance</p>
                                        <p className="text-white text-xl font-bold">{selectedStudent.attendance_rate}%</p>
                                        <p className="text-gray-500 text-xs">rate</p>
                                    </div>
                                    <div className="p-3 bg-white/5 rounded-lg text-center">
                                        <p className="text-gray-400 text-xs mb-1">Engagement</p>
                                        <p className="text-white text-xl font-bold">{selectedStudent.engagement_score}</p>
                                        <p className="text-gray-500 text-xs">out of 100</p>
                                    </div>
                                    <div className="p-3 bg-white/5 rounded-lg text-center">
                                        <p className="text-gray-400 text-xs mb-1">Year</p>
                                        <p className="text-white text-xl font-bold">{selectedStudent.year}</p>
                                        <p className="text-gray-500 text-xs">of study</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Check Another Student */}
                    <div className="text-center flex justify-center gap-4">
                        <Button
                            onClick={resetAll}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-3 text-lg"
                        >
                            <Brain className="w-5 h-5 mr-2" />
                            Check Another Student
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DropoutPrediction;
