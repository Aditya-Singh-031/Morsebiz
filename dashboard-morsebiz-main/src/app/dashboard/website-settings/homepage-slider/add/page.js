'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import RoleProtectedRoute from '@/components/RoleProtectedRoute';
import SliderForm from '../components/SliderForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function AddSliderPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  // Handle success - redirect to edit page of newly created slider
  const handleSuccess = (result) => {
    // SliderForm already shows success toast
    // Get the created slider ID from the response
    const createdSliderId = result?.data?._id || result?._id;
    if (createdSliderId) {
      router.push(`/dashboard/website-settings/homepage-slider/edit/${createdSliderId}`);
    } else {
      // Fallback to list page if ID extraction fails
      router.push('/dashboard/website-settings/homepage-slider');
    }
  };

  // Handle cancel
  const handleCancel = () => {
    router.push('/dashboard/website-settings/homepage-slider');
  };

  // Handle back navigation
  const handleBack = () => {
    router.back();
  };

  return (
    <RoleProtectedRoute allowedRoles={['admin', 'super-admin']}>
      <div className="flex flex-col min-h-screen">
        {/* Header - Sticky like products page */}
        <div className="sticky top-16 left-0 lg:left-64 right-0 z-30 bg-background py-2 border-b">
          <div className="container mx-auto px-2 sm:px-4">
            <div className="flex items-center justify-between gap-1 sm:gap-2 min-w-0">
              {/* Left Section - Back Button and Title */}
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 min-w-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="h-8 w-8 p-0 hover:bg-muted flex-shrink-0"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-sm sm:text-base lg:text-xl font-bold truncate min-w-0">
                  <span className="hidden sm:inline">Add New Homepage Slider</span>
                  <span className="sm:hidden">Add Slider</span>
                </h1>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-0 space-y-6 flex-1">
          {/* Slider Form - Full Width */}
          <div className="w-full">
            <div className="w-full">
              <div className="w-full">
                <SliderForm 
                  mode="add"
                  onSuccess={handleSuccess}
                  onCancel={handleCancel}
                  setSubmitting={setSubmitting}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Save Button - Only at bottom */}
        <div className="sticky bottom-0 bg-background z-20 w-full border-t">
          <div className="w-full py-3 px-4">
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={submitting}
                className="h-9 px-3 text-xs sm:text-sm"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  // Show confirmation dialog
                  if (window.confirm('Are you sure you want to create this slider?')) {
                    const form = document.querySelector('form[data-slider-form]');
                    if (form) {
                      form.requestSubmit();
                    }
                  }
                }}
                disabled={submitting}
                className="h-9 px-3 text-xs sm:text-sm"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Slider
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </RoleProtectedRoute>
  );
}