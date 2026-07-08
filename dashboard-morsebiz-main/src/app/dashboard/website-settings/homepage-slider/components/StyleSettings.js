'use client';

import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Palette, 
  Type, 
  MousePointer, 
  Image as ImageIcon, 
  Layout,
  Settings,
  Link,
  Unlink,
  Move
} from 'lucide-react';

const ColorPicker = ({ label, value, onChange, opacity, onOpacityChange }) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
        <div className="flex items-center space-x-3 flex-1">
          <div className="relative">
            <input
              type="color"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-12 h-8 border border-border rounded cursor-pointer"
            />
          </div>
          <Input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 text-sm"
            placeholder="#000000"
          />
        </div>
        {opacity !== undefined && (
          <div className="flex items-center space-x-1 sm:space-x-2 min-w-0 max-w-full">
            <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">Opacity:</span>
            <input
              type="range"
              value={opacity}
              onChange={(e) => onOpacityChange(parseFloat(e.target.value))}
              max="1"
              min="0"
              step="0.1"
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer min-w-0"
            />
            <span className="text-xs text-muted-foreground w-6 sm:w-8 whitespace-nowrap flex-shrink-0 text-right">{Math.round(opacity * 100)}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

const SpacingControls = ({ label, values, onChange, prefix = "" }) => {
  const [unit, setUnit] = useState('px');
  const [isLinked, setIsLinked] = useState(false);
  
  const spacingTypes = [
    { key: 'Top', label: 'T' },
    { key: 'Right', label: 'R' },
    { key: 'Bottom', label: 'B' },
    { key: 'Left', label: 'L' },
  ];

  // Helper function to extract numeric value from string like "16px"
  const getNumericValue = (value) => {
    if (!value) return 0;
    return parseInt(value.toString().replace(/[^\d.-]/g, '')) || 0;
  };

  // Helper function to apply unit to value
  const applyUnit = (value) => {
    return `${value}${unit}`;
  };

  // Handle individual input change
  const handleInputChange = (key, newValue) => {
    const valueWithUnit = applyUnit(newValue);
    
    // Convert key to proper camelCase (Top -> Top, not top)
    const camelCaseKey = `${prefix}${key}`;
    
    if (isLinked) {
      // Update all sides when linked
      spacingTypes.forEach(({ key: sideKey }) => {
        const camelCaseSideKey = `${prefix}${sideKey}`;
        onChange(camelCaseSideKey, valueWithUnit);
      });
    } else {
      // Update only the specific side
      onChange(camelCaseKey, valueWithUnit);
    }
  };

  // Handle unit change - convert all existing values to new unit
  const handleUnitChange = (newUnit) => {
    setUnit(newUnit);
    // Update all existing values with new unit
    spacingTypes.forEach(({ key }) => {
      const camelCaseKey = `${prefix}${key}`;
      const currentValue = getNumericValue(values[camelCaseKey]);
      onChange(camelCaseKey, `${currentValue}${newUnit}`);
    });
  };
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between min-w-0">
        <Label className="text-sm font-medium flex-shrink-0 mr-2">{label}</Label>
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* Unit Selector */}
          <Select value={unit} onValueChange={handleUnitChange}>
            <SelectTrigger className="w-12 sm:w-16 h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="px">px</SelectItem>
              <SelectItem value="rem">rem</SelectItem>
              <SelectItem value="em">em</SelectItem>
              <SelectItem value="%">%</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Link Button */}
          <Button
            type="button"
            variant={isLinked ? "default" : "outline"}
            size="sm"
            className="w-7 h-7 p-0"
            onClick={() => setIsLinked(!isLinked)}
            title={isLinked ? "Unlink sides" : "Link all sides"}
          >
            {isLinked ? <Link className="w-3 h-3" /> : <Unlink className="w-3 h-3" />}
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-full">
        {spacingTypes.map(({ key, label: shortLabel }) => (
          <div key={key} className="space-y-1 min-w-0">
            <Label className="text-xs text-muted-foreground text-center block">{shortLabel}</Label>
            <Input
              type="number"
              min="0"
              step={unit === 'rem' || unit === 'em' ? '0.1' : '1'}
              value={getNumericValue(values[`${prefix}${key}`])}
              onChange={(e) => handleInputChange(key, e.target.value)}
              className="text-center text-sm min-w-0 w-full"
            />
          </div>
        ))}
      </div>
      
      {isLinked && (
        <div className="text-xs text-muted-foreground text-center">
          🔗 All sides linked - changing one updates all
        </div>
      )}
    </div>
  );
};

const AdvancedTextControls = ({ label, values, onChange }) => {
  const [fontSizeUnit, setFontSizeUnit] = useState('px');
  const [lineHeightUnit, setLineHeightUnit] = useState('number');
  const [letterSpacingUnit, setLetterSpacingUnit] = useState('px');
  const [wordSpacingUnit, setWordSpacingUnit] = useState('px');
  
  const fontWeights = [
    { value: 'normal', label: 'Normal' },
    { value: 'bold', label: 'Bold' },
    { value: '100', label: 'Thin' },
    { value: '200', label: 'Light' },
    { value: '300', label: 'Light' },
    { value: '400', label: 'Normal' },
    { value: '500', label: 'Medium' },
    { value: '600', label: 'Semi Bold' },
    { value: '700', label: 'Bold' },
    { value: '800', label: 'Extra Bold' },
    { value: '900', label: 'Black' },
  ];

  const textAlignOptions = [
    { value: 'left', label: 'Left' },
    { value: 'center', label: 'Center' },
    { value: 'right', label: 'Right' },
    { value: 'justify', label: 'Justify' },
  ];

  const textTransformOptions = [
    { value: 'none', label: 'None' },
    { value: 'uppercase', label: 'UPPERCASE' },
    { value: 'lowercase', label: 'lowercase' },
    { value: 'capitalize', label: 'Capitalize' },
  ];

  const textDecorationOptions = [
    { value: 'none', label: 'None' },
    { value: 'underline', label: 'Underline' },
    { value: 'overline', label: 'Overline' },
    { value: 'line-through', label: 'Strike' },
  ];

  // Helper function to extract numeric value from string
  const getNumericValue = (value, defaultVal = 1) => {
    if (!value) return defaultVal;
    return parseFloat(value.toString().replace(/[^\d.-]/g, '')) || defaultVal;
  };

  // Helper function to apply unit to value
  const applyUnit = (value, unit) => {
    return unit && unit !== 'number' ? `${value}${unit}` : value;
  };

  // Handle various text property changes with units
  const handleUnitChange = (property, newValue, unit) => {
    const valueWithUnit = applyUnit(newValue, unit);
    onChange(property, valueWithUnit);
  };

  const handleUnitTypeChange = (property, newUnit, currentValue, setter) => {
    setter(newUnit);
    const numericValue = getNumericValue(currentValue);
    onChange(property, applyUnit(numericValue, newUnit));
  };

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-sm">{label}</h4>
      
      {/* Color */}
      <div className="space-y-2">
        <Label className="text-sm">Color</Label>
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
          <input
            type="color"
            value={values.color || '#ffffff'}
            onChange={(e) => onChange('color', e.target.value)}
            className="w-8 sm:w-10 h-8 border border-border rounded cursor-pointer flex-shrink-0"
          />
          <Input
            type="text"
            value={values.color || '#ffffff'}
            onChange={(e) => onChange('color', e.target.value)}
            className="flex-1 text-sm min-w-0"
          />
        </div>
      </div>

      {/* Font Size */}
      <div className="space-y-2">
        <Label className="text-sm">Font Size</Label>
        <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
          <Input
            type="number"
            min={fontSizeUnit === 'rem' || fontSizeUnit === 'em' ? '0.1' : '1'}
            step={fontSizeUnit === 'rem' || fontSizeUnit === 'em' ? '0.1' : '1'}
            value={getNumericValue(values.fontSize)}
            onChange={(e) => handleUnitChange('fontSize', e.target.value, fontSizeUnit)}
            className="flex-1 text-sm min-w-0"
          />
          <Select value={fontSizeUnit} onValueChange={(newUnit) => handleUnitTypeChange('fontSize', newUnit, values.fontSize, setFontSizeUnit)}>
            <SelectTrigger className="w-12 sm:w-16 h-8 text-xs flex-shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="px">px</SelectItem>
              <SelectItem value="rem">rem</SelectItem>
              <SelectItem value="em">em</SelectItem>
              <SelectItem value="%">%</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Font Weight */}
      <div className="space-y-2">
        <Label className="text-sm">Font Weight</Label>
        <Select value={values.fontWeight || 'normal'} onValueChange={(value) => onChange('fontWeight', value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {fontWeights.map((weight) => (
              <SelectItem key={weight.value} value={weight.value}>
                {weight.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Line Height */}
      <div className="space-y-2">
        <Label className="text-sm">Line Height</Label>
        <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
          <Input
            type="number"
            min="0.1"
            step="0.1"
            value={getNumericValue(values.lineHeight, 1.2)}
            onChange={(e) => handleUnitChange('lineHeight', e.target.value, lineHeightUnit)}
            className="flex-1 text-sm min-w-0"
          />
          <Select value={lineHeightUnit} onValueChange={(newUnit) => handleUnitTypeChange('lineHeight', newUnit, values.lineHeight, setLineHeightUnit)}>
            <SelectTrigger className="w-12 sm:w-16 h-8 text-xs flex-shrink-0">
              <SelectValue placeholder="Unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="px">px</SelectItem>
              <SelectItem value="rem">rem</SelectItem>
              <SelectItem value="em">em</SelectItem>
              <SelectItem value="%">%</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Letter Spacing */}
      <div className="space-y-2">
        <Label className="text-sm">Letter Spacing</Label>
        <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
          <Input
            type="number"
            step="0.1"
            value={getNumericValue(values.letterSpacing, 0)}
            onChange={(e) => handleUnitChange('letterSpacing', e.target.value, letterSpacingUnit)}
            className="flex-1 text-sm min-w-0"
          />
          <Select value={letterSpacingUnit} onValueChange={(newUnit) => handleUnitTypeChange('letterSpacing', newUnit, values.letterSpacing, setLetterSpacingUnit)}>
            <SelectTrigger className="w-12 sm:w-16 h-8 text-xs flex-shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="px">px</SelectItem>
              <SelectItem value="em">em</SelectItem>
              <SelectItem value="rem">rem</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Word Spacing */}
      <div className="space-y-2">
        <Label className="text-sm">Word Spacing</Label>
        <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
          <Input
            type="number"
            step="0.1"
            value={getNumericValue(values.wordSpacing, 0)}
            onChange={(e) => handleUnitChange('wordSpacing', e.target.value, wordSpacingUnit)}
            className="flex-1 text-sm min-w-0"
          />
          <Select value={wordSpacingUnit} onValueChange={(newUnit) => handleUnitTypeChange('wordSpacing', newUnit, values.wordSpacingUnit, setWordSpacingUnit)}>
            <SelectTrigger className="w-12 sm:w-16 h-8 text-xs flex-shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="px">px</SelectItem>
              <SelectItem value="em">em</SelectItem>
              <SelectItem value="rem">rem</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Text Align */}
      <div className="space-y-2">
        <Label className="text-sm">Text Align</Label>
        <Select value={values.textAlign || 'left'} onValueChange={(value) => onChange('textAlign', value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {textAlignOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Text Transform */}
      <div className="space-y-2">
        <Label className="text-sm">Text Transform</Label>
        <Select value={values.textTransform || 'none'} onValueChange={(value) => onChange('textTransform', value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {textTransformOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Text Decoration */}
      <div className="space-y-2">
        <Label className="text-sm">Text Decoration</Label>
        <Select value={values.textDecoration || 'none'} onValueChange={(value) => onChange('textDecoration', value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {textDecorationOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

const WidthControls = ({ label, values, onChange }) => {
  // Helper function to extract numeric value from string like "50%"
  const getNumericValue = (value) => {
    if (!value || value === 'auto') return '';
    return parseFloat(value.toString().replace(/[^\d.-]/g, '')) || '';
  };

  // Helper function to get unit from value
  const getUnit = (value) => {
    if (!value) return '%';
    if (value === 'auto') return 'auto';
    const match = value.toString().match(/(px|%|rem|em|vw|auto)$/);
    return match ? match[0] : '%';
  };

  // Handle width change for left side
  const handleLeftWidthChange = (newValue) => {
    const unit = getUnit(values.leftWidth);
    const valueWithUnit = unit === 'auto' ? 'auto' : `${newValue}${unit}`;
    onChange('leftWidth', valueWithUnit);
  };

  // Handle width change for right side
  const handleRightWidthChange = (newValue) => {
    const unit = getUnit(values.rightWidth);
    const valueWithUnit = unit === 'auto' ? 'auto' : `${newValue}${unit}`;
    onChange('rightWidth', valueWithUnit);
  };

  // Handle unit change for left side
  const handleLeftUnitChange = (newUnit) => {
    if (newUnit === 'auto') {
      onChange('leftWidth', 'auto');
    } else {
      const currentValue = getNumericValue(values.leftWidth) || 50;
      onChange('leftWidth', `${currentValue}${newUnit}`);
    }
  };

  // Handle unit change for right side
  const handleRightUnitChange = (newUnit) => {
    if (newUnit === 'auto') {
      onChange('rightWidth', 'auto');
    } else {
      const currentValue = getNumericValue(values.rightWidth) || 50;
      onChange('rightWidth', `${currentValue}${newUnit}`);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground text-center block">Left Side</Label>
          <div className="flex items-center space-x-2">
            <Input
              type="text"
              value={getNumericValue(values.leftWidth)}
              onChange={(e) => handleLeftWidthChange(e.target.value)}
              className="text-center text-sm flex-1"
              placeholder="50"
              disabled={getUnit(values.leftWidth) === 'auto'}
            />
            <Select 
              value={getUnit(values.leftWidth)} 
              onValueChange={handleLeftUnitChange}
            >
              <SelectTrigger className="w-12 sm:w-16 h-8 text-xs flex-shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="%">%</SelectItem>
                <SelectItem value="px">px</SelectItem>
                <SelectItem value="rem">rem</SelectItem>
                <SelectItem value="em">em</SelectItem>
                <SelectItem value="vw">vw</SelectItem>
                <SelectItem value="auto">auto</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground text-center block">Right Side</Label>
          <div className="flex items-center space-x-2">
            <Input
              type="text"
              value={getNumericValue(values.rightWidth)}
              onChange={(e) => handleRightWidthChange(e.target.value)}
              className="text-center text-sm flex-1"
              placeholder="50"
              disabled={getUnit(values.rightWidth) === 'auto'}
            />
            <Select 
              value={getUnit(values.rightWidth)} 
              onValueChange={handleRightUnitChange}
            >
              <SelectTrigger className="w-12 sm:w-16 h-8 text-xs flex-shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="%">%</SelectItem>
                <SelectItem value="px">px</SelectItem>
                <SelectItem value="rem">rem</SelectItem>
                <SelectItem value="em">em</SelectItem>
                <SelectItem value="vw">vw</SelectItem>
                <SelectItem value="auto">auto</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <div className="text-xs text-muted-foreground text-center">
        💡 Total should equal 100% for balanced layout
      </div>
    </div>
  );
};

const LayoutSpacingControls = ({ label, values, onChange }) => {
  return (
    <div className="space-y-4">
      {label && <Label className="text-sm font-medium">{label}</Label>}
      <div className="space-y-4">
        <SpacingControls
          label="Padding"
          values={values}
          onChange={onChange}
          prefix="padding"
        />
        <SpacingControls
          label="Margin"
          values={values}
          onChange={onChange}
          prefix="margin"
        />
      </div>
    </div>
  );
};

const FlexboxControls = ({ label, values, onChange, showDisplay = true }) => {
  const flexDirectionOptions = [
    { value: 'row', label: 'Row →' },
    { value: 'row-reverse', label: '← Row Reverse' },
    { value: 'column', label: 'Column ↓' },
    { value: 'column-reverse', label: '↑ Column Reverse' },
  ];

  const justifyContentOptions = [
    { value: 'flex-start', label: 'Start' },
    { value: 'center', label: 'Center' },
    { value: 'flex-end', label: 'End' },
    { value: 'space-between', label: 'Space Between' },
    { value: 'space-around', label: 'Space Around' },
    { value: 'space-evenly', label: 'Space Evenly' },
  ];

  const alignItemsOptions = [
    { value: 'flex-start', label: 'Start' },
    { value: 'center', label: 'Center' },
    { value: 'flex-end', label: 'End' },
    { value: 'stretch', label: 'Stretch' },
    { value: 'baseline', label: 'Baseline' },
  ];

  const flexWrapOptions = [
    { value: 'nowrap', label: 'No Wrap' },
    { value: 'wrap', label: 'Wrap' },
    { value: 'wrap-reverse', label: 'Wrap Reverse' },
  ];

  const alignContentOptions = [
    { value: 'flex-start', label: 'Start' },
    { value: 'center', label: 'Center' },
    { value: 'flex-end', label: 'End' },
    { value: 'space-between', label: 'Space Between' },
    { value: 'space-around', label: 'Space Around' },
    { value: 'stretch', label: 'Stretch' },
  ];

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-sm">{label}</h4>
      
      {/* Display Type - only show if showDisplay is true */}
      {showDisplay && (
        <div className="space-y-2">
          <Label className="text-sm">Display</Label>
          <Select value={values.display || 'block'} onValueChange={(value) => onChange('display', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="block">Block</SelectItem>
              <SelectItem value="flex">Flex</SelectItem>
              <SelectItem value="inline-flex">Inline Flex</SelectItem>
              <SelectItem value="inline-block">Inline Block</SelectItem>
              <SelectItem value="inline">Inline</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Flex Direction */}
      {(values.display === 'flex' || values.display === 'inline-flex') && (
        <>
          <div className="space-y-2">
            <Label className="text-sm">Flex Direction</Label>
            <Select value={values.flexDirection || 'row'} onValueChange={(value) => onChange('flexDirection', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {flexDirectionOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Justify Content */}
          <div className="space-y-2">
            <Label className="text-sm">Justify Content</Label>
            <Select value={values.justifyContent || 'flex-start'} onValueChange={(value) => onChange('justifyContent', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {justifyContentOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Align Items */}
          <div className="space-y-2">
            <Label className="text-sm">Align Items</Label>
            <Select value={values.alignItems || 'stretch'} onValueChange={(value) => onChange('alignItems', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {alignItemsOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Flex Wrap */}
          <div className="space-y-2">
            <Label className="text-sm">Flex Wrap</Label>
            <Select value={values.flexWrap || 'nowrap'} onValueChange={(value) => onChange('flexWrap', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {flexWrapOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Align Content (only show when flex-wrap is enabled) */}
          {values.flexWrap !== 'nowrap' && (
            <div className="space-y-2">
              <Label className="text-sm">Align Content</Label>
              <Select value={values.alignContent || 'stretch'} onValueChange={(value) => onChange('alignContent', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {alignContentOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Gap */}
          <div className="space-y-2">
            <Label className="text-sm">Gap</Label>
            <Input
              type="text"
              value={values.gap || '0px'}
              onChange={(e) => onChange('gap', e.target.value)}
              className="text-sm"
              placeholder="10px, 1rem, etc."
            />
          </div>
        </>
      )}
    </div>
  );
};



const StyleSettings = ({ styles, onStyleChange, onDirectStyleChange, currentBreakpoint, onBreakpointChange }) => {
  if (!styles) return null;

  return (
    <div className="space-y-2 w-full max-w-full overflow-hidden min-w-0">
      <div className="border-b pb-2 max-w-full overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2 break-words">
            <Settings className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            Style Settings
          </h3>
          {onBreakpointChange && (
            <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
              <Button
                variant={currentBreakpoint === 'desktop' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onBreakpointChange('desktop')}
                className="h-7 px-2 text-xs"
              >
                Desktop
              </Button>
              <Button
                variant={currentBreakpoint === 'mobile' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onBreakpointChange('mobile')}
                className="h-7 px-2 text-xs"
              >
                Mobile
              </Button>
            </div>
          )}
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground break-words">
          Customize the appearance of your slider {currentBreakpoint && `for ${currentBreakpoint} devices`}
        </p>
        
        
      </div>

      <Accordion type="single" defaultValue="background" collapsible className="w-full max-w-full space-y-2">
        <AccordionItem value="background" className=" max-w-full overflow-hidden">
          <AccordionTrigger className=" py-2 sm:py-3 text-sm font-medium hover:no-underline">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Background Settings
            </div>
          </AccordionTrigger>
          <AccordionContent className=" pb-2 sm:pb-4 space-y-2 sm:space-y-4 max-w-full overflow-hidden">
          <div className="space-y-3 p-1 sm:p-2 max-w-full overflow-hidden">
            <div className="border-b pb-2">
              <h4 className="text-sm font-medium">Background Colors & Overlay</h4>
            </div>
            <div className="space-y-4">
              <ColorPicker
                label="Background Color"
                value={styles.backgroundColor}
                onChange={(value) => onDirectStyleChange('backgroundColor', value)}
                opacity={styles.backgroundOpacity}
                onOpacityChange={(value) => onDirectStyleChange('backgroundOpacity', value)}
              />
              
              <div className="border-b border-border my-4"></div>
              
              <ColorPicker
                label="Overlay Color"
                value={styles.overlayColor}
                onChange={(value) => onDirectStyleChange('overlayColor', value)}
                opacity={styles.overlayOpacity}
                onOpacityChange={(value) => onDirectStyleChange('overlayOpacity', value)}
              />
            </div>
          </div>

          <div className="space-y-3 p-1 sm:p-2 max-w-full overflow-hidden">
            <div className="border-b pb-2">
              <h4 className="text-sm font-medium">Background Image Settings</h4>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 max-w-full overflow-hidden">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Image Width</Label>
                  <div className="flex items-center space-x-1 sm:space-x-2 min-w-0 max-w-full overflow-hidden">
                    <Input
                      type="text"
                      value={styles.backgroundImage?.width?.replace(/(px|%|rem|em|auto)$/, '') || ''}
                      onChange={(e) => {
                        const unit = styles.backgroundImage?.width?.match(/(px|%|rem|em|auto)$/)?.[0] || 'auto';
                        const newValue = unit === 'auto' ? 'auto' : `${e.target.value}${unit}`;
                        onStyleChange('backgroundImage', 'width', newValue);
                      }}
                      className="text-xs flex-1 min-w-0 max-w-full"
                      placeholder="auto"
                    />
                    <Select
                      value={styles.backgroundImage?.width?.match(/(px|%|rem|em|auto)$/)?.[0] || 'auto'} 
                      onValueChange={(unit) => {
                        const numValue = styles.backgroundImage?.width?.replace(/(px|%|rem|em|auto)$/, '') || '';
                        const newValue = unit === 'auto' ? 'auto' : `${numValue || 100}${unit}`;
                        onStyleChange('backgroundImage', 'width', newValue);
                      }}
                    >
                      <SelectTrigger className="w-12 sm:w-16 h-6 text-xs flex-shrink-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">auto</SelectItem>
                        <SelectItem value="px">px</SelectItem>
                        <SelectItem value="%">%</SelectItem>
                        <SelectItem value="rem">rem</SelectItem>
                        <SelectItem value="em">em</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Image Height</Label>
                  <div className="flex items-center space-x-1 sm:space-x-2 min-w-0 max-w-full overflow-hidden">
                    <Input
                      type="text"
                      value={styles.backgroundImage?.height?.replace(/(px|%|rem|em|auto)$/, '') || ''}
                      onChange={(e) => {
                        const unit = styles.backgroundImage?.height?.match(/(px|%|rem|em|auto)$/)?.[0] || 'auto';
                        const newValue = unit === 'auto' ? 'auto' : `${e.target.value}${unit}`;
                        onStyleChange('backgroundImage', 'height', newValue);
                      }}
                      className="text-xs flex-1 min-w-0 max-w-full"
                      placeholder="auto"
                    />
                    <Select 
                      value={styles.backgroundImage?.height?.match(/(px|%|rem|em|auto)$/)?.[0] || 'auto'} 
                      onValueChange={(unit) => {
                        const numValue = styles.backgroundImage?.height?.replace(/(px|%|rem|em|auto)$/, '') || '';
                        const newValue = unit === 'auto' ? 'auto' : `${numValue || 100}${unit}`;
                        onStyleChange('backgroundImage', 'height', newValue);
                      }}
                    >
                      <SelectTrigger className="w-12 sm:w-16 h-6 text-xs flex-shrink-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">auto</SelectItem>
                        <SelectItem value="px">px</SelectItem>
                        <SelectItem value="%">%</SelectItem>
                        <SelectItem value="rem">rem</SelectItem>
                        <SelectItem value="em">em</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 max-w-full overflow-hidden">
                <div>
                  <Label className="text-xs text-muted-foreground">Object Fit</Label>
                  <Select 
                    value={styles.backgroundImage?.objectFit || 'cover'} 
                    onValueChange={(value) => onStyleChange('backgroundImage', 'objectFit', value)}
                  >
                    <SelectTrigger className="h-6 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cover">Cover</SelectItem>
                      <SelectItem value="contain">Contain</SelectItem>
                      <SelectItem value="fill">Fill</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="scale-down">Scale Down</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-xs text-muted-foreground">Object Position</Label>
                  <Select 
                    value={styles.backgroundImage?.objectPosition || 'center'} 
                    onValueChange={(value) => onStyleChange('backgroundImage', 'objectPosition', value)}
                  >
                    <SelectTrigger className="h-6 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="top">Top</SelectItem>
                      <SelectItem value="bottom">Bottom</SelectItem>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                      <SelectItem value="top left">Top Left</SelectItem>
                      <SelectItem value="top right">Top Right</SelectItem>
                      <SelectItem value="bottom left">Bottom Left</SelectItem>
                      <SelectItem value="bottom right">Bottom Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="text" className=" max-w-full overflow-hidden">
          <AccordionTrigger className=" py-2 sm:py-3 text-sm font-medium hover:no-underline">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4" />
              Text Settings
            </div>
          </AccordionTrigger>
          <AccordionContent className=" pb-2 sm:pb-4 space-y-2 sm:space-y-4 max-w-full overflow-hidden">
          <div className="space-y-4 p-2 sm:p-4 max-w-full overflow-hidden">
            <div className="border-b pb-2">
              <h4 className="text-sm font-medium">Title Styling</h4>
            </div>
            <div className="space-y-4">
              <AdvancedTextControls
                label="Title Typography"
                values={styles.title}
                onChange={(field, value) => onStyleChange('title', field, value)}
              />
              
              <div className="border-b border-border my-4"></div>
              
              <SpacingControls
                label="Title Margin"
                values={styles.title}
                onChange={(field, value) => onStyleChange('title', field, value)}
                prefix="margin"
              />
              
              <SpacingControls
                label="Title Padding"
                values={styles.title}
                onChange={(field, value) => onStyleChange('title', field, value)}
                prefix="padding"
              />
            </div>
          </div>

          <div className="space-y-4 p-2 sm:p-4 max-w-full overflow-hidden">
            <div className="border-b pb-2">
              <h4 className="text-sm font-medium">Description Styling</h4>
            </div>
            <div className="space-y-4">
              <AdvancedTextControls
                label="Description Typography"
                values={styles.description}
                onChange={(field, value) => onStyleChange('description', field, value)}
              />
              
              <div className="border-b border-border my-4"></div>
              
              <SpacingControls
                label="Description Margin"
                values={styles.description}
                onChange={(field, value) => onStyleChange('description', field, value)}
                prefix="margin"
              />
              
              <SpacingControls
                label="Description Padding"
                values={styles.description}
                onChange={(field, value) => onStyleChange('description', field, value)}
                prefix="padding"
              />
            </div>
          </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="button" className=" max-w-full overflow-hidden">
          <AccordionTrigger className=" py-2 sm:py-3 text-sm font-medium hover:no-underline">
            <div className="flex items-center gap-2">
              <MousePointer className="w-4 h-4" />
              Button Settings
            </div>
          </AccordionTrigger>
          <AccordionContent className=" pb-2 sm:pb-4 space-y-2 sm:space-y-4 max-w-full overflow-hidden">
          <div className="space-y-4 p-2 sm:p-4 max-w-full overflow-hidden">
            <div className="border-b pb-2">
              <h4 className="text-sm font-medium">Button Styling</h4>
            </div>
            <div className="space-y-4">
              {/* Button Colors */}
              <div className="space-y-2">
                <Label className="text-sm">Background Color</Label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={styles.button?.backgroundColor}
                    onChange={(e) => onStyleChange('button', 'backgroundColor', e.target.value)}
                    className="w-8 sm:w-10 h-8 border border-border rounded cursor-pointer flex-shrink-0"
                  />
                  <Input
                    type="text"
                    value={styles.button?.backgroundColor}
                    onChange={(e) => onStyleChange('button', 'backgroundColor', e.target.value)}
                    className="flex-1 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Text Color</Label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={styles.button?.color}
                    onChange={(e) => onStyleChange('button', 'color', e.target.value)}
                    className="w-8 sm:w-10 h-8 border border-border rounded cursor-pointer flex-shrink-0"
                  />
                  <Input
                    type="text"
                    value={styles.button?.color}
                    onChange={(e) => onStyleChange('button', 'color', e.target.value)}
                    className="flex-1 text-sm"
                  />
                </div>
              </div>

              {/* Font Settings */}
              <div className="space-y-2">
                <Label className="text-sm">Font Size</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="text"
                    value={styles.button?.fontSize?.replace(/(px|%|rem|em)$/, '') || '16'}
                    onChange={(e) => {
                      const unit = styles.button?.fontSize?.match(/(px|%|rem|em)$/)?.[0] || 'px';
                      onStyleChange('button', 'fontSize', `${e.target.value}${unit}`);
                    }}
                    className="text-sm flex-1"
                    placeholder="16"
                  />
                  <Select 
                    value={styles.button?.fontSize?.match(/(px|%|rem|em)$/)?.[0] || 'px'} 
                    onValueChange={(unit) => {
                      const numValue = styles.button?.fontSize?.replace(/(px|%|rem|em)$/, '') || '16';
                      onStyleChange('button', 'fontSize', `${numValue}${unit}`);
                    }}
                  >
                    <SelectTrigger className="w-16 h-6 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="px">px</SelectItem>
                      <SelectItem value="%">%</SelectItem>
                      <SelectItem value="rem">rem</SelectItem>
                      <SelectItem value="em">em</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Font Weight</Label>
                <Select 
                  value={styles.button?.fontWeight} 
                  onValueChange={(value) => onStyleChange('button', 'fontWeight', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="bold">Bold</SelectItem>
                    <SelectItem value="600">Semi Bold</SelectItem>
                    <SelectItem value="700">Bold</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Border Radius */}
              <div className="space-y-2">
                <Label className="text-sm">Border Radius</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="text"
                    value={styles.button?.borderRadius?.replace(/(px|%|rem|em)$/, '') || '8'}
                    onChange={(e) => {
                      const unit = styles.button?.borderRadius?.match(/(px|%|rem|em)$/)?.[0] || 'px';
                      onStyleChange('button', 'borderRadius', `${e.target.value}${unit}`);
                    }}
                    className="text-sm flex-1"
                    placeholder="8"
                  />
                  <Select 
                    value={styles.button?.borderRadius?.match(/(px|%|rem|em)$/)?.[0] || 'px'} 
                    onValueChange={(unit) => {
                      const numValue = styles.button?.borderRadius?.replace(/(px|%|rem|em)$/, '') || '8';
                      onStyleChange('button', 'borderRadius', `${numValue}${unit}`);
                    }}
                  >
                    <SelectTrigger className="w-16 h-6 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="px">px</SelectItem>
                      <SelectItem value="%">%</SelectItem>
                      <SelectItem value="rem">rem</SelectItem>
                      <SelectItem value="em">em</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border-b border-border my-4"></div>

              {/* Button Spacing */}
              <SpacingControls
                label="Button Padding"
                values={styles.button}
                onChange={(field, value) => onStyleChange('button', field, value)}
                prefix="padding"
              />
              
              <SpacingControls
                label="Button Margin"
                values={styles.button}
                onChange={(field, value) => onStyleChange('button', field, value)}
                prefix="margin"
              />
            </div>
          </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="tagline" className=" max-w-full overflow-hidden">
          <AccordionTrigger className=" py-2 sm:py-3 text-sm font-medium hover:no-underline">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4" />
              Tagline Settings
            </div>
          </AccordionTrigger>
          <AccordionContent className=" pb-2 sm:pb-4 space-y-2 sm:space-y-4 max-w-full overflow-hidden">
          <div className="space-y-4 p-2 sm:p-4 max-w-full overflow-hidden">
            <div className="border-b pb-2">
              <h4 className="text-sm font-medium">Tagline Typography</h4>
            </div>
            <div className="space-y-4">
              <AdvancedTextControls
                label="Tagline Text Settings"
                values={styles.tagline || {}}
                onChange={(field, value) => onStyleChange('tagline', field, value)}
                hideDisplay={true}
              />
            </div>
          </div>

          <div className="space-y-4 p-2 sm:p-4 max-w-full overflow-hidden">
            <div className="border-b pb-2">
              <h4 className="text-sm font-medium">Tagline Background & Border</h4>
            </div>
            <div className="space-y-4">
              <ColorPicker
                label="Background Color"
                value={styles.tagline?.backgroundColor || 'rgba(255, 255, 255, 0.1)'}
                onChange={(value) => onStyleChange('tagline', 'backgroundColor', value)}
                opacity={styles.tagline?.backgroundOpacity || 0.1}
                onOpacityChange={(value) => onStyleChange('tagline', 'backgroundOpacity', value)}
              />
              
              <div className="space-y-3">
                <Label className="text-sm font-medium">Border Settings</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Border Color</Label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={styles.tagline?.borderColor || '#ffffff'}
                        onChange={(e) => onStyleChange('tagline', 'borderColor', e.target.value)}
                        className="w-8 h-6 border border-border rounded cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={styles.tagline?.borderColor || '#ffffff'}
                        onChange={(e) => onStyleChange('tagline', 'borderColor', e.target.value)}
                        className="flex-1 text-xs"
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-xs text-muted-foreground">Border Width & Style</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 max-w-full overflow-hidden">
                      <Input
                        type="text"
                        value={styles.tagline?.borderWidth?.replace(/(px|%|rem|em)$/, '') || '1'}
                        onChange={(e) => {
                          const unit = styles.tagline?.borderWidth?.match(/(px|%|rem|em)$/)?.[0] || 'px';
                          onStyleChange('tagline', 'borderWidth', `${e.target.value}${unit}`);
                        }}
                        className="text-xs"
                        placeholder="1"
                      />
                      <Select 
                        value={styles.tagline?.borderWidth?.match(/(px|%|rem|em)$/)?.[0] || 'px'} 
                        onValueChange={(unit) => {
                          const numValue = styles.tagline?.borderWidth?.replace(/(px|%|rem|em)$/, '') || '1';
                          onStyleChange('tagline', 'borderWidth', `${numValue}${unit}`);
                        }}
                      >
                        <SelectTrigger className="h-6 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="px">px</SelectItem>
                          <SelectItem value="rem">rem</SelectItem>
                          <SelectItem value="em">em</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select 
                        value={styles.tagline?.borderStyle || 'solid'} 
                        onValueChange={(value) => onStyleChange('tagline', 'borderStyle', value)}
                      >
                        <SelectTrigger className="h-6 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="solid">Solid</SelectItem>
                          <SelectItem value="dashed">Dashed</SelectItem>
                          <SelectItem value="dotted">Dotted</SelectItem>
                          <SelectItem value="none">None</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label className="text-xs text-muted-foreground">Border Radius</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="text"
                      value={styles.tagline?.borderRadius?.replace(/(px|%|rem|em)$/, '') || '20'}
                      onChange={(e) => {
                        const unit = styles.tagline?.borderRadius?.match(/(px|%|rem|em)$/)?.[0] || 'px';
                        onStyleChange('tagline', 'borderRadius', `${e.target.value}${unit}`);
                      }}
                      className="text-xs flex-1"
                      placeholder="20"
                    />
                    <Select 
                      value={styles.tagline?.borderRadius?.match(/(px|%|rem|em)$/)?.[0] || 'px'} 
                      onValueChange={(unit) => {
                        const numValue = styles.tagline?.borderRadius?.replace(/(px|%|rem|em)$/, '') || '20';
                        onStyleChange('tagline', 'borderRadius', `${numValue}${unit}`);
                      }}
                    >
                      <SelectTrigger className="w-16 h-6 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="px">px</SelectItem>
                        <SelectItem value="%">%</SelectItem>
                        <SelectItem value="rem">rem</SelectItem>
                        <SelectItem value="em">em</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 p-2 sm:p-4 max-w-full overflow-hidden"><div className="border-b pb-2"><h4 className="text-sm font-medium">Tagline Spacing</h4></div>
            <div className="space-y-4">
              <SpacingControls
                label="Individual Tagline Padding"
                values={styles.tagline || {}}
                onChange={(field, value) => onStyleChange('tagline', field, value)}
                prefix="padding"
              />
              
              <SpacingControls
                label="Individual Tagline Margin"
                values={styles.tagline || {}}
                onChange={(field, value) => onStyleChange('tagline', field, value)}
                prefix="margin"
              />
              
              <div className="space-y-3">
                <Label className="text-sm font-medium">Container Spacing</Label>
                <SpacingControls
                  label="Tagline Container Margin"
                  values={styles.tagline || {}}
                  onChange={(field, value) => onStyleChange('tagline', field, value)}
                  prefix="containerMargin"
                />
                
                <div>
                  <Label className="text-xs text-muted-foreground">Gap Between Taglines</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="text"
                      value={styles.tagline?.gap?.replace(/(px|%|rem|em)$/, '') || '8'}
                      onChange={(e) => {
                        const unit = styles.tagline?.gap?.match(/(px|%|rem|em)$/)?.[0] || 'px';
                        onStyleChange('tagline', 'gap', `${e.target.value}${unit}`);
                      }}
                      className="text-xs flex-1"
                      placeholder="8"
                    />
                    <Select 
                      value={styles.tagline?.gap?.match(/(px|%|rem|em)$/)?.[0] || 'px'} 
                      onValueChange={(unit) => {
                        const numValue = styles.tagline?.gap?.replace(/(px|%|rem|em)$/, '') || '8';
                        onStyleChange('tagline', 'gap', `${numValue}${unit}`);
                      }}
                    >
                      <SelectTrigger className="w-16 h-6 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="px">px</SelectItem>
                        <SelectItem value="rem">rem</SelectItem>
                        <SelectItem value="em">em</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 p-2 sm:p-4 max-w-full overflow-hidden"><div className="border-b pb-2"><h4 className="text-sm font-medium">Tagline Layout Settings</h4></div>
            <div className="space-y-4">
              <div className="space-y-3">
                <Label className="text-sm font-medium">Display Type</Label>
                <Select 
                  value={styles.tagline?.displayType || 'flex'} 
                  onValueChange={(value) => onStyleChange('tagline', 'displayType', value)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flex">List (Flex)</SelectItem>
                    <SelectItem value="grid">Grid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {styles.tagline?.displayType === 'flex' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Flex Direction</Label>
                      <Select 
                        value={styles.tagline?.flexDirection || 'row'} 
                        onValueChange={(value) => onStyleChange('tagline', 'flexDirection', value)}
                      >
                        <SelectTrigger className="h-6 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="row">Row</SelectItem>
                          <SelectItem value="column">Column</SelectItem>
                          <SelectItem value="row-reverse">Row Reverse</SelectItem>
                          <SelectItem value="column-reverse">Column Reverse</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-xs text-muted-foreground">Flex Wrap</Label>
                      <Select 
                        value={styles.tagline?.flexWrap || 'wrap'} 
                        onValueChange={(value) => onStyleChange('tagline', 'flexWrap', value)}
                      >
                        <SelectTrigger className="h-6 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="nowrap">No Wrap</SelectItem>
                          <SelectItem value="wrap">Wrap</SelectItem>
                          <SelectItem value="wrap-reverse">Wrap Reverse</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Justify Content</Label>
                      <Select 
                        value={styles.tagline?.justifyContent || 'flex-start'} 
                        onValueChange={(value) => onStyleChange('tagline', 'justifyContent', value)}
                      >
                        <SelectTrigger className="h-6 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="flex-start">Start</SelectItem>
                          <SelectItem value="flex-end">End</SelectItem>
                          <SelectItem value="center">Center</SelectItem>
                          <SelectItem value="space-between">Space Between</SelectItem>
                          <SelectItem value="space-around">Space Around</SelectItem>
                          <SelectItem value="space-evenly">Space Evenly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-xs text-muted-foreground">Align Items</Label>
                      <Select 
                        value={styles.tagline?.alignItems || 'center'} 
                        onValueChange={(value) => onStyleChange('tagline', 'alignItems', value)}
                      >
                        <SelectTrigger className="h-6 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="flex-start">Start</SelectItem>
                          <SelectItem value="flex-end">End</SelectItem>
                          <SelectItem value="center">Center</SelectItem>
                          <SelectItem value="baseline">Baseline</SelectItem>
                          <SelectItem value="stretch">Stretch</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Gap Between Items</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="text"
                        value={styles.tagline?.gap?.replace(/(px|%|rem|em)$/, '') || '8'}
                        onChange={(e) => {
                          const unit = styles.tagline?.gap?.match(/(px|%|rem|em)$/)?.[0] || 'px';
                          onStyleChange('tagline', 'gap', `${e.target.value}${unit}`);
                        }}
                        className="text-xs flex-1"
                        placeholder="8"
                      />
                      <Select 
                        value={styles.tagline?.gap?.match(/(px|%|rem|em)$/)?.[0] || 'px'} 
                        onValueChange={(unit) => {
                          const numValue = styles.tagline?.gap?.replace(/(px|%|rem|em)$/, '') || '8';
                          onStyleChange('tagline', 'gap', `${numValue}${unit}`);
                        }}
                      >
                        <SelectTrigger className="w-16 h-6 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="px">px</SelectItem>
                          <SelectItem value="rem">rem</SelectItem>
                          <SelectItem value="em">em</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {styles.tagline?.displayType === 'grid' && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Grid Template Columns</Label>
                    <Input
                      type="text"
                      value={styles.tagline?.gridTemplateColumns || 'repeat(auto-fit, minmax(120px, 1fr))'}
                      onChange={(e) => onStyleChange('tagline', 'gridTemplateColumns', e.target.value)}
                      className="text-xs w-full min-w-0"
                      placeholder="auto-fit grid"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Grid Gap</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="text"
                          value={styles.tagline?.gridGap?.replace(/(px|%|rem|em)$/, '') || '8'}
                          onChange={(e) => {
                            const unit = styles.tagline?.gridGap?.match(/(px|%|rem|em)$/)?.[0] || 'px';
                            onStyleChange('tagline', 'gridGap', `${e.target.value}${unit}`);
                          }}
                          className="text-xs flex-1"
                          placeholder="8"
                        />
                        <Select 
                          value={styles.tagline?.gridGap?.match(/(px|%|rem|em)$/)?.[0] || 'px'} 
                          onValueChange={(unit) => {
                            const numValue = styles.tagline?.gridGap?.replace(/(px|%|rem|em)$/, '') || '8';
                            onStyleChange('tagline', 'gridGap', `${numValue}${unit}`);
                          }}
                        >
                          <SelectTrigger className="w-16 h-6 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="px">px</SelectItem>
                            <SelectItem value="rem">rem</SelectItem>
                            <SelectItem value="em">em</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-xs text-muted-foreground">Row Gap</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="text"
                          value={styles.tagline?.rowGap?.replace(/(px|%|rem|em)$/, '') || '8'}
                          onChange={(e) => {
                            const unit = styles.tagline?.rowGap?.match(/(px|%|rem|em)$/)?.[0] || 'px';
                            onStyleChange('tagline', 'rowGap', `${e.target.value}${unit}`);
                          }}
                          className="text-xs flex-1"
                          placeholder="8"
                        />
                        <Select 
                          value={styles.tagline?.rowGap?.match(/(px|%|rem|em)$/)?.[0] || 'px'} 
                          onValueChange={(unit) => {
                            const numValue = styles.tagline?.rowGap?.replace(/(px|%|rem|em)$/, '') || '8';
                            onStyleChange('tagline', 'rowGap', `${numValue}${unit}`);
                          }}
                        >
                          <SelectTrigger className="w-16 h-6 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="px">px</SelectItem>
                            <SelectItem value="rem">rem</SelectItem>
                            <SelectItem value="em">em</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-xs text-muted-foreground">Column Gap</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="text"
                          value={styles.tagline?.columnGap?.replace(/(px|%|rem|em)$/, '') || '8'}
                          onChange={(e) => {
                            const unit = styles.tagline?.columnGap?.match(/(px|%|rem|em)$/)?.[0] || 'px';
                            onStyleChange('tagline', 'columnGap', `${e.target.value}${unit}`);
                          }}
                          className="text-xs flex-1"
                          placeholder="8"
                        />
                        <Select 
                          value={styles.tagline?.columnGap?.match(/(px|%|rem|em)$/)?.[0] || 'px'} 
                          onValueChange={(unit) => {
                            const numValue = styles.tagline?.columnGap?.replace(/(px|%|rem|em)$/, '') || '8';
                            onStyleChange('tagline', 'columnGap', `${numValue}${unit}`);
                          }}
                        >
                          <SelectTrigger className="w-16 h-6 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="px">px</SelectItem>
                            <SelectItem value="rem">rem</SelectItem>
                            <SelectItem value="em">em</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 p-2 sm:p-4 max-w-full overflow-hidden"><div className="border-b pb-2"><h4 className="text-sm font-medium">Tagline Image Settings</h4></div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Image Width</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="text"
                      value={styles.tagline?.imageWidth?.replace(/(px|%|rem|em|auto)$/, '') || '20'}
                      onChange={(e) => {
                        const unit = styles.tagline?.imageWidth?.match(/(px|%|rem|em|auto)$/)?.[0] || 'px';
                        const newValue = unit === 'auto' ? 'auto' : `${e.target.value}${unit}`;
                        onStyleChange('tagline', 'imageWidth', newValue);
                      }}
                      className="text-xs flex-1"
                      placeholder="20"
                    />
                    <Select 
                      value={styles.tagline?.imageWidth?.match(/(px|%|rem|em|auto)$/)?.[0] || 'px'} 
                      onValueChange={(unit) => {
                        const numValue = styles.tagline?.imageWidth?.replace(/(px|%|rem|em|auto)$/, '') || '20';
                        const newValue = unit === 'auto' ? 'auto' : `${numValue}${unit}`;
                        onStyleChange('tagline', 'imageWidth', newValue);
                      }}
                    >
                      <SelectTrigger className="w-16 h-6 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="px">px</SelectItem>
                        <SelectItem value="%">%</SelectItem>
                        <SelectItem value="rem">rem</SelectItem>
                        <SelectItem value="em">em</SelectItem>
                        <SelectItem value="auto">auto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Image Height</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="text"
                      value={styles.tagline?.imageHeight?.replace(/(px|%|rem|em|auto)$/, '') || '20'}
                      onChange={(e) => {
                        const unit = styles.tagline?.imageHeight?.match(/(px|%|rem|em|auto)$/)?.[0] || 'px';
                        const newValue = unit === 'auto' ? 'auto' : `${e.target.value}${unit}`;
                        onStyleChange('tagline', 'imageHeight', newValue);
                      }}
                      className="text-xs flex-1"
                      placeholder="20"
                    />
                    <Select 
                      value={styles.tagline?.imageHeight?.match(/(px|%|rem|em|auto)$/)?.[0] || 'px'} 
                      onValueChange={(unit) => {
                        const numValue = styles.tagline?.imageHeight?.replace(/(px|%|rem|em|auto)$/, '') || '20';
                        const newValue = unit === 'auto' ? 'auto' : `${numValue}${unit}`;
                        onStyleChange('tagline', 'imageHeight', newValue);
                      }}
                    >
                      <SelectTrigger className="w-16 h-6 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="px">px</SelectItem>
                        <SelectItem value="%">%</SelectItem>
                        <SelectItem value="rem">rem</SelectItem>
                        <SelectItem value="em">em</SelectItem>
                        <SelectItem value="auto">auto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Image Border Radius</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="text"
                      value={styles.tagline?.imageBorderRadius?.replace(/(px|%|rem|em)$/, '') || '50'}
                      onChange={(e) => {
                        const unit = styles.tagline?.imageBorderRadius?.match(/(px|%|rem|em)$/)?.[0] || '%';
                        onStyleChange('tagline', 'imageBorderRadius', `${e.target.value}${unit}`);
                      }}
                      className="text-xs flex-1"
                      placeholder="50"
                    />
                    <Select 
                      value={styles.tagline?.imageBorderRadius?.match(/(px|%|rem|em)$/)?.[0] || '%'} 
                      onValueChange={(unit) => {
                        const numValue = styles.tagline?.imageBorderRadius?.replace(/(px|%|rem|em)$/, '') || '50';
                        onStyleChange('tagline', 'imageBorderRadius', `${numValue}${unit}`);
                      }}
                    >
                      <SelectTrigger className="w-16 h-6 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="px">px</SelectItem>
                        <SelectItem value="%">%</SelectItem>
                        <SelectItem value="rem">rem</SelectItem>
                        <SelectItem value="em">em</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label className="text-xs text-muted-foreground">Image Object Fit</Label>
                  <Select 
                    value={styles.tagline?.imageObjectFit || 'cover'} 
                    onValueChange={(value) => onStyleChange('tagline', 'imageObjectFit', value)}
                  >
                    <SelectTrigger className="h-6 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cover">Cover</SelectItem>
                      <SelectItem value="contain">Contain</SelectItem>
                      <SelectItem value="fill">Fill</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="scale-down">Scale Down</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="feature-image" className=" max-w-full overflow-hidden">
          <AccordionTrigger className=" py-2 sm:py-3 text-sm font-medium hover:no-underline">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Feature Image Settings
            </div>
          </AccordionTrigger>
          <AccordionContent className=" pb-2 sm:pb-4 space-y-2 sm:space-y-4 max-w-full overflow-hidden">
          <div className="space-y-4 p-2 sm:p-4 max-w-full overflow-hidden"><div className="border-b pb-2"><h4 className="text-sm font-medium">Feature Image Settings</h4></div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Image Width</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="text"
                      value={styles.featureImage?.width?.replace(/(px|%|rem|em|auto)$/, '') || ''}
                      onChange={(e) => {
                        const unit = styles.featureImage?.width?.match(/(px|%|rem|em|auto)$/)?.[0] || 'auto';
                        const newValue = unit === 'auto' ? 'auto' : `${e.target.value}${unit}`;
                        onStyleChange('featureImage', 'width', newValue);
                      }}
                      className="text-xs flex-1"
                      placeholder="auto or number"
                    />
                    <Select 
                      value={styles.featureImage?.width?.match(/(px|%|rem|em|auto)$/)?.[0] || 'auto'} 
                      onValueChange={(unit) => {
                        const numValue = styles.featureImage?.width?.replace(/(px|%|rem|em|auto)$/, '') || '';
                        const newValue = unit === 'auto' ? 'auto' : `${numValue || 100}${unit}`;
                        onStyleChange('featureImage', 'width', newValue);
                      }}
                    >
                      <SelectTrigger className="w-16 h-6 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">auto</SelectItem>
                        <SelectItem value="px">px</SelectItem>
                        <SelectItem value="%">%</SelectItem>
                        <SelectItem value="rem">rem</SelectItem>
                        <SelectItem value="em">em</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Image Height</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="text"
                      value={styles.featureImage?.height?.replace(/(px|%|rem|em|auto)$/, '') || ''}
                      onChange={(e) => {
                        const unit = styles.featureImage?.height?.match(/(px|%|rem|em|auto)$/)?.[0] || 'auto';
                        const newValue = unit === 'auto' ? 'auto' : `${e.target.value}${unit}`;
                        onStyleChange('featureImage', 'height', newValue);
                      }}
                      className="text-xs flex-1"
                      placeholder="auto or number"
                    />
                    <Select 
                      value={styles.featureImage?.height?.match(/(px|%|rem|em|auto)$/)?.[0] || 'auto'} 
                      onValueChange={(unit) => {
                        const numValue = styles.featureImage?.height?.replace(/(px|%|rem|em|auto)$/, '') || '';
                        const newValue = unit === 'auto' ? 'auto' : `${numValue || 100}${unit}`;
                        onStyleChange('featureImage', 'height', newValue);
                      }}
                    >
                      <SelectTrigger className="w-16 h-6 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">auto</SelectItem>
                        <SelectItem value="px">px</SelectItem>
                        <SelectItem value="%">%</SelectItem>
                        <SelectItem value="rem">rem</SelectItem>
                        <SelectItem value="em">em</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Object Fit</Label>
                  <Select 
                    value={styles.featureImage?.objectFit || 'cover'} 
                    onValueChange={(value) => onStyleChange('featureImage', 'objectFit', value)}
                  >
                    <SelectTrigger className="h-6 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cover">Cover</SelectItem>
                      <SelectItem value="contain">Contain</SelectItem>
                      <SelectItem value="fill">Fill</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="scale-down">Scale Down</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-xs text-muted-foreground">Object Position</Label>
                  <Select 
                    value={styles.featureImage?.objectPosition || 'center'} 
                    onValueChange={(value) => onStyleChange('featureImage', 'objectPosition', value)}
                  >
                    <SelectTrigger className="h-6 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="top">Top</SelectItem>
                      <SelectItem value="bottom">Bottom</SelectItem>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                      <SelectItem value="top left">Top Left</SelectItem>
                      <SelectItem value="top right">Top Right</SelectItem>
                      <SelectItem value="bottom left">Bottom Left</SelectItem>
                      <SelectItem value="bottom right">Bottom Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="layout" className=" max-w-full overflow-hidden">
          <AccordionTrigger className=" py-2 sm:py-3 text-sm font-medium hover:no-underline">
            <div className="flex items-center gap-2">
              <Layout className="w-4 h-4" />
              Layout Settings
            </div>
          </AccordionTrigger>
          <AccordionContent className=" pb-2 sm:pb-4 space-y-2 sm:space-y-4 max-w-full overflow-hidden">
          <div className="space-y-4 p-2 sm:p-4 max-w-full overflow-hidden"><div className="border-b pb-2"><h4 className="text-sm font-medium">Container Layout & Spacing</h4></div>
            <div className="space-y-4">
              <div className="space-y-3">
                <Label className="text-sm font-medium">Container Flexbox Layout</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Flex Direction</Label>
                    <Select 
                      value={styles.container?.flexDirection || 'row'} 
                      onValueChange={(value) => onStyleChange('container', 'flexDirection', value)}
                    >
                      <SelectTrigger className="h-6 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="row">Row</SelectItem>
                        <SelectItem value="column">Column</SelectItem>
                        <SelectItem value="row-reverse">Row Reverse</SelectItem>
                        <SelectItem value="column-reverse">Column Reverse</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-xs text-muted-foreground">Flex Wrap</Label>
                    <Select 
                      value={styles.container?.flexWrap || 'nowrap'} 
                      onValueChange={(value) => onStyleChange('container', 'flexWrap', value)}
                    >
                      <SelectTrigger className="h-6 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nowrap">No Wrap</SelectItem>
                        <SelectItem value="wrap">Wrap</SelectItem>
                        <SelectItem value="wrap-reverse">Wrap Reverse</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Justify Content</Label>
                    <Select 
                      value={styles.container?.justifyContent || 'space-between'} 
                      onValueChange={(value) => onStyleChange('container', 'justifyContent', value)}
                    >
                      <SelectTrigger className="h-6 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="flex-start">Start</SelectItem>
                        <SelectItem value="flex-end">End</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="space-between">Space Between</SelectItem>
                        <SelectItem value="space-around">Space Around</SelectItem>
                        <SelectItem value="space-evenly">Space Evenly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-xs text-muted-foreground">Align Items</Label>
                    <Select 
                      value={styles.container?.alignItems || 'center'} 
                      onValueChange={(value) => onStyleChange('container', 'alignItems', value)}
                    >
                      <SelectTrigger className="h-6 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="flex-start">Start</SelectItem>
                        <SelectItem value="flex-end">End</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="baseline">Baseline</SelectItem>
                        <SelectItem value="stretch">Stretch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">Gap Between Items</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="text"
                      value={styles.container?.gap?.replace(/(px|%|rem|em)$/, '') || '20'}
                      onChange={(e) => {
                        const unit = styles.container?.gap?.match(/(px|%|rem|em)$/)?.[0] || 'px';
                        onStyleChange('container', 'gap', `${e.target.value}${unit}`);
                      }}
                      className="text-xs flex-1"
                      placeholder="20"
                    />
                    <Select 
                      value={styles.container?.gap?.match(/(px|%|rem|em)$/)?.[0] || 'px'} 
                      onValueChange={(unit) => {
                        const numValue = styles.container?.gap?.replace(/(px|%|rem|em)$/, '') || '20';
                        onStyleChange('container', 'gap', `${numValue}${unit}`);
                      }}
                    >
                      <SelectTrigger className="w-16 h-6 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="px">px</SelectItem>
                        <SelectItem value="rem">rem</SelectItem>
                        <SelectItem value="em">em</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="border-b border-border my-4"></div>
              
              <SpacingControls
                label="Container Padding"
                values={styles.container}
                onChange={(field, value) => onStyleChange('container', field, value)}
                prefix="padding"
              />
            </div>
          </div>

          <div className="space-y-4 p-2 sm:p-4 max-w-full overflow-hidden"><div className="border-b pb-2"><h4 className="text-sm font-medium">Layout Width</h4></div>
            <div className="space-y-4">
              <WidthControls
                label="Side Width Distribution" 
                values={styles.layout || {}}
                onChange={(field, value) => onStyleChange('layout', field, value)}
              />
            </div>
          </div>

          <div className="space-y-4 p-2 sm:p-4 max-w-full overflow-hidden"><div className="border-b pb-2"><h4 className="text-sm font-medium">Layout Spacing</h4></div>
            <div className="space-y-6">
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-xs font-medium text-center block  py-1 px-2 rounded">
                    📝 Left Content (Text/Button)
                  </Label>
                  <LayoutSpacingControls
                    label=""
                    values={styles.leftContent || {}}
                    onChange={(field, value) => onStyleChange('leftContent', field, value)}
                  />
                </div>
                
                <div className="border-b border-border"></div>
                
                <div className="space-y-3">
                  <Label className="text-xs font-medium text-center block  py-1 px-2 rounded">
                    🖼️ Right Content (Image/Video)
                  </Label>
                  <LayoutSpacingControls
                    label=""
                    values={styles.rightContent || {}}
                    onChange={(field, value) => onStyleChange('rightContent', field, value)}
                  />
                </div>
              </div>
            </div>
          </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default StyleSettings;

