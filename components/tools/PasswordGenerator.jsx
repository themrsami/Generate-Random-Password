'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Copy, 
  RefreshCw, 
  Download, 
  Key, 
  Check,
  Shield,
  AlertTriangle,
  X,
  Eye,
  EyeOff,
  Settings,
  Database,
  FileText,
  BarChart3
} from 'lucide-react';

const PasswordGenerator = () => {
  const [passwords, setPasswords] = useState([]);
  const [length, setLength] = useState(16);
  const [quantity, setQuantity] = useState(5);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });
  const [copiedIndex, setCopiedIndex] = useState(-1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [showPasswords, setShowPasswords] = useState(true);
  const [selectedExportType, setSelectedExportType] = useState('json');
  
  // Export template configurations
  const [exportTemplates, setExportTemplates] = useState({
    json: {
      includeMetadata: true,
      includeStrength: true,
      includeTimestamp: true,
      indentSize: 2
    },
    csv: {
      includeHeaders: true,
      includeStrength: true,
      includeTimestamp: true,
      separator: ','
    },
    txt: {
      includeIndex: true,
      includeStrength: false,
      separator: '\n',
      format: 'simple' // simple, detailed
    }
  });

  const { toast } = useToast();

  // Custom password generation function
  const generateCustomPassword = useCallback((length, options) => {
    let charset = '';
    
    if (options.uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (options.lowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (options.numbers) charset += '0123456789';
    if (options.symbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    if (charset === '') return '';
    
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    return password;
  }, []);

  // Calculate password strength
  const calculatePasswordStrength = useCallback((password) => {
    let score = 0;
    let feedback = [];

    // Length scoring
    if (password.length >= 12) score += 25;
    else if (password.length >= 8) score += 15;
    else if (password.length >= 6) score += 10;
    else feedback.push("Too short");

    // Character variety
    if (/[a-z]/.test(password)) score += 15;
    else feedback.push("Missing lowercase");
    
    if (/[A-Z]/.test(password)) score += 15;
    else feedback.push("Missing uppercase");
    
    if (/[0-9]/.test(password)) score += 15;
    else feedback.push("Missing numbers");
    
    if (/[^A-Za-z0-9]/.test(password)) score += 20;
    else feedback.push("Missing symbols");

    // Pattern checks
    if (!/(.)\1{2,}/.test(password)) score += 10; // No repeated characters
    else feedback.push("Repeated characters");

    // Ensure maximum is 100%
    score = Math.min(score, 100);

    let strength = 'Very Weak';
    let color = 'bg-red-500';
    
    if (score >= 80) {
      strength = 'Very Strong';
      color = 'bg-green-500';
    } else if (score >= 60) {
      strength = 'Strong';
      color = 'bg-blue-500';
    } else if (score >= 40) {
      strength = 'Medium';
      color = 'bg-yellow-500';
    } else if (score >= 20) {
      strength = 'Weak';
      color = 'bg-orange-500';
    }

    return { score, strength, color, feedback };
  }, []);

  // Generate passwords with progress tracking
  const generatePasswords = useCallback(async (opts = options) => {
    if (!opts.uppercase && !opts.lowercase && !opts.numbers && !opts.symbols) {
      toast({
        title: "Configuration Error",
        description: "Please select at least one character type.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);
    
    try {
      const newPasswords = [];
      const batchSize = Math.min(quantity, 1000); // Process in batches
      
      for (let i = 0; i < quantity; i += batchSize) {
        const currentBatch = Math.min(batchSize, quantity - i);
        
        for (let j = 0; j < currentBatch; j++) {
          const password = generateCustomPassword(length, opts);
          newPasswords.push(password);
          
          // Update progress
          const progress = ((i + j + 1) / quantity) * 100;
          setGenerationProgress(progress);
          
          // Allow UI updates for large quantities
          if ((i + j + 1) % 100 === 0) {
            await new Promise(resolve => setTimeout(resolve, 1));
          }
        }
      }
      
      setPasswords(newPasswords);
      toast({
        title: "Passwords Generated",
        description: `Successfully generated ${newPasswords.length} passwords.`,
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: 'Failed to generate passwords. Please try again.',
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  }, [length, quantity, options, generateCustomPassword, toast]);

  // Generate export preview - real-time update with all passwords
  const generateExportPreview = useMemo(() => {
    if (passwords.length === 0) return '';
    
    const template = exportTemplates[selectedExportType];
    const previewPasswords = passwords.slice(0, Math.min(passwords.length, 10)); // Show first 10 for preview
    
    switch (selectedExportType) {
      case 'json':
        const jsonData = {
          ...(template.includeMetadata && {
            metadata: {
              generated: new Date().toISOString(),
              count: passwords.length,
              settings: { length, options }
            }
          }),
          passwords: previewPasswords.map((pwd, idx) => {
            const item = { password: pwd };
            if (template.includeStrength) {
              item.strength = calculatePasswordStrength(pwd);
            }
            if (template.includeTimestamp) {
              item.generated = new Date().toISOString();
            }
            return item;
          })
        };
        return JSON.stringify(jsonData, null, template.indentSize);
        
      case 'csv':
        const headers = [];
        if (template.includeHeaders) {
          headers.push('ID', 'Password');
          if (template.includeStrength) headers.push('Strength', 'Score');
          if (template.includeTimestamp) headers.push('Generated');
        }
        
        const rows = [];
        if (headers.length > 0) rows.push(headers.join(template.separator));
        
        previewPasswords.forEach((pwd, idx) => {
          const row = [idx + 1, `"${pwd}"`];
          if (template.includeStrength) {
            const strength = calculatePasswordStrength(pwd);
            row.push(`"${strength.strength}"`, strength.score);
          }
          if (template.includeTimestamp) {
            row.push(new Date().toISOString());
          }
          rows.push(row.join(template.separator));
        });
        
        if (passwords.length > 10) {
          rows.push(`... and ${passwords.length - 10} more passwords`);
        }
        
        return rows.join('\n');
        
      case 'txt':
        let result;
        if (template.format === 'simple') {
          result = previewPasswords.map((pwd, idx) => 
            template.includeIndex ? `${idx + 1}. ${pwd}` : pwd
          ).join(template.separator);
        } else {
          result = previewPasswords.map((pwd, idx) => {
            let line = template.includeIndex ? `Password #${idx + 1}: ${pwd}` : pwd;
            if (template.includeStrength) {
              const strength = calculatePasswordStrength(pwd);
              line += ` (${strength.strength} - ${strength.score}%)`;
            }
            return line;
          }).join(template.separator);
        }
        
        if (passwords.length > 10) {
          result += `${template.separator}... and ${passwords.length - 10} more passwords`;
        }
        
        return result;
        
      default:
        return '';
    }
  }, [passwords, selectedExportType, exportTemplates, length, options, calculatePasswordStrength]);

  // Handle export template changes
  const updateExportTemplate = (type, key, value) => {
    setExportTemplates(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [key]: value
      }
    }));
  };

  // Export functions
  const handleExport = (type) => {
    if (passwords.length === 0) {
      toast({
        title: "No Passwords",
        description: "Generate passwords first before exporting.",
        variant: "destructive"
      });
      return;
    }

    const template = exportTemplates[type];
    let content = '';
    let filename = '';
    let mimeType = '';

    switch (type) {
      case 'json':
        const jsonData = {
          ...(template.includeMetadata && {
            metadata: {
              generated: new Date().toISOString(),
              count: passwords.length,
              settings: { length, options }
            }
          }),
          passwords: passwords.map((pwd, idx) => {
            const item = { password: pwd };
            if (template.includeStrength) {
              item.strength = calculatePasswordStrength(pwd);
            }
            if (template.includeTimestamp) {
              item.generated = new Date().toISOString();
            }
            return item;
          })
        };
        content = JSON.stringify(jsonData, null, template.indentSize);
        filename = `passwords-${Date.now()}.json`;
        mimeType = 'application/json';
        break;
        
      case 'csv':
        const headers = [];
        if (template.includeHeaders) {
          headers.push('ID', 'Password');
          if (template.includeStrength) headers.push('Strength', 'Score');
          if (template.includeTimestamp) headers.push('Generated');
        }
        
        const rows = [];
        if (headers.length > 0) rows.push(headers.join(template.separator));
        
        passwords.forEach((pwd, idx) => {
          const row = [idx + 1, `"${pwd}"`];
          if (template.includeStrength) {
            const strength = calculatePasswordStrength(pwd);
            row.push(`"${strength.strength}"`, strength.score);
          }
          if (template.includeTimestamp) {
            row.push(new Date().toISOString());
          }
          rows.push(row.join(template.separator));
        });
        
        content = rows.join('\n');
        filename = `passwords-${Date.now()}.csv`;
        mimeType = 'text/csv';
        break;
        
      case 'txt':
        if (template.format === 'simple') {
          content = passwords.map((pwd, idx) => 
            template.includeIndex ? `${idx + 1}. ${pwd}` : pwd
          ).join(template.separator);
        } else {
          content = passwords.map((pwd, idx) => {
            let line = template.includeIndex ? `Password #${idx + 1}: ${pwd}` : pwd;
            if (template.includeStrength) {
              const strength = calculatePasswordStrength(pwd);
              line += ` (${strength.strength} - ${strength.score}%)`;
            }
            return line;
          }).join(template.separator);
        }
        filename = `passwords-${Date.now()}.txt`;
        mimeType = 'text/plain';
        break;
    }

    // Create and download file
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: `Passwords exported as ${type.toUpperCase()} file.`,
    });
  };

  // Copy functions
  const handleCopyPassword = async (password, index) => {
    try {
      await navigator.clipboard.writeText(password);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(-1), 2000);
      toast({
        title: "Copied",
        description: "Password copied to clipboard!",
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy password to clipboard.",
        variant: "destructive"
      });
    }
  };

  const handleCopyAll = async () => {
    try {
      const allPasswords = passwords.join('\n');
      await navigator.clipboard.writeText(allPasswords);
      toast({
        title: "All Copied",
        description: `${passwords.length} passwords copied to clipboard!`,
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy passwords to clipboard.",
        variant: "destructive"
      });
    }
  };

  const handleCopyPreview = async () => {
    try {
      // Generate full export content (not just preview) when copying
      const template = exportTemplates[selectedExportType];
      let fullContent = '';
      
      switch (selectedExportType) {
        case 'json':
          const jsonData = {
            ...(template.includeMetadata && {
              metadata: {
                generated: new Date().toISOString(),
                count: passwords.length,
                settings: { length, options }
              }
            }),
            passwords: passwords.map((pwd, idx) => {
              const item = { password: pwd };
              if (template.includeStrength) {
                item.strength = calculatePasswordStrength(pwd);
              }
              if (template.includeTimestamp) {
                item.generated = new Date().toISOString();
              }
              return item;
            })
          };
          fullContent = JSON.stringify(jsonData, null, template.indentSize);
          break;
          
        case 'csv':
          const headers = [];
          if (template.includeHeaders) {
            headers.push('ID', 'Password');
            if (template.includeStrength) headers.push('Strength', 'Score');
            if (template.includeTimestamp) headers.push('Generated');
          }
          
          const rows = [];
          if (headers.length > 0) rows.push(headers.join(template.separator));
          
          passwords.forEach((pwd, idx) => {
            const row = [idx + 1, `"${pwd}"`];
            if (template.includeStrength) {
              const strength = calculatePasswordStrength(pwd);
              row.push(`"${strength.strength}"`, strength.score);
            }
            if (template.includeTimestamp) {
              row.push(new Date().toISOString());
            }
            rows.push(row.join(template.separator));
          });
          
          fullContent = rows.join('\n');
          break;
          
        case 'txt':
          if (template.format === 'simple') {
            fullContent = passwords.map((pwd, idx) => 
              template.includeIndex ? `${idx + 1}. ${pwd}` : pwd
            ).join(template.separator);
          } else {
            fullContent = passwords.map((pwd, idx) => {
              let line = template.includeIndex ? `Password #${idx + 1}: ${pwd}` : pwd;
              if (template.includeStrength) {
                const strength = calculatePasswordStrength(pwd);
                line += ` (${strength.strength} - ${strength.score}%)`;
              }
              return line;
            }).join(template.separator);
          }
          break;
      }
      
      await navigator.clipboard.writeText(fullContent);
      toast({
        title: "Full Export Copied",
        description: `All ${passwords.length} passwords copied to clipboard as ${selectedExportType.toUpperCase()}!`,
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy preview to clipboard.",
        variant: "destructive"
      });
    }
  };

  // Initialize with some passwords
  useEffect(() => {
    const initializePasswords = async () => {
      if (!options.uppercase && !options.lowercase && !options.numbers && !options.symbols) {
        return;
      }
      setIsGenerating(true);
      setGenerationProgress(0);
      
      try {
        const newPasswords = [];
        const defaultQuantity = 5;
        
        for (let i = 0; i < defaultQuantity; i++) {
          const password = generateCustomPassword(length, options);
          newPasswords.push(password);
          setGenerationProgress(((i + 1) / defaultQuantity) * 100);
        }
        
        setPasswords(newPasswords);
      } catch (error) {
        // Handle error silently for initial load
      } finally {
        setIsGenerating(false);
        setGenerationProgress(0);
      }
    };
    
    initializePasswords();
  }, []); // Only run once on mount

  return (
    <div className="w-full max-w-full mx-auto space-y-6 p-4">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center space-x-3">
          <Shield className="w-8 h-8 text-indigo-600" />
          <h1 className="text-3xl font-bold text-gray-900">Password Generator</h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Generate secure, customizable passwords with advanced export options
        </p>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Configuration Panel */}
        <div className="col-span-12 lg:col-span-3">
          <Card className="shadow-lg sticky top-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Length */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Length: {length}</Label>
                <Slider
                  value={[length]}
                  onValueChange={(value) => setLength(value[0])}
                  min={4}
                  max={128}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>4</span>
                  <span>128</span>
                </div>
              </div>

              {/* Quantity */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Quantity</Label>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  min={1}
                  className="w-full"
                />
              </div>

              {/* Character Options */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Characters</Label>
                <div className="space-y-2">
                  {[
                    { key: 'uppercase', label: 'A-Z', desc: 'Uppercase' },
                    { key: 'lowercase', label: 'a-z', desc: 'Lowercase' },
                    { key: 'numbers', label: '0-9', desc: 'Numbers' },
                    { key: 'symbols', label: '!@#', desc: 'Symbols' },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={key}
                        checked={options[key]}
                        onCheckedChange={() => {
                          setOptions(prev => ({
                            ...prev,
                            [key]: !prev[key]
                          }));
                        }}
                      />
                      <Label htmlFor={key} className="text-sm flex-1 cursor-pointer">
                        <span className="font-mono font-semibold">{label}</span>
                        <span className="text-gray-500 ml-1">{desc}</span>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <Button 
                onClick={() => generatePasswords()}
                disabled={isGenerating}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4 mr-2" />
                    Generate
                  </>
                )}
              </Button>

              {/* Progress */}
              {isGenerating && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{Math.round(generationProgress)}%</span>
                  </div>
                  <Progress value={generationProgress} className="w-full" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Generated Passwords */}
        <div className="col-span-12 lg:col-span-4">
          <Card className="shadow-lg h-[600px]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Key className="w-5 h-5" />
                  <span>Generated ({passwords.length})</span>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPasswords(!showPasswords)}
                      >
                        {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{showPasswords ? 'Hide passwords' : 'Show passwords'}</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyAll}
                        disabled={passwords.length === 0}
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy All
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Copy all passwords to clipboard</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3">
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {passwords.map((password, index) => {
                    const strength = calculatePasswordStrength(password);
                    return (
                      <div key={index} className="group p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded">
                              #{index + 1}
                            </span>
                            <Badge 
                              variant="outline"
                              className={`text-xs ${
                                strength.strength === 'Very Strong' ? 'bg-green-100 text-green-700 border-green-300' :
                                strength.strength === 'Strong' ? 'bg-blue-100 text-blue-700 border-blue-300' :
                                strength.strength === 'Medium' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
                                'bg-red-100 text-red-700 border-red-300'
                              }`}
                            >
                              {strength.strength}
                            </Badge>
                          </div>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopyPassword(password, index)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                {copiedIndex === index ? (
                                  <Check className="w-4 h-4 text-green-600" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Copy password to clipboard</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        
                        <div className="font-mono text-sm bg-white p-2 rounded border mb-2">
                          {showPasswords ? password : '•'.repeat(password.length)}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                            <div 
                              className={`h-1.5 rounded-full transition-all duration-300 ${strength.color}`}
                              style={{ width: `${Math.min(strength.score, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-600 min-w-[35px] text-right">
                            {Math.min(strength.score, 100)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Export Templates */}
        <div className="col-span-12 lg:col-span-5">
          <Card className="shadow-lg h-[600px]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Download className="w-5 h-5" />
                  <span>Export Templates</span>
                </CardTitle>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyPreview()}
                      disabled={!generateExportPreview}
                      className="opacity-70 hover:opacity-100"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy full export data to clipboard</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex flex-wrap gap-1 mt-3">
                {['json', 'csv', 'txt'].map((type) => (
                  <Button
                    key={type}
                    variant={selectedExportType === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedExportType(type)}
                    className="flex items-center space-x-1 text-xs px-2"
                  >
                    {type === 'json' && <Database className="w-3 h-3" />}
                    {type === 'csv' && <BarChart3 className="w-3 h-3" />}
                    {type === 'txt' && <FileText className="w-3 h-3" />}
                    <span className="uppercase">{type}</span>
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
              {/* Export Configuration */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Configuration</Label>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  {selectedExportType === 'json' && (
                    <>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={exportTemplates.json.includeMetadata}
                          onCheckedChange={(checked) => updateExportTemplate('json', 'includeMetadata', checked)}
                        />
                        <Label className="text-xs">Metadata</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={exportTemplates.json.includeStrength}
                          onCheckedChange={(checked) => updateExportTemplate('json', 'includeStrength', checked)}
                        />
                        <Label className="text-xs">Strength</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={exportTemplates.json.includeTimestamp}
                          onCheckedChange={(checked) => updateExportTemplate('json', 'includeTimestamp', checked)}
                        />
                        <Label className="text-xs">Timestamp</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Label className="text-xs">Indent:</Label>
                        <Input
                          type="number"
                          value={exportTemplates.json.indentSize}
                          onChange={(e) => updateExportTemplate('json', 'indentSize', parseInt(e.target.value) || 2)}
                          min={0}
                          max={8}
                          className="w-16 h-6 text-xs"
                        />
                      </div>
                    </>
                  )}
                  
                  {selectedExportType === 'csv' && (
                    <>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={exportTemplates.csv.includeHeaders}
                          onCheckedChange={(checked) => updateExportTemplate('csv', 'includeHeaders', checked)}
                        />
                        <Label className="text-xs">Headers</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={exportTemplates.csv.includeStrength}
                          onCheckedChange={(checked) => updateExportTemplate('csv', 'includeStrength', checked)}
                        />
                        <Label className="text-xs">Strength</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={exportTemplates.csv.includeTimestamp}
                          onCheckedChange={(checked) => updateExportTemplate('csv', 'includeTimestamp', checked)}
                        />
                        <Label className="text-xs">Timestamp</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Label className="text-xs">Separator:</Label>
                        <Select 
                          value={exportTemplates.csv.separator} 
                          onValueChange={(value) => updateExportTemplate('csv', 'separator', value)}
                        >
                          <SelectTrigger className="w-16 h-6 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value=",">Comma</SelectItem>
                            <SelectItem value=";">Semicolon</SelectItem>
                            <SelectItem value="\t">Tab</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                  
                  {selectedExportType === 'txt' && (
                    <>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={exportTemplates.txt.includeIndex}
                          onCheckedChange={(checked) => updateExportTemplate('txt', 'includeIndex', checked)}
                        />
                        <Label className="text-xs">Index</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={exportTemplates.txt.includeStrength}
                          onCheckedChange={(checked) => updateExportTemplate('txt', 'includeStrength', checked)}
                        />
                        <Label className="text-xs">Strength</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Label className="text-xs">Format:</Label>
                        <Select 
                          value={exportTemplates.txt.format} 
                          onValueChange={(value) => updateExportTemplate('txt', 'format', value)}
                        >
                          <SelectTrigger className="w-20 h-6 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="simple">Simple</SelectItem>
                            <SelectItem value="detailed">Detailed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Preview</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyPreview()}
                        disabled={!generateExportPreview}
                        className="h-6 px-2 text-xs"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Copy preview content</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="bg-gray-900 text-green-400 p-3 rounded-lg font-mono text-xs overflow-auto h-[250px] border-2 border-gray-700">
                  <pre className="whitespace-pre-wrap">{generateExportPreview || '// Generate passwords to see preview'}</pre>
                </div>
              </div>

              {/* Export Button */}
              <Button 
                onClick={() => handleExport(selectedExportType)}
                disabled={passwords.length === 0}
                className="w-full"
                size="lg"
              >
                <Download className="w-4 h-4 mr-2" />
                Export as {selectedExportType.toUpperCase()}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PasswordGenerator;
