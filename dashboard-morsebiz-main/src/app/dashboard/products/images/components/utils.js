import { File, FileImage, FileText, FileCode, FileArchive, FileVideo } from 'lucide-react';

export const getFileIcon = (fileName) => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'bmp':
    case 'svg':
    case 'webp':
      return <FileImage className="h-8 w-8 text-green-500" />;
    
    case 'pdf':
      return <FileText className="h-8 w-8 text-red-500" />;
    
    case 'txt':
    case 'doc':
    case 'docx':
    case 'rtf':
      return <FileText className="h-8 w-8 text-blue-500" />;
    
    case 'html':
    case 'css':
    case 'js':
    case 'json':
    case 'xml':
    case 'php':
    case 'py':
    case 'java':
    case 'cpp':
    case 'c':
    case 'cs':
      return <FileCode className="h-8 w-8 text-purple-500" />;
    
    case 'zip':
    case 'rar':
    case '7z':
    case 'tar':
    case 'gz':
      return <FileArchive className="h-8 w-8 text-orange-500" />;
    
    case 'mp4':
    case 'avi':
    case 'mkv':
    case 'mov':
    case 'wmv':
    case 'flv':
      return <FileVideo className="h-8 w-8 text-pink-500" />;
    
    default:
      return <File className="h-8 w-8 text-gray-500" />;
  }
};

export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatDate = (dateString) => {
  if (!dateString) return 'Unknown';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};