
import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/components/ui/use-toast";
import { Clock, CheckCircle, XCircle, Plus, Edit, Trash2, Upload } from 'lucide-react';

const AdminApprovalPanel = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [adminMessages, setAdminMessages] = useState({});
  const [file, setFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  useEffect(() => {
    fetchRequests();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('admin-requests')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'approval_requests'
      }, fetchRequests)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('approval_requests')
        .select(`
          *,
          profiles:user_id (full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalAction = async (requestId, action, adminMessage = '') => {
    setProcessingId(requestId);
    
    try {
      const request = requests.find(r => r.id === requestId);
      
      // Update request status
      const { error: updateError } = await supabase
        .from('approval_requests')
        .update({
          status: action,
          admin_message: adminMessage,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // If approved, execute the actual database operation
      if (action === 'approved') {
        await executeApprovedRequest(request);
      }

      toast({
        title: `Request ${action}`,
        description: `Request has been ${action} successfully.`
      });

      fetchRequests();
    } catch (error) {
      console.error('Error processing request:', error);
      toast({
        title: "Error",
        description: "Failed to process request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const executeApprovedRequest = async (request) => {
    const { request_type, request_data } = request;

    switch (request_type) {
      case 'create_student':
        const { error: insertError } = await supabase
          .from('students')
          .insert(request_data);
        if (insertError) throw insertError;
        break;

      case 'update_student':
        const { error: updateError } = await supabase
          .from('students')
          .update(request_data)
          .eq('id', request.student_id);
        if (updateError) throw updateError;
        break;

      case 'delete_student':
        const { error: deleteError } = await supabase
          .from('students')
          .delete()
          .eq('id', request.student_id);
        if (deleteError) throw deleteError;
        break;

      default:
        throw new Error('Unknown request type');
    }
  };

  const handleExcelUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select an Excel file to upload.",
        variant: "destructive"
      });
      return;
    }

    setUploadLoading(true);

    try {
      // Upload file to Supabase Storage
      const fileName = `excel-import-${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('excel-imports')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Here you would typically process the Excel file
      // For now, we'll just show a success message
      toast({
        title: "File uploaded successfully",
        description: "Excel file has been uploaded. Processing functionality can be added as needed."
      });

      setFile(null);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload Excel file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploadLoading(false);
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

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const processedRequests = requests.filter(r => r.status !== 'pending');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white">Loading approval requests...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Excel Upload Section */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="w-5 h-5" />
            <span>Excel Data Import</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(e) => setFile(e.target.files[0])}
              className="text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <Button
              onClick={handleExcelUpload}
              disabled={!file || uploadLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {uploadLoading ? 'Uploading...' : 'Upload Excel'}
            </Button>
          </div>
          <p className="text-gray-300 text-sm mt-2">
            Upload Excel files (.xlsx, .xls, .csv) to bulk import student data
          </p>
        </CardContent>
      </Card>

      {/* Pending Requests */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
          <Clock className="w-6 h-6 text-yellow-500" />
          <span>Pending Requests ({pendingRequests.length})</span>
        </h2>

        {pendingRequests.length === 0 ? (
          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardContent className="p-8 text-center">
              <p className="text-gray-300">No pending requests to review.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((request) => (
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
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-300">Requested by:</span>
                      <p className="font-medium">{request.profiles?.full_name || 'Unknown'}</p>
                      <p className="text-gray-400">{request.profiles?.email}</p>
                    </div>
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
                  </div>

                  {/* Request Details */}
                  <div className="bg-white/5 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Request Details:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      {Object.entries(request.request_data).map(([key, value]) => (
                        <div key={key}>
                          <span className="text-gray-300 capitalize">{key.replace('_', ' ')}:</span>
                          <p>{value?.toString() || 'N/A'}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Admin Message Input */}
                  <div className="space-y-2">
                    <label className="text-white font-medium">Admin Message (Optional):</label>
                    <Textarea
                      placeholder="Add a message for the user..."
                      value={adminMessages[request.id] || ''}
                      onChange={(e) => setAdminMessages(prev => ({ ...prev, [request.id]: e.target.value }))}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 resize-none"
                      rows={2}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-4 pt-4">
                    <Button
                      onClick={() => handleApprovalAction(request.id, 'approved', adminMessages[request.id])}
                      disabled={processingId === request.id}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {processingId === request.id ? 'Processing...' : 'Approve'}
                    </Button>
                    <Button
                      onClick={() => handleApprovalAction(request.id, 'rejected', adminMessages[request.id])}
                      disabled={processingId === request.id}
                      className="flex-1 bg-red-600 hover:bg-red-700"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      {processingId === request.id ? 'Processing...' : 'Reject'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Processed Requests */}
      {processedRequests.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white">Recent Processed Requests</h2>
          <div className="space-y-4">
            {processedRequests.slice(0, 5).map((request) => (
              <Card key={request.id} className="bg-white/5 backdrop-blur-md border-white/10 text-white">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getRequestTypeIcon(request.request_type)}
                        <span className="font-medium">{getRequestTypeLabel(request.request_type)}</span>
                      </div>
                      <span className="text-gray-300">•</span>
                      <span className="text-gray-300">{request.request_data?.name}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge className={`${getStatusColor(request.status)} text-white flex items-center space-x-1`}>
                        {getStatusIcon(request.status)}
                        <span className="capitalize">{request.status}</span>
                      </Badge>
                      <span className="text-gray-400 text-sm">
                        {new Date(request.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {request.admin_message && (
                    <div className="mt-2 text-sm text-gray-300">
                      <strong>Message:</strong> {request.admin_message}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminApprovalPanel;
