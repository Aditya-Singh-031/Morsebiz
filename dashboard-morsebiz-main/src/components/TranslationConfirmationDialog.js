'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Bot, Languages, Loader2, AlertCircle } from 'lucide-react';

export default function TranslationConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  isProcessing = false,
  translationData = {}
}) {
  const [aiTranslationEnabled, setAiTranslationEnabled] = useState(false);

  const handleConfirm = () => {
    onConfirm(aiTranslationEnabled);
  };

  const handleClose = () => {
    if (!isProcessing) {
      onClose();
      // Reset AI option when closing
      setAiTranslationEnabled(false);
    }
  };

  const validProductCount = translationData.validProducts?.length || translationData.validRows || 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            Confirm Translation
          </DialogTitle>
          <DialogDescription>
            You are about to start the translation process. Please review the details below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Translation Summary */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Products to translate:</span>
              <span className="font-medium">{validProductCount} items</span>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">File:</span>
              <span className="font-medium text-xs truncate max-w-[200px]" title={translationData.fileName}>
                {translationData.fileName}
              </span>
            </div>

            {translationData.languages && translationData.languages.length > 0 && (
              <div className="flex justify-between items-start text-sm">
                <span className="text-muted-foreground">Languages:</span>
                <div className="flex flex-wrap gap-1 max-w-[200px] justify-end">
                  {translationData.languages.map((lang, index) => (
                    <span key={index} className="px-2 py-1 bg-muted rounded text-xs">
                      {lang.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* AI Translation Option */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="ai-translation" className="text-sm font-medium flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  AI Translation
                </Label>
                <p className="text-xs text-muted-foreground">
                  Automatically translate missing language fields using AI
                </p>
              </div>
              <Switch
                id="ai-translation"
                checked={aiTranslationEnabled}
                onCheckedChange={setAiTranslationEnabled}
                disabled={isProcessing}
              />
            </div>

            {aiTranslationEnabled && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-blue-700">
                    <p className="font-medium">AI Translation will:</p>
                    <ul className="mt-1 space-y-1 list-disc list-inside">
                      <li>Use English text as source for translations</li>
                      <li>Fill in missing language fields automatically</li>
                      <li>Preserve existing translations in Excel file</li>
                      <li>May take longer to process</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={isProcessing || validProductCount === 0}
            className="min-w-[120px]"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Languages className="mr-2 h-4 w-4" />
                Start Translation
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}