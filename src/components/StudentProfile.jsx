
import React, { useState } from 'react';
import { User, Mail, Phone, Calendar, BookOpen, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

const StudentProfile = () => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);

  const students = [
    {
      id: 1,
      name: 'Rohan Kumar',
      email: 'rohan.chen@university.edu',
      phone: '+1 (555) 123-4567',
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
      email: 'sarala.johnson@university.edu',
      phone: '+1 (555) 987-6543',
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
      major: 'Business Administration',
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

  const getRiskColor = (level) => {
    switch (level) {
      case 'Critical': return 'from-red-500 to-red-600';
      case 'High': return 'from-orange-500 to-orange-600';
      case 'Medium': return 'from-yellow-500 to-yellow-600';
      default: return 'from-green-500 to-green-600';
    }
  };

  const getRiskTextColor = (level) => {
    switch (level) {
      case 'Critical': return 'text-red-400';
      case 'High': return 'text-orange-400';
      case 'Medium': return 'text-yellow-400';
      default: return 'text-green-400';
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
          Student Profile Viewer
        </h1>
        <p className="text-gray-400">3D Interactive Student Cards with Detailed Analytics</p>
      </div>

      {/* Student Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {students.map((student) => (
          <div
            key={student.id}
            className="relative h-80 perspective-1000 cursor-pointer"
            onClick={() => {
              setSelectedStudent(student);
              setIsFlipped(!isFlipped);
            }}
          >
            <div className={`
              relative w-full h-full transition-transform duration-700 transform-style-preserve-3d
              ${selectedStudent?.id === student.id && isFlipped ? 'rotate-y-180' : ''}
            `}>
              {/* Front of Card */}
              <div className="absolute inset-0 glass-card rounded-xl p-6 backface-hidden">
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-4xl">{student.avatar}</div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getRiskColor(student.riskLevel)}`}>
                      {student.riskLevel} Risk
                    </div>
                  </div>
                  
                  {/* Student Info */}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">{student.name}</h3>
                    <p className="text-gray-400 text-sm mb-4">{student.major} • {student.year}</p>
                    
                    {/* Stats */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">GPA</span>
                        <span className="text-white font-medium">{student.gpa}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Attendance</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-700 rounded-full h-2">
                            <div
                              className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                              style={{ width: `${student.attendance}%` }}
                            ></div>
                          </div>
                          <span className="text-white text-sm">{student.attendance}%</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Engagement</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-700 rounded-full h-2">
                            <div
                              className="h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                              style={{ width: `${student.engagement}%` }}
                            ></div>
                          </div>
                          <span className="text-white text-sm">{student.engagement}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Risk Score */}
                  <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Risk Score</span>
                      <span className={`font-bold ${getRiskTextColor(student.riskLevel)}`}>
                        {student.riskScore}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Back of Card */}
              <div className="absolute inset-0 glass-card rounded-xl p-6 backface-hidden rotate-y-180">
                <div className="h-full overflow-y-auto">
                  <h4 className="text-lg font-bold text-white mb-4">Detailed Analysis</h4>
                  
                  {/* Subjects */}
                  <div className="mb-6">
                    <h5 className="text-sm font-medium text-gray-400 mb-3">Current Subjects</h5>
                    <div className="space-y-2">
                      {student.subjects.map((subject, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span className="text-gray-300">{subject.name}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-white font-medium">{subject.grade}</span>
                            <span className="text-gray-500">({subject.attendance}%)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Recent Interventions */}
                  <div>
                    <h5 className="text-sm font-medium text-gray-400 mb-3">Recent Interventions</h5>
                    {student.interventions.length > 0 ? (
                      <div className="space-y-2">
                        {student.interventions.map((intervention, index) => (
                          <div key={index} className="text-sm">
                            <div className="flex justify-between items-start">
                              <span className="text-gray-300">{intervention.type}</span>
                              <span className={`px-2 py-1 rounded text-xs ${
                                intervention.status === 'Active' ? 'bg-blue-500/20 text-blue-400' :
                                intervention.status === 'Completed' ? 'bg-green-500/20 text-green-400' :
                                'bg-yellow-500/20 text-yellow-400'
                              }`}>
                                {intervention.status}
                              </span>
                            </div>
                            <p className="text-gray-500 text-xs">{intervention.date}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No interventions needed</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentProfile;
