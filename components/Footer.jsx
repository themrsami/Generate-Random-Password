'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Github,
  Instagram,
  Linkedin,
  Heart,
  Code,
  Mail
} from 'lucide-react';

const Footer = ({ tools, setActiveTab }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">DT</span>
              </div>
              <h3 className="text-lg font-bold">DevTools Hub</h3>
            </div>
            <p className="text-gray-400 text-sm">
              Professional development utilities designed to boost your productivity.
            </p>
          </div>

          {/* Tools */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-300">Tools</h4>
            <div className="space-y-2">
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setActiveTab(tool.id)}
                  className="block text-gray-400 hover:text-white text-sm transition-colors"
                >
                  {tool.name}
                </button>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-300">Resources</h4>
            <div className="space-y-2">
              <a href="#" className="block text-gray-400 hover:text-white text-sm transition-colors">
                Documentation
              </a>
              <a href="#" className="block text-gray-400 hover:text-white text-sm transition-colors">
                API Reference
              </a>
              <a href="#" className="block text-gray-400 hover:text-white text-sm transition-colors">
                Tutorials
              </a>
              <a href="#" className="block text-gray-400 hover:text-white text-sm transition-colors">
                Support
              </a>
            </div>
          </div>

          {/* Connect */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-300">Connect</h4>
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2" asChild>
                <a href="https://github.com/themrsami" target="_blank" rel="noopener noreferrer">
                  <Github className="w-4 h-4" />
                </a>
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2" asChild>
                <a href="https://instagram.com/themrsami" target="_blank" rel="noopener noreferrer">
                  <Instagram className="w-4 h-4" />
                </a>
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2" asChild>
                <a href="https://linkedin.com/in/usama-nazir" target="_blank" rel="noopener noreferrer">
                  <Linkedin className="w-4 h-4" />
                </a>
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2" asChild>
                <a href="mailto:contact@themrsami.com">
                  <Mail className="w-4 h-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <span>© {currentYear} DevTools Hub. Made with</span>
            <Heart className="w-4 h-4 text-red-500" />
            <span>by developers, for developers</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-400 mt-2 md:mt-0">
            <Code className="w-4 h-4" />
            <span>Open Source</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
