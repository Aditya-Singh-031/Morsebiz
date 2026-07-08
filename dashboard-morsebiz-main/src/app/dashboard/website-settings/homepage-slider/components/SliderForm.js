'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import config from '@/config/config';
import FileUploader from '@/components/FileUploader/FileUploader';
import { Plus, X, Image as ImageIcon, Video } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from 'sonner';
import HomepageSliderService from '@/services/homepageSliderService';

import PreviewToggle from './PreviewToggle';
import StyleSettings from './StyleSettings';

// Memoized component for tagline items to prevent unnecessary re-renders
const TaglineItem = React.memo(({ tagline, index, onRemove, getImageUrl, disabled }) => {
  const handleRemove = useCallback(() => {
    onRemove(index);
  }, [onRemove, index]);

  return (
    <div className="p-3 border rounded-lg flex items-center justify-between bg-muted/20">
      <div className="flex items-center space-x-3 flex-1">
        {tagline.image && (
          <div className="w-10 h-10 rounded overflow-hidden bg-muted flex-shrink-0">
            <Image
              src={getImageUrl(tagline.image)}
              alt={tagline.text}
              width={40}
              height={40}
              className="object-cover w-full h-full"
              onError={(e) => {
                e.target.src = '/images/no-image.png';
              }}
            />
          </div>
        )}
        <div className="flex-1">
          <span className="text-sm font-medium">{tagline.text}</span>
          <p className="text-xs text-muted-foreground">Position: {index + 1}</p>
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleRemove}
        disabled={disabled}
        className="text-destructive hover:text-destructive"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
});

TaglineItem.displayName = 'TaglineItem';

const SliderForm = ({
  sliderId = null, // For edit mode
  mode = 'add', // 'add' or 'edit'
  onSuccess,
  onCancel,
  setSubmitting
}) => {
  const router = useRouter();
  const [sliderData, setSliderData] = useState({
    title: '',
    description: '',
    taglines: [],
    buttonText: '',
    buttonLink: '',
    buttonTarget: 'same',
    featureMedia: '',
    bgMedia: '',
    order: 0,
    isActive: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [newTagline, setNewTagline] = useState({ text: '', image: '' });
  const [showAddTagline, setShowAddTagline] = useState(false);
  const [isLoadingSlider, setIsLoadingSlider] = useState(false);
  
  // Breakpoint state
  const [currentBreakpoint, setCurrentBreakpoint] = useState('desktop');

  const isEditing = useMemo(() => mode === 'edit' && Boolean(sliderId), [mode, sliderId]);

  // Check if tagline can be added
  const canAddTagline = useMemo(() => {
    return newTagline.text.trim() && newTagline.image && !isLoading;
  }, [newTagline.text, newTagline.image, isLoading]);

  // Helper function to get image URL with validation (memoized to prevent re-renders)
  const getImageUrl = useCallback((imageUrl) => {
    // If no image URL provided, return fallback
    if (!imageUrl || typeof imageUrl !== 'string') {
      return '/images/no-image.png';
    }

    // If it's already a full URL (starts with http/https), return as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }

    // If it starts with a slash, it's a relative path from root
    if (imageUrl.startsWith('/')) {
      return imageUrl;
    }

    // Otherwise, construct the full URL using the config
    return `${config.API_BASE_URL}/${imageUrl}`;
  }, []);

  // Helper function to scale size values to half for mobile
  const scaleToHalf = useCallback((value) => {
    if (!value || typeof value !== 'string') return value;
    
    const match = value.match(/^(\d+(?:\.\d+)?)(\w*)$/);
    if (match) {
      const number = parseFloat(match[1]);
      const unit = match[2] || 'px';
      return `${Math.round(number / 2)}${unit}`;
    }
    return value;
  }, []);

  // Default styles for reset/new slider
  const getDefaultStyles = useCallback(() => ({
    backgroundColor: '#F3E8FF',
    backgroundOpacity: 1.0,
    overlayColor: '#F3E8FF',
    overlayOpacity: 0,
    title: {
      // Typography
      color: '#000000',
      fontSize: '25px',
      fontWeight: 'bold',
      lineHeight: '1.2',
      letterSpacing: '0px',
      wordSpacing: '0px',
      textAlign: 'left',
      textTransform: 'none',
      textDecoration: 'none',
      // Spacing
      marginTop: '0px',
      marginBottom: '0px',
      marginLeft: '0px',
      marginRight: '0px',
      paddingTop: '0px',
      paddingBottom: '0px',
      paddingLeft: '0px',
      paddingRight: '0px'
    },
    description: {
      // Typography
      color: '#000000',
      fontSize: '18px',
      fontWeight: 'normal',
      lineHeight: '1.5',
      letterSpacing: '0px',
      wordSpacing: '0px',
      textAlign: 'left',
      textTransform: 'none',
      textDecoration: 'none',
      // Spacing
      marginTop: '0px',
      marginBottom: '20px',
      marginLeft: '0px',
      marginRight: '0px',
      paddingTop: '0px',
      paddingBottom: '0px',
      paddingLeft: '0px',
      paddingRight: '0px'
    },
    button: {
      backgroundColor: '#3b82f6',
      color: '#000000',
      fontSize: '16px',
      fontWeight: '600',
      borderRadius: '14px',
      paddingTop: '10px',
      paddingBottom: '10px',
      paddingLeft: '24px',
      paddingRight: '24px',
      marginTop: '0px',
      marginBottom: '0px',
      marginLeft: '0px',
      marginRight: '0px'
    },
    backgroundImage: {
      width: 'auto',
      height: 'auto',
      objectFit: 'cover',
      objectPosition: 'center'
    },
    featureImage: {
      width: 'auto',
      height: 'auto',
      objectFit: 'cover',
      objectPosition: 'center'
    },
    container: {
      // Layout properties
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'nowrap',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '0px',
      // Spacing
      paddingTop: '0px',
      paddingBottom: '0px',
      paddingLeft: '0px',
      paddingRight: '0px'
    },
    layout: {
      leftWidth: '50%',
      rightWidth: '50%'
    },
    leftContent: {
      paddingTop: '0px',
      paddingBottom: '0px',
      paddingLeft: '0px',
      paddingRight: '0px',
      marginTop: '0px',
      marginBottom: '0px',
      marginLeft: '0px',
      marginRight: '0px'
    },
    rightContent: {
      paddingTop: '0px',
      paddingBottom: '0px',
      paddingLeft: '0px',
      paddingRight: '0px',
      marginTop: '0px',
      marginBottom: '0px',
      marginLeft: '0px',
      marginRight: '0px'
    },
    tagline: {
      // Typography
      color: '#ffffff',
      fontSize: '14px',
      fontWeight: '500',
      lineHeight: '1.4',
      letterSpacing: '0px',
      wordSpacing: '0px',
      textAlign: 'center',
      textTransform: 'none',
      textDecoration: 'none',
      // Background
      backgroundColor: '#ffffff',
      backgroundOpacity: 0.1,
      // Border
      borderColor: '#ffffff',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderRadius: '12px',
      // Spacing
      marginTop: '0px',
      marginBottom: '0px',
      marginLeft: '4px',
      marginRight: '4px',
      paddingTop: '8px',
      paddingBottom: '8px',
      paddingLeft: '12px',
      paddingRight: '12px',
      gap: '8px',
      // Container spacing
      containerMarginTop: '0px',
      containerMarginBottom: '20px',
      containerMarginLeft: '0px',
      containerMarginRight: '0px',
      // Layout settings
      displayType: 'flex', // 'flex' for list, 'grid' for grid
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'flex-start',
      alignItems: 'center',
      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
      gridGap: '8px',
      rowGap: '8px',
      columnGap: '8px',
      // Image styling
      imageWidth: '20px',
      imageHeight: '20px',
      imageBorderRadius: '50%',
      imageObjectFit: 'cover'
    }
  }), []);

  // Mobile default styles with half sizes but same colors
  const getMobileDefaultStyles = useCallback(() => {
    const desktopStyles = getDefaultStyles();
    
    return {
      ...desktopStyles, // Keep all colors same
      title: {
        ...desktopStyles.title,
        fontSize: scaleToHalf(desktopStyles.title.fontSize),
        marginBottom: scaleToHalf(desktopStyles.title.marginBottom),
        paddingTop: scaleToHalf(desktopStyles.title.paddingTop),
        paddingBottom: scaleToHalf(desktopStyles.title.paddingBottom),
        paddingLeft: scaleToHalf(desktopStyles.title.paddingLeft),
        paddingRight: scaleToHalf(desktopStyles.title.paddingRight)
      },
      description: {
        ...desktopStyles.description,
        fontSize: scaleToHalf(desktopStyles.description.fontSize),
        marginBottom: scaleToHalf(desktopStyles.description.marginBottom),
        paddingTop: scaleToHalf(desktopStyles.description.paddingTop),
        paddingBottom: scaleToHalf(desktopStyles.description.paddingBottom),
        paddingLeft: scaleToHalf(desktopStyles.description.paddingLeft),
        paddingRight: scaleToHalf(desktopStyles.description.paddingRight)
      },
      button: {
        ...desktopStyles.button,
        fontSize: scaleToHalf(desktopStyles.button.fontSize),
        borderRadius: scaleToHalf(desktopStyles.button.borderRadius),
        paddingTop: scaleToHalf(desktopStyles.button.paddingTop),
        paddingBottom: scaleToHalf(desktopStyles.button.paddingBottom),
        paddingLeft: scaleToHalf(desktopStyles.button.paddingLeft),
        paddingRight: scaleToHalf(desktopStyles.button.paddingRight)
      },
      container: {
        ...desktopStyles.container,
        gap: scaleToHalf(desktopStyles.container.gap),
        paddingTop: scaleToHalf(desktopStyles.container.paddingTop),
        paddingBottom: scaleToHalf(desktopStyles.container.paddingBottom),
        paddingLeft: scaleToHalf(desktopStyles.container.paddingLeft),
        paddingRight: scaleToHalf(desktopStyles.container.paddingRight)
      },
      leftContent: {
        ...desktopStyles.leftContent,
        paddingTop: scaleToHalf(desktopStyles.leftContent.paddingTop),
        paddingBottom: scaleToHalf(desktopStyles.leftContent.paddingBottom),
        paddingLeft: scaleToHalf(desktopStyles.leftContent.paddingLeft),
        paddingRight: scaleToHalf(desktopStyles.leftContent.paddingRight),
        marginTop: scaleToHalf(desktopStyles.leftContent.marginTop),
        marginBottom: scaleToHalf(desktopStyles.leftContent.marginBottom),
        marginLeft: scaleToHalf(desktopStyles.leftContent.marginLeft),
        marginRight: scaleToHalf(desktopStyles.leftContent.marginRight)
      },
      rightContent: {
        ...desktopStyles.rightContent,
        paddingTop: scaleToHalf(desktopStyles.rightContent.paddingTop),
        paddingBottom: scaleToHalf(desktopStyles.rightContent.paddingBottom),
        paddingLeft: scaleToHalf(desktopStyles.rightContent.paddingLeft),
        paddingRight: scaleToHalf(desktopStyles.rightContent.paddingRight),
        marginTop: scaleToHalf(desktopStyles.rightContent.marginTop),
        marginBottom: scaleToHalf(desktopStyles.rightContent.marginBottom),
        marginLeft: scaleToHalf(desktopStyles.rightContent.marginLeft),
        marginRight: scaleToHalf(desktopStyles.rightContent.marginRight)
      },
      tagline: {
        ...desktopStyles.tagline,
        fontSize: scaleToHalf(desktopStyles.tagline.fontSize),
        borderRadius: scaleToHalf(desktopStyles.tagline.borderRadius),
        borderWidth: scaleToHalf(desktopStyles.tagline.borderWidth),
        paddingTop: scaleToHalf(desktopStyles.tagline.paddingTop),
        paddingBottom: scaleToHalf(desktopStyles.tagline.paddingBottom),
        paddingLeft: scaleToHalf(desktopStyles.tagline.paddingLeft),
        paddingRight: scaleToHalf(desktopStyles.tagline.paddingRight),
        gap: scaleToHalf(desktopStyles.tagline.gap),
        containerMarginBottom: scaleToHalf(desktopStyles.tagline.containerMarginBottom),
        gridGap: scaleToHalf(desktopStyles.tagline.gridGap),
        rowGap: scaleToHalf(desktopStyles.tagline.rowGap),
        columnGap: scaleToHalf(desktopStyles.tagline.columnGap),
        imageWidth: scaleToHalf(desktopStyles.tagline.imageWidth),
        imageHeight: scaleToHalf(desktopStyles.tagline.imageHeight)
      }
    };
  }, [getDefaultStyles, scaleToHalf]);

  const [styles, setStyles] = useState(() => ({
    desktop: getDefaultStyles(),
    mobile: getMobileDefaultStyles()
  }));

  // Function to clean up duplicate style properties
  const cleanupStyleProperties = useCallback((styleObj) => {
    if (!styleObj || typeof styleObj !== 'object') return styleObj;

    const cleaned = { ...styleObj };

    // Define the correct camelCase properties that should be kept
    const correctSpacingProps = [
      'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
      'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'
    ];

    // Remove any lowercase duplicates
    Object.keys(cleaned).forEach(key => {
      const lowerKey = key.toLowerCase();
      if (key !== lowerKey && correctSpacingProps.includes(key)) {
        delete cleaned[lowerKey];
      }
    });

    return cleaned;
  }, []);

  // Load slider data for editing
  useEffect(() => {
    if (isEditing && sliderId) {
      setIsLoadingSlider(true);
      HomepageSliderService.getSliderById(sliderId)
        .then((response) => {
          // Handle both direct data and wrapped response
          const slider = response.data || response;
          setSliderData({
            title: slider.title || '',
            description: slider.description || '',
            taglines: slider.taglines || [],
            buttonText: slider.buttonText || '',
            buttonLink: slider.buttonLink || '',
            buttonTarget: slider.buttonTarget || 'same',
            featureMedia: slider.featureMedia || '',
            bgMedia: slider.bgMedia || '',
            order: slider.order || 0,
            isActive: slider.isActive !== undefined ? slider.isActive : true
          });

          // Set styles if available - handle both old and new format
          if (slider.styles) {
            // Check if styles already have breakpoint structure
            if (slider.styles.desktop || slider.styles.mobile) {
              // New breakpoint format
              setStyles({
                desktop: slider.styles.desktop ? cleanupStyleProperties(slider.styles.desktop) : getDefaultStyles(),
                mobile: slider.styles.mobile ? cleanupStyleProperties(slider.styles.mobile) : getMobileDefaultStyles()
              });
            } else {
              // Old format - use as desktop styles and duplicate for mobile
              const cleanedStyles = cleanupStyleProperties(slider.styles);
              setStyles({
                desktop: cleanedStyles,
                mobile: getMobileDefaultStyles()
              });
            }
          } else {
            setStyles({
              desktop: getDefaultStyles(),
              mobile: getMobileDefaultStyles()
            });
          }
        })
        .catch((error) => {
          toast.error('Failed to load slider data');
          setError('Failed to load slider data');
        })
        .finally(() => {
          setIsLoadingSlider(false);
        });
    }
  }, [isEditing, sliderId, cleanupStyleProperties, getDefaultStyles, getMobileDefaultStyles]);

  // Handle input changes
  const handleInputChange = useCallback((field, value) => {
    setSliderData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  }, []);

  // Handle tagline addition
  const handleAddTagline = useCallback(() => {
    if (!canAddTagline) return;

    const taglineToAdd = { ...newTagline };
    setSliderData(prev => ({
      ...prev,
      taglines: [...prev.taglines, taglineToAdd]
    }));
    setNewTagline({ text: '', image: '' });
    setShowAddTagline(false);
  }, [canAddTagline, newTagline]);

  // Handle tagline removal
  const handleRemoveTagline = useCallback((index) => {
    setSliderData(prev => ({
      ...prev,
      taglines: prev.taglines.filter((_, i) => i !== index)
    }));
  }, []);

  // Handle direct style changes (for simple properties like backgroundColor, overlayColor, etc.)
  const handleDirectStyleChange = useCallback((field, value) => {
    setStyles(prev => {
      const newStyles = {
        ...prev,
        [currentBreakpoint]: {
          ...prev[currentBreakpoint],
          [field]: value
        }
      };
      
      // Also update sliderData.styles for immediate preview
      setSliderData(prevData => ({
        ...prevData,
        styles: newStyles
      }));
      
      return newStyles;
    });
  }, [currentBreakpoint]);

  // Handle nested style changes (for complex properties like backgroundImage.width, title.fontSize, etc.)
  const handleStyleChange = useCallback((section, field, value) => {
    setStyles(prev => {
      const newStyles = {
        ...prev,
        [currentBreakpoint]: {
          ...prev[currentBreakpoint],
          [section]: {
            ...prev[currentBreakpoint]?.[section],
            [field]: value
          }
        }
      };
      
      // Also update sliderData.styles for immediate preview
      setSliderData(prevData => ({
        ...prevData,
        styles: newStyles
      }));
      
      return newStyles;
    });
  }, [currentBreakpoint]);

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    setIsLoading(true);
    setError('');
    
    // Update parent submitting state if provided
    if (setSubmitting) {
      setSubmitting(true);
    }

    try {
      const dataToSubmit = {
        ...sliderData,
        styles: styles
      };
      
      let result;
      if (isEditing) {
        result = await HomepageSliderService.updateSlider(sliderId, dataToSubmit);
        toast.success('Slider updated successfully');
        // For edit mode, call onSuccess but don't redirect
        if (onSuccess) {
          onSuccess(result);
        }
      } else {
        result = await HomepageSliderService.createSlider(dataToSubmit);
        toast.success('Slider created successfully');
        // For create mode, always call onSuccess callback
        if (onSuccess) {
          onSuccess(result);
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save slider';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
      // Update parent submitting state if provided
      if (setSubmitting) {
        setSubmitting(false);
      }
    }
  }, [sliderData, styles, isEditing, sliderId, onSuccess, router, setSubmitting]);



  if (isLoadingSlider) {

    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-5">
      
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column - Preview */}
        <div className="lg:sticky lg:top-50 lg:h-fit w-full min-w-0">
          <PreviewToggle
            sliderData={sliderData}
            styles={styles || { desktop: getDefaultStyles(), mobile: getMobileDefaultStyles() }}
            getImageUrl={getImageUrl}
            currentBreakpoint={currentBreakpoint}
            onBreakpointChange={setCurrentBreakpoint}
          />
        </div>

        {/* Right Column - Form */}
        <form onSubmit={handleSubmit} data-slider-form  className="space-y-6 w-full">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={sliderData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter slider title"
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={sliderData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter slider description"
                  rows={3}
                  disabled={isLoading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="order">Order</Label>
                  <Input
                    id="order"
                    type="number"
                    value={sliderData.order}
                    onChange={(e) => handleInputChange('order', parseInt(e.target.value) || 0)}
                    placeholder="0"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="isActive">Status</Label>
                  <Select
                    value={sliderData.isActive ? 'true' : 'false'}
                    onValueChange={(value) => handleInputChange('isActive', value === 'true')}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Button Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Button Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="buttonText">Button Text</Label>
                <Input
                  id="buttonText"
                  value={sliderData.buttonText}
                  onChange={(e) => handleInputChange('buttonText', e.target.value)}
                  placeholder="Enter button text"
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="buttonLink">Button Link</Label>
                <Input
                  id="buttonLink"
                  value={sliderData.buttonLink}
                  onChange={(e) => handleInputChange('buttonLink', e.target.value)}
                  placeholder="Enter button link"
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="buttonTarget">Button Target</Label>
                <Select
                  value={sliderData.buttonTarget}
                  onValueChange={(value) => handleInputChange('buttonTarget', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="same">Same Window</SelectItem>
                    <SelectItem value="new">New Window</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Media Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Feature Media</Label>
                <div className="mt-2">
                  <FileUploader
                    onUploadSuccess={(uploadedFile) => {
                      if (uploadedFile && uploadedFile.url) {
                        setSliderData(prev => ({
                          ...prev,
                          featureMedia: uploadedFile.url
                        }));
                        toast.success('Feature media uploaded successfully');
                      }
                    }}
                    acceptedFileTypes="image/*,video/*"
                    disabled={isLoading}
                    compact={true}
                    folderName="homepage-sliders"
                  />
                </div>
                {sliderData.featureMedia && (
                  <div className="mt-3">
                    <h4 className="text-sm font-medium mb-2">Uploaded Feature Media</h4>
                    <div className="relative group inline-block">
                      <div className="w-32 h-24 bg-muted rounded-md overflow-hidden border">
                        <Image
                          src={getImageUrl(sliderData.featureMedia)}
                          alt="Feature Media"
                          width={128}
                          height={96}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = '/images/no-image.png';
                          }}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => {
                          setSliderData(prev => ({ ...prev, featureMedia: '' }));
                        }}
                      >
                        <X className="h-2 w-2" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Label>Background Media</Label>
                <div className="mt-2">
                  <FileUploader
                    onUploadSuccess={(uploadedFile) => {
                      if (uploadedFile && uploadedFile.url) {
                        setSliderData(prev => ({
                          ...prev,
                          bgMedia: uploadedFile.url
                        }));
                        toast.success('Background media uploaded successfully');
                      }
                    }}
                    acceptedFileTypes="image/*,video/*"
                    disabled={isLoading}
                    compact={true}
                    folderName="homepage-sliders"
                  />
                </div>
                {sliderData.bgMedia && (
                  <div className="mt-3">
                    <h4 className="text-sm font-medium mb-2">Uploaded Background Media</h4>
                    <div className="relative group inline-block">
                      <div className="w-32 h-24 bg-muted rounded-md overflow-hidden border">
                        <Image
                          src={getImageUrl(sliderData.bgMedia)}
                          alt="Background Media"
                          width={128}
                          height={96}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = '/images/no-image.png';
                          }}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => {
                          setSliderData(prev => ({ ...prev, bgMedia: '' }));
                        }}
                      >
                        <X className="h-2 w-2" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Taglines */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Taglines
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddTagline(!showAddTagline)}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Tagline
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Tagline Form */}
              {showAddTagline && (
                <div className="p-4 border rounded-lg bg-muted/20 space-y-3">
                  <Input
                    value={newTagline.text}
                    onChange={(e) => setNewTagline(prev => ({ ...prev, text: e.target.value }))}
                    placeholder="Enter tagline text"
                    disabled={isLoading}
                  />
                  <FileUploader
                    onUploadSuccess={(uploadedFile) => {
                      if (uploadedFile && uploadedFile.url) {
                        setNewTagline(prev => ({ ...prev, image: uploadedFile.url }));
                        toast.success('Tagline image uploaded successfully');
                      }
                    }}
                    acceptedFileTypes="image/*"
                    disabled={isLoading}
                    compact={true}
                    folderName="homepage-sliders"
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAddTagline}
                      disabled={!canAddTagline}
                    >
                      Add
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowAddTagline(false);
                        setNewTagline({ text: '', image: '' });
                      }}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Existing Taglines */}
              <div className="space-y-2">
                {sliderData.taglines.map((tagline, index) => (
                  <TaglineItem
                    key={index}
                    tagline={tagline}
                    index={index}
                    onRemove={handleRemoveTagline}
                    getImageUrl={getImageUrl}
                    disabled={isLoading}
                  />
                ))}
                {sliderData.taglines.length === 0 && (
                  <p className="text-sm text-muted-foreground">No taglines added yet.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Style Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Style Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <StyleSettings
                styles={styles?.[currentBreakpoint] || (currentBreakpoint === 'mobile' ? getMobileDefaultStyles() : getDefaultStyles())}
                onStyleChange={handleStyleChange}
                onDirectStyleChange={handleDirectStyleChange}
                disabled={isLoading}
                currentBreakpoint={currentBreakpoint}
                onBreakpointChange={setCurrentBreakpoint}
              />
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default SliderForm;