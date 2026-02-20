
import { supabase } from "@/integrations/supabase/client";
import { sampleStudents } from "@/data/sampleStudents";

// Helper: fetch students from Supabase, fallback to sample data
const getStudents = async () => {
  try {
    const { data, error } = await supabase.from('students').select('*');
    if (error) throw error;
    if (data && data.length > 0) return data;
    return [...sampleStudents];
  } catch {
    return [...sampleStudents];
  }
};

// Geographic and Distribution API
export const geographicAPI = {

  // Student Distribution by Department
  getGlobeData: async () => {
    try {
      const students = await getStudents();

      const deptMap = {};
      students.forEach(s => {
        if (!deptMap[s.department]) {
          deptMap[s.department] = { students: 0, atRisk: 0, years: new Set() };
        }
        deptMap[s.department].students++;
        if (s.risk_level === 'high' || s.risk_level === 'medium') {
          deptMap[s.department].atRisk++;
        }
        deptMap[s.department].years.add(s.year);
      });

      const studentLocations = Object.entries(deptMap).map(([department, data]) => ({
        country: department,
        students: data.students,
        atRisk: data.atRisk,
        universities: data.years.size,
        yearsActive: [...data.years].sort().join(', ')
      })).sort((a, b) => b.students - a.students);

      return {
        success: true,
        data: {
          studentLocations: studentLocations.length > 0 ? studentLocations : [
            { country: 'No Data', students: 0, atRisk: 0, universities: 0 }
          ],
          heatMapPoints: studentLocations.map(loc => ({
            department: loc.country,
            intensity: loc.students > 0 ? +(loc.atRisk / loc.students).toFixed(2) : 0
          }))
        }
      };
    } catch (error) {
      console.error('Error fetching distribution data:', error);
      return { success: false, data: { studentLocations: [], heatMapPoints: [] } };
    }
  },

  // Demographic Distribution
  getDemographicDistribution: async (region = 'global') => {
    try {
      const students = await getStudents();

      const deptGroups = {};
      students.forEach(s => {
        if (!deptGroups[s.department]) {
          deptGroups[s.department] = { total: 0, low: 0, medium: 0, high: 0, yearDist: {} };
        }
        deptGroups[s.department].total++;
        const level = (s.risk_level || 'low').toLowerCase();
        if (deptGroups[s.department][level] !== undefined) deptGroups[s.department][level]++;
        const yearKey = `Year ${s.year}`;
        if (!deptGroups[s.department].yearDist[yearKey]) deptGroups[s.department].yearDist[yearKey] = 0;
        deptGroups[s.department].yearDist[yearKey]++;
      });

      const regions = Object.entries(deptGroups).map(([name, data]) => ({
        name, totalStudents: data.total,
        riskBreakdown: { low: data.low, medium: data.medium, high: data.high },
        yearDistribution: data.yearDist
      }));

      const yearRisk = {};
      students.forEach(s => {
        const yearKey = `Year ${s.year}`;
        if (!yearRisk[yearKey]) yearRisk[yearKey] = 0;
        if (s.risk_level === 'high' || s.risk_level === 'medium') yearRisk[yearKey]++;
      });
      const yearLabels = Object.keys(yearRisk).sort();

      return {
        success: true,
        data: {
          regions,
          timeSeriesData: {
            labels: yearLabels.length > 0 ? yearLabels : ['No Data'],
            datasets: [{ label: 'At Risk Students', data: yearLabels.map(y => yearRisk[y]), borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)' }]
          }
        }
      };
    } catch (error) {
      console.error('Error fetching demographic distribution:', error);
      return { success: false, data: { regions: [], timeSeriesData: { labels: [], datasets: [] } } };
    }
  },

  // Real-time Summary Updates
  getRealTimeUpdates: async () => {
    try {
      const students = await getStudents();

      const recentStudents = [...students]
        .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
        .slice(0, 5);

      const liveUpdates = recentStudents.map(s => ({
        timestamp: s.updated_at || s.created_at,
        location: s.department,
        event: 'Student record updated',
        riskLevel: s.risk_level || 'low',
        details: `${s.name} - ${s.department}`
      }));

      const deptActivity = {};
      students.forEach(s => {
        if (!deptActivity[s.department]) deptActivity[s.department] = { active: 0, atRisk: 0 };
        deptActivity[s.department].active++;
        if (s.risk_level === 'high' || s.risk_level === 'medium') deptActivity[s.department].atRisk++;
      });

      const activeRegions = Object.entries(deptActivity)
        .map(([region, data]) => ({
          region, activeUsers: data.active, atRisk: data.atRisk,
          trend: data.atRisk / data.active > 0.3 ? 'concern' : data.atRisk / data.active > 0.15 ? 'stable' : 'good'
        }))
        .sort((a, b) => b.activeUsers - a.activeUsers);

      return {
        success: true,
        data: { liveUpdates, activeRegions }
      };
    } catch (error) {
      console.error('Error fetching real-time updates:', error);
      return { success: false, data: { liveUpdates: [], activeRegions: [] } };
    }
  }
};
