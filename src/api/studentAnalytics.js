
import { supabase } from "@/integrations/supabase/client";
import { sampleStudents } from "@/data/sampleStudents";

// Helper: fetch students from Supabase, fallback to sample data
const getStudents = async (selectFields = '*', filters = {}) => {
  try {
    let query = supabase.from('students').select(selectFields);
    if (filters.department && filters.department !== 'all') {
      query = query.eq('department', filters.department);
    }
    const { data, error } = await query;
    if (error) throw error;
    if (data && data.length > 0) return data;
    // Fallback to sample data
    let result = [...sampleStudents];
    if (filters.department && filters.department !== 'all') {
      result = result.filter(s => s.department === filters.department);
    }
    return result;
  } catch {
    // Supabase unreachable, use sample data
    let result = [...sampleStudents];
    if (filters.department && filters.department !== 'all') {
      result = result.filter(s => s.department === filters.department);
    }
    return result;
  }
};

// Student Analytics API - Connected to real Supabase data with sample fallback
export const studentAnalyticsAPI = {

  // Student Performance Trends - Real data grouped by year
  getPerformanceTrends: async (studentId = null, timeframe = '6months') => {
    try {
      const students = await getStudents();

      // Group by year and compute avg GPA & attendance
      const yearGroups = {};
      students.forEach(s => {
        const yearKey = `Year ${s.year}`;
        if (!yearGroups[yearKey]) {
          yearGroups[yearKey] = { gpas: [], attendances: [] };
        }
        if (s.gpa != null) yearGroups[yearKey].gpas.push(s.gpa);
        if (s.attendance_rate != null) yearGroups[yearKey].attendances.push(s.attendance_rate);
      });

      const labels = Object.keys(yearGroups).sort();
      const gpaData = labels.map(label => {
        const gpas = yearGroups[label].gpas;
        return gpas.length > 0 ? +(gpas.reduce((a, b) => a + b, 0) / gpas.length).toFixed(2) : 0;
      });
      const attendanceData = labels.map(label => {
        const atts = yearGroups[label].attendances;
        return atts.length > 0 ? +(atts.reduce((a, b) => a + b, 0) / atts.length).toFixed(1) : 0;
      });

      return {
        success: true,
        data: {
          labels: labels.length > 0 ? labels : ['No Data'],
          datasets: [
            {
              label: 'Average GPA',
              data: gpaData.length > 0 ? gpaData : [0],
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              tension: 0.4
            },
            {
              label: 'Average Attendance %',
              data: attendanceData.length > 0 ? attendanceData : [0],
              borderColor: '#8b5cf6',
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
              tension: 0.4
            }
          ]
        }
      };
    } catch (error) {
      console.error('Error fetching performance trends:', error);
      return { success: false, data: { labels: ['Error'], datasets: [{ label: 'GPA', data: [0] }, { label: 'Attendance', data: [0] }] } };
    }
  },

  // Risk Heat Map Data
  getRiskHeatMap: async (department = 'all') => {
    try {
      const students = await getStudents('*', { department });

      const departments = [...new Set(students.map(s => s.department))].sort();
      const years = [...new Set(students.map(s => s.year))].sort();

      const heatMapData = [];
      departments.forEach(dept => {
        years.forEach(year => {
          const deptYearStudents = students.filter(s => s.department === dept && s.year === year);
          const total = deptYearStudents.length;
          const atRisk = deptYearStudents.filter(s => s.risk_level === 'high' || s.risk_level === 'medium').length;
          const percentage = total > 0 ? Math.round((atRisk / total) * 100) : 0;

          let risk = 'low';
          if (percentage > 40) risk = 'high';
          else if (percentage > 20) risk = 'medium';

          heatMapData.push({
            x: dept,
            y: `Year ${year}`,
            value: percentage,
            risk: risk,
            total: total,
            atRisk: atRisk
          });
        });
      });

      return {
        success: true,
        data: {
          heatMapData,
          colorScale: { low: '#10b981', medium: '#f59e0b', high: '#ef4444' },
          departments,
          years: years.map(y => `Year ${y}`)
        }
      };
    } catch (error) {
      console.error('Error fetching risk heatmap:', error);
      return { success: false, data: { heatMapData: [], colorScale: {}, departments: [], years: [] } };
    }
  },

  // Department Distribution
  getDepartmentDistribution: async () => {
    try {
      const students = await getStudents();
      const COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6'];
      const deptMap = {};
      students.forEach(s => {
        if (!deptMap[s.department]) {
          deptMap[s.department] = { total: 0, atRisk: 0 };
        }
        deptMap[s.department].total++;
        if (s.risk_level === 'high' || s.risk_level === 'medium') {
          deptMap[s.department].atRisk++;
        }
      });

      const departments = Object.entries(deptMap).map(([name, data]) => ({
        name, total: data.total, atRisk: data.atRisk,
        percentage: data.total > 0 ? +((data.atRisk / data.total) * 100).toFixed(1) : 0
      })).sort((a, b) => b.total - a.total);

      const chartData = departments.map((dept, index) => ({
        label: dept.name, name: dept.name, value: dept.total, color: COLORS[index % COLORS.length]
      }));

      return {
        success: true,
        data: {
          departments,
          chartData: chartData.length > 0 ? chartData : [{ label: 'No Data', name: 'No Data', value: 0, color: '#6b7280' }]
        }
      };
    } catch (error) {
      console.error('Error fetching department distribution:', error);
      return { success: false, data: { departments: [], chartData: [] } };
    }
  },

  // Risk Comparison Analytics
  getRiskComparison: async (compareBy = 'department') => {
    try {
      const students = await getStudents();
      const deptMap = {};
      students.forEach(s => {
        if (!deptMap[s.department]) {
          deptMap[s.department] = { low: 0, medium: 0, high: 0, total: 0 };
        }
        deptMap[s.department].total++;
        const level = (s.risk_level || 'low').toLowerCase();
        if (deptMap[s.department][level] !== undefined) deptMap[s.department][level]++;
        else deptMap[s.department].low++;
      });

      const comparison = Object.entries(deptMap).map(([category, data]) => ({
        category,
        lowRisk: data.total > 0 ? Math.round((data.low / data.total) * 100) : 0,
        mediumRisk: data.total > 0 ? Math.round((data.medium / data.total) * 100) : 0,
        highRisk: data.total > 0 ? Math.round((data.high / data.total) * 100) : 0,
        total: data.total
      }));

      const totalStudents = students.length;
      const lowCount = students.filter(s => (s.risk_level || 'low') === 'low').length;
      const medCount = students.filter(s => s.risk_level === 'medium').length;
      const highCount = students.filter(s => s.risk_level === 'high').length;

      return {
        success: true,
        data: {
          comparison,
          trends: {
            improving: totalStudents > 0 ? Math.round((lowCount / totalStudents) * 100) : 0,
            stable: totalStudents > 0 ? Math.round((medCount / totalStudents) * 100) : 0,
            declining: totalStudents > 0 ? Math.round((highCount / totalStudents) * 100) : 0
          }
        }
      };
    } catch (error) {
      console.error('Error fetching risk comparison:', error);
      return { success: false, data: { comparison: [], trends: { improving: 0, stable: 0, declining: 0 } } };
    }
  }
};
