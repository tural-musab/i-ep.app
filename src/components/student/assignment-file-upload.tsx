'use client';

import React, { useCallback, useState, useRef } from 'react';
import { Upload, FileText, AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AssignmentFileUploadProps {
  onFileUpload: (files: File[]) => void;
  allowedTypes: string[];
  maxFileSize: number;
  maxFiles: number;
  currentFileCount: number;
  className?: string;
}

export function AssignmentFileUpload({
  onFileUpload,
  allowedTypes,
  maxFileSize,
  maxFiles,
  currentFileCount,
  className
}: AssignmentFileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Validate file type
  const isValidFileType = (file: File) => {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    return allowedTypes.includes(extension);
  };

  // Validate file size
  const isValidFileSize = (file: File) => {
    return file.size <= maxFileSize;
  };

  // Format file size for display
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Handle file drop
  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setErrors([]);
    const newErrors: string[] = [];

    // Check file count limit
    if (currentFileCount + acceptedFiles.length > maxFiles) {
      newErrors.push(`Maksimum ${maxFiles} dosya yükleyebilirsiniz`);
      setErrors(newErrors);
      return;
    }

    // Validate each file
    const validFiles: File[] = [];
    
    acceptedFiles.forEach((file) => {
      // Check file type
      if (!isValidFileType(file)) {
        newErrors.push(`${file.name}: Desteklenmeyen dosya türü. İzin verilen türler: ${allowedTypes.join(', ')}`);
        return;
      }

      // Check file size
      if (!isValidFileSize(file)) {
        newErrors.push(`${file.name}: Dosya boyutu çok büyük. Maksimum: ${formatFileSize(maxFileSize)}`);
        return;
      }

      validFiles.push(file);
    });

    // Handle rejected files from react-dropzone
    rejectedFiles.forEach(({ file, errors }) => {
      errors.forEach((error) => {
        if (error.code === 'file-too-large') {
          newErrors.push(`${file.name}: Dosya boyutu çok büyük`);
        } else if (error.code === 'file-invalid-type') {
          newErrors.push(`${file.name}: Desteklenmeyen dosya türü`);
        } else {
          newErrors.push(`${file.name}: ${error.message}`);
        }
      });
    });

    setErrors(newErrors);

    if (validFiles.length > 0) {
      onFileUpload(validFiles);
    }
  }, [allowedTypes, maxFileSize, maxFiles, currentFileCount, onFileUpload]);

  // File input ref for fallback upload
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file input change (fallback for drag-drop)
  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    onDrop(files, []);
    
    // Reset input
    if (event.target) {
      event.target.value = '';
    }
  };

  // Handle click to open file dialog
  const handleFileSelectClick = () => {
    fileInputRef.current?.click();
  };

  // Handle drag events (basic implementation)
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    onDrop(files, []);
  };

  const canUploadMore = currentFileCount < maxFiles;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleFileSelectClick}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer',
          dragActive 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400',
          !canUploadMore && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input 
          ref={fileInputRef}
          type="file"
          multiple
          accept={allowedTypes.join(',')}
          onChange={handleFileInputChange}
          disabled={!canUploadMore}
          className="hidden"
        />
        
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
            <Upload className={cn(
              'h-8 w-8',
              dragActive ? 'text-blue-500' : 'text-gray-400'
            )} />
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-900">
              {dragActive 
                ? 'Dosyaları buraya bırakın' 
                : 'Dosyaları sürükleyin veya seçin'
              }
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {canUploadMore 
                ? `${maxFiles - currentFileCount} dosya daha yükleyebilirsiniz`
                : 'Maksimum dosya sayısına ulaştınız'
              }
            </p>
          </div>

          {canUploadMore && (
            <Button type="button" variant="outline">
              Dosya Seç
            </Button>
          )}
        </div>
      </div>

      {/* File Info */}
      <div className="text-xs text-gray-500 space-y-1">
        <p><strong>İzin verilen türler:</strong> {allowedTypes.join(', ')}</p>
        <p><strong>Maksimum dosya boyutu:</strong> {formatFileSize(maxFileSize)}</p>
        <p><strong>Maksimum dosya sayısı:</strong> {maxFiles}</p>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="space-y-2">
          {errors.map((error, index) => (
            <div
              key={index}
              className="flex items-start space-x-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3"
            >
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}