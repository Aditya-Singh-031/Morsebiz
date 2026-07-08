'use client';

import { useState } from 'react';
import { Monitor, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SliderPreview from './SliderPreview';

const PreviewToggle = ({ sliderData, styles, getImageUrl, currentBreakpoint, onBreakpointChange }) => {
  const viewMode = currentBreakpoint;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Live Preview</CardTitle>
          <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
            <Button
              variant={viewMode === 'desktop' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onBreakpointChange('desktop')}
              className="h-8 px-3"
            >
              <Monitor className="h-4 w-4 mr-1" />
              Desktop
            </Button>
            <Button
              variant={viewMode === 'mobile' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onBreakpointChange('mobile')}
              className="h-8 px-3"
            >
              <Smartphone className="h-4 w-4 mr-1" />
              Mobile
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Preview how your slider will look on different devices
        </p>
      </CardHeader>
      <CardContent>
        <div className={`transition-all duration-300 ${
          viewMode === 'mobile' 
            ? 'mx-auto border-2 border-muted rounded-lg p-2 bg-muted/10 overflow-auto' 
            : 'mx-auto border-2 border-muted rounded-lg p-2 bg-muted/10 overflow-auto'
        }`} style={{ maxHeight: '400px' }}>
          <div className={`overflow-auto rounded-md ${
            viewMode === 'desktop' 
              ? 'w-[520px] h-[270px] mx-auto' 
              : 'w-[300px] h-[220px] mx-auto'
          }`}>
            <SliderPreview
              sliderData={sliderData}
              styles={styles}
              getImageUrl={getImageUrl}
              viewMode={viewMode}
            />
          </div>
        </div>
      
      </CardContent>
    </Card>
  );
};

export default PreviewToggle;