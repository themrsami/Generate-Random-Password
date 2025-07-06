'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Type, 
  Copy,
  Download,
  Check,
  Hash,
  Lock,
  Unlock,
  RotateCcw,
  FileText,
  Calculator,
  Eye,
  EyeOff,
  RefreshCw,
  Zap
} from 'lucide-react';

const TextTools = () => {
  const [inputText, setInputText] = useState('Hello, World! This is a sample text for encoding and analysis.');
  const [base64Result, setBase64Result] = useState('');
  const [urlResult, setUrlResult] = useState('');
  const [hashResults, setHashResults] = useState({});
  const [copiedField, setCopiedField] = useState('');
  const [selectedHashType, setSelectedHashType] = useState('all');
  const [caseConversionResult, setCaseConversionResult] = useState('');
  const [selectedCaseType, setSelectedCaseType] = useState('uppercase');
  
  const { toast } = useToast();

  // Base64 encode/decode
  const encodeBase64 = useCallback((text) => {
    try {
      return btoa(unescape(encodeURIComponent(text)));
    } catch (error) {
      return 'Error: Invalid input for Base64 encoding';
    }
  }, []);

  const decodeBase64 = useCallback((text) => {
    try {
      return decodeURIComponent(escape(atob(text)));
    } catch (error) {
      return 'Error: Invalid Base64 string';
    }
  }, []);

  // URL encode/decode
  const encodeURL = useCallback((text) => {
    try {
      return encodeURIComponent(text);
    } catch (error) {
      return 'Error: Invalid input for URL encoding';
    }
  }, []);

  const decodeURL = useCallback((text) => {
    try {
      return decodeURIComponent(text);
    } catch (error) {
      return 'Error: Invalid URL encoded string';
    }
  }, []);

  // Hash generation (simplified client-side hashes)
  const generateHashes = useCallback(async (text) => {
    const results = {};
    
    try {
      // Simple hash function for demonstration
      const simpleHash = (str, algorithm = 'simple') => {
        let hash = 0;
        if (str.length === 0) return hash.toString();
        for (let i = 0; i < str.length; i++) {
          const char = str.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(16);
      };

      // Generate different "hash" types (simplified for demo)
      results.md5 = `md5_${simpleHash(text, 'md5')}${text.length}`;
      results.sha1 = `sha1_${simpleHash(text + 'sha1', 'sha1')}${text.length * 2}`;
      results.sha256 = `sha256_${simpleHash(text + 'sha256', 'sha256')}${text.length * 4}`;
      results.crc32 = simpleHash(text).substring(0, 8);
      
      // Note: These are simplified demo hashes, not actual cryptographic hashes
      
    } catch (error) {
      results.error = 'Error generating hashes';
    }
    
    return results;
  }, []);

  // Case conversions
  const convertCase = useCallback((text, type) => {
    switch (type) {
      case 'uppercase':
        return text.toUpperCase();
      case 'lowercase':
        return text.toLowerCase();
      case 'title':
        return text.replace(/\w\S*/g, (txt) => 
          txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
      case 'camel':
        return text.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => 
          index === 0 ? word.toLowerCase() : word.toUpperCase()
        ).replace(/\s+/g, '');
      case 'pascal':
        return text.replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => 
          word.toUpperCase()
        ).replace(/\s+/g, '');
      case 'snake':
        return text.toLowerCase().replace(/\s+/g, '_');
      case 'kebab':
        return text.toLowerCase().replace(/\s+/g, '-');
      case 'reverse':
        return text.split('').reverse().join('');
      default:
        return text;
    }
  }, []);

  // Text statistics
  const textStats = useMemo(() => {
    if (!inputText) return {};
    
    const words = inputText.trim().split(/\s+/).filter(word => word.length > 0);
    const sentences = inputText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const paragraphs = inputText.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    return {
      characters: inputText.length,
      charactersNoSpaces: inputText.replace(/\s/g, '').length,
      words: words.length,
      sentences: sentences.length,
      paragraphs: paragraphs.length,
      avgWordsPerSentence: sentences.length > 0 ? (words.length / sentences.length).toFixed(1) : 0,
      avgCharsPerWord: words.length > 0 ? (inputText.replace(/\s/g, '').length / words.length).toFixed(1) : 0,
      readingTime: Math.ceil(words.length / 200) // Assuming 200 words per minute
    };
  }, [inputText]);

  // Copy to clipboard
  const copyToClipboard = async (text, fieldName) => {
    try {
      await navigator.clipboard.writeText(text);
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

  // Download result
  const downloadResult = (content, filename, mimeType = 'text/plain') => {
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
      title: "Download Complete",
      description: `File ${filename} downloaded successfully`,
    });
  };

  // Update results when input changes
  React.useEffect(() => {
    if (inputText) {
      setBase64Result(encodeBase64(inputText));
      setUrlResult(encodeURL(inputText));
      setCaseConversionResult(convertCase(inputText, selectedCaseType));
      generateHashes(inputText).then(setHashResults);
    }
  }, [inputText, encodeBase64, encodeURL, convertCase, selectedCaseType, generateHashes]);

  React.useEffect(() => {
    if (inputText) {
      setCaseConversionResult(convertCase(inputText, selectedCaseType));
    }
  }, [selectedCaseType, inputText, convertCase]);

  return (
    <div className="w-full max-w-full mx-auto space-y-6 p-4">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center space-x-3">
          <Type className="w-8 h-8 text-indigo-600" />
          <h1 className="text-3xl font-bold text-gray-900">Text Tools</h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Comprehensive text processing: encode, decode, hash, analyze, and transform your text data
        </p>
      </div>

      {/* Input Section */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Input Text</span>
          </CardTitle>
          <CardDescription>Enter your text to process and analyze</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter your text here..."
            rows={4}
            className="w-full"
          />
        </CardContent>
      </Card>

      <Tabs defaultValue="encode" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="encode" className="flex items-center space-x-2">
            <Lock className="w-4 h-4" />
            <span>Encode</span>
          </TabsTrigger>
          <TabsTrigger value="decode" className="flex items-center space-x-2">
            <Unlock className="w-4 h-4" />
            <span>Decode</span>
          </TabsTrigger>
          <TabsTrigger value="hash" className="flex items-center space-x-2">
            <Hash className="w-4 h-4" />
            <span>Hash</span>
          </TabsTrigger>
          <TabsTrigger value="transform" className="flex items-center space-x-2">
            <RotateCcw className="w-4 h-4" />
            <span>Transform</span>
          </TabsTrigger>
          <TabsTrigger value="analyze" className="flex items-center space-x-2">
            <Calculator className="w-4 h-4" />
            <span>Analyze</span>
          </TabsTrigger>
        </TabsList>

        {/* Encode Tab */}
        <TabsContent value="encode" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Base64 Encoding */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lock className="w-5 h-5" />
                  <span>Base64 Encoding</span>
                </CardTitle>
                <CardDescription>Encode text to Base64 format</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Encoded Result</Label>
                  <div className="relative">
                    <Textarea
                      value={base64Result}
                      readOnly
                      rows={6}
                      className="font-mono text-sm bg-gray-50"
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(base64Result, 'Base64 encoded text')}
                        disabled={!base64Result}
                      >
                        {copiedField === 'Base64 encoded text' ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Copy Base64 result</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadResult(base64Result, 'base64-encoded.txt')}
                        disabled={!base64Result}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Download Base64 result</TooltipContent>
                  </Tooltip>
                </div>
              </CardContent>
            </Card>

            {/* URL Encoding */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="w-5 h-5" />
                  <span>URL Encoding</span>
                </CardTitle>
                <CardDescription>Encode text for URL parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>URL Encoded Result</Label>
                  <div className="relative">
                    <Textarea
                      value={urlResult}
                      readOnly
                      rows={6}
                      className="font-mono text-sm bg-gray-50"
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(urlResult, 'URL encoded text')}
                        disabled={!urlResult}
                      >
                        {copiedField === 'URL encoded text' ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Copy URL encoded result</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadResult(urlResult, 'url-encoded.txt')}
                        disabled={!urlResult}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Download URL encoded result</TooltipContent>
                  </Tooltip>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Decode Tab */}
        <TabsContent value="decode" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Base64 Decoding */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Unlock className="w-5 h-5" />
                  <span>Base64 Decoding</span>
                </CardTitle>
                <CardDescription>Decode Base64 encoded text</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Base64 Input</Label>
                  <Textarea
                    placeholder="Enter Base64 encoded text..."
                    rows={3}
                    onChange={(e) => setInputText(decodeBase64(e.target.value))}
                    className="font-mono text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Decoded Result</Label>
                  <Textarea
                    value={inputText}
                    readOnly
                    rows={4}
                    className="bg-gray-50"
                  />
                </div>
                <div className="flex space-x-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(inputText, 'Decoded text')}
                        disabled={!inputText}
                      >
                        {copiedField === 'Decoded text' ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Copy decoded result</TooltipContent>
                  </Tooltip>
                </div>
              </CardContent>
            </Card>

            {/* URL Decoding */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Unlock className="w-5 h-5" />
                  <span>URL Decoding</span>
                </CardTitle>
                <CardDescription>Decode URL encoded text</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>URL Encoded Input</Label>
                  <Textarea
                    placeholder="Enter URL encoded text..."
                    rows={3}
                    onChange={(e) => setInputText(decodeURL(e.target.value))}
                    className="font-mono text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Decoded Result</Label>
                  <Textarea
                    value={inputText}
                    readOnly
                    rows={4}
                    className="bg-gray-50"
                  />
                </div>
                <div className="flex space-x-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(inputText, 'URL decoded text')}
                        disabled={!inputText}
                      >
                        {copiedField === 'URL decoded text' ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Copy URL decoded result</TooltipContent>
                  </Tooltip>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Hash Tab */}
        <TabsContent value="hash" className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Hash className="w-5 h-5" />
                <span>Hash Generation</span>
              </CardTitle>
              <CardDescription>Generate various hash types (demo implementation)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(hashResults).map(([type, hash]) => (
                  <div key={type} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="uppercase font-semibold">{type}</Label>
                      <Badge variant="outline">{type}</Badge>
                    </div>
                    <div className="relative">
                      <Input
                        value={hash}
                        readOnly
                        className="font-mono text-xs bg-gray-50"
                      />
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1 h-8"
                            onClick={() => copyToClipboard(hash, `${type.toUpperCase()} hash`)}
                          >
                            {copiedField === `${type.toUpperCase()} hash` ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Copy {type.toUpperCase()} hash</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                  <strong>Note:</strong> These are simplified hash implementations for demonstration purposes. 
                  For production use, implement proper cryptographic hash functions.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transform Tab */}
        <TabsContent value="transform" className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <RotateCcw className="w-5 h-5" />
                <span>Case Transformation</span>
              </CardTitle>
              <CardDescription>Transform text case and format</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Label>Transformation Type:</Label>
                <Select value={selectedCaseType} onValueChange={setSelectedCaseType}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="uppercase">UPPERCASE</SelectItem>
                    <SelectItem value="lowercase">lowercase</SelectItem>
                    <SelectItem value="title">Title Case</SelectItem>
                    <SelectItem value="camel">camelCase</SelectItem>
                    <SelectItem value="pascal">PascalCase</SelectItem>
                    <SelectItem value="snake">snake_case</SelectItem>
                    <SelectItem value="kebab">kebab-case</SelectItem>
                    <SelectItem value="reverse">esreveR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Transformed Result</Label>
                <Textarea
                  value={caseConversionResult}
                  readOnly
                  rows={6}
                  className="bg-gray-50"
                />
              </div>
              
              <div className="flex space-x-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(caseConversionResult, 'Transformed text')}
                      disabled={!caseConversionResult}
                    >
                      {copiedField === 'Transformed text' ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Copy transformed text</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadResult(caseConversionResult, `${selectedCaseType}-text.txt`)}
                      disabled={!caseConversionResult}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Download transformed text</TooltipContent>
                </Tooltip>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analyze Tab */}
        <TabsContent value="analyze" className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="w-5 h-5" />
                <span>Text Analysis</span>
              </CardTitle>
              <CardDescription>Detailed statistics and analysis of your text</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm uppercase text-gray-500">Basic Counts</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Characters:</span>
                      <Badge variant="outline">{textStats.characters || 0}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">No Spaces:</span>
                      <Badge variant="outline">{textStats.charactersNoSpaces || 0}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Words:</span>
                      <Badge variant="outline">{textStats.words || 0}</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-sm uppercase text-gray-500">Structure</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Sentences:</span>
                      <Badge variant="outline">{textStats.sentences || 0}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Paragraphs:</span>
                      <Badge variant="outline">{textStats.paragraphs || 0}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Reading Time:</span>
                      <Badge variant="outline">{textStats.readingTime || 0} min</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-sm uppercase text-gray-500">Averages</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Words/Sentence:</span>
                      <Badge variant="outline">{textStats.avgWordsPerSentence || 0}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Chars/Word:</span>
                      <Badge variant="outline">{textStats.avgCharsPerWord || 0}</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-sm uppercase text-gray-500">Export</h3>
                  <div className="space-y-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadResult(JSON.stringify(textStats, null, 2), 'text-analysis.json', 'application/json')}
                          disabled={!Object.keys(textStats).length}
                          className="w-full"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Export Stats
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Download analysis as JSON</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TextTools;
