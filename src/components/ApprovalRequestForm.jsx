
import React, { useState } from 'react';
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl bg-white/10 backdrop-blur-md border-white/20 text-white max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>{getFormTitle()}</CardTitle>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">Student Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  disabled={requestType === 'delete_student'}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="student_id" className="text-white">Student ID</Label>
                <Input
                  id="student_id"
                  type="text"
                  value={formData.student_id}
                  onChange={(e) => handleInputChange('student_id', e.target.value)}
                  required
                  disabled={requestType === 'delete_student'}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={requestType === 'delete_student'}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department" className="text-white">Department</Label>
                <Input
                  id="department"
                  type="text"
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  required
                  disabled={requestType === 'delete_student'}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="year" className="text-white">Year</Label>
                <Select 
                  value={formData.year.toString()} 
                  onValueChange={(value) => handleInputChange('year', value)}
                  disabled={requestType === 'delete_student'}
                >
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
                <Label htmlFor="gpa" className="text-white">GPA</Label>
                <Input
                  id="gpa"
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={formData.gpa}
                  onChange={(e) => handleInputChange('gpa', e.target.value)}
                  disabled={requestType === 'delete_student'}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="attendance_rate" className="text-white">Attendance Rate (%)</Label>
                <Input
                  id="attendance_rate"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.attendance_rate}
                  onChange={(e) => handleInputChange('attendance_rate', e.target.value)}
                  disabled={requestType === 'delete_student'}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="engagement_score" className="text-white">Engagement Score</Label>
                <Input
                  id="engagement_score"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.engagement_score}
                  onChange={(e) => handleInputChange('engagement_score', e.target.value)}
                  disabled={requestType === 'delete_student'}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="risk_level" className="text-white">Risk Level</Label>
                <Select 
                  value={formData.risk_level} 
                  onValueChange={(value) => handleInputChange('risk_level', value)}
                  disabled={requestType === 'delete_student'}
                >
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
            </div>

            {requestType === 'delete_student' && (
              <Alert className="bg-red-500/20 border-red-500/50">
                <AlertDescription className="text-red-300">
                  You are requesting to delete student: {formData.name} (ID: {formData.student_id})
                </AlertDescription>
              </Alert>
            )}

            <div className="flex space-x-4 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {loading ? 'Submitting...' : 'Submit Request'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApprovalRequestForm;
