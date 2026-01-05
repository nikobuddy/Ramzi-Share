import React, { useState, useEffect, DragEvent, ChangeEvent, KeyboardEvent, FormEvent } from 'react';
import { Socket } from 'socket.io-client';
import { FileSharingProps, FileInfo } from '../types';

function FileSharing({ socket, userName }: FileSharingProps): JSX.Element {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [isPublic, setIsPublic] = useState<boolean>(true);
  const [password, setPassword] = useState<string>('');
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [message, setMessage] = useState<{ text: string; type: string }>({ text: '', type: '' });
  const [selectedFile, setSelectedFile] = useState<FileInfo | null>(null);
  const [accessCode, setAccessCode] = useState<string>('');

  useEffect(() => {
    loadFiles();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleFileShared = (): void => {
      loadFiles();
    };

    socket.on('file-shared', handleFileShared);
    return () => {
      socket.off('file-shared', handleFileShared);
    };
  }, [socket]);

  const loadFiles = async (): Promise<void> => {
    try {
      const response = await fetch('/api/files');
      const data = await response.json();
      setFiles(data.files || []);
    } catch (error) {
      console.error('Error loading files:', error);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>): void => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      uploadFiles(Array.from(selectedFiles));
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      uploadFiles(Array.from(droppedFiles));
    }
  };

  const uploadFiles = async (fileList: File[]): Promise<void> => {
    for (const file of fileList) {
      await uploadFile(file);
    }
  };

  const uploadFile = async (file: File): Promise<void> => {
    if (!isPublic && !password.trim()) {
      setMessage({ text: 'Access code is required for private files', type: 'error' });
      setTimeout(() => setMessage({ text: '', type: '' }), 5000);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('public', isPublic ? 'true' : 'false');
    if (!isPublic) {
      formData.append('password', password.trim());
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          setUploadProgress((e.loaded / e.total) * 100);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          setMessage({
            text: `File "${response.filename}" uploaded successfully!`,
            type: 'success',
          });
          setPassword('');
          setUploadProgress(0);
          if (socket) {
            socket.emit('file-shared', {
              fileName: response.filename,
              fileSize: response.size,
              isPublic: response.isPublic,
            });
          }
          loadFiles();
          setTimeout(() => setMessage({ text: '', type: '' }), 5000);
        } else {
          const response = JSON.parse(xhr.responseText || '{}');
          setMessage({
            text: response.error || 'Upload failed',
            type: 'error',
          });
          setTimeout(() => setMessage({ text: '', type: '' }), 5000);
        }
        setUploading(false);
      });

      xhr.addEventListener('error', () => {
        setMessage({ text: 'Upload failed', type: 'error' });
        setUploading(false);
        setTimeout(() => setMessage({ text: '', type: '' }), 5000);
      });

      xhr.open('POST', '/upload');
      xhr.send(formData);
    } catch (error) {
      const err = error as Error;
      setMessage({ text: 'Error uploading file: ' + err.message, type: 'error' });
      setUploading(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    }
  };

  const downloadFile = (file: FileInfo): void => {
    if (file.isPublic) {
      window.open(`/public/${encodeURIComponent(file.name)}`, '_blank');
    } else if (file.hasPassword) {
      setSelectedFile(file);
    } else {
      window.open(`/store/${encodeURIComponent(file.name)}`, '_blank');
    }
  };

  const verifyAndDownload = async (): Promise<void> => {
    if (!selectedFile || !accessCode.trim()) return;

    try {
      const response = await fetch('/api/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: selectedFile.name,
          password: accessCode.trim(),
        }),
      });

      const data = await response.json();
      if (data.success) {
        window.open(
          `/store/${encodeURIComponent(selectedFile.name)}?password=${encodeURIComponent(accessCode.trim())}`,
          '_blank'
        );
        setSelectedFile(null);
        setAccessCode('');
      } else {
        setMessage({ text: data.error || 'Invalid access code', type: 'error' });
        setTimeout(() => setMessage({ text: '', type: '' }), 5000);
      }
    } catch (error) {
      setMessage({ text: 'Error verifying password', type: 'error' });
      setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    }
  };

  const deleteFile = async (file: FileInfo): Promise<void> => {
    if (!confirm(`Are you sure you want to delete "${file.name}"?`)) return;

    try {
      const response = await fetch(`/api/files/${encodeURIComponent(file.name)}?public=${file.isPublic}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        loadFiles();
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="w-1/2 max-lg:w-full max-lg:h-1/2 flex flex-col bg-white overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold">📁 File Sharing</h2>
        <button
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          onClick={loadFiles}
          title="Refresh"
        >
          🔄
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <div
          className={`border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50 cursor-pointer transition-all mb-6 relative ${
            uploading ? 'border-blue-500 bg-blue-50' : 'hover:border-blue-500 hover:bg-blue-50'
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={(e) => e.preventDefault()}
          onClick={() => document.getElementById('fileInput')?.click()}
        >
          <div className="text-5xl mb-4">📤</div>
          <h3 className="text-lg font-semibold mb-2">Drag & Drop Files Here</h3>
          <p className="text-slate-600">or click to browse</p>
          <input
            type="file"
            id="fileInput"
            className="hidden"
            multiple
            onChange={handleFileSelect}
          />
          {uploading && (
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mt-4">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}
        </div>

        <div className="mb-4 p-4 bg-slate-50 rounded-lg">
          <div className="flex gap-4">
            <label
              className={`flex-1 p-3 border-2 rounded-lg cursor-pointer transition-all text-center flex items-center justify-center gap-2 ${
                isPublic
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <input
                type="radio"
                name="fileType"
                checked={isPublic}
                onChange={() => setIsPublic(true)}
                className="hidden"
              />
              🌍 Public
            </label>
            <label
              className={`flex-1 p-3 border-2 rounded-lg cursor-pointer transition-all text-center flex items-center justify-center gap-2 ${
                !isPublic
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <input
                type="radio"
                name="fileType"
                checked={!isPublic}
                onChange={() => setIsPublic(false)}
                className="hidden"
              />
              🔒 Private
            </label>
          </div>
        </div>

        {!isPublic && (
          <div className="mb-4 p-4 bg-yellow-50 rounded-lg border-2 border-yellow-300">
            <label className="block mb-2 font-semibold text-sm">
              🔐 Access Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter access code"
              maxLength={50}
              className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg mt-2 focus:outline-none focus:border-blue-500"
            />
            <small className="block mt-2 text-sm text-slate-600">
              Private files require an access code. Users will need this code to download the file.
            </small>
          </div>
        )}

        {message.text && (
          <div
            className={`p-3 rounded-lg mb-4 font-medium ${
              message.type === 'success'
                ? 'bg-green-100 text-green-800 border border-green-300'
                : 'bg-red-100 text-red-800 border border-red-300'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="mt-6">
          {files.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p>No files uploaded yet</p>
            </div>
          ) : (
            files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg mb-3 transition-all hover:bg-slate-100 hover:translate-x-1"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="text-3xl flex-shrink-0">📄</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold truncate">{file.name}</h3>
                    <p className="text-xs text-slate-600 flex gap-2 flex-wrap">
                      {formatFileSize(file.size)} • {formatDate(file.modified)}
                      {!file.isPublic && ' • 🔐 Access Code Required'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 items-center flex-shrink-0">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${
                      file.isPublic
                        ? 'bg-green-100 text-green-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {file.isPublic ? '🌍 Public' : '🔒 Private'}
                  </span>
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium cursor-pointer transition-all hover:bg-blue-600 hover:-translate-y-0.5 hover:shadow-md text-sm"
                    onClick={() => downloadFile(file)}
                  >
                    Download
                  </button>
                  <button
                    className="px-4 py-2 bg-slate-500 text-white rounded-lg font-medium cursor-pointer transition-all hover:bg-slate-600 text-sm"
                    onClick={() => deleteFile(file)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedFile && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50">
          <div className="bg-white p-8 rounded-xl w-[90%] max-w-md shadow-xl">
            <h3 className="text-xl font-semibold mb-2">🔒 Access Code Required</h3>
            <p className="text-slate-600 mb-4 text-sm">{selectedFile.name}</p>
            <input
              type="text"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              placeholder="Enter access code"
              onKeyPress={(e: KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'Enter') verifyAndDownload();
              }}
              className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg mb-4 focus:outline-none focus:border-blue-500"
            />
            <div className="flex gap-2">
              <button
                className="flex-1 px-4 py-2 bg-slate-500 text-white rounded-lg font-medium cursor-pointer transition-colors hover:bg-slate-600"
                onClick={() => setSelectedFile(null)}
              >
                Cancel
              </button>
              <button
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium cursor-pointer transition-colors hover:bg-blue-600"
                onClick={verifyAndDownload}
              >
                Access
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FileSharing;

