
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { sampleStudents } from "@/data/sampleStudents";
import { studentAnalyticsAPI } from '../api/studentAnalytics';
import { predictiveAPI } from '../api/predictiveAPI';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';
import { AlertTriangle, TrendingDown, TrendingUp, Brain, Target, Zap } from 'lucide-react';

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
        // Get real student IDs from database for batch predictions
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
            Analyzing Risk Patterns...
          </p>
        </div>
      </div>
    );
  }

  // Transform data for radar chart
  const radarData = modelMetrics?.featureImportance.map(item => ({
    feature: item.feature.split(' ')[0], // Shortened labels
    importance: item.importance * 100,
    fullName: item.feature
  })) || [];

  // Risk distribution data for scatter plot using real GPA data
  const scatterData = predictiveResults?.predictions.map((pred, index) => ({
    x: pred.gpa ? (pred.gpa / 10.0) * 100 : 50,
    y: pred.riskScore * 100,
    risk: pred.riskLevel,
    confidence: pred.confidence,
    name: pred.studentName
  })) || [];

  return (
    <div className="space-y-8 p-6">
      {/* Header with Controls */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Risk Analysis Dashboard</h2>
          <p className="text-gray-300">Advanced predictive analytics for student dropout prevention</p>
        </div>
        <div className="space-x-2">
          <Button
            onClick={() => setSelectedDepartment('all')}
            variant={selectedDepartment === 'all' ? 'default' : 'outline'}
            className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
          >
            All Departments
          </Button>
          <Button
            onClick={() => setSelectedDepartment('cs')}
            variant={selectedDepartment === 'cs' ? 'default' : 'outline'}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            Computer Science
          </Button>
          <Button
            onClick={() => setSelectedDepartment('math')}
            variant={selectedDepartment === 'math' ? 'default' : 'outline'}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            Mathematics
          </Button>
        </div>
      </div>

      {/* Risk Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-card border-red-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">High Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">
              {predictiveResults?.summary.highRisk || 0}
            </div>
            <p className="text-xs text-red-300">Immediate intervention needed</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-yellow-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Medium Risk</CardTitle>
            <TrendingDown className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">
              {predictiveResults?.summary.mediumRisk || 0}
            </div>
            <p className="text-xs text-yellow-300">Monitor closely</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-green-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Low Risk</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {predictiveResults?.summary.lowRisk || 0}
            </div>
            <p className="text-xs text-green-300">On track</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-purple-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Model Accuracy</CardTitle>
            <Brain className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">
              {modelMetrics?.totalStudents || 0}
            </div>
            <p className="text-xs text-purple-300">Total Analyzed</p>
          </CardContent>
        </Card>
      </div>

      {/* Feature Importance Radar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-400" />
              Feature Importance Analysis
            </CardTitle>
            <CardDescription className="text-gray-300">
              AI model feature weights for dropout prediction
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis
                  dataKey="feature"
                  tick={{ fontSize: 12, fill: '#9ca3af' }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 40]}
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                />
                <Radar
                  name="Importance"
                  dataKey="importance"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-400" />
              Risk Distribution Plot
            </CardTitle>
            <CardDescription className="text-gray-300">
              Academic performance vs risk score correlation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart data={scatterData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="x"
                  name="Academic Performance"
                  stroke="#9ca3af"
                  label={{ value: 'Academic Performance (%)', position: 'insideBottom', offset: -5, fill: '#9ca3af' }}
                />
                <YAxis
                  dataKey="y"
                  name="Risk Score"
                  stroke="#9ca3af"
                  label={{ value: 'Risk Score (%)', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }}
                  formatter={(value, name) => [
                    `${value.toFixed(1)}%`,
                    name === 'y' ? 'Risk Score' : 'Academic Performance'
                  ]}
                />
                <Scatter
                  dataKey="y"
                  fill={(entry) =>
                    entry.risk === 'high' ? '#ef4444' :
                      entry.risk === 'medium' ? '#f59e0b' : '#10b981'
                  }
                />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Department Risk Comparison */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-400" />
            Department Risk Comparison
          </CardTitle>
          <CardDescription className="text-gray-300">
            Risk level distribution across academic departments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {comparisonData && (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={comparisonData.comparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="category" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }}
                />
                <Bar dataKey="lowRisk" stackId="a" fill="#10b981" name="Low Risk" />
                <Bar dataKey="mediumRisk" stackId="a" fill="#f59e0b" name="Medium Risk" />
                <Bar dataKey="highRisk" stackId="a" fill="#ef4444" name="High Risk" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Model Performance Metrics */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-400" />
            AI Model Performance
          </CardTitle>
          <CardDescription className="text-gray-300">
            Detailed metrics and confusion matrix
          </CardDescription>
        </CardHeader>
        <CardContent>
          {modelMetrics && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="text-2xl font-bold text-blue-400">{modelMetrics.totalStudents || 0}</div>
                  <div className="text-sm text-gray-300">Total Students</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="text-2xl font-bold text-green-400">{modelMetrics.riskPercentages?.low || 0}%</div>
                  <div className="text-sm text-gray-300">Low Risk</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <div className="text-2xl font-bold text-yellow-400">{modelMetrics.riskPercentages?.medium || 0}%</div>
                  <div className="text-sm text-gray-300">Medium Risk</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="text-2xl font-bold text-red-400">{modelMetrics.riskPercentages?.high || 0}%</div>
                  <div className="text-sm text-gray-300">High Risk</div>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <p className="text-gray-300 text-sm"><span className="text-white font-medium">Model:</span> {modelMetrics.modelDescription}</p>
                <p className="text-gray-300 text-sm mt-1"><span className="text-white font-medium">Factors:</span> {modelMetrics.factors}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RiskAnalysis;
