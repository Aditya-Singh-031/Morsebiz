'use client';

import React, { useState, useEffect } from 'react';
import { ExternalLink, Phone, Mail, User, Package, MessageSquare, Calendar, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import CustomerEnquiryService from '@/services/customerEnquiryService';

const CustomerEnquiryDialog = ({ 
  open, 
  onClose, 
  customerEnquiryId, 
  onStatusUpdate 
}) => {
  const [customerEnquiry, setCustomerEnquiry] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Fetch customer enquiry details when dialog opens
  useEffect(() => {
    if (open && customerEnquiryId) {
      fetchCustomerEnquiryDetails();
    } else if (!open) {
      // Reset state when dialog closes
      setCustomerEnquiry(null);
      setError(null);
    }
  }, [open, customerEnquiryId]);

  const fetchCustomerEnquiryDetails = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await CustomerEnquiryService.getCustomerEnquiryById(customerEnquiryId);
      
      if (response.success) {
        setCustomerEnquiry(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch customer enquiry details');
      }
    } catch (err) {
      console.error('Error fetching customer enquiry details:', err);
      setError(err.message);
      toast.error('Failed to load customer enquiry details');
    } finally {
      setIsLoading(false);
    }
  };

  // Status color mapping
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'partial':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      case 'submitted':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'completed':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  // Status transition rules
  const getAvailableStatusOptions = (currentStatus) => {
    const allStatuses = [
      { value: 'partial', label: 'Partial' },
      { value: 'submitted', label: 'Submitted' },
      { value: 'in-progress', label: 'In Progress' },
      { value: 'completed', label: 'Completed' },
      { value: 'cancelled', label: 'Cancelled' }
    ];

    switch (currentStatus) {
      case 'partial':
        // Partial can only go to submitted
        return allStatuses.filter(status => ['partial', 'submitted'].includes(status.value));
      
      case 'submitted':
        // Submitted can go to in-progress, completed, or cancelled (but not back to partial)
        return allStatuses.filter(status => ['submitted', 'in-progress', 'completed', 'cancelled'].includes(status.value));
      
      case 'in-progress':
        // In-progress can go to completed or cancelled
        return allStatuses.filter(status => ['in-progress', 'completed', 'cancelled'].includes(status.value));
      
      case 'completed':
      case 'cancelled':
        // Completed and cancelled are final states - no changes allowed
        return allStatuses.filter(status => status.value === currentStatus);
      
      default:
        return allStatuses;
    }
  };

  // Check if status can be updated
  const canUpdateStatus = (currentStatus) => {
    return !['completed', 'cancelled'].includes(currentStatus);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  // Handle attachment view
  const handleAttachmentView = (attachment) => {
    if (attachment && attachment.fileUrl) {
      window.open(attachment.fileUrl, '_blank');
    }
  };

  // Handle status update
  const handleStatusUpdate = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      
      const response = await CustomerEnquiryService.updateCustomerEnquiryStatus(customerEnquiryId, newStatus);
      
      if (response.success) {
        setCustomerEnquiry(prev => ({ ...prev, status: newStatus }));
        toast.success('Status updated successfully');
        
        // Notify parent component about the status update
        if (onStatusUpdate) {
          onStatusUpdate(customerEnquiryId, newStatus);
        }
      } else {
        throw new Error(response.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
    return Math.round(bytes / (1024 * 1024)) + ' MB';
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Customer Enquiry Details
          </DialogTitle>
          <DialogDescription>
            Complete information about this customer enquiry
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* Error Message */}
          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-200">
              {error}
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="space-y-4 flex-1 overflow-y-auto p-2">
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={`skeleton-${index}`} className="rounded-lg border p-3 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customer Enquiry Details */}
          {!isLoading && !error && customerEnquiry && (
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-4 p-2">
                {/* Status and Actions Row */}
                <div className="flex items-center justify-between bg-background p-3 rounded-md">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground">Status:</span>
                    <div className="relative">
                      <Select 
                        value={customerEnquiry.status} 
                        onValueChange={handleStatusUpdate}
                        disabled={updatingStatus || !canUpdateStatus(customerEnquiry.status)}
                      >
                        <SelectTrigger 
                          className="w-36"
                          title={!canUpdateStatus(customerEnquiry.status) ? 
                            `Cannot change status from ${customerEnquiry.status}. This is a final status.` : 
                            'Click to change status'
                          }
                        >
                          <Badge 
                            variant="secondary"
                            className={`text-xs capitalize cursor-pointer ${getStatusBadgeColor(customerEnquiry.status)}`}
                          >
                            {updatingStatus ? (
                              <>
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                Updating...
                              </>
                            ) : (
                              customerEnquiry.status
                            )}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailableStatusOptions(customerEnquiry.status).map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {!canUpdateStatus(customerEnquiry.status) && (
                        <div className="absolute -top-1 -right-1">
                          <div className="h-2 w-2 bg-red-500 rounded-full" title="Status locked"></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="rounded-lg border p-3 bg-background">
                  <h3 className="flex items-center gap-2 text-base font-semibold mb-3">
                    <User className="h-4 w-4 text-blue-600" />
                    Customer Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        Full Name
                      </div>
                      <div className="font-medium text-sm break-words">{customerEnquiry.fullName}</div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        Email Address
                      </div>
                      <div className="font-medium text-sm">
                        <a 
                          href={`mailto:${customerEnquiry.email}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline break-all"
                        >
                          {customerEnquiry.email}
                        </a>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        Phone Number
                      </div>
                      <div className="font-medium text-sm">
                        <a 
                          href={`tel:${customerEnquiry.phoneDialCode || ''}${customerEnquiry.mobile}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline break-words"
                        >
                          {customerEnquiry.phoneDialCode ? `${customerEnquiry.phoneDialCode} ${customerEnquiry.mobile}` : customerEnquiry.mobile}
                        </a>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        Country
                      </div>
                      <div className="font-medium text-sm break-words">{customerEnquiry.country || 'N/A'}</div>
                    </div>
                  </div>
                </div>

                {/* Product Information */}
                <div className="rounded-lg border p-3 bg-background">
                  <h3 className="flex items-center gap-2 text-base font-semibold mb-3">
                    <Package className="h-4 w-4 text-green-600" />
                    Product Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">Product Name</div>
                      <div className="font-medium text-sm break-words">{customerEnquiry.product}</div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">Quantity Required</div>
                      <div className="font-medium">
                        <Badge variant="outline" className="text-xs">
                          {customerEnquiry.quantity}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  {customerEnquiry.message && (
                    <div className="mt-3 space-y-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MessageSquare className="h-3 w-3" />
                        Customer Message
                      </div>
                      <div className="p-2 bg-background rounded-md border-l-2 border-blue-500">
                        <p className="text-xs leading-relaxed whitespace-pre-wrap break-words">
                          {customerEnquiry.message}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Attachment Information */}
                {customerEnquiry.attachment && (
                  <div className="rounded-lg border p-3 bg-background">
                    <h3 className="flex items-center gap-2 text-base font-semibold mb-3">
                      <ExternalLink className="h-4 w-4 text-purple-600" />
                      Attachment
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">File Name</div>
                        <div className="font-medium text-sm break-words">{customerEnquiry.attachment.originalName}</div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">File Size</div>
                        <div className="font-medium text-sm">{formatFileSize(customerEnquiry.attachment.fileSize)}</div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">File Type</div>
                        <div className="font-medium">
                          <Badge variant="secondary" className="text-xs">{customerEnquiry.attachment.mimeType}</Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleAttachmentView(customerEnquiry.attachment)}
                        className="w-full sm:w-auto text-xs"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View Attachment
                      </Button>
                    </div>
                  </div>
                )}

                {/* Timeline Information */}
                <div className="rounded-lg border p-3 bg-background">
                  <h3 className="flex items-center gap-2 text-base font-semibold mb-3">
                    <Calendar className="h-4 w-4 text-orange-600" />
                    Timeline
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">Created Date</div>
                      <div className="font-medium text-sm break-words">{formatDate(customerEnquiry.createdAt)}</div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">Submitted Date</div>
                      <div className="font-medium text-sm break-words">{formatDate(customerEnquiry.submittedAt)}</div>
                    </div>
                    
                    {customerEnquiry.updatedAt && (
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Last Updated</div>
                        <div className="font-medium text-sm break-words">{formatDate(customerEnquiry.updatedAt)}</div>
                      </div>
                    )}
                    
                    {customerEnquiry.updatedBy && (
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Updated By</div>
                        <div className="font-medium text-sm break-words">{customerEnquiry.updatedBy}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* No Results */}
          {!isLoading && !customerEnquiry && !error && (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <MessageSquare className="h-12 w-12 mb-4 text-gray-300" />
              <p className="text-lg font-medium">Customer enquiry not found</p>
              <p className="text-sm">The requested customer enquiry could not be loaded</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="flex items-center justify-end">
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {!isLoading && !error && customerEnquiry && (
              <Button 
                onClick={() => window.open(`mailto:${customerEnquiry.email}`, '_blank')}
                className="flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                Reply to Customer
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerEnquiryDialog;