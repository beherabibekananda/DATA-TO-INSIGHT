
import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/components/ui/use-toast";
import { Clock, CheckCircle, XCircle, Plus, Edit, Trash2, Upload, AlertCircle, Activity } from 'lucide-react';

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
        <div className="text-muted-foreground font-black uppercase tracking-widest text-xs">Loading approval requests...</div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Excel Upload Section */}
      <Card className="bg-card backdrop-blur-3xl border-border text-foreground shadow-xl overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-success/0 via-success/40 to-success/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <CardHeader className="p-8 border-b border-border bg-muted/30">
          <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-3">
            <div className="p-2 rounded-xl bg-success/10 text-success">
              <Upload className="w-5 h-5" />
            </div>
            Excel Data Import
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex-1 w-full">
              <div className="relative group/input">
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="w-full text-sm text-foreground
                    file:mr-4 file:py-3 file:px-6
                    file:rounded-2xl file:border-0
                    file:text-[10px] file:font-black file:uppercase file:tracking-widest
                    file:bg-primary file:text-white
                    file:hover:bg-primary/90 file:transition-all
                    bg-muted border border-border rounded-2xl p-2 cursor-pointer"
                />
              </div>
            </div>
            <Button
              onClick={handleExcelUpload}
              disabled={!file || uploadLoading}
              className="h-14 px-8 bg-success hover:bg-success/90 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-success/10 transition-all active:scale-95 shrink-0"
            >
              {uploadLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  <span>Upload Dataset</span>
                </div>
              )}
            </Button>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
            <AlertCircle className="w-4 h-4 text-primary" />
            <p className="text-[10px] font-black uppercase tracking-widest">
              Supports .xlsx, .xls, and .csv formats for bulk student ingestion
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Pending Requests */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-black text-foreground tracking-tighter uppercase flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-warning/10 flex items-center justify-center">
              <Clock className="w-6 h-6 text-warning" />
            </div>
            Pending Reviews
            <span className="text-muted-foreground/30 font-medium ml-2">({pendingRequests.length})</span>
          </h2>
        </div>

        {pendingRequests.length === 0 ? (
          <Card className="bg-card border-border text-foreground shadow-sm">
            <CardContent className="p-16 text-center">
              <div className="w-20 h-20 bg-muted rounded-3xl flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-muted-foreground/20" />
              </div>
              <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">All caught up! No pending requests.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {pendingRequests.map((request) => (
              <Card key={request.id} className="bg-card backdrop-blur-3xl border-border text-foreground shadow-xl group hover:border-primary/40 transition-all overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <CardHeader className="p-8 border-b border-border bg-muted/20">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-muted border border-border flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        {getRequestTypeIcon(request.request_type)}
                      </div>
                      <div>
                        <CardTitle className="text-xl font-black tracking-tighter uppercase">
                          {getRequestTypeLabel(request.request_type)}
                        </CardTitle>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">
                          Request ID: {request.id.split('-')[0]}
                        </p>
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(request.status)} bg-opacity-10 text-current border border-current/20 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm`}>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></div>
                        {request.status}
                      </div>
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-8 space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Requested By</span>
                      <p className="font-bold text-foreground text-sm">{request.profiles?.full_name || 'System User'}</p>
                      <p className="text-[10px] font-bold text-muted-foreground/60">{request.profiles?.email}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Student Subject</span>
                      <p className="font-bold text-foreground text-sm">{request.request_data?.name || 'N/A'}</p>
                      <p className="text-[10px] font-bold text-muted-foreground/60">ID: {request.request_data?.student_id || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Target Department</span>
                      <p className="font-bold text-foreground text-sm">{request.request_data?.department || 'General'}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Submission Timestamp</span>
                      <p className="font-bold text-foreground text-sm">{new Date(request.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </div>

                  {/* Request Details Mesh */}
                  <div className="p-6 rounded-3xl bg-muted border border-border space-y-4">
                    <h4 className="text-[10px] font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                      <Activity className="w-3.5 h-3.5 text-primary" />
                      Data Payload
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {Object.entries(request.request_data).map(([key, value]) => (
                        <div key={key}>
                          <span className="text-[9px] font-black text-muted-foreground capitalize tracking-widest">{key.replace('_', ' ')}</span>
                          <p className="text-xs font-bold text-foreground mt-0.5">{value?.toString() || '—'}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Admin Interaction */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-foreground uppercase tracking-widest">Feedback / Justification</label>
                      <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest italic">(Optional)</span>
                    </div>
                    <Textarea
                      placeholder="Enter approval details or rejection reason..."
                      value={adminMessages[request.id] || ''}
                      onChange={(e) => setAdminMessages(prev => ({ ...prev, [request.id]: e.target.value }))}
                      className="bg-muted border-border text-foreground placeholder:text-muted-foreground/30 h-24 rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-medium resize-none p-4"
                    />
                  </div>

                  {/* CTA Cluster */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button
                      onClick={() => handleApprovalAction(request.id, 'approved', adminMessages[request.id])}
                      disabled={processingId === request.id}
                      className="flex-1 h-14 bg-success hover:bg-success/90 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-success/10 transition-all active:scale-95 group/btn"
                    >
                      {processingId === request.id ? 'Syncing...' : (
                        <div className="flex items-center justify-center gap-2">
                          <CheckCircle className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                          <span>Finalize Approval</span>
                        </div>
                      )}
                    </Button>
                    <Button
                      onClick={() => handleApprovalAction(request.id, 'rejected', adminMessages[request.id])}
                      disabled={processingId === request.id}
                      variant="outline"
                      className="flex-1 h-14 border-destructive/20 text-destructive hover:bg-destructive/10 hover:border-destructive/30 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-95"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <XCircle className="w-4 h-4" />
                        <span>Deny Request</span>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Processed Stream */}
      {processedRequests.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-foreground tracking-tighter uppercase flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-muted border border-border flex items-center justify-center">
              <Activity className="w-4 h-4 text-muted-foreground" />
            </div>
            Audit Log
          </h2>
          <div className="space-y-3">
            {processedRequests.slice(0, 5).map((request) => (
              <Card key={request.id} className="bg-card/50 backdrop-blur-sm border-border text-foreground group hover:bg-card transition-all">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg bg-muted border border-border text-muted-foreground group-hover:text-primary transition-colors`}>
                        {getRequestTypeIcon(request.request_type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 font-black uppercase tracking-tighter text-[11px]">
                          <span>{getRequestTypeLabel(request.request_type)}</span>
                          <span className="text-muted-foreground/30">•</span>
                          <span className="text-muted-foreground">{request.request_data?.name}</span>
                        </div>
                        <p className="text-[9px] font-bold text-muted-foreground/40 mt-0.5">Updated on {new Date(request.updated_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(request.status)} bg-opacity-10 text-current border border-current/20 px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest`}>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-current"></div>
                        {request.status}
                      </div>
                    </Badge>
                  </div>
                  {request.admin_message && (
                    <div className="mt-3 py-2 px-3 rounded-xl bg-muted/50 border border-border/50 text-[10px] font-bold text-muted-foreground/80 leading-relaxed italic">
                      Admin: "{request.admin_message}"
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
