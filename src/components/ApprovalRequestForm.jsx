
import React, { useState } from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/components/ui/use-toast";

const ApprovalRequestForm = ({ onClose, student = null, requestType = 'create_student' }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: student?.name || '',
    student_id: student?.student_id || '',
    email: student?.email || '',
    department: student?.department || '',
    year: student?.year || 1,
    gpa: student?.gpa || '',
    attendance_rate: student?.attendance_rate || '',
    engagement_score: student?.engagement_score || '',
    risk_level: student?.risk_level || 'low'
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const requestData = {
        ...formData,
        year: parseInt(formData.year),
        gpa: formData.gpa ? parseFloat(formData.gpa) : null,
        attendance_rate: formData.attendance_rate ? parseFloat(formData.attendance_rate) : null,
        engagement_score: formData.engagement_score ? parseFloat(formData.engagement_score) : null
      };

      const { error } = await supabase
        .from('approval_requests')
        .insert({
          user_id: user.id,
          request_type: requestType,
          request_data: requestData,
          student_id: student?.id || null
        });

      if (error) throw error;

      toast({
        title: "Request Submitted",
        description: "Your request has been sent to admin for approval."
      });

      onClose();
    } catch (error) {
      console.error('Error submitting request:', error);
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getFormTitle = () => {
    switch (requestType) {
      case 'create_student': return 'Request to Add New Student';
      case 'update_student': return 'Request to Update Student';
      case 'delete_student': return 'Request to Delete Student';
      default: return 'Submit Request';
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
      <Card className="w-full max-w-2xl bg-card backdrop-blur-3xl border-border text-foreground max-h-[90vh] overflow-y-auto shadow-2xl rounded-[32px] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-indigo-500 to-accent"></div>
        <CardHeader className="p-8 border-b border-border bg-muted/30">
          <CardTitle className="text-2xl font-black tracking-tighter uppercase flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Plus className="w-5 h-5" />
            </div>
            {getFormTitle()}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Student Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  disabled={requestType === 'delete_student'}
                  placeholder="Enter full name"
                  className="h-14 bg-muted border-border text-foreground placeholder:text-muted-foreground/30 rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-medium px-4"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="student_id" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Student ID</Label>
                <Input
                  id="student_id"
                  type="text"
                  value={formData.student_id}
                  onChange={(e) => handleInputChange('student_id', e.target.value)}
                  required
                  disabled={requestType === 'delete_student'}
                  placeholder="e.g. STU123"
                  className="h-14 bg-muted border-border text-foreground placeholder:text-muted-foreground/30 rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-medium px-4"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={requestType === 'delete_student'}
                  placeholder="student@university.edu"
                  className="h-14 bg-muted border-border text-foreground placeholder:text-muted-foreground/30 rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-medium px-4"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Department</Label>
                <Input
                  id="department"
                  type="text"
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  required
                  disabled={requestType === 'delete_student'}
                  placeholder="e.g. Computer Science"
                  className="h-14 bg-muted border-border text-foreground placeholder:text-muted-foreground/30 rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-medium px-4"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="year" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Current Year</Label>
                <Select
                  value={formData.year.toString()}
                  onValueChange={(value) => handleInputChange('year', value)}
                  disabled={requestType === 'delete_student'}
                >
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
                <Label htmlFor="gpa" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Subject GPA</Label>
                <Input
                  id="gpa"
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={formData.gpa}
                  onChange={(e) => handleInputChange('gpa', e.target.value)}
                  disabled={requestType === 'delete_student'}
                  placeholder="0.00 - 4.00"
                  className="h-14 bg-muted border-border text-foreground placeholder:text-muted-foreground/30 rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-medium px-4"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="attendance_rate" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Attendance Rate (%)</Label>
                <Input
                  id="attendance_rate"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.attendance_rate}
                  onChange={(e) => handleInputChange('attendance_rate', e.target.value)}
                  disabled={requestType === 'delete_student'}
                  placeholder="0 - 100"
                  className="h-14 bg-muted border-border text-foreground placeholder:text-muted-foreground/30 rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-medium px-4"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="engagement_score" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Engagement Score</Label>
                <Input
                  id="engagement_score"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.engagement_score}
                  onChange={(e) => handleInputChange('engagement_score', e.target.value)}
                  disabled={requestType === 'delete_student'}
                  placeholder="0 - 100"
                  className="h-14 bg-muted border-border text-foreground placeholder:text-muted-foreground/30 rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-medium px-4"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="risk_level" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Initial Risk Assessment</Label>
                <Select
                  value={formData.risk_level}
                  onValueChange={(value) => handleInputChange('risk_level', value)}
                  disabled={requestType === 'delete_student'}
                >
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
            </div>

            {requestType === 'delete_student' && (
              <Alert className="bg-destructive/10 border-destructive/20 rounded-2xl p-6">
                <AlertCircle className="w-5 h-5 text-destructive" />
                <AlertDescription className="text-destructive font-bold text-sm ml-2">
                  CRITICAL: You are requesting the permanent deletion of student: {formData.name} (ID: {formData.student_id})
                </AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col sm:flex-row gap-4 pt-10 border-t border-border">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 h-14 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/10 transition-all active:scale-95 group/btn"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Processing Submission...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                    <span>Confirm & Submit Request</span>
                  </div>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="h-14 px-8 border-border text-foreground hover:bg-muted transition-all rounded-2xl font-black uppercase tracking-widest text-[10px]"
              >
                Discard Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApprovalRequestForm;
