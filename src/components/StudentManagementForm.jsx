
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
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Manual Student Entry Form */}
      <Card className="bg-card backdrop-blur-3xl border-border text-foreground shadow-xl overflow-hidden">
        <CardHeader className="p-8 border-b border-border bg-muted/30">
          <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Plus className="h-5 w-5" />
            </div>
            Add New Student
          </CardTitle>
          <CardDescription className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mt-2">
            Manually add student information to the database
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Student ID *</Label>
              <Input
                name="student_id"
                value={formData.student_id}
                onChange={handleInputChange}
                placeholder="e.g. STU001"
                className="h-14 bg-muted border-border text-foreground placeholder:text-muted-foreground/30 rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-medium px-4"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Name *</Label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter full name"
                className="h-14 bg-muted border-border text-foreground placeholder:text-muted-foreground/30 rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-medium px-4"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email</Label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="student@university.edu"
                className="h-14 bg-muted border-border text-foreground placeholder:text-muted-foreground/30 rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-medium px-4"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Department *</Label>
              <Input
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                placeholder="e.g. Computer Science"
                className="h-14 bg-muted border-border text-foreground placeholder:text-muted-foreground/30 rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-medium px-4"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Year *</Label>
              <Select onValueChange={(value) => handleSelectChange('year', value)}>
                <SelectTrigger className="h-14 bg-muted border-border text-foreground rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-medium px-4">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground rounded-2xl shadow-2xl">
                  <SelectItem value="1">1st Year</SelectItem>
                  <SelectItem value="2">2nd Year</SelectItem>
                  <SelectItem value="3">3rd Year</SelectItem>
                  <SelectItem value="4">4th Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">GPA</Label>
              <Input
                name="gpa"
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={formData.gpa}
                onChange={handleInputChange}
                placeholder="0.00"
                className="h-14 bg-muted border-border text-foreground placeholder:text-muted-foreground/30 rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-medium px-4"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Attendance Rate (%)</Label>
              <Input
                name="attendance_rate"
                type="number"
                min="0"
                max="100"
                value={formData.attendance_rate}
                onChange={handleInputChange}
                placeholder="0 - 100"
                className="h-14 bg-muted border-border text-foreground placeholder:text-muted-foreground/30 rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-medium px-4"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Engagement Score</Label>
              <Input
                name="engagement_score"
                type="number"
                min="0"
                max="100"
                value={formData.engagement_score}
                onChange={handleInputChange}
                placeholder="0 - 100"
                className="h-14 bg-muted border-border text-foreground placeholder:text-muted-foreground/30 rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-medium px-4"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Risk Level</Label>
              <Select onValueChange={(value) => handleSelectChange('risk_level', value)}>
                <SelectTrigger className="h-14 bg-muted border-border text-foreground rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-medium px-4">
                  <SelectValue placeholder="Select risk level" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground rounded-2xl shadow-2xl">
                  <SelectItem value="low">Low Risk</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && (
              <div className="md:col-span-2">
                <Alert className="bg-destructive/10 border-destructive/20 rounded-2xl">
                  <AlertDescription className="text-destructive font-bold text-sm">
                    {error}
                  </AlertDescription>
                </Alert>
              </div>
            )}

            <div className="md:col-span-2 pt-4">
              <Button
                type="submit"
                className="h-14 px-8 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/10 transition-all active:scale-95"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    <span>Add Student Record</span>
                  </div>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* File Upload Section */}
      <Card className="bg-card backdrop-blur-3xl border-border text-foreground shadow-xl overflow-hidden group">
        <CardHeader className="p-8 border-b border-border bg-muted/30">
          <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
            <div className="p-2 rounded-xl bg-success/10 text-success">
              <Upload className="h-5 w-5" />
            </div>
            Bulk Upload Students
          </CardTitle>
          <CardDescription className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mt-2">
            Upload CSV/Excel file with student data
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <div className="space-y-6">
            <div className="border-2 border-dashed border-border hover:border-primary/40 rounded-3xl p-10 text-center transition-all group/drop">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover/drop:scale-110 transition-transform">
                <FileSpreadsheet className="h-8 w-8 text-primary" />
              </div>
              <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-6">
                Drop your CSV file here or click to browse
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
                className="cursor-pointer inline-flex items-center px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-2xl transition-all font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/10 active:scale-95"
              >
                {uploadLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    <span>Choose File</span>
                  </div>
                )}
              </label>
            </div>

            <div className="p-6 rounded-3xl bg-muted border border-border">
              <p className="text-[10px] font-black uppercase tracking-widest text-foreground mb-3">Expected CSV Schema</p>
              <code className="block bg-background p-4 rounded-2xl text-[10px] font-mono text-muted-foreground border border-border leading-relaxed">
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
