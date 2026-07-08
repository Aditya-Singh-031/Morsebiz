'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import RoleProtectedRoute from '@/components/RoleProtectedRoute';
import SliderForm from '../../components/SliderForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function EditSliderPage() {
  const params = useParams();
  const router = useRouter();
  const sliderId = params.id;
  const [submitting, setSubmitting] = useState(false);

  // Handle success - SliderForm will handle toast, no redirect for edit
  const handleSuccess = () => {
    // SliderForm already shows toast for edit mode
    // No redirect needed for edit mode - user stays on the same page
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
                  <span className="hidden sm:inline">Edit Homepage Slider</span>
                  <span className="sm:hidden">Edit Slider</span>
                </h1>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-0 space-y-6">
          <div className="w-full">
            <SliderForm
              mode="edit"
              sliderId={sliderId}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
              setSubmitting={setSubmitting}
            />
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
                  if (window.confirm('Are you sure you want to save the changes to this slider?')) {
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
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
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