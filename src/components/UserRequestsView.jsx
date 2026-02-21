
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, CheckCircle, XCircle, Plus, Edit, Trash2, Brain, Files, MessageSquare, ChevronRight, Activity } from 'lucide-react';
import ApprovalRequestForm from './ApprovalRequestForm';

const UserRequestsView = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserRequests();

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
      case 'pending': return <Clock className="w-3.5 h-3.5" />;
      case 'approved': return <CheckCircle className="w-3.5 h-3.5" />;
      case 'rejected': return <XCircle className="w-3.5 h-3.5" />;
      default: return <Clock className="w-3.5 h-3.5" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return <Badge className="bg-warning/10 text-warning border-warning/20 text-[9px] font-black uppercase tracking-widest px-2">{status}</Badge>;
      case 'approved': return <Badge className="bg-success/10 text-success border-success/20 text-[9px] font-black uppercase tracking-widest px-2">{status}</Badge>;
      case 'rejected': return <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-[9px] font-black uppercase tracking-widest px-2">{status}</Badge>;
      default: return <Badge className="bg-white/5 text-white/40 border-white/10 text-[9px] font-black uppercase tracking-widest px-2">{status}</Badge>;
    }
  };

  const getRequestTypeLabel = (type) => {
    switch (type) {
      case 'create_student': return 'Inception Protocol';
      case 'update_student': return 'Node Modification';
      case 'delete_student': return 'Decommissioning';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-2 border-primary/20 rounded-full"></div>
          <div className="absolute inset-0 border-2 border-transparent border-t-primary rounded-full animate-spin"></div>
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Syncing Request Log</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <MessageSquare className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Directives Log</span>
          </div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase">My Directives</h2>
          <p className="text-white/20 uppercase tracking-[0.2em] text-[10px] font-black mt-1">Authorized request history & status tracking</p>
        </div>
        <Button
          onClick={() => setShowRequestForm(true)}
          className="bg-primary hover:bg-primary/90 text-white rounded-xl h-11 px-6 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Directive
        </Button>
      </div>

      {requests.length === 0 ? (
        <Card className="bg-card/40 backdrop-blur-3xl border-white/5 text-white overflow-hidden shadow-2xl">
          <CardContent className="p-20 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-white/[0.02] border border-white/5 rounded-3xl flex items-center justify-center mb-8">
              <Files className="w-10 h-10 text-white/20" />
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-4">No Directives Issued</h2>
            <p className="text-white/20 uppercase tracking-widest text-[10px] font-black max-w-md leading-loose mb-10">
              Your directive log is currently empty. Initiate a new node request to begin authorization protocols.
            </p>
            <Button
              onClick={() => setShowRequestForm(true)}
              className="bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 rounded-xl h-12 px-8 font-black uppercase tracking-widest text-[10px] transition-all"
            >
              Issue First Directive
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
          {requests.map((request) => (
            <Card key={request.id} className="bg-card/40 backdrop-blur-3xl border-white/5 text-white overflow-hidden hover:border-primary/40 transition-all group">
              <div className="h-1.5 w-full bg-white/5 group-hover:bg-primary transition-colors"></div>
              <CardHeader className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-black uppercase tracking-tighter group-hover:text-primary transition-colors">
                      {getRequestTypeLabel(request.request_type)}
                    </CardTitle>
                    <CardDescription className="text-white/20 uppercase tracking-widest text-[9px] font-black">Ref ID: {request.id.slice(0, 8)}</CardDescription>
                  </div>
                  {getStatusBadge(request.status)}
                </div>
              </CardHeader>

              <CardContent className="p-6 pt-0 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1 text-center">Subject Node</p>
                    <p className="text-sm font-black tracking-tight text-center">{request.request_data?.name || 'N/A'}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1 text-center">Unique ID</p>
                    <p className="text-sm font-mono font-bold text-center text-primary">{request.request_data?.student_id || 'N/A'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-white/20">Sector Alpha</span>
                    <span className="text-white">{request.request_data?.department || 'Unassigned'}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-white/20">Log Timestamp</span>
                    <span className="text-white/60">{new Date(request.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {request.admin_message && (
                  <div className={`p-4 rounded-2xl border ${request.status === 'approved' ? 'bg-success/5 border-success/20' : 'bg-destructive/5 border-destructive/20'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className={`w-3 h-3 ${request.status === 'approved' ? 'text-success' : 'text-destructive'}`} />
                      <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Admin Transcript</span>
                    </div>
                    <p className={`text-xs font-bold leading-relaxed ${request.status === 'approved' ? 'text-success/80' : 'text-destructive/80'}`}>
                      {request.admin_message}
                    </p>
                  </div>
                )}

                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white/20">
                    <Clock className="w-3 h-3" />
                    Updated {new Date(request.updated_at).toLocaleDateString()}
                  </div>
                  <button className="text-[9px] font-black uppercase tracking-widest text-primary hover:text-white transition-colors flex items-center gap-1 group/btn">
                    Inspect Trace <ChevronRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
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
