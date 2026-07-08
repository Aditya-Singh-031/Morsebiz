'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Table, ClipboardPaste } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

const AddCompatibleVehicleDialog = ({ onAddVehicle }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    variant: '',
    period: '',
    engine: '',
    drive: '',
    bodyStyle: ''
  });
  const [bulkData, setBulkData] = useState('');
  const [activeTab, setActiveTab] = useState('single');
  const [previewVehicles, setPreviewVehicles] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields (make and model are required)
    if (!formData.make.trim() || !formData.model.trim()) {
      alert('Please fill in Make and Model fields');
      return;
    }

    // Call the parent function with the form data
    onAddVehicle({
      make: formData.make.trim(),
      model: formData.model.trim(),
      variant: formData.variant.trim(),
      period: formData.period.trim(),
      engine: formData.engine.trim(),
      drive: formData.drive.trim(),
      bodyStyle: formData.bodyStyle.trim()
    });

    // Reset form and close dialog
    setFormData({
      make: '',
      model: '',
      variant: '',
      period: '',
      engine: '',
      drive: '',
      bodyStyle: ''
    });
    setIsOpen(false);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBulkDataChange = (text) => {
    setBulkData(text);
    // Update preview in real-time
    const parsed = parseBulkData(text);
    setPreviewVehicles(parsed);
  };

  const parseBulkData = (text) => {
    if (!text.trim()) return [];
    
    const lines = text.split('\n').filter(line => line.trim());
    const vehicles = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Skip header row (contains **Make**, **Model**, etc.)
      if (line.includes('**Make**') || line.includes('**Model**') || 
          line.includes('Make *') || line.includes('Model *') ||
          /^\s*\|?\s*Make\s*\|/i.test(line) || 
          /^\s*\|?\s*[-\s|]+\s*\|/.test(line)) {
        continue;
      }

      // Skip separator lines (lines with only dashes and pipes)
      if (/^[\s\-|]+$/.test(line)) {
        continue;
      }

      // Try different delimiters: pipe, tab, comma, semicolon
      let parts = [];
      
      if (line.includes('|')) {
        parts = line.split('|').map(p => p.trim()).filter(p => p !== '');
      } else if (line.includes('\t')) {
        parts = line.split('\t');
      } else if (line.includes(',')) {
        parts = line.split(',');
      } else if (line.includes(';')) {
        parts = line.split(';');
      } else {
        // If no delimiter found, treat as space-separated but be careful
        parts = line.split(/\s{2,}/); // Split by 2 or more spaces
      }

      // Clean up parts - remove empty strings and trim
      parts = parts.map(p => p.trim()).filter(p => p !== '' && p !== '-' && !/^[-\s]+$/.test(p));

      // Create vehicle object with available data
      // Only add if we have at least make and model (first 2 columns with actual data)
      if (parts.length >= 2 && parts[0] && parts[1]) {
        const vehicle = {
          make: parts[0] || '',
          model: parts[1] || '',
          variant: parts[2] || '',
          period: parts[3] || '',
          engine: parts[4] || '',
          drive: parts[5] || '',
          bodyStyle: parts[6] || ''
        };
        vehicles.push(vehicle);
      }
    }

    return vehicles;
  };

  const handleBulkSubmit = (e) => {
    e.preventDefault();
    
    const vehicles = parseBulkData(bulkData);
    
    if (vehicles.length === 0) {
      alert('No valid data found. Please paste table data with at least Make and Model columns.');
      return;
    }

    // Add all vehicles
    vehicles.forEach(vehicle => {
      onAddVehicle(vehicle);
    });

    // Reset and close
    setBulkData('');
    setPreviewVehicles([]);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add Compatible Vehicle
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Compatible Vehicles</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single">
              Single Entry
            </TabsTrigger>
            <TabsTrigger value="bulk">
              Paste Table
            </TabsTrigger>
          </TabsList>

          {/* Single Entry Tab - Horizontal Table Layout */}
          <TabsContent value="single" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Table-like horizontal layout */}
              <div className="border rounded-lg overflow-hidden">
                {/* Header Row */}
                <div className="bg-gray-100 dark:bg-gray-800 grid grid-cols-7 gap-px border-b">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900">
                    Make *
                  </div>
                  <div className="px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900">
                    Model *
                  </div>
                  <div className="px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900">
                    Variant
                  </div>
                  <div className="px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900">
                    Period
                  </div>
                  <div className="px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900">
                    Engine
                  </div>
                  <div className="px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900">
                    Drive
                  </div>
                  <div className="px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900">
                    Body Style
                  </div>
                </div>

                {/* Input Row */}
                <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700">
                  <div className="bg-white dark:bg-gray-900 p-1">
                    <Input
                      id="make"
                      placeholder="Hyundai"
                      value={formData.make}
                      onChange={(e) => handleInputChange('make', e.target.value)}
                      required
                      className="border-0 h-9 text-sm"
                    />
                  </div>
                  <div className="bg-white dark:bg-gray-900 p-1">
                    <Input
                      id="model"
                      placeholder="Accent"
                      value={formData.model}
                      onChange={(e) => handleInputChange('model', e.target.value)}
                      required
                      className="border-0 h-9 text-sm"
                    />
                  </div>
                  <div className="bg-white dark:bg-gray-900 p-1">
                    <Input
                      id="variant"
                      placeholder="Various"
                      value={formData.variant}
                      onChange={(e) => handleInputChange('variant', e.target.value)}
                      className="border-0 h-9 text-sm"
                    />
                  </div>
                  <div className="bg-white dark:bg-gray-900 p-1">
                    <Input
                      id="period"
                      placeholder="2011-2013"
                      value={formData.period}
                      onChange={(e) => handleInputChange('period', e.target.value)}
                      className="border-0 h-9 text-sm"
                    />
                  </div>
                  <div className="bg-white dark:bg-gray-900 p-1">
                    <Input
                      id="engine"
                      placeholder="1.4L L4 Gas"
                      value={formData.engine}
                      onChange={(e) => handleInputChange('engine', e.target.value)}
                      className="border-0 h-9 text-sm"
                    />
                  </div>
                  <div className="bg-white dark:bg-gray-900 p-1">
                    <Input
                      id="drive"
                      placeholder="FWD"
                      value={formData.drive}
                      onChange={(e) => handleInputChange('drive', e.target.value)}
                      className="border-0 h-9 text-sm"
                    />
                  </div>
                  <div className="bg-white dark:bg-gray-900 p-1">
                    <Input
                      id="bodyStyle"
                      placeholder="Sedan"
                      value={formData.bodyStyle}
                      onChange={(e) => handleInputChange('bodyStyle', e.target.value)}
                      className="border-0 h-9 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Add Vehicle
                </Button>
              </div>
            </form>
          </TabsContent>

          {/* Bulk Entry Tab - Paste Table Data */}
          <TabsContent value="bulk" className="space-y-4">

            <form onSubmit={handleBulkSubmit} className="space-y-4">
              <Textarea
                id="bulkData"
                value={bulkData}
                onChange={(e) => handleBulkDataChange(e.target.value)}
                placeholder="Paste table data here (Excel, Sheets, etc.)&#10;&#10;Make | Model | Variant | Period | Engine | Drive | Body Style"
                rows={6}
                className="font-mono text-sm"
              />

              {/* Live Preview */}
              {previewVehicles.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">
                    {previewVehicles.length} vehicle{previewVehicles.length !== 1 ? 's' : ''} ready to add
                  </div>
                  <div className="border rounded-lg overflow-hidden max-h-[300px] overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-100 dark:bg-gray-800 sticky top-0">
                        <tr>
                          <th className="px-2 py-2 text-left font-semibold">#</th>
                          <th className="px-2 py-2 text-left font-semibold">Make</th>
                          <th className="px-2 py-2 text-left font-semibold">Model</th>
                          <th className="px-2 py-2 text-left font-semibold">Variant</th>
                          <th className="px-2 py-2 text-left font-semibold">Period</th>
                          <th className="px-2 py-2 text-left font-semibold">Engine</th>
                          <th className="px-2 py-2 text-left font-semibold">Drive</th>
                          <th className="px-2 py-2 text-left font-semibold">Body Style</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900">
                        {previewVehicles.map((vehicle, index) => (
                          <tr key={index} className="border-t hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="px-2 py-2 text-gray-500">{index + 1}</td>
                            <td className="px-2 py-2 font-medium">{vehicle.make || <span className="text-red-500">Missing</span>}</td>
                            <td className="px-2 py-2 font-medium">{vehicle.model || <span className="text-red-500">Missing</span>}</td>
                            <td className="px-2 py-2 text-gray-600 dark:text-gray-400">{vehicle.variant || '-'}</td>
                            <td className="px-2 py-2 text-gray-600 dark:text-gray-400">{vehicle.period || '-'}</td>
                            <td className="px-2 py-2 text-gray-600 dark:text-gray-400">{vehicle.engine || '-'}</td>
                            <td className="px-2 py-2 text-gray-600 dark:text-gray-400">{vehicle.drive || '-'}</td>
                            <td className="px-2 py-2 text-gray-600 dark:text-gray-400">{vehicle.bodyStyle || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}



              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={previewVehicles.length === 0}>
                  Add {previewVehicles.length > 0 ? `${previewVehicles.length} ` : ''}Vehicle{previewVehicles.length !== 1 ? 's' : ''}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AddCompatibleVehicleDialog;