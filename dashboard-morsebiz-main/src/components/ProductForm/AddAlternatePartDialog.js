'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

const AddAlternatePartDialog = ({ onAddPart }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    make: '',
    partNumber: ''
  });
  const [bulkData, setBulkData] = useState('');
  const [activeTab, setActiveTab] = useState('single');
  const [previewParts, setPreviewParts] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.make.trim() || !formData.partNumber.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    // Call the parent function with the form data
    onAddPart({
      make: formData.make.trim(),
      partNumber: formData.partNumber.trim()
    });

    // Reset form and close dialog
    setFormData({
      make: '',
      partNumber: ''
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
    setPreviewParts(parsed);
  };

  const parseBulkData = (text) => {
    if (!text.trim()) return [];
    
    const lines = text.split('\n').filter(line => line.trim());
    const parts = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Skip header row
      if (line.includes('**Make**') || line.includes('**Part Number**') || 
          line.includes('Make *') || line.includes('Part Number *') ||
          /^\s*\|?\s*Make\s*\|/i.test(line)) {
        continue;
      }

      // Skip separator lines
      if (/^[\s\-|]+$/.test(line)) {
        continue;
      }

      // Try different delimiters: pipe, tab, comma, semicolon
      let columns = [];
      
      if (line.includes('|')) {
        columns = line.split('|').map(p => p.trim()).filter(p => p !== '');
      } else if (line.includes('\t')) {
        columns = line.split('\t');
      } else if (line.includes(',')) {
        columns = line.split(',');
      } else if (line.includes(';')) {
        columns = line.split(';');
      } else {
        columns = line.split(/\s{2,}/);
      }

      // Clean up columns
      columns = columns.map(p => p.trim()).filter(p => p !== '' && p !== '-' && !/^[-\s]+$/.test(p));

      // Create part object with available data
      if (columns.length >= 2 && columns[0] && columns[1]) {
        const part = {
          make: columns[0] || '',
          partNumber: columns[1] || ''
        };
        parts.push(part);
      }
    }

    return parts;
  };

  const handleBulkSubmit = (e) => {
    e.preventDefault();
    
    const parts = parseBulkData(bulkData);
    
    if (parts.length === 0) {
      alert('No valid data found. Please paste table data with at least Make and Part Number columns.');
      return;
    }

    // Add all parts
    parts.forEach(part => {
      onAddPart(part);
    });

    // Reset and close
    setBulkData('');
    setPreviewParts([]);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add Alternate Part
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Alternate Parts</DialogTitle>
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
                <div className="bg-gray-100 dark:bg-gray-800 grid grid-cols-2 gap-px border-b">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900">
                    Make *
                  </div>
                  <div className="px-3 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900">
                    Part Number *
                  </div>
                </div>

                {/* Input Row */}
                <div className="grid grid-cols-2 gap-px bg-gray-200 dark:bg-gray-700">
                  <div className="bg-white dark:bg-gray-900 p-1">
                    <Input
                      id="make"
                      placeholder="A.B.S."
                      value={formData.make}
                      onChange={(e) => handleInputChange('make', e.target.value)}
                      required
                      className="border-0 h-9 text-sm"
                    />
                  </div>
                  <div className="bg-white dark:bg-gray-900 p-1">
                    <Input
                      id="partNumber"
                      placeholder="17725"
                      value={formData.partNumber}
                      onChange={(e) => handleInputChange('partNumber', e.target.value)}
                      required
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
                  Add Part
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
                placeholder="Paste table data here (Excel, Sheets, etc.)&#10;&#10;Make | Part Number"
                rows={6}
                className="font-mono text-sm"
              />

              {/* Live Preview */}
              {previewParts.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">
                    {previewParts.length} part{previewParts.length !== 1 ? 's' : ''} ready to add
                  </div>
                  <div className="border rounded-lg overflow-hidden max-h-[300px] overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-100 dark:bg-gray-800 sticky top-0">
                        <tr>
                          <th className="px-2 py-2 text-left font-semibold">#</th>
                          <th className="px-2 py-2 text-left font-semibold">Make</th>
                          <th className="px-2 py-2 text-left font-semibold">Part Number</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900">
                        {previewParts.map((part, index) => (
                          <tr key={index} className="border-t hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="px-2 py-2 text-gray-500">{index + 1}</td>
                            <td className="px-2 py-2 font-medium">{part.make || <span className="text-red-500">Missing</span>}</td>
                            <td className="px-2 py-2 font-medium">{part.partNumber || <span className="text-red-500">Missing</span>}</td>
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
                <Button type="submit" disabled={previewParts.length === 0}>
                  Add {previewParts.length > 0 ? `${previewParts.length} ` : ''}Part{previewParts.length !== 1 ? 's' : ''}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AddAlternatePartDialog;