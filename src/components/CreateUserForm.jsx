
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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            onClick={() => navigate('/adminDashboard')}
            variant="outline"
            className="border-border text-foreground hover:bg-muted rounded-2xl font-black uppercase tracking-widest text-[10px] h-11 px-5 transition-all"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="h-10 w-[1px] bg-border"></div>
          <h1 className="text-3xl font-black text-foreground tracking-tighter uppercase">Create New Student</h1>
        </div>

        <Card className="bg-card backdrop-blur-3xl border-border text-foreground shadow-xl overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-primary via-indigo-500 to-accent"></div>
          <CardHeader className="p-8 border-b border-border bg-muted/30">
            <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <UserPlus className="h-5 w-5" />
              </div>
              Student Information Form
            </CardTitle>
            <CardDescription className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mt-2">
              Fill in the student details to create a new record
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
                  className="h-14 bg-muted border-border text-foreground placeholder:text-muted-foreground/30 rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-medium px-4"
                  placeholder="Enter student ID"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name *</Label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="h-14 bg-muted border-border text-foreground placeholder:text-muted-foreground/30 rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-medium px-4"
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</Label>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="h-14 bg-muted border-border text-foreground placeholder:text-muted-foreground/30 rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-medium px-4"
                  placeholder="Enter email address"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Department *</Label>
                <Input
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="h-14 bg-muted border-border text-foreground placeholder:text-muted-foreground/30 rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-medium px-4"
                  placeholder="e.g., Computer Science"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Academic Year *</Label>
                <Select onValueChange={(value) => handleSelectChange('year', value)} required>
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
                  className="h-14 bg-muted border-border text-foreground placeholder:text-muted-foreground/30 rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-medium px-4"
                  placeholder="e.g., 3.45"
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
                  className="h-14 bg-muted border-border text-foreground placeholder:text-muted-foreground/30 rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-medium px-4"
                  placeholder="e.g., 85"
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
                  className="h-14 bg-muted border-border text-foreground placeholder:text-muted-foreground/30 rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-medium px-4"
                  placeholder="e.g., 78"
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

              <div className="md:col-span-2 flex gap-4 pt-4">
                <Button
                  type="submit"
                  className="h-14 px-8 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/10 transition-all active:scale-95"
                  disabled={loading}
                >
                  {loading ? 'Creating Student...' : 'Create Student'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-14 px-8 border-border text-foreground hover:bg-muted rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
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

