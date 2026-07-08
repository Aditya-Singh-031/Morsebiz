'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  AlertTriangle,
  FileText,
  Loader2,
  ChevronDown,
  X,
  Languages,
  ArrowLeft,
  Eye,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { buildApiUrl } from '@/config/api';
import Cookies from 'js-cookie';
import globalWebSocketManager from '@/services/globalWebSocketManager';

export default function ProductTranslationPage() {
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const [isValidating, setIsValidating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Brand selection states
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [brandSearchTerm, setBrandSearchTerm] = useState('');

  // Translation logs state
  const [translationLogs, setTranslationLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Fetch brands and translation logs on component mount
  useEffect(() => {
    fetchBrands();
    fetchTranslationLogs();
  }, []);

  // Fetch brands from API
  const fetchBrands = async () => {
    setLoadingBrands(true);
    try {
      const token = Cookies.get('adminToken');
      const response = await fetch(buildApiUrl('/api/dashboard/brands'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch brands');
      }

      const result = await response.json();
      
      if (result.success && Array.isArray(result.data)) {
        setBrands(result.data);
      } else {
        setBrands([]);
      }
    } catch (error) {
      setError('Failed to load brands');
      setBrands([]);
    } finally {
      setLoadingBrands(false);
    }
  };

  // Fetch translation logs
  const fetchTranslationLogs = async () => {
    setLoadingLogs(true);
    try {
      const token = Cookies.get('adminToken');
      const response = await fetch(buildApiUrl('/api/dashboard/product-translation/logs'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch translation logs');
      }

      const result = await response.json();
      
      if (result.success && Array.isArray(result.data)) {
        setTranslationLogs(result.data);
      } else {
        setTranslationLogs([]);
      }
    } catch (error) {
      setTranslationLogs([]);
    } finally {
      setLoadingLogs(false);
    }
  };

  // Handle brand selection
  const handleBrandSelect = (brand) => {
    setSelectedBrand(brand);
    setShowBrandDropdown(false);
    setBrandSearchTerm('');
  };

  // Clear selected brand
  const clearBrand = () => {
    setSelectedBrand(null);
  };

  // Filter brands based on search term
  const filteredBrands = brands.filter(brand =>
    brand && brand.title && brand.title.toLowerCase().includes(brandSearchTerm.toLowerCase())
  );

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  // Handle drag and drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  // Validate file and set it
  const validateAndSetFile = (file) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return;
    }
    
    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      return;
    }
    
    setSelectedFile(file);
  };

  // Download sample Excel file
  const handleDownloadSample = async () => {
    if (!selectedBrand) {
      return;
    }

    setIsDownloading(true);
    try {
      const token = Cookies.get('adminToken');
      
      const response = await fetch(buildApiUrl('/api/dashboard/product-translation/sample-excel'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ brandSlug: selectedBrand.slug })
      });

      if (!response.ok) {
        throw new Error('Failed to download sample file');
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `product-translation-sample-${selectedBrand.slug}-${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Sample translation file downloaded successfully');
    } catch (error) {
      toast.error('Failed to download sample file');
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle file validation
  const handleValidation = async () => {
    if (!selectedFile) {
      return;
    }

    setIsValidating(true);

    try {
      const formData = new FormData();
      formData.append('excelFile', selectedFile);

      const token = Cookies.get('adminToken');
      const response = await fetch(buildApiUrl('/api/dashboard/product-translation/validate'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();
      
      if (response.ok) {
        toast.success(result.message);
        router.push(`/dashboard/products/translation/${result.translationLogId}`);
      } else {
        throw new Error(result.message || 'Validation failed');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to validate translation file');
    } finally {
      setIsValidating(false);
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'validated':
        return <Badge variant="outline">Validated</Badge>;
      case 'processing':
        return <Badge variant="outline">Processing</Badge>;
      case 'completed':
        return <Badge variant="default">Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="px-0 space-y-6">
        {/* Sticky Header */}
        <div className="sticky top-16 left-0 lg:left-64 right-0 z-30 bg-background py-2">
          <div className="container mx-auto">
            <div className="flex items-center justify-between gap-2 md:gap-4">
              {/* Left Section - Back Button and Title */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.back()}
                  className="h-8 w-8 p-0 hover:bg-muted"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <h1 className="text-sm sm:text-base md:text-xl lg:text-2xl font-bold truncate">
                    <span className="hidden sm:inline">Product Translation</span>
                    <span className="sm:hidden">Translation</span>
                  </h1>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto">

          {/* Permission Check */}
          {user && !['super-admin', 'admin'].includes(user.role) && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You don't have permission to translate products. Only Super Admins and Admins can perform product translations.
              </AlertDescription>
            </Alert>
          )}

          {/* Main Content */}
          {user && ['super-admin', 'admin'].includes(user.role) && (
            <div 
              className="grid gap-6 md:grid-cols-2"
              onClick={(e) => {
                // Close brand dropdown when clicking outside
                if (!e.target.closest('.brand-dropdown-container')) {
                  setShowBrandDropdown(false);
                }
              }}
            >
              {/* Download Sample */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Download Sample Template
                  </CardTitle>
                  <CardDescription>
                    Select a brand and download a sample Excel file with translation data from that brand
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Brand Selection */}
                  <div className="space-y-2 brand-dropdown-container">
                    <Label htmlFor="brand-select">Select Brand</Label>
                    <div className="relative">
                      <div
                        className="min-h-[40px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-pointer flex items-center justify-between"
                        onClick={() => setShowBrandDropdown(!showBrandDropdown)}
                      >
                        <div className="flex items-center">
                          {!selectedBrand ? (
                            <span className="text-muted-foreground">Select a brand...</span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span>{selectedBrand.title}</span>
                              <X
                                className="h-4 w-4 cursor-pointer hover:text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  clearBrand();
                                }}
                              />
                            </div>
                          )}
                        </div>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </div>

                      {/* Dropdown */}
                      {showBrandDropdown && (
                        <div className="absolute z-50 w-full mt-1 bg-background border border-input rounded-md shadow-lg max-h-60 overflow-hidden">
                          {/* Search */}
                          <div className="p-2 border-b">
                            <Input
                              placeholder="Search brands..."
                              value={brandSearchTerm}
                              onChange={(e) => setBrandSearchTerm(e.target.value)}
                              className="h-8"
                            />
                          </div>
                          
                          {/* Brand List */}
                          <div className="max-h-48 overflow-y-auto">
                            {loadingBrands ? (
                              <div className="p-4 text-center">
                                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                                <p className="text-sm text-muted-foreground mt-2">Loading brands...</p>
                              </div>
                            ) : filteredBrands.length === 0 ? (
                              <div className="p-4 text-center text-sm text-muted-foreground">
                                No brands found
                              </div>
                            ) : (
                              filteredBrands.map((brand) => {
                                const isSelected = selectedBrand && selectedBrand._id === brand._id;
                                return (
                                  <div
                                    key={brand._id}
                                    className={`p-2 cursor-pointer hover:bg-accent flex items-center gap-2 ${
                                      isSelected ? 'bg-accent' : ''
                                    }`}
                                    onClick={() => handleBrandSelect(brand)}
                                  >
                                    <div className={`w-4 h-4 border rounded-full flex items-center justify-center ${
                                      isSelected ? 'bg-primary border-primary' : 'border-input'
                                    }`}>
                                      {isSelected && <div className="w-2 h-2 bg-primary-foreground rounded-full" />}
                                    </div>
                                    <span className="text-sm">{brand.title}</span>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Selected count */}
                    {selectedBrand && (
                      <p className="text-xs text-muted-foreground">
                        1 brand selected
                      </p>
                    )}
                  </div>

                  <Button 
                    onClick={handleDownloadSample}
                    disabled={isDownloading || !selectedBrand}
                    className="w-full"
                    variant="outline"
                  >
                    {isDownloading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Download Sample Excel
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Upload File */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Upload Excel File
                  </CardTitle>
                  <CardDescription>
                    Select an Excel file (.xlsx or .xls) with product translations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* File Upload Area */}
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      dragActive 
                        ? 'border-primary bg-primary/5' 
                        : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <FileSpreadsheet className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <div className="space-y-2">
                      <p className="text-sm font-medium">
                        {selectedFile ? selectedFile.name : 'Drop your Excel file here, or click to browse'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Supports .xlsx and .xls files up to 50MB
                      </p>
                    </div>
                    <Input
                      id="file-upload"
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Label
                      htmlFor="file-upload"
                      className="mt-4 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 cursor-pointer"
                    >
                      Choose File
                    </Label>
                    
                    {selectedFile && (
                      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileSpreadsheet className="h-4 w-4 text-green-600" />
                            <div className="text-left">
                              <p className="text-sm font-medium">{selectedFile.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedFile(null);
                              const fileInput = document.getElementById('file-upload');
                              if (fileInput) fileInput.value = '';
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Validate & Upload Button */}
                  <Button
                    onClick={handleValidation}
                    disabled={!selectedFile || isValidating}
                    className="w-full"
                  >
                    {isValidating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Validating & Processing...
                      </>
                    ) : (
                      <>
                        <Languages className="mr-2 h-4 w-4" />
                        Validate & Process Translations
                      </>
                    )}
                  </Button>

                  {/* Help Text */}
                  <div className="space-y-2 pt-2 border-t">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Languages className="h-4 w-4" />
                      Translation Guidelines
                    </h4>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      <li>• Excel file must contain 'partNumber' and language columns (ar, pt, es, tr, ru, en)</li>
                      <li>• System matches existing products by partNumber and updates translation fields only</li>
                      <li>• Download sample file first to see the correct format</li>
                      <li>• Large files are processed in background with progress tracking</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Recent Translation Logs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Recent Translation Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingLogs ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading translation logs...</span>
                </div>
              ) : translationLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Languages className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No translation logs found</p>
                  <p className="text-sm">Start by uploading a translation file</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-32">Log ID</TableHead>
                        <TableHead>File Name</TableHead>
                        <TableHead className="w-24 text-center">Total</TableHead>
                        <TableHead className="w-24 text-center">Valid</TableHead>
                        <TableHead className="w-24 text-center">Invalid</TableHead>
                        <TableHead className="w-28">Status</TableHead>
                        <TableHead className="w-32">Uploaded By</TableHead>
                        <TableHead className="w-40">Date</TableHead>
                        <TableHead className="w-20">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {translationLogs.map((log) => (
                        <TableRow 
                          key={log.logId}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => router.push(`/dashboard/products/translation/${log.logId}`)}
                        >
                          <TableCell className="font-mono text-xs">{log.logId}</TableCell>
                          <TableCell className="font-medium max-w-48 truncate" title={log.fileName}>
                            {log.fileName}
                          </TableCell>
                          <TableCell className="text-center">{log.totalRows}</TableCell>
                          <TableCell className="text-center text-green-600">{log.validRows}</TableCell>
                          <TableCell className="text-center text-red-600">{log.invalidRows}</TableCell>
                          <TableCell>
                            <Badge variant={
                              log.processStatus === 'completed' ? 'default' :
                              log.processStatus === 'validated' ? 'secondary' : 'destructive'
                            } className="text-xs">
                              {log.processStatus === 'completed' ? 'Translated' :
                               log.processStatus === 'validated' ? 'Ready' :
                               log.processStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{log.uploadedBy}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(log.uploadedAt).toLocaleDateString()}
                            </div>
                            <div className="text-xs mt-1">
                              {new Date(log.uploadedAt).toLocaleTimeString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/dashboard/products/translation/${log.logId}`);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        
        </div>
      </div>
    </div>
  );
}