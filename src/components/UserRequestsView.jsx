
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, CheckCircle, XCircle, Plus, Edit, Trash2 } from 'lucide-react';
import ApprovalRequestForm from './ApprovalRequestForm';

const UserRequestsView = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserRequests();
      
      // Set up real-time subscription
      const subscription = supabase
        .channel('user-requests')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'approval_requests',
          filter: `user_id=eq.${user.id}`
        }, fetchUserRequests)
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  const fetchUserRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('approval_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getRequestTypeLabel = (type) => {
    switch (type) {
      case 'create_student': return 'Add Student';
      case 'update_student': return 'Update Student';
      case 'delete_student': return 'Delete Student';
      default: return type;
    }
  };

  const getRequestTypeIcon = (type) => {
    switch (type) {
      case 'create_student': return <Plus className="w-4 h-4" />;
      case 'update_student': return <Edit className="w-4 h-4" />;
      case 'delete_student': return <Trash2 className="w-4 h-4" />;
      default: return <Plus className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white">Loading your requests...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">My Requests</h2>
        <Button
          onClick={() => setShowRequestForm(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Request
        </Button>
      </div>

      {requests.length === 0 ? (
        <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
          <CardContent className="p-8 text-center">
            <p className="text-gray-300">You haven't submitted any requests yet.</p>
            <Button
              onClick={() => setShowRequestForm(true)}
              className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Submit Your First Request
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id} className="bg-white/10 backdrop-blur-md border-white/20 text-white">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    {getRequestTypeIcon(request.request_type)}
                    <CardTitle className="text-lg">
                      {getRequestTypeLabel(request.request_type)}
                    </CardTitle>
                  </div>
                  <Badge className={`${getStatusColor(request.status)} text-white flex items-center space-x-1`}>
                    {getStatusIcon(request.status)}
                    <span className="capitalize">{request.status}</span>
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-300">Student Name:</span>
                      <p className="font-medium">{request.request_data?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-300">Student ID:</span>
                      <p className="font-medium">{request.request_data?.student_id || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-300">Department:</span>
                      <p className="font-medium">{request.request_data?.department || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-300">Submitted:</span>
                      <p className="font-medium">{new Date(request.created_at).toLocaleDateString()}</p>
                    </div>
                    {request.updated_at !== request.created_at && (
                      <div>
                        <span className="text-gray-300">Updated:</span>
                        <p className="font-medium">{new Date(request.updated_at).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>

                  {request.admin_message && (
                    <Alert className={`${request.status === 'approved' ? 'bg-green-500/20 border-green-500/50' : 'bg-red-500/20 border-red-500/50'}`}>
                      <AlertDescription className={request.status === 'approved' ? 'text-green-300' : 'text-red-300'}>
                        <strong>Admin Message:</strong> {request.admin_message}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showRequestForm && (
        <ApprovalRequestForm
          onClose={() => setShowRequestForm(false)}
          requestType="create_student"
        />
      )}
    </div>
  );
};

export default UserRequestsView;
