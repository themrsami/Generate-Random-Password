'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
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
  Link, 
  Copy,
  Download,
  QrCode,
  Check,
  X,
  ExternalLink,
  BarChart3,
  Globe,
  Shield,
  Clock,
  Zap,
  Eye,
  Search,
  Scissors,
  RefreshCw
} from 'lucide-react';
import QRCode from 'qrcode';

const URLTools = () => {
  const [originalUrl, setOriginalUrl] = useState('https://github.com/themrsami');
  const [shortenedUrls, setShortenedUrls] = useState([]);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [qrOptions, setQrOptions] = useState({
    width: 256,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    },
    errorCorrectionLevel: 'M'
  });
  const [urlAnalysis, setUrlAnalysis] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(-1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [customAlias, setCustomAlias] = useState('');
  const [bulkUrls, setBulkUrls] = useState('');
  
  const { toast } = useToast();

  // Generate short URL (mock implementation)
  const generateShortUrl = useCallback((url, alias = '') => {
    const domains = ['bit.ly', 'tinyurl.com', 'short.link', 'go.ly'];
    const randomDomain = domains[Math.floor(Math.random() * domains.length)];
    const shortCode = alias || Math.random().toString(36).substr(2, 8);
    return `https://${randomDomain}/${shortCode}`;
  }, []);

  // Validate URL
  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  // Generate QR Code
  const generateQRCode = useCallback(async (text) => {
    try {
      setIsGenerating(true);
      const dataUrl = await QRCode.toDataURL(text, qrOptions);
      setQrCodeDataUrl(dataUrl);
    } catch (error) {
      toast({
        title: "QR Generation Failed",
        description: "Could not generate QR code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  }, [qrOptions, toast]);

  // Analyze URL
  const analyzeUrl = useCallback((url) => {
    if (!isValidUrl(url)) return null;
    
    const urlObj = new URL(url);
    return {
      protocol: urlObj.protocol,
      hostname: urlObj.hostname,
      pathname: urlObj.pathname,
      search: urlObj.search,
      hash: urlObj.hash,
      port: urlObj.port || (urlObj.protocol === 'https:' ? '443' : '80'),
      isSecure: urlObj.protocol === 'https:',
      domainLength: urlObj.hostname.length,
      pathLength: urlObj.pathname.length,
      totalLength: url.length,
      hasQuery: urlObj.search.length > 0,
      hasFragment: urlObj.hash.length > 0,
      subdomain: urlObj.hostname.split('.').length > 2 ? urlObj.hostname.split('.')[0] : null
    };
  }, []);

  // Shorten single URL
  const handleShortenUrl = () => {
    if (!isValidUrl(originalUrl)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL starting with http:// or https://",
        variant: "destructive"
      });
      return;
    }

    const shortUrl = generateShortUrl(originalUrl, customAlias);
    const newEntry = {
      id: Date.now(),
      original: originalUrl,
      shortened: shortUrl,
      alias: customAlias || 'auto-generated',
      created: new Date().toISOString(),
      clicks: Math.floor(Math.random() * 100) // Mock click count
    };

    setShortenedUrls(prev => [newEntry, ...prev]);
    setCustomAlias('');
    
    toast({
      title: "URL Shortened",
      description: "Your URL has been shortened successfully!",
    });
  };

  // Bulk URL shortening
  const handleBulkShorten = () => {
    const urls = bulkUrls.split('\n').filter(url => url.trim() && isValidUrl(url.trim()));
    
    if (urls.length === 0) {
      toast({
        title: "No Valid URLs",
        description: "Please enter at least one valid URL",
        variant: "destructive"
      });
      return;
    }

    const newEntries = urls.map(url => ({
      id: Date.now() + Math.random(),
      original: url.trim(),
      shortened: generateShortUrl(url.trim()),
      alias: 'bulk-generated',
      created: new Date().toISOString(),
      clicks: Math.floor(Math.random() * 50)
    }));

    setShortenedUrls(prev => [...newEntries, ...prev]);
    setBulkUrls('');
    
    toast({
      title: "Bulk Shortening Complete",
      description: `Successfully shortened ${urls.length} URLs`,
    });
  };

  // Copy to clipboard
  const copyToClipboard = async (text, index = -1) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(-1), 2000);
      toast({
        title: "Copied!",
        description: "URL copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      });
    }
  };

  // Download QR Code
  const downloadQRCode = () => {
    if (!qrCodeDataUrl) return;
    
    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = qrCodeDataUrl;
    link.click();
  };

  // Export shortened URLs
  const exportUrls = (format) => {
    if (shortenedUrls.length === 0) {
      toast({
        title: "No Data",
        description: "No shortened URLs to export",
        variant: "destructive"
      });
      return;
    }

    let content = '';
    let filename = '';
    let mimeType = '';

    switch (format) {
      case 'csv':
        content = 'Original URL,Shortened URL,Alias,Created,Clicks\n' + 
          shortenedUrls.map(url => 
            `"${url.original}","${url.shortened}","${url.alias}","${url.created}",${url.clicks}`
          ).join('\n');
        filename = 'shortened-urls.csv';
        mimeType = 'text/csv';
        break;
      case 'json':
        content = JSON.stringify(shortenedUrls, null, 2);
        filename = 'shortened-urls.json';
        mimeType = 'application/json';
        break;
      case 'txt':
        content = shortenedUrls.map(url => 
          `${url.original} -> ${url.shortened} (${url.alias})`
        ).join('\n');
        filename = 'shortened-urls.txt';
        mimeType = 'text/plain';
        break;
    }

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
      description: `URLs exported as ${format.toUpperCase()}`,
    });
  };

  // Update analysis when URL changes
  useEffect(() => {
    if (originalUrl) {
      setUrlAnalysis(analyzeUrl(originalUrl));
      generateQRCode(originalUrl);
    }
  }, [originalUrl, analyzeUrl, generateQRCode]);

  return (
    <div className="w-full max-w-full mx-auto space-y-6 p-4">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center space-x-3">
          <Link className="w-8 h-8 text-indigo-600" />
          <h1 className="text-3xl font-bold text-gray-900">URL Tools</h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Comprehensive URL management: shorten, analyze, generate QR codes, and track your links
        </p>
      </div>

      <Tabs defaultValue="shorten" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="shorten" className="flex items-center space-x-2">
            <Scissors className="w-4 h-4" />
            <span>Shorten</span>
          </TabsTrigger>
          <TabsTrigger value="qr-generator" className="flex items-center space-x-2">
            <QrCode className="w-4 h-4" />
            <span>QR Code</span>
          </TabsTrigger>
          <TabsTrigger value="analyze" className="flex items-center space-x-2">
            <Search className="w-4 h-4" />
            <span>Analyze</span>
          </TabsTrigger>
          <TabsTrigger value="manage" className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>Manage</span>
          </TabsTrigger>
        </TabsList>

        {/* URL Shortener Tab */}
        <TabsContent value="shorten" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Single URL Shortening */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Scissors className="w-5 h-5" />
                  <span>Single URL</span>
                </CardTitle>
                <CardDescription>Shorten a single URL with optional custom alias</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="original-url">Original URL</Label>
                  <Input
                    id="original-url"
                    type="url"
                    value={originalUrl}
                    onChange={(e) => setOriginalUrl(e.target.value)}
                    placeholder="https://example.com/very-long-url"
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="custom-alias">Custom Alias (Optional)</Label>
                  <Input
                    id="custom-alias"
                    value={customAlias}
                    onChange={(e) => setCustomAlias(e.target.value)}
                    placeholder="my-custom-link"
                    className="w-full"
                  />
                </div>

                <Button 
                  onClick={handleShortenUrl}
                  className="w-full"
                  size="lg"
                >
                  <Scissors className="w-4 h-4 mr-2" />
                  Shorten URL
                </Button>
              </CardContent>
            </Card>

            {/* Bulk URL Shortening */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="w-5 h-5" />
                  <span>Bulk URLs</span>
                </CardTitle>
                <CardDescription>Shorten multiple URLs at once</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bulk-urls">URLs (one per line)</Label>
                  <Textarea
                    id="bulk-urls"
                    value={bulkUrls}
                    onChange={(e) => setBulkUrls(e.target.value)}
                    placeholder="https://example1.com&#10;https://example2.com&#10;https://example3.com"
                    rows={6}
                    className="w-full"
                  />
                </div>

                <Button 
                  onClick={handleBulkShorten}
                  className="w-full"
                  size="lg"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Bulk Shorten
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* QR Code Generator Tab */}
        <TabsContent value="qr-generator" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* QR Code Configuration */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <QrCode className="w-5 h-5" />
                  <span>QR Code Settings</span>
                </CardTitle>
                <CardDescription>Customize your QR code appearance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="qr-url">URL for QR Code</Label>
                  <Input
                    id="qr-url"
                    type="url"
                    value={originalUrl}
                    onChange={(e) => setOriginalUrl(e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="qr-size">Size</Label>
                    <Select 
                      value={qrOptions.width.toString()} 
                      onValueChange={(value) => setQrOptions(prev => ({ ...prev, width: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="128">128px</SelectItem>
                        <SelectItem value="256">256px</SelectItem>
                        <SelectItem value="512">512px</SelectItem>
                        <SelectItem value="1024">1024px</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="qr-margin">Margin</Label>
                    <Select 
                      value={qrOptions.margin.toString()} 
                      onValueChange={(value) => setQrOptions(prev => ({ ...prev, margin: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Small</SelectItem>
                        <SelectItem value="2">Medium</SelectItem>
                        <SelectItem value="4">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="qr-dark">Dark Color</Label>
                    <Input
                      id="qr-dark"
                      type="color"
                      value={qrOptions.color.dark}
                      onChange={(e) => setQrOptions(prev => ({ 
                        ...prev, 
                        color: { ...prev.color, dark: e.target.value }
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="qr-light">Light Color</Label>
                    <Input
                      id="qr-light"
                      type="color"
                      value={qrOptions.color.light}
                      onChange={(e) => setQrOptions(prev => ({ 
                        ...prev, 
                        color: { ...prev.color, light: e.target.value }
                      }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* QR Code Preview */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="w-5 h-5" />
                  <span>QR Code Preview</span>
                </CardTitle>
                <CardDescription>Generated QR code for your URL</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                {isGenerating ? (
                  <div className="flex items-center justify-center h-64 w-64 bg-gray-100 rounded-lg">
                    <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
                  </div>
                ) : qrCodeDataUrl ? (
                  <div className="relative">
                    <Image 
                      src={qrCodeDataUrl} 
                      alt="QR Code"
                      width={256}
                      height={256}
                      className="border rounded-lg shadow-sm"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 w-64 bg-gray-100 rounded-lg">
                    <QrCode className="w-16 h-16 text-gray-400" />
                  </div>
                )}

                <div className="flex space-x-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(originalUrl)}
                        disabled={!originalUrl}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Copy URL</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadQRCode}
                        disabled={!qrCodeDataUrl}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Download QR Code</TooltipContent>
                  </Tooltip>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* URL Analyzer Tab */}
        <TabsContent value="analyze" className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="w-5 h-5" />
                <span>URL Analysis</span>
              </CardTitle>
              <CardDescription>Detailed breakdown of URL structure and properties</CardDescription>
            </CardHeader>
            <CardContent>
              {urlAnalysis ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm uppercase text-gray-500">Basic Info</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Protocol:</span>
                        <Badge variant={urlAnalysis.isSecure ? "default" : "destructive"}>
                          {urlAnalysis.protocol}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Domain:</span>
                        <span className="text-sm font-mono">{urlAnalysis.hostname}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Port:</span>
                        <span className="text-sm font-mono">{urlAnalysis.port}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm uppercase text-gray-500">Structure</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Path:</span>
                        <span className="text-sm font-mono truncate max-w-[150px]">
                          {urlAnalysis.pathname || '/'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Query:</span>
                        <Badge variant={urlAnalysis.hasQuery ? "default" : "outline"}>
                          {urlAnalysis.hasQuery ? "Yes" : "No"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Fragment:</span>
                        <Badge variant={urlAnalysis.hasFragment ? "default" : "outline"}>
                          {urlAnalysis.hasFragment ? "Yes" : "No"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm uppercase text-gray-500">Metrics</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Length:</span>
                        <span className="text-sm font-semibold">{urlAnalysis.totalLength}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Domain Length:</span>
                        <span className="text-sm font-semibold">{urlAnalysis.domainLength}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Path Length:</span>
                        <span className="text-sm font-semibold">{urlAnalysis.pathLength}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Enter a valid URL to see analysis</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manage URLs Tab */}
        <TabsContent value="manage" className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>URL Management</span>
                  </CardTitle>
                  <CardDescription>View and manage your shortened URLs</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => exportUrls('csv')}>
                        <Download className="w-4 h-4 mr-1" />
                        CSV
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Export as CSV</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => exportUrls('json')}>
                        <Download className="w-4 h-4 mr-1" />
                        JSON
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Export as JSON</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {shortenedUrls.length > 0 ? (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {shortenedUrls.map((url, index) => (
                      <div key={url.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{url.alias}</Badge>
                            <span className="text-xs text-gray-500">
                              {new Date(url.created).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary" className="text-xs">
                              <Eye className="w-3 h-3 mr-1" />
                              {url.clicks}
                            </Badge>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(url.shortened, index)}
                                >
                                  {copiedIndex === index ? (
                                    <Check className="w-4 h-4 text-green-600" />
                                  ) : (
                                    <Copy className="w-4 h-4" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Copy shortened URL</TooltipContent>
                            </Tooltip>
                            
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(url.original, '_blank')}
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Open original URL</TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="text-sm">
                            <span className="text-gray-500">Original: </span>
                            <span className="font-mono text-xs break-all">{url.original}</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-500">Shortened: </span>
                            <span className="font-mono text-xs text-blue-600">{url.shortened}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-12">
                  <Link className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No shortened URLs yet</p>
                  <p className="text-sm text-gray-400">Create your first shortened URL to see it here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default URLTools;
