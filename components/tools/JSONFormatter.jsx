'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { 
  FileText, 
  Copy, 
  Download,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Minimize2,
  Maximize2,
  RotateCcw,
  Zap
} from 'lucide-react';

const JSONFormatter = () => {
  const [inputJSON, setInputJSON] = useState('');
  const [outputJSON, setOutputJSON] = useState('');
  const [indentSize, setIndentSize] = useState('2');
  const [isValid, setIsValid] = useState(null);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ keys: 0, values: 0, size: 0 });
  const { toast } = useToast();

  // JSON validation and formatting
  const processJSON = useCallback((jsonString, indent = 2) => {
    try {
      if (!jsonString.trim()) {
        setOutputJSON('');
        setIsValid(null);
        setError('');
        setStats({ keys: 0, values: 0, size: 0 });
        return;
      }

      // Parse JSON
      const parsed = JSON.parse(jsonString);
      
      // Format JSON
      const formatted = JSON.stringify(parsed, null, indent);
      
      // Calculate stats
      const calculateStats = (obj, keys = 0, values = 0) => {
        if (Array.isArray(obj)) {
          values += obj.length;
          obj.forEach(item => {
            const result = calculateStats(item, keys, values);
            keys = result.keys;
            values = result.values;
          });
        } else if (typeof obj === 'object' && obj !== null) {
          const objKeys = Object.keys(obj);
          keys += objKeys.length;
          objKeys.forEach(key => {
            const result = calculateStats(obj[key], keys, values);
            keys = result.keys;
            values = result.values;
          });
        } else {
          values++;
        }
        return { keys, values };
      };

      const statsResult = calculateStats(parsed);
      const size = new Blob([formatted]).size;

      setOutputJSON(formatted);
      setIsValid(true);
      setError('');
      setStats({ ...statsResult, size });

    } catch (err) {
      setOutputJSON('');
      setIsValid(false);
      setError(err.message);
      setStats({ keys: 0, values: 0, size: 0 });
    }
  }, []);

  // Handle input change
  const handleInputChange = useCallback((value) => {
    setInputJSON(value);
    processJSON(value, parseInt(indentSize));
  }, [processJSON, indentSize]);

  // Handle indent change
  const handleIndentChange = useCallback((value) => {
    setIndentSize(value);
    if (inputJSON.trim()) {
      processJSON(inputJSON, parseInt(value));
    }
  }, [inputJSON, processJSON]);

  // Minify JSON
  const minifyJSON = useCallback(() => {
    if (isValid && inputJSON.trim()) {
      try {
        const parsed = JSON.parse(inputJSON);
        const minified = JSON.stringify(parsed);
        setOutputJSON(minified);
        
        const size = new Blob([minified]).size;
        setStats(prev => ({ ...prev, size }));
        
        toast({
          title: "JSON Minified",
          description: "JSON has been minified successfully!",
        });
      } catch (err) {
        toast({
          title: "Minification Failed",
          description: err.message,
          variant: "destructive"
        });
      }
    }
  }, [inputJSON, isValid, toast]);

  // Copy functions
  const copyToClipboard = useCallback((text, type) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied",
        description: `${type} copied to clipboard!`,
      });
    }).catch(() => {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      });
    });
  }, [toast]);

  // Download JSON
  const downloadJSON = useCallback(() => {
    if (!outputJSON) {
      toast({
        title: "No Output",
        description: "Please format JSON first",
        variant: "destructive"
      });
      return;
    }

    const blob = new Blob([outputJSON], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `formatted-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded",
      description: "JSON file downloaded successfully!",
    });
  }, [outputJSON, toast]);

  // Clear all
  const clearAll = useCallback(() => {
    setInputJSON('');
    setOutputJSON('');
    setIsValid(null);
    setError('');
    setStats({ keys: 0, values: 0, size: 0 });
  }, []);

  // Sample JSON templates
  const sampleTemplates = useMemo(() => ({
    simple: '{"name": "John Doe", "age": 30, "city": "New York"}',
    array: '["apple", "banana", "cherry", "date"]',
    nested: '{"user": {"name": "Jane", "details": {"age": 25, "hobbies": ["reading", "gaming"]}}}',
    complex: '{"users": [{"id": 1, "name": "Alice", "active": true}, {"id": 2, "name": "Bob", "active": false}], "total": 2}'
  }), []);

  const loadSample = useCallback((template) => {
    const sample = sampleTemplates[template];
    setInputJSON(sample);
    processJSON(sample, parseInt(indentSize));
  }, [processJSON, indentSize, sampleTemplates]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center space-x-3">
          <FileText className="w-8 h-8 text-blue-600" />
          <span>JSON Formatter & Validator</span>
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Format, validate, and analyze JSON data with real-time feedback and statistics
        </p>
      </div>

      {/* Controls */}
      <Card className="shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <Zap className="w-5 h-5" />
              <span>Controls</span>
            </span>
            <div className="flex items-center space-x-2">
              {isValid !== null && (
                <div className="flex items-center space-x-2">
                  {isValid ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ${isValid ? 'text-green-600' : 'text-red-600'}`}>
                    {isValid ? 'Valid JSON' : 'Invalid JSON'}
                  </span>
                </div>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Indent Size</Label>
              <Select value={indentSize} onValueChange={handleIndentChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 spaces</SelectItem>
                  <SelectItem value="4">4 spaces</SelectItem>
                  <SelectItem value="8">8 spaces</SelectItem>
                  <SelectItem value="1">1 tab</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Sample Templates</Label>
              <Select onValueChange={loadSample}>
                <SelectTrigger>
                  <SelectValue placeholder="Load sample" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="simple">Simple Object</SelectItem>
                  <SelectItem value="array">Array</SelectItem>
                  <SelectItem value="nested">Nested Object</SelectItem>
                  <SelectItem value="complex">Complex Structure</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex space-x-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={minifyJSON}
                    disabled={!isValid}
                    className="flex-1"
                  >
                    <Minimize2 className="w-4 h-4 mr-1" />
                    Minify
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Minify JSON</TooltipContent>
              </Tooltip>
            </div>

            <div className="flex space-x-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={clearAll}
                    className="flex-1"
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Clear
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Clear all fields</TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Stats */}
          {(stats.keys > 0 || stats.values > 0) && (
            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.keys}</div>
                <div className="text-sm text-gray-600">Keys</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.values}</div>
                <div className="text-sm text-gray-600">Values</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.size}</div>
                <div className="text-sm text-gray-600">Bytes</div>
              </div>
            </div>
          )}

          {/* Error display */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <div className="font-medium text-red-800">JSON Error</div>
                <div className="text-red-600 text-sm mt-1">{error}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* JSON Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <Card className="shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span>Input JSON</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(inputJSON, 'Input JSON')}
                disabled={!inputJSON}
              >
                <Copy className="w-4 h-4 mr-1" />
                Copy
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={inputJSON}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Paste your JSON here..."
              className="font-mono text-sm min-h-[400px] resize-none"
            />
          </CardContent>
        </Card>

        {/* Output */}
        <Card className="shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span>Formatted JSON</span>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(outputJSON, 'Formatted JSON')}
                  disabled={!outputJSON}
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadJSON}
                  disabled={!outputJSON}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={outputJSON}
              readOnly
              placeholder="Formatted JSON will appear here..."
              className="font-mono text-sm min-h-[400px] resize-none bg-gray-50"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JSONFormatter;
