
import React, { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Upload, FileSpreadsheet, CheckCircle, AlertCircle, Activity, Brain } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';

const UploadStudentsDataFile = () => {
  const [uploading, setUploading] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [fileName, setFileName] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setUploading(true);
    setUploadStatus('parsing');

    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const bstr = evt.target.result;
          const XLSX = await import('xlsx');
          const wb = XLSX.read(bstr, { type: 'binary' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const rawData = XLSX.utils.sheet_to_json(ws);

          if (rawData.length === 0) {
            throw new Error('File is empty or invalid');
          }

          // Smart Mapping for UCI Dataset vs Standard Format
          const students = rawData.map((row, index) => {
            const mapped = {};

            // 1. Identification
            mapped.student_id = row.student_id || row.id || `STU-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
            mapped.name = row.name || `Student ${index + 1}`;
            mapped.email = row.email || `${mapped.student_id.toLowerCase()}@university.edu`;

            // 2. Department & Year
            mapped.department = row.department || (row.school === 'GP' ? 'Gabriel Pereira' : row.school === 'MS' ? 'Mouzinho da Silveira' : 'General Education');
            mapped.year = parseInt(row.year || row.age % 4 || 1);

            // 3. Performance (Scaling UCI G3 (0-20) to GPA (0-4))
            if (row.G3 !== undefined) {
              mapped.gpa = parseFloat(((row.G3 / 20) * 4).toFixed(2));
            } else {
              mapped.gpa = parseFloat(row.gpa) || 0;
            }

            // 4. Attendance (Mapping UCI absences to attendance rate)
            if (row.absences !== undefined) {
              // Assume 100 max possible absences for scaling
              mapped.attendance_rate = Math.max(0, 100 - row.absences);
            } else {
              mapped.attendance_rate = parseFloat(row.attendance_rate) || 0;
            }

            // 5. Engagement (Mapping UCI studytime/failures to engagement)
            if (row.studytime !== undefined) {
              mapped.engagement_score = Math.min(100, (row.studytime * 25) - (row.failures * 10));
            } else {
              mapped.engagement_score = parseFloat(row.engagement_score) || 0;
            }

            // 6. Risk Level
            if (mapped.gpa < 2.0 || mapped.attendance_rate < 50) {
              mapped.risk_level = 'high';
            } else if (mapped.gpa < 3.0 || mapped.attendance_rate < 75) {
              mapped.risk_level = 'medium';
            } else {
              mapped.risk_level = 'low';
            }

            // Store extra UCI data as JSON if needed (optional extension)
            mapped.metadata = {
              uci_data: {
                sex: row.sex,
                address: row.address,
                romantic: row.romantic,
                alcohol_daily: row.Dalc,
                alcohol_weekly: row.Walc,
                health: row.health
              }
            };

            return mapped;
          });

          setPreviewData(students);
          setUploadStatus('preview');
          toast({
            title: "File Successfully Parsed",
            description: `Auto-mapped ${students.length} records. Detected ${rawData[0].G3 ? 'UCI Dataset' : 'Standard'} format.`,
          });
        } catch (err) {
          console.error('Inner parsing error:', err);
          toast({ title: "Parsing Error", description: err.message, variant: "destructive" });
          setUploadStatus('error');
        } finally {
          setUploading(false);
        }
      };
      reader.readAsBinaryString(file);
    } catch (error) {
      console.error('File reading error:', error);
      setUploadStatus('error');
      setUploading(false);
    }
  };

  const confirmUpload = async () => {
    setUploading(true);
    setUploadStatus('uploading');

    try {
      const { error } = await supabase
        .from('students')
        .insert(previewData);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${previewData.length} students uploaded successfully!`,
      });

      setUploadStatus('success');
      setPreviewData([]);
      setFileName('');

      // Reset file input
      const fileInput = document.getElementById('file-upload');
      if (fileInput) fileInput.value = '';

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: "Failed to upload student data",
        variant: "destructive",
      });
      setUploadStatus('error');
    } finally {
      setUploading(false);
    }
  };

  const resetUpload = () => {
    setPreviewData([]);
    setFileName('');
    setUploadStatus('');
    const fileInput = document.getElementById('file-upload');
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="min-h-screen bg-background p-6 relative overflow-hidden">
      {/* Dynamic Background Effects */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary/5 blur-[120px] rounded-full"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <Button
            onClick={() => navigate('/adminDashboard')}
            className="border border-border text-muted-foreground hover:text-foreground hover:bg-muted rounded-2xl px-5 transition-all font-black uppercase tracking-widest text-[10px] h-11 bg-card"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Admin Dashboard
          </Button>
          <div className="h-10 w-[1px] bg-border"></div>
          <h1 className="text-3xl font-black text-foreground tracking-tighter uppercase">Upload Student Data</h1>
        </div>

        {/* Upload Section */}
        <Card className="bg-card backdrop-blur-3xl border-border text-foreground mb-8 overflow-hidden shadow-xl">
          <div className="h-1 w-full bg-gradient-to-r from-primary to-secondary"></div>
          <CardHeader className="p-8 border-b border-border bg-muted/30">
            <CardTitle className="flex items-center gap-3 text-xl font-black uppercase tracking-tighter">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Upload className="h-5 w-5" />
              </div>
              Upload Student Files
            </CardTitle>
            <CardDescription className="text-muted-foreground uppercase tracking-widest text-[10px] font-black mt-2">
              Securely import student records to the system
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-8">
              {/* File Upload Area */}
              <div className="border-2 border-dashed border-border rounded-3xl p-12 text-center group hover:border-primary/40 transition-all bg-muted/20">
                <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <FileSpreadsheet className="h-10 w-10 text-primary" />
                </div>
                <p className="text-foreground font-black text-xl mb-2 uppercase tracking-tight">
                  Drop your file here
                </p>
                <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-8">Supports CSV, XLSX, and standard data formats</p>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  disabled={uploading}
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer inline-flex items-center px-8 py-4 bg-primary hover:bg-primary/90 rounded-2xl transition-all text-white font-black shadow-lg shadow-primary/10 hover:scale-105 active:scale-95 uppercase tracking-widest text-[10px]"
                >
                  {uploading ? 'Processing File...' : 'Select File'}
                </label>
                {fileName && (
                  <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
                    <CheckCircle className="w-3.5 h-3.5" />
                    File: {fileName}
                  </div>
                )}
              </div>

              {/* Status Messages */}
              {uploadStatus === 'parsing' && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-primary/10 border border-primary/20 animate-pulse">
                  <Activity className="h-5 w-5 text-primary" />
                  <p className="text-primary text-[10px] font-black uppercase tracking-widest">Reading file data...</p>
                </div>
              )}

              {uploadStatus === 'uploading' && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-secondary/10 border border-secondary/20 animate-pulse">
                  <Upload className="h-5 w-5 text-secondary" />
                  <p className="text-secondary text-[10px] font-black uppercase tracking-widest">Saving to database...</p>
                </div>
              )}

              {uploadStatus === 'success' && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-success/10 border border-success/20">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <p className="text-success text-[10px] font-black uppercase tracking-widest">Upload Successful</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Preview Section */}
        {previewData.length > 0 && uploadStatus === 'preview' && (
          <Card className="bg-card backdrop-blur-3xl border-border text-foreground shadow-xl">
            <CardHeader className="p-8 border-b border-border bg-muted/30">
              <CardTitle className="text-xl font-black uppercase tracking-tighter">Preview ({previewData.length} students found)</CardTitle>
              <CardDescription className="text-muted-foreground uppercase tracking-widest text-[10px] font-black mt-2">
                Check the data before confirming upload
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="overflow-x-auto mb-8 rounded-2xl border border-border bg-muted/20">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">ID</th>
                      <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Name</th>
                      <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Department</th>
                      <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Year</th>
                      <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">GPA</th>
                      <th className="text-left p-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Risk Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.slice(0, 10).map((student, index) => (
                      <tr key={index} className="border-b border-border hover:bg-muted/30 transition-colors">
                        <td className="p-4 text-muted-foreground font-mono text-xs">{student.student_id}</td>
                        <td className="p-4 text-foreground font-bold">{student.name}</td>
                        <td className="p-4 text-muted-foreground">{student.department}</td>
                        <td className="p-4 text-muted-foreground uppercase tracking-tighter text-xs">Year {student.year}</td>
                        <td className="p-4 text-primary font-bold">{student.gpa || 'N/A'}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest border ${student.risk_level === 'high' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                            student.risk_level === 'medium' ? 'bg-warning/10 text-warning border-warning/20' :
                              'bg-success/10 text-success border-success/20'
                            }`}>
                            {student.risk_level}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={confirmUpload}
                  className="bg-primary text-white font-black px-8 py-6 rounded-2xl shadow-lg shadow-primary/10 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-[10px]"
                  disabled={uploading}
                >
                  {uploading ? 'Processing...' : 'Confirm Upload'}
                </Button>
                <Button
                  onClick={resetUpload}
                  className="border border-border text-muted-foreground hover:text-foreground hover:bg-muted rounded-2xl px-6 py-6 transition-all font-black uppercase tracking-widest text-[10px] bg-card"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UploadStudentsDataFile;

