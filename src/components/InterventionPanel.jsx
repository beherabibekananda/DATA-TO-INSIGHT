
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { predictiveAPI } from '../api/predictiveAPI';
import { studentAnalyticsAPI } from '../api/studentAnalytics';
import { Send, AlertTriangle, CheckCircle, Clock, Target, Zap, Users, MessageSquare } from 'lucide-react';

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
        
        // Simulate existing interventions
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
      case 'active': return 'bg-green-500';
      case 'planning': return 'bg-yellow-500';
      case 'completed': return 'bg-blue-500';
      case 'paused': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'bg-red-500/20 text-red-300 border-red-500/50';
      case 'high': return 'bg-orange-500/20 text-orange-300 border-orange-500/50';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
      case 'low': return 'bg-green-500/20 text-green-300 border-green-500/50';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/50';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
            Loading Intervention Panel...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Intervention Management</h2>
        <p className="text-gray-300">AI-powered student intervention and support programs</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-card border-green-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Active Programs</CardTitle>
            <Target className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {interventions.filter(i => i.status === 'active').length}
            </div>
            <p className="text-xs text-green-300">Currently running</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-blue-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Students Helped</CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">
              {interventions.reduce((sum, i) => sum + i.studentsAffected, 0)}
            </div>
            <p className="text-xs text-blue-300">Total reached</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-yellow-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Avg Effectiveness</CardTitle>
            <Zap className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">
              {interventions.length > 0 ? 
                Math.round(interventions.reduce((sum, i) => sum + i.effectiveness, 0) / interventions.length) : 0
              }%
            </div>
            <p className="text-xs text-yellow-300">Success rate</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-purple-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">AI Insights</CardTitle>
            <MessageSquare className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">
              {aiInsights?.insights.length || 0}
            </div>
            <p className="text-xs text-purple-300">New recommendations</p>
          </CardContent>
        </Card>
      </div>

      {/* Create New Intervention */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Send className="h-5 w-5 text-blue-400" />
            Create New Intervention
          </CardTitle>
          <CardDescription className="text-gray-300">
            Design targeted support programs for at-risk students
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Program Title</label>
                <Input
                  value={newIntervention.title}
                  onChange={(e) => setNewIntervention({...newIntervention, title: e.target.value})}
                  placeholder="Enter intervention title"
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
              
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Target Group</label>
                <select
                  value={newIntervention.targetGroup}
                  onChange={(e) => setNewIntervention({...newIntervention, targetGroup: e.target.value})}
                  className="w-full p-2 bg-white/10 border border-white/20 rounded-md text-white"
                >
                  <option value="high-risk">High Risk Students</option>
                  <option value="medium-risk">Medium Risk Students</option>
                  <option value="low-risk">Low Risk Students</option>
                  <option value="all">All Students</option>
                </select>
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-2 block">Intervention Type</label>
                <select
                  value={newIntervention.type}
                  onChange={(e) => setNewIntervention({...newIntervention, type: e.target.value})}
                  className="w-full p-2 bg-white/10 border border-white/20 rounded-md text-white"
                >
                  <option value="academic">Academic Support</option>
                  <option value="behavioral">Behavioral</option>
                  <option value="wellness">Mental Health & Wellness</option>
                  <option value="financial">Financial Aid</option>
                  <option value="social">Social Integration</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-white text-sm font-medium mb-2 block">Priority Level</label>
                <select
                  value={newIntervention.priority}
                  onChange={(e) => setNewIntervention({...newIntervention, priority: e.target.value})}
                  className="w-full p-2 bg-white/10 border border-white/20 rounded-md text-white"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="text-white text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  value={newIntervention.description}
                  onChange={(e) => setNewIntervention({...newIntervention, description: e.target.value})}
                  placeholder="Describe the intervention program..."
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 resize-none"
                  rows={4}
                />
              </div>

              <Button
                onClick={handleCreateIntervention}
                disabled={!newIntervention.title || !newIntervention.description}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                <Send className="h-4 w-4 mr-2" />
                Create Intervention
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights & Recommendations */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-400" />
            AI-Powered Recommendations
          </CardTitle>
          <CardDescription className="text-gray-300">
            Smart insights for targeted interventions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {aiInsights && (
            <div className="space-y-4">
              {aiInsights.insights.map((insight, index) => (
                <div key={index} className={`p-4 rounded-lg border-l-4 ${
                  insight.severity === 'critical' ? 'bg-red-500/10 border-red-500' :
                  insight.severity === 'high' ? 'bg-orange-500/10 border-orange-500' :
                  insight.severity === 'positive' ? 'bg-green-500/10 border-green-500' :
                  'bg-blue-500/10 border-blue-500'
                }`}>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-white font-semibold">{insight.title}</h4>
                    <div className="flex items-center space-x-2">
                      <Badge className={`${
                        insight.severity === 'critical' ? 'bg-red-500/20 text-red-300' :
                        insight.severity === 'high' ? 'bg-orange-500/20 text-orange-300' :
                        insight.severity === 'positive' ? 'bg-green-500/20 text-green-300' :
                        'bg-blue-500/20 text-blue-300'
                      }`}>
                        {insight.severity}
                      </Badge>
                      <span className="text-sm text-gray-300">{insight.affectedStudents} students</span>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm mb-3">{insight.description}</p>
                  <div className="flex justify-between items-center">
                    <p className="text-blue-300 text-sm font-medium">💡 {insight.recommendation}</p>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      Create Program
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Interventions */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="h-5 w-5 text-green-400" />
            Active Intervention Programs
          </CardTitle>
          <CardDescription className="text-gray-300">
            Currently running and planned intervention programs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {interventions.map((intervention) => (
              <div key={intervention.id} className="p-6 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-white font-semibold text-lg">{intervention.title}</h4>
                      <Badge className={getStatusColor(intervention.status)}>
                        {intervention.status}
                      </Badge>
                      <Badge className={getPriorityColor(intervention.priority)}>
                        {intervention.priority}
                      </Badge>
                    </div>
                    <p className="text-gray-300 text-sm mb-3">{intervention.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Target:</span>
                        <p className="text-white capitalize">{intervention.targetGroup.replace('-', ' ')}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Type:</span>
                        <p className="text-white capitalize">{intervention.type}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Students Affected:</span>
                        <p className="text-blue-300 font-medium">{intervention.studentsAffected}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Effectiveness:</span>
                        <p className={`font-medium ${
                          intervention.effectiveness > 80 ? 'text-green-300' :
                          intervention.effectiveness > 60 ? 'text-yellow-300' :
                          'text-red-300'
                        }`}>
                          {intervention.effectiveness}%
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <Button size="sm" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                      View Details
                    </Button>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      Manage
                    </Button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Progress</span>
                    <span>{intervention.effectiveness}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        intervention.effectiveness > 80 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                        intervention.effectiveness > 60 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                        'bg-gradient-to-r from-red-500 to-pink-500'
                      }`}
                      style={{ width: `${intervention.effectiveness}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Notifications */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            Recent Notifications
          </CardTitle>
          <CardDescription className="text-gray-300">
            Real-time alerts and system updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div key={notification.id} className={`flex items-center space-x-3 p-3 rounded-lg ${
                notification.type === 'alert' ? 'bg-red-500/10 border-l-4 border-red-500' :
                notification.type === 'success' ? 'bg-green-500/10 border-l-4 border-green-500' :
                'bg-blue-500/10 border-l-4 border-blue-500'
              }`}>
                <div className={`p-2 rounded-full ${
                  notification.type === 'alert' ? 'bg-red-500/20' :
                  notification.type === 'success' ? 'bg-green-500/20' :
                  'bg-blue-500/20'
                }`}>
                  {notification.type === 'alert' ? 
                    <AlertTriangle className="h-4 w-4 text-red-400" /> :
                    notification.type === 'success' ?
                    <CheckCircle className="h-4 w-4 text-green-400" /> :
                    <Clock className="h-4 w-4 text-blue-400" />
                  }
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm">{notification.message}</p>
                  <p className="text-gray-400 text-xs">
                    {new Date(notification.timestamp).toLocaleString()}
                  </p>
                </div>
                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                  View
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
