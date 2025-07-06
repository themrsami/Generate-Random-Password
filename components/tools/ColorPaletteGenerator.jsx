'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { 
  Copy, 
  RefreshCw, 
  Download, 
  Palette, 
  Check,
  Shuffle
} from 'lucide-react';

const ColorPaletteGenerator = () => {
  const [colors, setColors] = useState([]);
  const [baseColor, setBaseColor] = useState('#3B82F6');
  const [copiedColor, setCopiedColor] = useState('');
  const { toast } = useToast();

  // Generate complementary colors
  const generateComplementaryPalette = useCallback((baseHex) => {
    const hsl = hexToHsl(baseHex);
    return [
      baseHex,
      hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l), // Complementary
      hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l), // Triadic 1
      hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l), // Triadic 2
      hslToHex(hsl.h, hsl.s, Math.min(hsl.l + 20, 100)), // Lighter
      hslToHex(hsl.h, hsl.s, Math.max(hsl.l - 20, 0)), // Darker
    ];
  }, []);

  // Generate analogous colors
  const generateAnalogousPalette = useCallback((baseHex) => {
    const hsl = hexToHsl(baseHex);
    return [
      hslToHex((hsl.h - 30 + 360) % 360, hsl.s, hsl.l),
      hslToHex((hsl.h - 15 + 360) % 360, hsl.s, hsl.l),
      baseHex,
      hslToHex((hsl.h + 15) % 360, hsl.s, hsl.l),
      hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l),
      hslToHex((hsl.h + 45) % 360, hsl.s, hsl.l),
    ];
  }, []);

  // Generate monochromatic colors
  const generateMonochromaticPalette = useCallback((baseHex) => {
    const hsl = hexToHsl(baseHex);
    return [
      hslToHex(hsl.h, hsl.s, 90),
      hslToHex(hsl.h, hsl.s, 70),
      hslToHex(hsl.h, hsl.s, 50),
      baseHex,
      hslToHex(hsl.h, hsl.s, 30),
      hslToHex(hsl.h, hsl.s, 10),
    ];
  }, []);

  // Generate random palette
  const generateRandomPalette = useCallback(() => {
    const colors = [];
    for (let i = 0; i < 6; i++) {
      const hue = Math.floor(Math.random() * 360);
      const saturation = Math.floor(Math.random() * 40) + 60; // 60-100%
      const lightness = Math.floor(Math.random() * 40) + 30; // 30-70%
      colors.push(hslToHex(hue, saturation, lightness));
    }
    return colors;
  }, []);

  // Helper functions
  const hexToHsl = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  const hslToHex = (h, s, l) => {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  // Get contrasting text color
  const getContrastColor = (hexColor) => {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#FFFFFF';
  };

  // Generate palette
  const generatePalette = (type) => {
    let newColors = [];
    switch (type) {
      case 'complementary':
        newColors = generateComplementaryPalette(baseColor);
        break;
      case 'analogous':
        newColors = generateAnalogousPalette(baseColor);
        break;
      case 'monochromatic':
        newColors = generateMonochromaticPalette(baseColor);
        break;
      case 'random':
        newColors = generateRandomPalette();
        break;
    }
    setColors(newColors);
    toast({
      title: "Palette Generated",
      description: `${type.charAt(0).toUpperCase() + type.slice(1)} palette created successfully!`,
    });
  };

  // Copy color
  const copyColor = async (color) => {
    try {
      await navigator.clipboard.writeText(color);
      setCopiedColor(color);
      setTimeout(() => setCopiedColor(''), 2000);
      toast({
        title: "Color Copied",
        description: `${color} copied to clipboard!`,
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: 'Failed to copy color.',
        variant: "destructive"
      });
    }
  };

  // Copy all colors
  const copyAllColors = async () => {
    try {
      const colorString = colors.join(', ');
      await navigator.clipboard.writeText(colorString);
      toast({
        title: "All Colors Copied",
        description: 'All colors copied to clipboard!',
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: 'Failed to copy colors.',
        variant: "destructive"
      });
    }
  };

  // Export palette
  const exportPalette = (format) => {
    if (colors.length === 0) {
      toast({
        title: "No Palette",
        description: 'Generate a palette first!',
        variant: "destructive"
      });
      return;
    }

    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    let content = '';
    let filename = '';
    let mimeType = '';

    switch (format) {
      case 'css':
        content = ':root {\n' + 
          colors.map((color, idx) => `  --color-${idx + 1}: ${color};`).join('\n') +
          '\n}';
        filename = `palette-${timestamp}.css`;
        mimeType = 'text/css';
        break;
      case 'json':
        content = JSON.stringify({
          generated: new Date().toISOString(),
          baseColor,
          colors: colors.map((color, idx) => ({
            id: idx + 1,
            hex: color,
            hsl: hexToHsl(color)
          }))
        }, null, 2);
        filename = `palette-${timestamp}.json`;
        mimeType = 'application/json';
        break;
      case 'txt':
        content = colors.join('\n');
        filename = `palette-${timestamp}.txt`;
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
      description: `Palette exported as ${format.toUpperCase()}`,
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <Palette className="w-8 h-8 text-indigo-600" />
          <h1 className="text-3xl font-bold text-gray-900">Color Palette Generator</h1>
        </div>
        <p className="text-gray-600">Create beautiful color palettes for your design projects</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Settings</CardTitle>
              <CardDescription>Choose your base color and palette type</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Base Color */}
              <div className="space-y-2">
                <Label htmlFor="baseColor">Base Color</Label>
                <div className="flex space-x-2">
                  <Input
                    type="color"
                    id="baseColor"
                    value={baseColor}
                    onChange={(e) => setBaseColor(e.target.value)}
                    className="w-16 h-10 p-1 border rounded cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={baseColor}
                    onChange={(e) => setBaseColor(e.target.value)}
                    className="flex-1"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>

              {/* Generate Buttons */}
              <div className="space-y-2">
                <Label>Palette Types</Label>
                <div className="grid grid-cols-1 gap-2">
                  <Button 
                    onClick={() => generatePalette('complementary')} 
                    variant="outline"
                    size="sm"
                  >
                    Complementary
                  </Button>
                  <Button 
                    onClick={() => generatePalette('analogous')} 
                    variant="outline"
                    size="sm"
                  >
                    Analogous
                  </Button>
                  <Button 
                    onClick={() => generatePalette('monochromatic')} 
                    variant="outline"
                    size="sm"
                  >
                    Monochromatic
                  </Button>
                  <Button 
                    onClick={() => generatePalette('random')} 
                    variant="outline"
                    size="sm"
                  >
                    <Shuffle className="w-4 h-4 mr-2" />
                    Random
                  </Button>
                </div>
              </div>

              {/* Actions */}
              {colors.length > 0 && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      onClick={copyAllColors} 
                      variant="outline" 
                      size="sm"
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copy All
                    </Button>
                    <div className="relative group">
                      <Button variant="outline" size="sm" className="w-full">
                        <Download className="w-4 h-4 mr-1" />
                        Export
                      </Button>
                      <div className="absolute top-full left-0 w-full mt-1 bg-white border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                        <button 
                          onClick={() => exportPalette('css')}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                        >
                          CSS
                        </button>
                        <button 
                          onClick={() => exportPalette('json')}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                        >
                          JSON
                        </button>
                        <button 
                          onClick={() => exportPalette('txt')}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                        >
                          TXT
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Color Palette Display */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Generated Palette</CardTitle>
              <CardDescription>
                {colors.length > 0 ? `${colors.length} colors in your palette` : 'Generate a palette to get started'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {colors.length > 0 ? (
                <div className="space-y-4">
                  {/* Large Color Swatches */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {colors.map((color, index) => (
                      <div
                        key={index}
                        className="relative group rounded-lg overflow-hidden border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => copyColor(color)}
                      >
                        <div 
                          className="h-24 w-full flex items-center justify-center"
                          style={{ backgroundColor: color }}
                        >
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            {copiedColor === color ? (
                              <Check className="w-6 h-6" style={{ color: getContrastColor(color) }} />
                            ) : (
                              <Copy className="w-6 h-6" style={{ color: getContrastColor(color) }} />
                            )}
                          </div>
                        </div>
                        <div className="p-2 bg-white">
                          <p className="text-sm font-mono font-medium">{color}</p>
                          <p className="text-xs text-gray-500">
                            HSL({Object.values(hexToHsl(color)).join(', ')})
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Color Strip */}
                  <div className="h-16 rounded-lg overflow-hidden flex">
                    {colors.map((color, index) => (
                      <Tooltip key={index}>
                        <TooltipTrigger asChild>
                          <div
                            className="flex-1 cursor-pointer hover:scale-105 transition-transform"
                            style={{ backgroundColor: color }}
                            onClick={() => copyColor(color)}
                          />
                        </TooltipTrigger>
                        <TooltipContent>{color}</TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Palette className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">Select a palette type to generate colors</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ColorPaletteGenerator;
