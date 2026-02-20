
import React, { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, UserPlus } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';

const CreateUserForm = () => {
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
  const [error, setError] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

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
        description: "Student created successfully!",
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
    } catch (error) {
      setError(error.message);
      toast({
        title: "Error",
        description: "Failed to create student",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            onClick={() => navigate('/adminDashboard')}
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-white">Create New Student</h1>
        </div>

        <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Student Information Form
            </CardTitle>
            <CardDescription className="text-gray-300">
              Fill in the student details to create a new record
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-white">Student ID *</Label>
                <Input
                  name="student_id"
                  value={formData.student_id}
                  onChange={handleInputChange}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  placeholder="Enter student ID"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-white">Full Name *</Label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  placeholder="Enter full name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-white">Email Address</Label>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  placeholder="Enter email address"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-white">Department *</Label>
                <Input
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  placeholder="e.g., Computer Science"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-white">Academic Year *</Label>
                <Select onValueChange={(value) => handleSelectChange('year', value)} required>
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
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  placeholder="e.g., 3.45"
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
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  placeholder="e.g., 85"
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
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  placeholder="e.g., 78"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-white">Risk Level</Label>
                <Select onValueChange={(value) => handleSelectChange('risk_level', value)}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select risk level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low Risk</SelectItem>
                    <SelectItem value="medium">Medium Risk</SelectItem>
                    <SelectItem value="high">High Risk</SelectItem>
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

              <div className="md:col-span-2 flex gap-4">
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={loading}
                >
                  {loading ? 'Creating Student...' : 'Create Student'}
                </Button>
                <Button 
                  type="button"
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  onClick={() => navigate('/')}
                >
                  View Public Dashboard
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateUserForm;
