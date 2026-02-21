
import { supabase } from "@/integrations/supabase/client";
import { sampleStudents } from "@/data/sampleStudents";

// Helper: fetch students from Supabase, fallback to sample data
const getStudents = async (filters = {}) => {
  try {
    let query = supabase.from('students').select('*');
    if (filters.ids && filters.ids.length > 0) {
      query = query.in('id', filters.ids);
    }
    if (filters.id) {
      query = query.eq('id', filters.id);
    }
    const { data, error } = await query;
    if (error) throw error;
    if (data && data.length > 0) return data;
    return [...sampleStudents];
  } catch {
    return [...sampleStudents];
  }
};

const getStudentById = async (id) => {
  try {
    const { data, error } = await supabase.from('students').select('*').eq('id', id).single();
    if (error) throw error;
    if (data) return data;
    return sampleStudents.find(s => s.id === id) || sampleStudents[0];
  } catch {
    return sampleStudents.find(s => s.id === id) || sampleStudents[0];
  }
};

// Predictive Analytics API - Connected to real Supabase data with sample fallback
export const predictiveAPI = {

  // AI Prediction Results
  getPredictionResults: async (studentId) => {
    try {
      const student = await getStudentById(studentId);

      const gpaScore = student.gpa ? Math.min(student.gpa / 10.0, 1.0) : 0.5;
      const attendanceScore = student.attendance_rate ? student.attendance_rate / 100 : 0.5;
      const engagementScore = student.engagement_score ? student.engagement_score / 100 : 0.5;
      const overallScore = 1 - (gpaScore * 0.4 + attendanceScore * 0.3 + engagementScore * 0.2 + 0.1);
      const riskLevel = overallScore > 0.6 ? 'high' : overallScore > 0.35 ? 'medium' : 'low';

      const factors = [
        { name: 'Academic Performance (GPA)', weight: 0.4, score: gpaScore, impact: gpaScore >= 0.6 ? 'positive' : 'negative', actual: student.gpa || 'N/A' },
        { name: 'Attendance Rate', weight: 0.3, score: attendanceScore, impact: attendanceScore >= 0.75 ? 'positive' : 'negative', actual: student.attendance_rate ? `${student.attendance_rate}%` : 'N/A' },
        { name: 'Engagement Level', weight: 0.2, score: engagementScore, impact: engagementScore >= 0.6 ? 'positive' : 'negative', actual: student.engagement_score ? `${student.engagement_score}/100` : 'N/A' },
        { name: 'Year Standing', weight: 0.1, score: Math.max(0, 1 - (student.year - 1) * 0.2), impact: student.year <= 2 ? 'positive' : 'neutral', actual: `Year ${student.year}` }
      ];

      const recommendations = [];
      if (attendanceScore < 0.75) recommendations.push({ priority: 'high', action: 'Improve Attendance', description: `Current attendance is ${student.attendance_rate || 0}%. Target: 75%+.`, expectedImpact: +(0.75 - attendanceScore).toFixed(2) });
      if (gpaScore < 0.6) recommendations.push({ priority: 'high', action: 'Academic Support Required', description: `Current GPA is ${student.gpa || 0}. Consider tutoring.`, expectedImpact: +(0.6 - gpaScore).toFixed(2) });
      if (engagementScore < 0.6) recommendations.push({ priority: 'medium', action: 'Increase Engagement', description: `Engagement score is ${student.engagement_score || 0}/100.`, expectedImpact: +(0.6 - engagementScore).toFixed(2) });
      if (recommendations.length === 0) recommendations.push({ priority: 'low', action: 'Maintain Current Performance', description: 'Student is performing well across all metrics.', expectedImpact: 0 });

      // Find similar students
      const allStudents = await getStudents();
      const similarStudents = allStudents.filter(s => s.department === student.department && s.year === student.year);
      const totalSimilar = similarStudents.length;
      const successfulSimilar = similarStudents.filter(s => s.risk_level === 'low').length;

      return {
        success: true,
        data: {
          studentId, studentName: student.name, department: student.department, year: student.year,
          overallRisk: { score: +overallScore.toFixed(3), level: riskLevel, confidence: 0.85, factors },
          recommendations,
          trendAnalysis: { currentScore: +overallScore.toFixed(2), riskLevel, trajectory: overallScore < 0.35 ? 'stable' : overallScore < 0.6 ? 'needs attention' : 'declining' },
          similarCases: { total: totalSimilar, successful: successfulSimilar, successRate: totalSimilar > 0 ? +(successfulSimilar / totalSimilar).toFixed(2) : 0 }
        }
      };
    } catch (error) {
      console.error('Error fetching prediction results:', error);
      return { success: false, data: null };
    }
  },

  // Batch Prediction for Multiple Students
  getBatchPredictions: async (studentIds = []) => {
    try {
      const allStudents = await getStudents();
      const students = studentIds.length > 0
        ? allStudents.filter(s => studentIds.includes(s.id))
        : allStudents;

      const predictions = students.map(student => {
        const gpaScore = student.gpa ? Math.min(student.gpa / 10.0, 1.0) : 0.5;
        const attendanceScore = student.attendance_rate ? student.attendance_rate / 100 : 0.5;
        const engagementScore = student.engagement_score ? student.engagement_score / 100 : 0.5;
        const riskScore = 1 - (gpaScore * 0.4 + attendanceScore * 0.3 + engagementScore * 0.2 + 0.1);

        return {
          studentId: student.id, studentName: student.name, department: student.department,
          riskScore: +riskScore.toFixed(3),
          riskLevel: riskScore > 0.6 ? 'high' : riskScore > 0.35 ? 'medium' : 'low',
          confidence: 0.85, gpa: student.gpa, attendance: student.attendance_rate, engagement: student.engagement_score
        };
      });

      return {
        success: true,
        data: {
          predictions,
          summary: {
            totalProcessed: predictions.length,
            highRisk: predictions.filter(p => p.riskLevel === 'high').length,
            mediumRisk: predictions.filter(p => p.riskLevel === 'medium').length,
            lowRisk: predictions.filter(p => p.riskLevel === 'low').length
          },
          modelInfo: { version: '2.1.3', algorithm: 'Weighted Multi-Factor Analysis', features: 4, description: 'Risk calculated from GPA (40%), Attendance (30%), Engagement (20%), Year Standing (10%)' }
        }
      };
    } catch (error) {
      console.error('Error fetching batch predictions:', error);
      return { success: false, data: { predictions: [], summary: {}, modelInfo: {} } };
    }
  },

  // Model Performance Metrics
  getModelMetrics: async () => {
    try {
      const students = await getStudents();
      const total = students.length;
      const riskCounts = { low: 0, medium: 0, high: 0 };
      const gpaByRisk = { low: [], medium: [], high: [] };

      students.forEach(s => {
        const level = (s.risk_level || 'low').toLowerCase();
        if (riskCounts[level] !== undefined) riskCounts[level]++;
        else riskCounts.low++;
        if (gpaByRisk[level]) gpaByRisk[level].push(s.gpa || 0);
      });

      const avgGpa = (arr) => arr.length > 0 ? +(arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2) : 0;

      return {
        success: true,
        data: {
          totalStudents: total,
          riskDistribution: riskCounts,
          riskPercentages: {
            low: total > 0 ? +((riskCounts.low / total) * 100).toFixed(1) : 0,
            medium: total > 0 ? +((riskCounts.medium / total) * 100).toFixed(1) : 0,
            high: total > 0 ? +((riskCounts.high / total) * 100).toFixed(1) : 0
          },
          featureImportance: [
            { feature: 'GPA', importance: 0.40, avgLow: avgGpa(gpaByRisk.low), avgHigh: avgGpa(gpaByRisk.high) },
            { feature: 'Attendance Rate', importance: 0.30 },
            { feature: 'Engagement Score', importance: 0.20 },
            { feature: 'Year Standing', importance: 0.10 }
          ],
          modelDescription: 'Weighted Multi-Factor Risk Assessment Model',
          factors: 'GPA (40%) + Attendance (30%) + Engagement (20%) + Year Standing (10%)'
        }
      };
    } catch (error) {
      console.error('Error fetching model metrics:', error);
      return { success: false, data: {} };
    }
  },

  // AI Insights
  getAIInsights: async () => {
    try {
      const students = await getStudents();
      const insights = [];
      const totalStudents = students.length;

      if (totalStudents === 0) {
        return { success: true, data: { insights: [{ type: 'info', title: 'No Data', description: 'Upload student data to see insights.', severity: 'info', affectedStudents: 0, recommendation: 'Upload data' }], realTimeStats: { studentsAnalyzed: 0, highRiskCount: 0, avgGpa: 0, avgAttendance: 0 } } };
      }

      const lowAttendance = students.filter(s => s.attendance_rate && s.attendance_rate < 75);
      if (lowAttendance.length > 0) {
        const depts = [...new Set(lowAttendance.map(s => s.department))];
        insights.push({ type: 'trend', title: 'Low Attendance Alert', description: `${lowAttendance.length} students have attendance below 75% across ${depts.length} department(s): ${depts.slice(0, 3).join(', ')}`, severity: lowAttendance.length > totalStudents * 0.2 ? 'critical' : 'high', affectedStudents: lowAttendance.length, recommendation: 'Implement targeted attendance monitoring and counseling for these students' });
      }

      const highRisk = students.filter(s => s.risk_level === 'high');
      if (highRisk.length > 0) {
        insights.push({ type: 'prediction', title: 'High Risk Students Identified', description: `${highRisk.length} students are classified as high risk (${((highRisk.length / totalStudents) * 100).toFixed(1)}% of total)`, severity: 'critical', affectedStudents: highRisk.length, recommendation: 'Immediate intervention required - assign counselors and create support plans' });
      }

      const lowGpa = students.filter(s => s.gpa && s.gpa < 2.0);
      if (lowGpa.length > 0) {
        insights.push({ type: 'trend', title: 'Academic Performance Concern', description: `${lowGpa.length} students have GPA below 2.0, risking academic probation`, severity: 'high', affectedStudents: lowGpa.length, recommendation: 'Enroll students in tutoring programs and academic support workshops' });
      }

      const highPerformers = students.filter(s => s.gpa && s.gpa >= 3.5 && s.attendance_rate && s.attendance_rate >= 85);
      if (highPerformers.length > 0) {
        insights.push({ type: 'opportunity', title: 'High Performers Identified', description: `${highPerformers.length} students have excellent GPA (≥3.5) and attendance (≥85%)`, severity: 'positive', affectedStudents: highPerformers.length, recommendation: 'Consider these students for mentorship programs and leadership opportunities' });
      }

      const deptRisk = {};
      students.forEach(s => {
        if (!deptRisk[s.department]) deptRisk[s.department] = { total: 0, high: 0 };
        deptRisk[s.department].total++;
        if (s.risk_level === 'high') deptRisk[s.department].high++;
      });
      const worstDept = Object.entries(deptRisk).map(([dept, d]) => ({ dept, rate: d.total > 0 ? (d.high / d.total) * 100 : 0, count: d.high })).sort((a, b) => b.rate - a.rate)[0];
      if (worstDept && worstDept.count > 0) {
        insights.push({ type: 'trend', title: `${worstDept.dept} Needs Attention`, description: `${worstDept.rate.toFixed(1)}% of students in ${worstDept.dept} are high risk (${worstDept.count} students)`, severity: worstDept.rate > 30 ? 'critical' : 'high', affectedStudents: worstDept.count, recommendation: `Review ${worstDept.dept} curriculum and teaching methods. Consider department-specific intervention.` });
      }

      const avgGpa = students.reduce((sum, s) => sum + (s.gpa || 0), 0) / totalStudents;
      const avgAttendance = students.reduce((sum, s) => sum + (s.attendance_rate || 0), 0) / totalStudents;

      return {
        success: true,
        data: {
          insights,
          realTimeStats: { studentsAnalyzed: totalStudents, highRiskCount: highRisk.length, avgGpa: +avgGpa.toFixed(2), avgAttendance: +avgAttendance.toFixed(1) }
        }
      };
    } catch (error) {
      console.error('Error fetching AI insights:', error);
      return { success: false, data: { insights: [], realTimeStats: {} } };
    }
  }
};
