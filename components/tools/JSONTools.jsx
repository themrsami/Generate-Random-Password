'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { 
  FileText, 
  Copy,
  Download,
  Upload,
  Check,
  X,
  AlertTriangle,
  Search,
  Code,
  Braces,
  Filter,
  ArrowUpDown,
  Zap,
  FileJson,
  Trash2,
  Edit3,
  Plus,
  Minus,
  Settings,
  Database,
  BarChart3,
  Globe
} from 'lucide-react';

const JSONTools = () => {
  const [inputJSON, setInputJSON] = useState('{\n  "users": [\n    {\n      "id": 1,\n      "name": "John Doe",\n      "age": 30,\n      "email": "john@example.com",\n      "address": {\n        "street": "123 Main St",\n        "city": "New York",\n        "zipcode": "10001"\n      },\n      "skills": ["JavaScript", "React", "Node.js"],\n      "active": true\n    },\n    {\n      "id": 2,\n      "name": "Jane Smith",\n      "age": 25,\n      "email": "jane@example.com",\n      "address": {\n        "street": "456 Oak Ave",\n        "city": "Los Angeles",\n        "zipcode": "90210"\n      },\n      "skills": ["Python", "Django", "PostgreSQL"],\n      "active": false\n    }\n  ],\n  "metadata": {\n    "total": 2,\n    "generated": "2024-01-01T00:00:00Z"\n  }\n}');
  const [outputJSON, setOutputJSON] = useState('');
  const [formattedJSON, setFormattedJSON] = useState('');
  const [minifiedJSON, setMinifiedJSON] = useState('');
  const [jsonPath, setJsonPath] = useState('$.users[0].name');
  const [pathResult, setPathResult] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);
  const [isValid, setIsValid] = useState(true);
  const [indentSize, setIndentSize] = useState(2);
  const [sortKeys, setSortKeys] = useState(false);
  const [copiedField, setCopiedField] = useState('');
  
  // New states for advanced features
  const [keyToRemove, setKeyToRemove] = useState('');
  const [pathToRemove, setPathToRemove] = useState('');
  const [filterKey, setFilterKey] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const [transformOperation, setTransformOperation] = useState('removeKey');
  
  const { toast } = useToast();

  // Validate JSON
  const validateJSON = useCallback((jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      setIsValid(true);
      setValidationErrors([]);
      return parsed;
    } catch (error) {
      setIsValid(false);
      const errorMessage = error.message;
      const line = errorMessage.match(/line (\d+)/)?.[1] || 'unknown';
      const column = errorMessage.match(/column (\d+)/)?.[1] || 'unknown';
      setValidationErrors([{
        message: errorMessage,
        line: line,
        column: column
      }]);
      return null;
    }
  }, []);

  // Sort object keys recursively
  const sortObjectKeys = useCallback((obj) => {
    if (Array.isArray(obj)) {
      return obj.map(sortObjectKeys);
    } else if (obj !== null && typeof obj === 'object') {
      const sorted = {};
      Object.keys(obj).sort().forEach(key => {
        sorted[key] = sortObjectKeys(obj[key]);
      });
      return sorted;
    }
    return obj;
  }, []);

  // Format JSON
  const formatJSON = useCallback(() => {
    const parsed = validateJSON(inputJSON);
    if (parsed !== null) {
      try {
        let formatted;
        if (sortKeys) {
          formatted = JSON.stringify(sortObjectKeys(parsed), null, indentSize);
        } else {
          formatted = JSON.stringify(parsed, null, indentSize);
        }
        setFormattedJSON(formatted);
      } catch (error) {
        toast({
          title: "Format Error",
          description: "Unable to format JSON",
          variant: "destructive"
        });
      }
    }
  }, [inputJSON, indentSize, sortKeys, validateJSON, toast, sortObjectKeys]);

  // Minify JSON
  const minifyJSON = useCallback(() => {
    const parsed = validateJSON(inputJSON);
    if (parsed !== null) {
      try {
        const minified = JSON.stringify(parsed);
        setMinifiedJSON(minified);
      } catch (error) {
        toast({
          title: "Minify Error",
          description: "Unable to minify JSON",
          variant: "destructive"
        });
      }
    }
  }, [inputJSON, validateJSON, toast]);

  // Advanced JSON manipulation functions
  const removeKeyFromObject = (obj, keyToRemove) => {
    if (Array.isArray(obj)) {
      return obj.map(item => removeKeyFromObject(item, keyToRemove));
    } else if (obj !== null && typeof obj === 'object') {
      const newObj = {};
      Object.keys(obj).forEach(key => {
        if (key !== keyToRemove) {
          newObj[key] = removeKeyFromObject(obj[key], keyToRemove);
        }
      });
      return newObj;
    }
    return obj;
  };

  const removeByPath = (obj, pathToRemove) => {
    try {
      const pathParts = pathToRemove.replace(/^\$\.?/, '').split('.');
      const newObj = JSON.parse(JSON.stringify(obj)); // Deep clone
      
      let current = newObj;
      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];
        if (part.includes('[') && part.includes(']')) {
          const [prop, indexStr] = part.split('[');
          const index = parseInt(indexStr.replace(']', ''));
          if (prop) current = current[prop];
          if (Array.isArray(current) && index >= 0 && index < current.length) {
            current = current[index];
          }
        } else {
          current = current[part];
        }
      }
      
      const lastPart = pathParts[pathParts.length - 1];
      if (lastPart.includes('[') && lastPart.includes(']')) {
        const [prop, indexStr] = lastPart.split('[');
        const index = parseInt(indexStr.replace(']', ''));
        if (prop && current[prop] && Array.isArray(current[prop])) {
          current[prop].splice(index, 1);
        }
      } else {
        delete current[lastPart];
      }
      
      return newObj;
    } catch (error) {
      throw new Error(`Invalid path: ${pathToRemove}`);
    }
  };

  const filterObjects = (obj, filterKey, filterValue) => {
    if (Array.isArray(obj)) {
      return obj.filter(item => {
        if (item && typeof item === 'object' && filterKey in item) {
          return String(item[filterKey]).toLowerCase().includes(String(filterValue).toLowerCase());
        }
        return true;
      }).map(item => filterObjects(item, filterKey, filterValue));
    } else if (obj !== null && typeof obj === 'object') {
      const newObj = {};
      Object.keys(obj).forEach(key => {
        newObj[key] = filterObjects(obj[key], filterKey, filterValue);
      });
      return newObj;
    }
    return obj;
  };

  const removeArrays = (obj) => {
    if (Array.isArray(obj)) {
      return []; // Replace arrays with empty arrays or remove them
    } else if (obj !== null && typeof obj === 'object') {
      const newObj = {};
      Object.keys(obj).forEach(key => {
        const value = removeArrays(obj[key]);
        if (!Array.isArray(value) || value.length > 0) {
          newObj[key] = value;
        }
      });
      return newObj;
    }
    return obj;
  };

  const removeNestedObjects = (obj, depth = 0, maxDepth = 1) => {
    if (depth >= maxDepth) {
      return Array.isArray(obj) ? [] : {};
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => removeNestedObjects(item, depth + 1, maxDepth));
    } else if (obj !== null && typeof obj === 'object') {
      const newObj = {};
      Object.keys(obj).forEach(key => {
        const value = obj[key];
        if (typeof value === 'object' && value !== null && depth >= maxDepth - 1) {
          // Skip nested objects at max depth
        } else {
          newObj[key] = removeNestedObjects(value, depth + 1, maxDepth);
        }
      });
      return newObj;
    }
    return obj;
  };

  // Apply transformation
  const applyTransformation = () => {
    const parsed = validateJSON(inputJSON);
    if (!parsed) return;

    try {
      let result;
      
      switch (transformOperation) {
        case 'removeKey':
          if (!keyToRemove.trim()) {
            toast({
              title: "Missing Key",
              description: "Please specify a key to remove",
              variant: "destructive"
            });
            return;
          }
          result = removeKeyFromObject(parsed, keyToRemove.trim());
          break;
          
        case 'removePath':
          if (!pathToRemove.trim()) {
            toast({
              title: "Missing Path",
              description: "Please specify a path to remove",
              variant: "destructive"
            });
            return;
          }
          result = removeByPath(parsed, pathToRemove.trim());
          break;
          
        case 'filterObjects':
          if (!filterKey.trim() || !filterValue.trim()) {
            toast({
              title: "Missing Filter",
              description: "Please specify both filter key and value",
              variant: "destructive"
            });
            return;
          }
          result = filterObjects(parsed, filterKey.trim(), filterValue.trim());
          break;
          
        case 'removeArrays':
          result = removeArrays(parsed);
          break;
          
        case 'removeNestedObjects':
          result = removeNestedObjects(parsed);
          break;
          
        default:
          result = parsed;
      }
      
      setOutputJSON(JSON.stringify(result, null, indentSize));
      setCurrentConversion('transform');
      toast({
        title: "Transformation Applied",
        description: `Successfully applied ${transformOperation} operation`,
      });
    } catch (error) {
      toast({
        title: "Transformation Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Enhanced CSV conversion
  const convertToCSV = () => {
    const parsed = validateJSON(inputJSON);
    if (!parsed) return;

    try {
      let csvData = [];
      
      if (Array.isArray(parsed)) {
        // Handle array of objects
        if (parsed.length > 0 && typeof parsed[0] === 'object') {
          const headers = new Set();
          
          // Collect all possible headers
          parsed.forEach(obj => {
            const flatObj = flattenObject(obj);
            Object.keys(flatObj).forEach(key => headers.add(key));
          });
          
          const headerArray = Array.from(headers);
          csvData.push(headerArray.join(','));
          
          // Add data rows
          parsed.forEach(obj => {
            const flatObj = flattenObject(obj);
            const row = headerArray.map(header => {
              const value = flatObj[header] || '';
              return `"${String(value).replace(/"/g, '""')}"`;
            });
            csvData.push(row.join(','));
          });
        } else {
          // Handle array of primitives
          csvData.push('value');
          parsed.forEach(item => {
            csvData.push(`"${String(item).replace(/"/g, '""')}"`);
          });
        }
      } else if (typeof parsed === 'object') {
        // Handle single object
        const flatObj = flattenObject(parsed);
        const headers = Object.keys(flatObj);
        csvData.push(headers.join(','));
        
        const values = headers.map(header => {
          const value = flatObj[header] || '';
          return `"${String(value).replace(/"/g, '""')}"`;
        });
        csvData.push(values.join(','));
      } else {
        // Handle primitive value
        csvData.push('value');
        csvData.push(`"${String(parsed).replace(/"/g, '""')}"`);
      }
      
      setOutputJSON(csvData.join('\n'));
      setCurrentConversion('csv');
      toast({
        title: "CSV Conversion Complete",
        description: "JSON successfully converted to CSV format",
      });
    } catch (error) {
      toast({
        title: "CSV Conversion Failed",
        description: "Unable to convert complex JSON structure to CSV. Try flattening the structure first.",
        variant: "destructive"
      });
    }
  };

  // Flatten nested objects
  const flattenObject = (obj, prefix = '') => {
    const flattened = {};
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        
        if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
          Object.assign(flattened, flattenObject(obj[key], newKey));
        } else if (Array.isArray(obj[key])) {
          flattened[newKey] = obj[key].map(item => 
            typeof item === 'object' ? JSON.stringify(item) : item
          ).join('; ');
        } else {
          flattened[newKey] = obj[key];
        }
      }
    }
    
    return flattened;
  };
  // Extract value using JSON path
  const extractJSONPath = useCallback(() => {
    const parsed = validateJSON(inputJSON);
    if (parsed !== null) {
      try {
        // Simple JSON path implementation
        let result = parsed;
        const path = jsonPath.replace(/^\$\.?/, '').split('.');
        
        for (const key of path) {
          if (key === '') continue;
          
          // Handle array indices
          if (key.includes('[') && key.includes(']')) {
            const [prop, indexStr] = key.split('[');
            const index = parseInt(indexStr.replace(']', ''));
            if (prop) result = result[prop];
            if (Array.isArray(result) && index >= 0 && index < result.length) {
              result = result[index];
            } else {
              throw new Error(`Invalid array index: ${index}`);
            }
          } else {
            if (result && typeof result === 'object' && key in result) {
              result = result[key];
            } else {
              throw new Error(`Property '${key}' not found`);
            }
          }
        }
        
        setPathResult(JSON.stringify(result, null, 2));
      } catch (error) {
        setPathResult(`Error: ${error.message}`);
      }
    }
  }, [inputJSON, jsonPath, validateJSON]);

  // Convert to XML
  const convertToXML = () => {
    const parsed = validateJSON(inputJSON);
    if (!parsed) return;

    try {
      const xmlString = jsonToXML(parsed, 'root');
      setOutputJSON(xmlString);
      setCurrentConversion('xml');
      toast({
        title: "XML Conversion Complete",
        description: "JSON successfully converted to XML format",
      });
    } catch (error) {
      toast({
        title: "XML Conversion Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const jsonToXML = (obj, rootName = 'root') => {
    const buildXML = (data, name) => {
      if (Array.isArray(data)) {
        return data.map((item, index) => 
          buildXML(item, name.slice(0, -1) || 'item') // Remove 's' for singular
        ).join('');
      } else if (data && typeof data === 'object') {
        const inner = Object.entries(data)
          .map(([key, value]) => buildXML(value, key))
          .join('');
        return `<${name}>${inner}</${name}>`;
      } else {
        return `<${name}>${String(data).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</${name}>`;
      }
    };
    
    return `<?xml version="1.0" encoding="UTF-8"?>\n${buildXML(obj, rootName)}`;
  };

  // Convert to YAML
  const convertToYAML = () => {
    const parsed = validateJSON(inputJSON);
    if (!parsed) return;

    try {
      const yamlString = jsonToYAML(parsed);
      setOutputJSON(yamlString);
      setCurrentConversion('yaml');
      toast({
        title: "YAML Conversion Complete",
        description: "JSON successfully converted to YAML format",
      });
    } catch (error) {
      toast({
        title: "YAML Conversion Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const jsonToYAML = (obj, indent = 0) => {
    const spaces = '  '.repeat(indent);
    
    if (Array.isArray(obj)) {
      if (obj.length === 0) return '[]';
      return obj.map(item => {
        if (typeof item === 'object' && item !== null) {
          return `${spaces}- ${jsonToYAML(item, indent + 1).trim()}`;
        } else {
          return `${spaces}- ${String(item)}`;
        }
      }).join('\n');
    } else if (obj && typeof obj === 'object') {
      const entries = Object.entries(obj);
      if (entries.length === 0) return '{}';
      
      return entries.map(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          const valueYaml = jsonToYAML(value, indent + 1);
          return `${spaces}${key}:\n${valueYaml}`;
        } else {
          return `${spaces}${key}: ${String(value)}`;
        }
      }).join('\n');
    } else {
      return String(obj);
    }
  };

  // Convert to URL parameters
  const convertToURLParams = () => {
    const parsed = validateJSON(inputJSON);
    if (!parsed) return;

    try {
      const flattened = flattenObject(parsed);
      const params = new URLSearchParams();
      
      Object.entries(flattened).forEach(([key, value]) => {
        params.append(key, String(value));
      });
      
      setOutputJSON(params.toString());
      setCurrentConversion('url');
      toast({
        title: "URL Parameters Complete",
        description: "JSON successfully converted to URL parameters",
      });
    } catch (error) {
      toast({
        title: "URL Parameters Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Copy functions
  const handleCopy = async (content, fieldName) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(''), 2000);
      toast({
        title: "Copied!",
        description: `${fieldName} copied to clipboard`,
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      });
    }
  };

  // File upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setInputJSON(e.target.result);
      };
      reader.readAsText(file);
    }
  };

  // Generate sample JSON
  const generateSampleJSON = (type) => {
    const samples = {
      user: {
        "users": [
          {
            "id": 1,
            "name": "John Doe",
            "email": "john@example.com",
            "age": 30,
            "address": {
              "street": "123 Main St",
              "city": "New York",
              "zipcode": "10001"
            },
            "skills": ["JavaScript", "React", "Node.js"],
            "active": true
          },
          {
            "id": 2,
            "name": "Jane Smith",
            "email": "jane@example.com",
            "age": 25,
            "address": {
              "street": "456 Oak Ave",
              "city": "Los Angeles",
              "zipcode": "90210"
            },
            "skills": ["Python", "Django", "PostgreSQL"],
            "active": false
          }
        ],
        "metadata": {
          "total": 2,
          "generated": "2024-01-01T00:00:00Z"
        }
      },
      product: {
        "products": [
          {
            "id": "prod-123",
            "name": "Wireless Headphones",
            "price": 99.99,
            "categories": ["electronics", "audio"],
            "specifications": {
              "battery": "20 hours",
              "connectivity": "Bluetooth 5.0",
              "weight": "250g"
            },
            "inStock": true,
            "reviews": [
              { "rating": 5, "comment": "Great sound quality!" },
              { "rating": 4, "comment": "Good value for money" }
            ]
          }
        ]
      },
      apiResponse: {
        "status": "success",
        "data": [
          {"id": 1, "title": "First Post", "published": true},
          {"id": 2, "title": "Second Post", "published": false}
        ],
        "pagination": {
          "page": 1,
          "total": 2,
          "hasNext": false
        }
      }
    };
    
    setInputJSON(JSON.stringify(samples[type], null, 2));
  };

  // Auto-format and validate on input change
  const handleInputChange = (value) => {
    setInputJSON(value);
    validateJSON(value);
  };

  // Statistics
  const jsonStats = useMemo(() => {
    const parsed = validateJSON(inputJSON);
    if (!parsed) return { size: 0, objects: 0, arrays: 0, properties: 0 };
    
    let objects = 0;
    let arrays = 0;
    let properties = 0;
    
    const count = (obj) => {
      if (Array.isArray(obj)) {
        arrays++;
        obj.forEach(count);
      } else if (obj !== null && typeof obj === 'object') {
        objects++;
        properties += Object.keys(obj).length;
        Object.values(obj).forEach(count);
      }
    };
    
    count(parsed);
    
    return {
      size: new Blob([inputJSON]).size,
      objects,
      arrays,
      properties
    };
  }, [inputJSON, validateJSON]);

  // Handle download functionality
  const handleDownload = (content, filename, mimeType = 'application/json') => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Smart download based on current conversion
  const [currentConversion, setCurrentConversion] = useState('');
  
  const handleSmartDownload = () => {
    if (!outputJSON) return;
    
    let filename, mimeType;
    
    switch (currentConversion) {
      case 'csv':
        filename = 'converted-data.csv';
        mimeType = 'text/csv';
        break;
      case 'xml':
        filename = 'converted-data.xml';
        mimeType = 'application/xml';
        break;
      case 'yaml':
        filename = 'converted-data.yaml';
        mimeType = 'text/yaml';
        break;
      case 'url':
        filename = 'url-parameters.txt';
        mimeType = 'text/plain';
        break;
      case 'transform':
        filename = 'transformed-data.json';
        mimeType = 'application/json';
        break;
      default:
        filename = 'output.json';
        mimeType = 'application/json';
    }
    
    handleDownload(outputJSON, filename, mimeType);
  };

  // Run initial formatting
  React.useEffect(() => {
    formatJSON();
    minifyJSON();
    extractJSONPath();
  }, [formatJSON, minifyJSON, extractJSONPath]);

  return (
    <div className="w-full max-w-full mx-auto space-y-6 p-4">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center space-x-3">
          <FileJson className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">JSON Tools</h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Format, validate, minify, and manipulate JSON data with powerful tools
        </p>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Input Panel */}
        <div className="col-span-12 lg:col-span-6">
          <Card className="shadow-lg h-[700px]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Code className="w-5 h-5" />
                  <span>Input JSON</span>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="json-upload"
                  />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('json-upload').click()}
                      >
                        <Upload className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Upload JSON file</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => generateSampleJSON('user')}
                      >
                        <Zap className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Generate sample JSON</TooltipContent>
                  </Tooltip>
                </div>
              </div>
              
              {/* Validation Status */}
              <div className="flex items-center space-x-2">
                {isValid ? (
                  <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                    <Check className="w-3 h-3 mr-1" />
                    Valid JSON
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
                    <X className="w-3 h-3 mr-1" />
                    Invalid JSON
                  </Badge>
                )}
                
                {/* Statistics */}
                <div className="flex space-x-2 text-xs text-gray-500">
                  <span>{jsonStats.size} bytes</span>
                  <span>•</span>
                  <span>{jsonStats.objects} objects</span>
                  <span>•</span>
                  <span>{jsonStats.arrays} arrays</span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-3">
              <div className="space-y-3">
                {/* Format Options */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Label className="text-sm">Indent:</Label>
                    <Select value={indentSize.toString()} onValueChange={(v) => setIndentSize(parseInt(v))}>
                      <SelectTrigger className="w-16 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="8">8</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="sortKeys"
                      checked={sortKeys}
                      onChange={(e) => setSortKeys(e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="sortKeys" className="text-sm">Sort keys</Label>
                  </div>
                </div>

                {/* JSON Input */}
                <Textarea
                  value={inputJSON}
                  onChange={(e) => handleInputChange(e.target.value)}
                  className="font-mono text-sm h-[500px] resize-none"
                  placeholder="Enter your JSON here..."
                />

                {/* Validation Errors */}
                {validationErrors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2 text-red-700 mb-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="font-semibold">Validation Errors:</span>
                    </div>
                    {validationErrors.map((error, index) => (
                      <div key={index} className="text-sm text-red-600">
                        Line {error.line}, Column {error.column}: {error.message}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Output Panel */}
        <div className="col-span-12 lg:col-span-6">
          <Card className="shadow-lg h-[700px]">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Braces className="w-5 h-5" />
                <span>Output & Tools</span>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-3">
              <Tabs defaultValue="formatted" className="h-[600px]">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="formatted">Format</TabsTrigger>
                  <TabsTrigger value="minified">Minify</TabsTrigger>
                  <TabsTrigger value="path">Path</TabsTrigger>
                  <TabsTrigger value="convert">Convert</TabsTrigger>
                  <TabsTrigger value="transform">Transform</TabsTrigger>
                </TabsList>
                
                <TabsContent value="formatted" className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">Formatted JSON</Label>
                    <div className="flex space-x-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopy(formattedJSON, 'Formatted JSON')}
                            disabled={!formattedJSON}
                          >
                            {copiedField === 'Formatted JSON' ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Copy formatted JSON</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(formattedJSON, 'formatted.json')}
                            disabled={!formattedJSON}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Download formatted JSON</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-auto h-[500px] border-2 border-gray-700">
                    <pre className="whitespace-pre-wrap">{formattedJSON || '// Formatted JSON will appear here'}</pre>
                  </div>
                </TabsContent>
                
                <TabsContent value="minified" className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">Minified JSON</Label>
                    <div className="flex space-x-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopy(minifiedJSON, 'Minified JSON')}
                            disabled={!minifiedJSON}
                          >
                            {copiedField === 'Minified JSON' ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Copy minified JSON</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(minifiedJSON, 'minified.json')}
                            disabled={!minifiedJSON}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Download minified JSON</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-auto h-[500px] border-2 border-gray-700">
                    <pre className="whitespace-pre-wrap break-all">{minifiedJSON || '// Minified JSON will appear here'}</pre>
                  </div>
                </TabsContent>
                
                <TabsContent value="path" className="mt-4 space-y-3">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Label className="text-sm font-semibold">JSON Path:</Label>
                      <Input
                        value={jsonPath}
                        onChange={(e) => setJsonPath(e.target.value)}
                        placeholder="$.name or $.users[0].email"
                        className="flex-1 font-mono text-sm"
                      />
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={extractJSONPath}
                            disabled={!isValid}
                          >
                            <Search className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Extract value from JSON path</TooltipContent>
                      </Tooltip>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold">Result</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopy(pathResult, 'Path Result')}
                            disabled={!pathResult}
                          >
                            {copiedField === 'Path Result' ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Copy path extraction result</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                  
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-auto h-[450px] border-2 border-gray-700">
                    <pre className="whitespace-pre-wrap">{pathResult || '// Path extraction result will appear here'}</pre>
                  </div>
                </TabsContent>
                
                <TabsContent value="convert" className="mt-4 space-y-1">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Convert to other formats</Label>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            onClick={convertToCSV}
                            disabled={!isValid}
                            className="h-12 flex gap-2 items-center"
                          >
                            <BarChart3 className="w-5 h-5 mb-1" />
                            <span className="text-xs">Export as CSV</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Convert JSON to CSV format</TooltipContent>
                      </Tooltip>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            onClick={convertToXML}
                            disabled={!isValid}
                            className="h-12 flex gap-2 items-center"
                          >
                            <Code className="w-5 h-5 mb-1" />
                            <span className="text-xs">Export as XML</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Convert JSON to XML format</TooltipContent>
                      </Tooltip>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            onClick={convertToYAML}
                            disabled={!isValid}
                            className="h-12 flex gap-2 items-center"
                          >
                            <FileText className="w-5 h-5 mb-1" />
                            <span className="text-xs">Export as YAML</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Convert JSON to YAML format</TooltipContent>
                      </Tooltip>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            onClick={convertToURLParams}
                            disabled={!isValid}
                            className="h-12 flex gap-2 items-center"
                          >
                            <Globe className="w-5 h-5 mb-1" />
                            <span className="text-xs">URL Params</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Convert JSON to URL parameters</TooltipContent>
                      </Tooltip>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold">Converted Output</Label>
                        <div className="flex space-x-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCopy(outputJSON, 'Converted Output')}
                                disabled={!outputJSON}
                              >
                                {copiedField === 'Converted Output' ? (
                                  <Check className="w-4 h-4 text-green-600" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Copy converted output</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleSmartDownload}
                                disabled={!outputJSON}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Download converted output</TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                      <div className="bg-gray-900 text-green-400 p-3 rounded-lg font-mono text-xs overflow-auto h-[200px] border-2 border-gray-700">
                        <pre className="whitespace-pre-wrap">{outputJSON || '// Converted output will appear here'}</pre>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-2">
                      <h4 className="font-semibold text-xs mb-2">Statistics:</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                        <div className="text-center">
                          <div className="font-medium">{jsonStats.size}</div>
                          <div>bytes</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{jsonStats.objects}</div>
                          <div>objects</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{jsonStats.arrays}</div>
                          <div>arrays</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{jsonStats.properties}</div>
                          <div>properties</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="transform" className="mt-4 space-y-3">
                  <div className="space-y-4">
                    <Label className="text-sm font-semibold">Advanced JSON Transformations</Label>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Label className="text-sm w-24">Operation:</Label>
                        <Select value={transformOperation} onValueChange={setTransformOperation}>
                          <SelectTrigger className="flex-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="removeKey">Remove Key</SelectItem>
                            <SelectItem value="removePath">Remove Path</SelectItem>
                            <SelectItem value="filterObjects">Filter Objects</SelectItem>
                            <SelectItem value="removeArrays">Remove Arrays</SelectItem>
                            <SelectItem value="removeNestedObjects">Remove Nested Objects</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {transformOperation === 'removeKey' && (
                        <div className="flex items-center space-x-2">
                          <Label className="text-sm w-24">Key to remove:</Label>
                          <Input
                            value={keyToRemove}
                            onChange={(e) => setKeyToRemove(e.target.value)}
                            placeholder="e.g., email, id"
                            className="flex-1"
                          />
                        </div>
                      )}
                      
                      {transformOperation === 'removePath' && (
                        <div className="flex items-center space-x-2">
                          <Label className="text-sm w-24">Path to remove:</Label>
                          <Input
                            value={pathToRemove}
                            onChange={(e) => setPathToRemove(e.target.value)}
                            placeholder="e.g., $.users[0].address"
                            className="flex-1 font-mono"
                          />
                        </div>
                      )}
                      
                      {transformOperation === 'filterObjects' && (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Label className="text-sm w-24">Filter key:</Label>
                            <Input
                              value={filterKey}
                              onChange={(e) => setFilterKey(e.target.value)}
                              placeholder="e.g., active, status"
                              className="flex-1"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Label className="text-sm w-24">Filter value:</Label>
                            <Input
                              value={filterValue}
                              onChange={(e) => setFilterValue(e.target.value)}
                              placeholder="e.g., true, published"
                              className="flex-1"
                            />
                          </div>
                        </div>
                      )}
                      
                      <Button
                        onClick={applyTransformation}
                        disabled={!isValid}
                        className="w-full"
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Apply Transformation
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold">Transformed Output</Label>
                        <div className="flex space-x-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCopy(outputJSON, 'Transformed Output')}
                                disabled={!outputJSON}
                              >
                                {copiedField === 'Transformed Output' ? (
                                  <Check className="w-4 h-4 text-green-600" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Copy transformed JSON</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleSmartDownload}
                                disabled={!outputJSON}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Download transformed JSON</TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                      <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-auto h-[300px] border-2 border-gray-700">
                        <pre className="whitespace-pre-wrap">{outputJSON || '// Transformed output will appear here'}</pre>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default JSONTools;
