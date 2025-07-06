'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Menu,
  X,
  Github,
  Instagram,
  Linkedin
} from 'lucide-react';

const Navigation = ({ tools, activeTab, setActiveTab, isMenuOpen, setIsMenuOpen }) => {
  return (
    <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">DT</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">DevTools Hub</h1>
              <p className="text-xs text-gray-500 hidden sm:block">Professional Development Utilities</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {tools.map((tool) => {
              const IconComponent = tool.icon;
              return (
                <Button
                  key={tool.id}
                  variant={activeTab === tool.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab(tool.id)}
                  className="flex items-center space-x-2"
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="hidden xl:inline">{tool.name}</span>
                </Button>
              );
            })}
          </div>

          {/* Social Links (Desktop) */}
          <div className="hidden lg:flex items-center space-x-2">
            <Button variant="ghost" size="sm" asChild>
              <a href="https://github.com/themrsami" target="_blank" rel="noopener noreferrer">
                <Github className="w-4 h-4" />
              </a>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a href="https://instagram.com/themrsami" target="_blank" rel="noopener noreferrer">
                <Instagram className="w-4 h-4" />
              </a>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a href="https://linkedin.com/in/usama-nazir" target="_blank" rel="noopener noreferrer">
                <Linkedin className="w-4 h-4" />
              </a>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <Card className="lg:hidden mt-4 p-4 bg-white shadow-lg">
            <div className="space-y-2">
              {tools.map((tool) => {
                const IconComponent = tool.icon;
                return (
                  <Button
                    key={tool.id}
                    variant={activeTab === tool.id ? "default" : "ghost"}
                    size="sm"
                    onClick={() => {
                      setActiveTab(tool.id);
                      setIsMenuOpen(false);
                    }}
                    className="w-full justify-start flex items-center space-x-2"
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{tool.name}</span>
                  </Button>
                );
              })}
              
              {/* Mobile Social Links */}
              <div className="flex items-center space-x-2 pt-2 border-t">
                <Button variant="ghost" size="sm" asChild>
                  <a href="https://github.com/themrsami" target="_blank" rel="noopener noreferrer">
                    <Github className="w-4 h-4" />
                  </a>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <a href="https://instagram.com/themrsami" target="_blank" rel="noopener noreferrer">
                    <Instagram className="w-4 h-4" />
                  </a>
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <a href="https://linkedin.com/in/usama-nazir" target="_blank" rel="noopener noreferrer">
                    <Linkedin className="w-4 h-4" />
                  </a>
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
