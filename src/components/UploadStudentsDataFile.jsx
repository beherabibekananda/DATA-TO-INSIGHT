
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
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('File must contain at least a header row and one data row');
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const students = [];
      
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
          const student = {};
          
          headers.forEach((header, index) => {
            const value = values[index] || '';
            switch (header.toLowerCase()) {
              case 'student_id':
                student.student_id = value;
                break;
              case 'name':
                student.name = value;
                break;
              case 'email':
                student.email = value;
                break;
              case 'department':
                student.department = value;
                break;
              case 'year':
                student.year = parseInt(value) || 1;
                break;
              case 'gpa':
                student.gpa = parseFloat(value) || null;
                break;
              case 'attendance_rate':
                student.attendance_rate = parseFloat(value) || null;
                break;
              case 'engagement_score':
                student.engagement_score = parseFloat(value) || null;
                break;
              case 'risk_level':
                student.risk_level = value.toLowerCase() || 'low';
                break;
              default:
                // Skip unknown columns
                break;
            }
          });
          
          if (student.student_id && student.name && student.department) {
            students.push(student);
          }
        }
      }

      if (students.length === 0) {
        throw new Error('No valid student records found. Ensure file has student_id, name, and department columns.');
      }

      setPreviewData(students);
      setUploadStatus('preview');
      
      toast({
        title: "File Parsed Successfully",
        description: `Found ${students.length} valid student records`,
      });

    } catch (error) {
      console.error('File parsing error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to parse file",
        variant: "destructive",
      });
      setUploadStatus('error');
    } finally {
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
                  student_id,name,email,department,year,gpa,attendance_rate,engagement_score,risk_level<br/>
                  ST001,John Doe,john@example.com,Computer Science,2,3.45,85,78,low<br/>
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
