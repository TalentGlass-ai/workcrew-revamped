// PATH: app/admin/resume-uploader/page.tsx
"use client";

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle, XCircle, AlertCircle, Eye } from 'lucide-react';
import ResumePreview from '@/components/admin/ResumePreview';

interface ResumeFile {
  file: File;
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  parsedData?: any;
  error?: string;
}

export default function AdminResumeUploader() {
  const [uploadedFiles, setUploadedFiles] = useState<ResumeFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<ResumeFile | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: ResumeFile[] = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending'
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: true
  });

  const processResumes = async () => {
    if (uploadedFiles.length === 0) return;

    setIsProcessing(true);

    // Process files in batches
    const batchSize = 5;
    for (let i = 0; i < uploadedFiles.length; i += batchSize) {
      const batch = uploadedFiles.slice(i, i + batchSize);

      // Update status to processing
      setUploadedFiles(prev =>
        prev.map(file =>
          batch.some(b => b.id === file.id)
            ? { ...file, status: 'processing' }
            : file
        )
      );

      // Process batch
      await Promise.all(
        batch.map(async (fileData) => {
          try {
            const formData = new FormData();
            formData.append('resume', fileData.file);

            const response = await fetch('/api/admin/parse-resume', {
              method: 'POST',
              body: formData
            });

            if (!response.ok) {
              throw new Error('Failed to parse resume');
            }

            const result = await response.json();

            setUploadedFiles(prev =>
              prev.map(file =>
                file.id === fileData.id
                  ? { ...file, status: 'completed', parsedData: result.parsedData }
                  : file
              )
            );
          } catch (error) {
            setUploadedFiles(prev =>
              prev.map(file =>
                file.id === fileData.id
                  ? { ...file, status: 'error', error: error instanceof Error ? error.message : 'Unknown error' }
                  : file
              )
            );
          }
        })
      );
    }

    setIsProcessing(false);
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const viewResume = (file: ResumeFile) => {
    setSelectedFile(file);
  };

  const saveProfile = async (profileData: any) => {
    try {
      const response = await fetch('/api/admin/create-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        throw new Error('Failed to create profile');
      }

      // Mark file as saved or remove from list
      setUploadedFiles(prev =>
        prev.map(file =>
          file.id === selectedFile?.id
            ? { ...file, status: 'completed' as const }
            : file
        )
      );

      setSelectedFile(null);
      alert('Profile created successfully!');
    } catch (error) {
      alert('Failed to create profile: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const getStatusIcon = (status: ResumeFile['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'processing':
        return <AlertCircle className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <FileText className="w-5 h-5 text-gray-400" />;
    }
  };

  if (selectedFile && selectedFile.parsedData) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <ResumePreview
          data={selectedFile.parsedData}
          onSave={saveProfile}
          onCancel={() => setSelectedFile(null)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Resume Uploader</h1>
          <p className="text-gray-600 mt-2">
            Upload multiple candidate resumes for batch processing and profile creation
          </p>
        </div>

        {/* Upload Zone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg text-gray-600 mb-2">
            {isDragActive ? 'Drop the files here...' : 'Drag & drop resume files here, or click to select'}
          </p>
          <p className="text-sm text-gray-500">
            Supports PDF, DOC, and DOCX files
          </p>
        </div>

        {/* File List */}
        {uploadedFiles.length > 0 && (
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Uploaded Files ({uploadedFiles.length})
              </h2>
              <button
                onClick={processResumes}
                disabled={isProcessing || uploadedFiles.every(f => f.status === 'completed')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : 'Process Resumes'}
              </button>
            </div>

            <div className="space-y-3">
              {uploadedFiles.map((fileData) => (
                <div
                  key={fileData.id}
                  className="flex items-center justify-between p-4 bg-white rounded-lg border"
                >
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(fileData.status)}
                    <div>
                      <p className="font-medium text-gray-900">{fileData.file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(fileData.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      {fileData.error && (
                        <p className="text-sm text-red-600">{fileData.error}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {fileData.status === 'completed' && fileData.parsedData && (
                      <button
                        onClick={() => viewResume(fileData)}
                        className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 flex items-center"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </button>
                    )}
                    <button
                      onClick={() => removeFile(fileData.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Processing Summary */}
        {uploadedFiles.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-2xl font-bold text-gray-900">
                {uploadedFiles.filter(f => f.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-2xl font-bold text-blue-600">
                {uploadedFiles.filter(f => f.status === 'processing').length}
              </div>
              <div className="text-sm text-gray-600">Processing</div>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-2xl font-bold text-yellow-600">
                {uploadedFiles.filter(f => f.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-2xl font-bold text-red-600">
                {uploadedFiles.filter(f => f.status === 'error').length}
              </div>
              <div className="text-sm text-gray-600">Errors</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}