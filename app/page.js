'use client';

import React, { useState } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import PasswordGenerator from '@/components/tools/PasswordGenerator';
import ColorPaletteGenerator from '@/components/tools/ColorPaletteGenerator';
import QRCodeGenerator from '@/components/tools/QRCodeGenerator';
import JSONTools from '@/components/tools/JSONTools';
import TextTools from '@/components/tools/TextTools';
import { 
  Key,
  Palette,
  QrCode,
  FileText,
  Type
} from 'lucide-react';

const ToolSite = () => {
  const [activeTab, setActiveTab] = useState('password-generator');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const tools = [
    { 
      id: 'password-generator', 
      name: 'Password Generator', 
      icon: Key, 
      description: 'Generate secure, customizable passwords with advanced features',
      component: PasswordGenerator
    },
    { 
      id: 'json-tools', 
      name: 'JSON Tools', 
      icon: FileText, 
      description: 'Format, validate, convert and analyze JSON data with comprehensive tools',
      component: JSONTools
    },
    { 
      id: 'qr-code', 
      name: 'QR Code Generator', 
      icon: QrCode, 
      description: 'Generate customizable QR codes for URLs, text, and more',
      component: QRCodeGenerator
    },
    { 
      id: 'text-tools', 
      name: 'Text Tools', 
      icon: Type, 
      description: 'Transform, analyze, and manipulate text with powerful tools',
      component: TextTools
    },
    { 
      id: 'color-palette', 
      name: 'Color Palette Generator', 
      icon: Palette, 
      description: 'Create beautiful color palettes for your design projects',
      component: ColorPaletteGenerator
    }
  ];

  const ActiveComponent = tools.find(tool => tool.id === activeTab)?.component || PasswordGenerator;

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.05),transparent_50%)]"></div>
        
        <div className="relative z-10">
          <Navigation 
            tools={tools}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isMenuOpen={isMenuOpen}
            setIsMenuOpen={setIsMenuOpen}
          />
          
          <main className="container mx-auto px-4 py-8 max-w-8xl min-h-screen">
            <ActiveComponent />
          </main>
          
          <Footer tools={tools} setActiveTab={setActiveTab} />
        </div>
      </div>
    </TooltipProvider>
  );
};

export default ToolSite;
