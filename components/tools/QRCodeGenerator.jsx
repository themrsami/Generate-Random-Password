'use client';

import React, { useState, useRef, useCallback } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/components/ui/use-toast';
import { 
  QrCode, 
  Download, 
  Copy,
  RefreshCw,
  Palette,
  Settings,
  Link,
  MessageSquare,
  Wifi,
  Phone
} from 'lucide-react';

const QRCodeGenerator = () => {
  const [text, setText] = useState('');
  const [size, setSize] = useState(256);
  const [errorLevel, setErrorLevel] = useState('M');
  const [foregroundColor, setForegroundColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [qrCodeData, setQrCodeData] = useState('');
  const canvasRef = useRef(null);
  const { toast } = useToast();

  // Generate QR Code using proper QR code library
  const generateQRCode = useCallback(async () => {
    if (!text.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter text or URL to generate QR code.",
        variant: "destructive"
      });
      return;
    }

    try {
      const canvas = canvasRef.current;
      const options = {
        width: size,
        margin: 2,
        color: {
          dark: foregroundColor,
          light: backgroundColor
        },
        errorCorrectionLevel: errorLevel
      };

      await QRCode.toCanvas(canvas, text, options);
      
      // Convert to data URL for download
      const dataURL = canvas.toDataURL('image/png');
      setQrCodeData(dataURL);
      
      toast({
        title: "QR Code Generated",
        description: "Your QR code has been created successfully!",
      });
    } catch (error) {
      console.error('QR Code generation error:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate QR code. Please try again.",
        variant: "destructive"
      });
    }
  }, [text, size, foregroundColor, backgroundColor, errorLevel, toast]);

  const downloadQRCode = () => {
    if (!qrCodeData) {
      toast({
        title: "No QR Code",
        description: "Please generate a QR code first.",
        variant: "destructive"
      });
      return;
    }

    const link = document.createElement('a');
    link.download = `qrcode-${Date.now()}.png`;
    link.href = qrCodeData;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Downloaded",
      description: "QR code saved to your downloads folder.",
    });
  };

  const copyQRCode = async () => {
    if (!qrCodeData) {
      toast({
        title: "No QR Code",
        description: "Please generate a QR code first.",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch(qrCodeData);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      toast({
        title: "Copied",
        description: "QR code copied to clipboard.",
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy QR code to clipboard.",
        variant: "destructive"
      });
    }
  };

  const clearAll = () => {
    setText('');
    setQrCodeData('');
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    toast({
      title: "Cleared",
      description: "All data has been cleared.",
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 p-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <QrCode className="w-10 h-10 text-indigo-600" />
          <h1 className="text-4xl font-bold text-gray-900">QR Code Generator</h1>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Create custom QR codes for URLs, text, and more with customizable colors and sizes
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>QR Code Settings</span>
              </CardTitle>
              <CardDescription>Configure your QR code content and appearance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Text Input */}
              <div className="space-y-3">
                <Label htmlFor="text" className="text-base font-semibold">Content</Label>
                <Textarea
                  id="text"
                  placeholder="Enter text, URL, or any content for your QR code..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
                <p className="text-sm text-gray-500">
                  {text.length} characters
                </p>
              </div>

              {/* Size */}
              <div className="space-y-3">
                <Label htmlFor="size" className="text-base font-semibold">Size: {size}px</Label>
                <Slider
                  id="size"
                  min={128}
                  max={512}
                  step={32}
                  value={[size]}
                  onValueChange={(value) => setSize(value[0])}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>128px</span>
                  <span>512px</span>
                </div>
              </div>

              {/* Error Correction Level */}
              <div className="space-y-3">
                <Label htmlFor="errorLevel" className="text-base font-semibold">Error Correction Level</Label>
                <Select value={errorLevel} onValueChange={setErrorLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select error correction level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L">Low (~7%)</SelectItem>
                    <SelectItem value="M">Medium (~15%)</SelectItem>
                    <SelectItem value="Q">Quartile (~25%)</SelectItem>
                    <SelectItem value="H">High (~30%)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500">
                  Higher levels can recover from more damage but create denser codes
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl flex items-center space-x-2">
                <Palette className="w-5 h-5" />
                <span>Colors</span>
              </CardTitle>
              <CardDescription>Customize the appearance of your QR code</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Colors */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="foreground" className="text-base font-semibold">Foreground</Label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      id="foreground"
                      value={foregroundColor}
                      onChange={(e) => setForegroundColor(e.target.value)}
                      className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                    />
                    <Input
                      value={foregroundColor}
                      onChange={(e) => setForegroundColor(e.target.value)}
                      className="flex-1"
                      placeholder="#000000"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="background" className="text-base font-semibold">Background</Label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      id="background"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                    />
                    <Input
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="flex-1"
                      placeholder="#ffffff"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Button 
                  onClick={generateQRCode}
                  className="w-full h-12 text-base"
                  size="lg"
                  disabled={!text.trim()}
                >
                  <QrCode className="w-5 h-5 mr-2" />
                  Generate QR Code
                </Button>
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    onClick={downloadQRCode}
                    variant="outline"
                    disabled={!qrCodeData}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button 
                    onClick={copyQRCode}
                    variant="outline"
                    disabled={!qrCodeData}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <Button 
                  onClick={clearAll}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* QR Code Display */}
        <div className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl flex items-center space-x-2">
                <QrCode className="w-5 h-5" />
                <span>Generated QR Code</span>
              </CardTitle>
              <CardDescription>
                Your QR code will appear here
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg min-h-[400px]">
                {qrCodeData ? (
                  <div className="text-center space-y-4">
                    <img 
                      src={qrCodeData} 
                      alt="Generated QR Code" 
                      className="mx-auto shadow-lg rounded-lg border"
                      style={{ maxWidth: '100%', maxHeight: '350px' }}
                    />
                    <div className="text-sm text-gray-600">
                      <p>Size: {size}x{size}px</p>
                      <p>Content: {text.length > 50 ? text.substring(0, 50) + '...' : text}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <QrCode className="w-24 h-24 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Enter content and click "Generate QR Code"</p>
                    <p className="text-sm">Your QR code will appear here</p>
                  </div>
                )}
              </div>
              
              {/* Hidden canvas for QR code generation */}
              <canvas
                ref={canvasRef}
                style={{ display: 'none' }}
              />
            </CardContent>
          </Card>

          {/* QR Code Info */}
          {qrCodeData && (
            <Card className="shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">QR Code Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold text-gray-700">Dimensions:</span>
                    <p className="text-gray-600">{size} x {size} pixels</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Error Correction:</span>
                    <p className="text-gray-600">Level {errorLevel}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Foreground:</span>
                    <p className="text-gray-600">{foregroundColor}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Background:</span>
                    <p className="text-gray-600">{backgroundColor}</p>
                  </div>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Content Length:</span>
                  <p className="text-gray-600">{text.length} characters</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRCodeGenerator;
