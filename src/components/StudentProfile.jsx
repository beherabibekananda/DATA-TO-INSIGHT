
import React, { useState } from 'react';
import { User, Mail, Phone, Calendar, BookOpen, TrendingUp, TrendingDown, AlertTriangle, Fingerprint, Activity, Target, Brain, Shield, Clock, ChevronRight, Zap } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const StudentProfile = () => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);

  const students = [
    {
      id: 1,
      name: 'Rohan Kumar',
      email: 'rohan.kumar@university.edu',
      phone: '+91 98765 43210',
      enrollmentDate: '2022-09-01',
      major: 'Computer Science',
      year: 'Junior',
      gpa: 2.8,
      attendance: 65,
      engagement: 40,
      riskLevel: 'Critical',
      riskScore: 85,
      avatar: '👨‍💻',
      subjects: [
        { name: 'Data Structures', grade: 'D+', attendance: 60 },
        { name: 'Algorithms', grade: 'C-', attendance: 70 },
        { name: 'Database Systems', grade: 'F', attendance: 45 },
        { name: 'Web Development', grade: 'C+', attendance: 80 }
      ],
      interventions: [
        { date: '2024-12-01', type: 'Academic Counseling', status: 'Scheduled' },
        { date: '2024-11-28', type: 'Tutoring Assignment', status: 'Active' },
        { date: '2024-11-25', type: 'Parent Meeting', status: 'Completed' }
      ]
    },
    {
      id: 2,
      name: 'Sarala Singh',
      email: 'sarala.singh@university.edu',
      phone: '+91 91234 56789',
      enrollmentDate: '2021-09-01',
      major: 'Psychology',
      year: 'Senior',
      gpa: 3.2,
      attendance: 78,
      engagement: 65,
      riskLevel: 'High',
      riskScore: 72,
      avatar: '👩‍🎓',
      subjects: [
        { name: 'Clinical Psychology', grade: 'B-', attendance: 85 },
        { name: 'Research Methods', grade: 'C+', attendance: 70 },
        { name: 'Statistics', grade: 'D+', attendance: 60 },
        { name: 'Developmental Psych', grade: 'B', attendance: 90 }
      ],
      interventions: [
        { date: '2024-11-30', type: 'Study Group', status: 'Active' },
        { date: '2024-11-20', type: 'Academic Warning', status: 'Issued' }
      ]
    },
    {
      id: 3,
      name: 'Alex Rodriguez',
      email: 'alex.rodriguez@university.edu',
      phone: '+1 (555) 456-7890',
      enrollmentDate: '2023-01-15',
      major: 'Business Admin',
      year: 'Sophomore',
      gpa: 3.8,
      attendance: 92,
      engagement: 88,
      riskLevel: 'Low',
      riskScore: 15,
      avatar: '👨‍💼',
      subjects: [
        { name: 'Marketing', grade: 'A-', attendance: 95 },
        { name: 'Finance', grade: 'A', attendance: 90 },
        { name: 'Management', grade: 'B+', attendance: 88 },
        { name: 'Economics', grade: 'A-', attendance: 95 }
      ],
      interventions: []
    }
  ];

  const getRiskBadge = (level) => {
    switch (level) {
      case 'Critical': return <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-[9px] font-black uppercase tracking-widest px-2">Critical Risk</Badge>;
      case 'High': return <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/20 text-[9px] font-black uppercase tracking-widest px-2">High Risk</Badge>;
      case 'Medium': return <Badge className="bg-warning/10 text-warning border-warning/20 text-[9px] font-black uppercase tracking-widest px-2">Medium Risk</Badge>;
      default: return <Badge className="bg-success/10 text-success border-success/20 text-[9px] font-black uppercase tracking-widest px-2">Low Risk</Badge>;
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'Critical': return 'text-destructive';
      case 'High': return 'text-orange-500';
      case 'Medium': return 'text-warning';
      default: return 'text-success';
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Fingerprint className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Student Identification</span>
          </div>
          <h2 className="text-4xl font-black text-foreground tracking-tighter uppercase">Student Profiles</h2>
          <p className="text-muted-foreground uppercase tracking-[0.2em] text-[10px] font-black mt-1">Detailed analysis of student performance and risk factors</p>
        </div>
        <div className="flex gap-3">
          <Button className="bg-muted border border-border text-muted-foreground hover:text-foreground rounded-xl px-6 h-11 text-[10px] font-black uppercase tracking-widest transition-all">
            <Activity className="w-4 h-4 mr-2" />
            Quick View
          </Button>
        </div>
      </div>

      {/* Student Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
        {students.map((student) => (
          <div
            key={student.id}
            className="group relative h-[420px] perspective-1000 cursor-pointer"
            onClick={() => {
              setSelectedStudent(student);
              setIsFlipped(!isFlipped);
            }}
          >
            <div className={`
              relative w-full h-full transition-all duration-[800ms] preserve-3d
              ${selectedStudent?.id === student.id && isFlipped ? 'rotate-y-180' : ''}
            `}>
              {/* Front of Card */}
              <div className="absolute inset-0 bg-card backdrop-blur-3xl border border-border rounded-3xl p-8 backface-hidden shadow-2xl overflow-hidden group-hover:border-primary/40 transition-all">
                {/* Background Glow */}
                <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-5 -mr-16 -mt-16 transition-all ${getRiskColor(student.riskLevel).replace('text-', 'bg-')}`}></div>

                <div className="relative z-10 h-full flex flex-col">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="w-16 h-16 bg-muted border border-border rounded-2xl flex items-center justify-center text-3xl shadow-xl group-hover:scale-110 transition-transform">
                      {student.avatar}
                    </div>
                    {getRiskBadge(student.riskLevel)}
                  </div>

                  {/* Student Info */}
                  <div className="flex-1 space-y-2">
                    <h3 className="text-2xl font-black text-foreground tracking-tighter uppercase group-hover:text-primary transition-colors">{student.name}</h3>
                    <div className="flex items-center gap-2 text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">
                      <span>{student.major}</span>
                      <div className="w-1 h-1 bg-border rounded-full"></div>
                      <span>Year {student.year.split(' ')[0]}</span>
                    </div>

                    <div className="pt-8 space-y-5">
                      {/* GPA Meter */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                          <span className="text-muted-foreground">Current GPA</span>
                          <span className="text-foreground">{student.gpa} / 4.0</span>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden p-[1px] border border-border">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${(student.gpa / 4) * 100}%` }}></div>
                        </div>
                      </div>

                      {/* Attendance */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                          <span className="text-muted-foreground">Attendance</span>
                          <span className="text-foreground">{student.attendance}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden p-[1px] border border-border">
                          <div className="h-full bg-success rounded-full" style={{ width: `${student.attendance}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Risk Probability Footer */}
                  <div className="mt-auto p-5 rounded-2xl bg-muted/50 border border-border flex items-center justify-between group-hover:bg-muted transition-all">
                    <div className="flex items-center gap-3">
                      <Shield className={`w-4 h-4 ${getRiskColor(student.riskLevel)}`} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Dropout Risk</span>
                    </div>
                    <span className={`text-xl font-black tracking-tighter ${getRiskColor(student.riskLevel)}`}>
                      {student.riskScore}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Back of Card */}
              <div className="absolute inset-0 bg-card backdrop-blur-3xl border border-border rounded-3xl p-8 backface-hidden rotate-y-180 shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -mr-16 -mt-16"></div>

                <div className="h-full flex flex-col relative z-10">
                  <div className="flex items-center gap-3 mb-8">
                    <Brain className="w-5 h-5 text-primary" />
                    <h4 className="text-lg font-black text-foreground tracking-tighter uppercase">Detailed Analytics</h4>
                  </div>

                  {/* Subjects */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6">
                    <div className="space-y-3">
                      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Academic Performance</p>
                      <div className="space-y-2">
                        {student.subjects.map((subject, index) => (
                          <div key={index} className="flex justify-between items-center p-3 rounded-xl bg-muted/50 border border-border hover:border-primary/20 transition-all">
                            <span className="text-[10px] font-bold text-foreground/80 tracking-tight uppercase">{subject.name}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-black text-primary">{subject.grade}</span>
                              <span className="text-[9px] font-bold text-muted-foreground">{subject.attendance}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Interventions */}
                    <div className="space-y-3">
                      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Intervention History</p>
                      {student.interventions.length > 0 ? (
                        <div className="space-y-2">
                          {student.interventions.map((intervention, index) => (
                            <div key={index} className="p-3 rounded-xl bg-muted/50 border border-border flex flex-col gap-1">
                              <div className="flex justify-between items-start">
                                <span className="text-[10px] font-black text-foreground/80 tracking-tight uppercase">{intervention.type}</span>
                                <Badge className={`rounded-md px-1.5 py-0 text-[7px] font-black uppercase tracking-widest border ${intervention.status === 'Active' ? 'bg-primary/10 text-primary border-primary/20' :
                                  intervention.status === 'Completed' ? 'bg-success/10 text-success border-success/20' :
                                    'bg-warning/10 text-warning border-warning/20'
                                  }`}>
                                  {intervention.status}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-1.5 text-[8px] font-black text-muted-foreground uppercase tracking-widest">
                                <Clock className="w-2.5 h-2.5" />
                                {intervention.date}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 rounded-xl border border-border border-dashed flex items-center justify-center">
                          <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest">No Active Interventions</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-border">
                    <button className="w-full flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-primary group/btn">
                      View Full Details
                      <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Action Card */}
        <div className="h-[420px] rounded-3xl border border-dashed border-border flex flex-col items-center justify-center p-10 text-center group hover:border-primary transition-all cursor-pointer bg-muted/30">
          <div className="w-16 h-16 bg-muted border border-border rounded-2xl flex items-center justify-center mb-6 text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all shadow-lg shadow-black/5">
            <Target className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-foreground opacity-40 uppercase tracking-tighter group-hover:opacity-100 transition-opacity">Add Student</h3>
          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-2 group-hover:text-primary/60 transition-colors">Add a new student to the system</p>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
