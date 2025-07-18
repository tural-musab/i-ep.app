/**
 * File Upload Component
 * İ-EP.APP - Reusable file upload component
 * Supports drag & drop, multiple files, and file validation
 */

'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Upload, X, FileText, Image, AlertCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onUpload: (files: File[]) => Promise<void>;
  onFileSelect?: (files: File[]) => void;
  accept?: string;
  maxSize?: number;
  maxFiles?: number;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  type?: 'assignment' | 'profile' | 'document' | 'image';
  assignmentId?: string;
  children?: React.ReactNode;
}

interface UploadProgress {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

export function FileUpload({
  onUpload,
  onFileSelect,
  accept = '*/*',
  maxSize = 50 * 1024 * 1024, // 50MB default
  maxFiles = 5,
  multiple = true,
  disabled = false,
  className,
  type = 'assignment',
  assignmentId,
  children,
}: FileUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback(
    (file: File): string | null => {
      if (file.size > maxSize) {
        return `File "${file.name}" is too large. Maximum size is ${Math.round(maxSize / (1024 * 1024))}MB.`;
      }

      // Type-specific validation
      if (type === 'image' && !file.type.startsWith('image/')) {
        return `"${file.name}" is not an image file.`;
      }

      if (
        type === 'document' &&
        ![
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
        ].includes(file.type)
      ) {
        return `"${file.name}" is not a supported document format.`;
      }

      return null;
    },
    [maxSize, type]
  );

  const validateFiles = useCallback(
    (files: File[]): string | null => {
      if (files.length > maxFiles) {
        return `Too many files. Maximum ${maxFiles} files allowed.`;
      }

      for (const file of files) {
        const error = validateFile(file);
        if (error) return error;
      }

      return null;
    },
    [maxFiles, validateFile]
  );

  const handleFileSelect = useCallback(
    (files: File[]) => {
      setError(null);

      const validationError = validateFiles(files);
      if (validationError) {
        setError(validationError);
        return;
      }

      const newFiles = multiple
        ? [...selectedFiles, ...files].slice(0, maxFiles)
        : files.slice(0, 1);
      setSelectedFiles(newFiles);

      if (onFileSelect) {
        onFileSelect(newFiles);
      }
    },
    [selectedFiles, multiple, maxFiles, validateFiles, onFileSelect]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) {
        setIsDragging(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      handleFileSelect(files);
    },
    [disabled, handleFileSelect]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      handleFileSelect(files);
    },
    [handleFileSelect]
  );

  const removeFile = useCallback(
    (index: number) => {
      const newFiles = selectedFiles.filter((_, i) => i !== index);
      setSelectedFiles(newFiles);

      if (onFileSelect) {
        onFileSelect(newFiles);
      }
    },
    [selectedFiles, onFileSelect]
  );

  const handleUpload = useCallback(async () => {
    if (selectedFiles.length === 0) return;

    setError(null);

    // Initialize progress tracking
    const progressState: UploadProgress[] = selectedFiles.map((file) => ({
      file,
      progress: 0,
      status: 'uploading',
    }));
    setUploadProgress(progressState);

    try {
      await onUpload(selectedFiles);

      // Mark all as completed
      setUploadProgress((prev) =>
        prev.map((p) => ({
          ...p,
          progress: 100,
          status: 'completed',
        }))
      );

      // Clear selected files after successful upload
      setTimeout(() => {
        setSelectedFiles([]);
        setUploadProgress([]);
      }, 2000);
    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : 'Upload failed');

      // Mark all as error
      setUploadProgress((prev) =>
        prev.map((p) => ({
          ...p,
          status: 'error',
          error: error instanceof Error ? error.message : 'Upload failed',
        }))
      );
    }
  }, [selectedFiles, onUpload]);

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-5 w-5" />;
    }
    return <FileText className="h-5 w-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const isUploading = uploadProgress.some((p) => p.status === 'uploading');

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Area */}
      <Card
        className={cn(
          'cursor-pointer border-2 border-dashed transition-colors',
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300',
          disabled && 'cursor-not-allowed opacity-50'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <CardContent className="p-6 text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleInputChange}
            className="hidden"
            disabled={disabled}
          />

          {children || (
            <div className="space-y-2">
              <Upload className="mx-auto h-8 w-8 text-gray-400" />
              <div className="text-sm text-gray-600">
                <span className="font-medium">Click to upload</span> or drag and drop
              </div>
              <div className="text-xs text-gray-500">
                {type === 'image' ? 'Images only' : 'Documents, images, and archives'}
                {` • Max ${Math.round(maxSize / (1024 * 1024))}MB per file`}
                {multiple && ` • Up to ${maxFiles} files`}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Selected Files ({selectedFiles.length})</h4>
            {selectedFiles.length > 0 && !isUploading && (
              <Button onClick={handleUpload} disabled={disabled} size="sm">
                Upload Files
              </Button>
            )}
          </div>

          {selectedFiles.map((file, index) => {
            const progress = uploadProgress.find((p) => p.file === file);

            return (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
              >
                <div className="flex items-center space-x-3">
                  {getFileIcon(file)}
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{file.name}</div>
                    <div className="text-xs text-gray-500">{formatFileSize(file.size)}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {progress && (
                    <div className="flex items-center space-x-2">
                      {progress.status === 'uploading' && (
                        <Progress value={progress.progress} className="w-16" />
                      )}
                      {progress.status === 'completed' && (
                        <Check className="h-4 w-4 text-green-500" />
                      )}
                      {progress.status === 'error' && (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  )}

                  {!progress && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      disabled={disabled || isUploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Progress */}
      {uploadProgress.length > 0 && (
        <div className="space-y-2">
          {uploadProgress.map((progress, index) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{progress.file.name}</span>
                <span className="text-gray-500">
                  {progress.status === 'uploading' && `${Math.round(progress.progress)}%`}
                  {progress.status === 'completed' && 'Completed'}
                  {progress.status === 'error' && 'Error'}
                </span>
              </div>
              {progress.status === 'uploading' && (
                <Progress value={progress.progress} className="h-2" />
              )}
              {progress.status === 'error' && progress.error && (
                <p className="text-xs text-red-500">{progress.error}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
