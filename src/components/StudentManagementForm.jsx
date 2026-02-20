
import React, { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Upload, FileSpreadsheet } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const StudentManagementForm = ({ onStudentAdded }) => {
  const [formData, setFormData] = useState({
    student_id: '',
    name: '',
    email: '',
    department: '',
    year: '',
    gpa: '',
    attendance_rate: '',
    engagement_score: '',
    risk_level: 'low'
  });
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase
        .from('students')
        .insert([{
          ...formData,
          year: parseInt(formData.year),
          gpa: formData.gpa ? parseFloat(formData.gpa) : null,
          attendance_rate: formData.attendance_rate ? parseFloat(formData.attendance_rate) : null,
          engagement_score: formData.engagement_score ? parseFloat(formData.engagement_score) : null,
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Student added successfully!",
      });

      // Reset form
      setFormData({
        student_id: '',
        name: '',
        email: '',
        department: '',
        year: '',
        gpa: '',
        attendance_rate: '',
        engagement_score: '',
        risk_level: 'low'
      });

      onStudentAdded && onStudentAdded();
    } catch (error) {
      setError(error.message);
      toast({
        title: "Error",
        description: "Failed to add student",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadLoading(true);
    setError('');

    try {
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      const students = [];
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(',').map(v => v.trim());
          const student = {};
          
          headers.forEach((header, index) => {
            switch (header.toLowerCase()) {
              case 'student_id':
                student.student_id = values[index];
                break;
              case 'name':
                student.name = values[index];
                break;
              case 'email':
                student.email = values[index];
                break;
              case 'department':
                student.department = values[index];
                break;
              case 'year':
                student.year = parseInt(values[index]) || 1;
                break;
              case 'gpa':
                student.gpa = parseFloat(values[index]) || null;
                break;
              case 'attendance_rate':
                student.attendance_rate = parseFloat(values[index]) || null;
                break;
              case 'engagement_score':
                student.engagement_score = parseFloat(values[index]) || null;
                break;
              case 'risk_level':
                student.risk_level = values[index] || 'low';
                break;
            }
          });
          
          if (student.student_id && student.name && student.department) {
            students.push(student);
          }
        }
      }

      if (students.length > 0) {
        const { error } = await supabase
          .from('students')
          .insert(students);

        if (error) throw error;

        toast({
          title: "Success",
          description: `${students.length} students uploaded successfully!`,
        });

        onStudentAdded && onStudentAdded();
      } else {
        throw new Error('No valid student data found in file');
      }
    } catch (error) {
      setError(error.message);
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Manual Student Entry Form */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Student
          </CardTitle>
          <CardDescription className="text-gray-300">
            Manually add student information to the database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Student ID *</Label>
              <Input
                name="student_id"
                value={formData.student_id}
                onChange={handleInputChange}
                className="bg-white/10 border-white/20 text-white"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-white">Name *</Label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="bg-white/10 border-white/20 text-white"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-white">Email</Label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-white">Department *</Label>
              <Input
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className="bg-white/10 border-white/20 text-white"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-white">Year *</Label>
              <Select onValueChange={(value) => handleSelectChange('year', value)}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1st Year</SelectItem>
                  <SelectItem value="2">2nd Year</SelectItem>
                  <SelectItem value="3">3rd Year</SelectItem>
                  <SelectItem value="4">4th Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-white">GPA</Label>
              <Input
                name="gpa"
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={formData.gpa}
                onChange={handleInputChange}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-white">Attendance Rate (%)</Label>
              <Input
                name="attendance_rate"
                type="number"
                min="0"
                max="100"
                value={formData.attendance_rate}
                onChange={handleInputChange}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-white">Engagement Score</Label>
              <Input
                name="engagement_score"
                type="number"
                min="0"
                max="100"
                value={formData.engagement_score}
                onChange={handleInputChange}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-white">Risk Level</Label>
              <Select onValueChange={(value) => handleSelectChange('risk_level', value)}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select risk level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && (
              <div className="md:col-span-2">
                <Alert className="bg-red-500/20 border-red-500/50">
                  <AlertDescription className="text-red-300">
                    {error}
                  </AlertDescription>
                </Alert>
              </div>
            )}

            <div className="md:col-span-2">
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? 'Adding Student...' : 'Add Student'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* File Upload Section */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Bulk Upload Students
          </CardTitle>
          <CardDescription className="text-gray-300">
            Upload CSV/Excel file with student data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
              <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-blue-400" />
              <p className="text-gray-300 mb-4">
                Upload a CSV file with student data
              </p>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                disabled={uploadLoading}
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
              >
                {uploadLoading ? 'Uploading...' : 'Choose File'}
              </label>
            </div>
            
            <div className="text-sm text-gray-400">
              <p className="font-medium mb-2">Expected CSV format:</p>
              <code className="block bg-black/20 p-2 rounded text-xs">
                student_id,name,email,department,year,gpa,attendance_rate,engagement_score,risk_level
              </code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentManagementForm;
