
import React, { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Upload, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            onClick={() => navigate('/adminDashboard')}
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-white">Upload Students Data File</h1>
        </div>

        {/* Upload Section */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Bulk Student Data Upload
            </CardTitle>
            <CardDescription className="text-gray-300">
              Upload CSV or Excel files containing student information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* File Upload Area */}
              <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
                <FileSpreadsheet className="h-16 w-16 mx-auto mb-4 text-blue-400" />
                <p className="text-gray-300 mb-4 text-lg">
                  Drag and drop your file here, or click to browse
                </p>
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
                  className="cursor-pointer inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg transition-colors text-white font-medium"
                >
                  {uploading ? 'Processing...' : 'Choose File'}
                </label>
                {fileName && (
                  <p className="mt-4 text-blue-300">Selected: {fileName}</p>
                )}
              </div>

              {/* Expected Format */}
              <div className="bg-black/20 rounded-lg p-4">
                <h3 className="font-medium mb-2 text-white">Expected CSV Format:</h3>
                <code className="block text-xs text-gray-300 overflow-x-auto">
                  student_id,name,email,department,year,gpa,attendance_rate,engagement_score,risk_level<br />
                  ST001,John Doe,john@example.com,Computer Science,2,3.45,85,78,low<br />
                  ST002,Jane Smith,jane@example.com,Mathematics,3,3.89,92,85,low
                </code>
              </div>

              {/* Status Messages */}
              {uploadStatus === 'parsing' && (
                <Alert className="bg-blue-500/20 border-blue-500/50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-blue-300">
                    Parsing file... Please wait.
                  </AlertDescription>
                </Alert>
              )}

              {uploadStatus === 'uploading' && (
                <Alert className="bg-blue-500/20 border-blue-500/50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-blue-300">
                    Uploading students to database... Please wait.
                  </AlertDescription>
                </Alert>
              )}

              {uploadStatus === 'success' && (
                <Alert className="bg-green-500/20 border-green-500/50">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription className="text-green-300">
                    All students uploaded successfully! Data is now visible on the public dashboard.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Preview Section */}
        {previewData.length > 0 && uploadStatus === 'preview' && (
          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader>
              <CardTitle>Data Preview ({previewData.length} records found)</CardTitle>
              <CardDescription className="text-gray-300">
                Review the data before uploading to database
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto mb-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left p-2 text-white">Student ID</th>
                      <th className="text-left p-2 text-white">Name</th>
                      <th className="text-left p-2 text-white">Department</th>
                      <th className="text-left p-2 text-white">Year</th>
                      <th className="text-left p-2 text-white">GPA</th>
                      <th className="text-left p-2 text-white">Risk Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.slice(0, 10).map((student, index) => (
                      <tr key={index} className="border-b border-white/10">
                        <td className="p-2 text-gray-300">{student.student_id}</td>
                        <td className="p-2 text-gray-300">{student.name}</td>
                        <td className="p-2 text-gray-300">{student.department}</td>
                        <td className="p-2 text-gray-300">{student.year}</td>
                        <td className="p-2 text-gray-300">{student.gpa || 'N/A'}</td>
                        <td className="p-2 text-gray-300">{student.risk_level}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {previewData.length > 10 && (
                  <p className="text-gray-400 text-center mt-4">
                    Showing first 10 records of {previewData.length} total
                  </p>
                )}
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={confirmUpload}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : 'Confirm Upload'}
                </Button>
                <Button
                  onClick={resetUpload}
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => navigate('/')}
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  View Public Dashboard
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
