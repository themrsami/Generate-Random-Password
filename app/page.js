'use client';

import React, { useState, useEffect } from 'react';
import { generate } from 'generate-password';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { FaGithub, FaInstagram, FaCopy, FaSyncAlt } from 'react-icons/fa';
import Link from 'next/link';
import { ScrollArea } from '@/components/ui/scroll-area';

const PasswordGenerator = () => {
  const [passwords, setPasswords] = useState(['']);
  const [length, setLength] = useState(12);
  const [quantity, setQuantity] = useState(1);  // New state for quantity
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });

  const { toast } = useToast();

  useEffect(() => {
    generatePasswords(options);
  }, [length, quantity]);  // Regenerate passwords if quantity or length changes

  const generatePasswords = (opts = options) => {
    if (!opts.uppercase && !opts.lowercase && !opts.numbers && !opts.symbols) {
      toast({
        title: <span style={{ color: 'red', fontWeight: 'bold', fontSize: '1rem' }}>Error</span>,
        description: 'Please select at least one character type: Uppercase, Lowercase, Numbers, or Symbols.',
      });
      return;
    }

    const newPasswords = Array.from({ length: quantity }, () =>
      generate({
        length,
        numbers: opts.numbers,
        symbols: opts.symbols,
        uppercase: opts.uppercase,
        lowercase: opts.lowercase,
      })
    );
    setPasswords(newPasswords);
    toast({
      title: <span style={{ color: 'green', fontWeight: 'bold', fontSize: '1rem' }}>Success</span>,
      description: 'Passwords generated successfully!',
    });
  };

  const generateSinglePassword = (index) => {
    const newPassword = generate({
      length,
      numbers: options.numbers,
      symbols: options.symbols,
      uppercase: options.uppercase,
      lowercase: options.lowercase,
    });
    const updatedPasswords = [...passwords];
    updatedPasswords[index] = newPassword;
    setPasswords(updatedPasswords);
    toast({
      title: <span style={{ color: 'green', fontWeight: 'bold', fontSize: '1rem' }}>Success</span>,
      description: `Password at index ${index + 1} regenerated!`,
    });
  };

  const handleCheckboxChange = (option) => {
    const updatedOptions = {
      ...options,
      [option]: !options[option],
    };
    setOptions(updatedOptions);

    const action = updatedOptions[option] ? 'added to' : 'removed from';
    toast({
      title: <span style={{ color: 'blue', fontWeight: 'bold', fontSize: '1rem' }}>Option Changed</span>,
      description: `${option.charAt(0).toUpperCase() + option.slice(1)} ${action} password.`,
    });

    // Regenerate passwords with updated options
    generatePasswords(updatedOptions);
  };

  const handleLengthChange = (value) => {
    setLength(value);
    toast({
      title: <span style={{ color: 'orange', fontWeight: 'bold', fontSize: '1rem' }}>Info</span>,
      description: `Password length changed to ${value}!`,
    });
  };

  const handleCopyPassword = (password) => {
    navigator.clipboard.writeText(password);
    toast({
      title: <span style={{ color: 'green', fontWeight: 'bold', fontSize: '1rem' }}>Copied</span>,
      description: 'Password copied to clipboard!',
    });
  };

  const handleCopyAllPasswords = () => {
    const allPasswords = passwords.join('\n');
    navigator.clipboard.writeText(allPasswords);
    toast({
      title: <span style={{ color: 'green', fontWeight: 'bold', fontSize: '1rem' }}>Copied</span>,
      description: 'All passwords copied to clipboard!',
    });
  };

  const handleQuantityChange = (value) => {
    setQuantity(value);
    toast({
      title: <span style={{ color: 'orange', fontWeight: 'bold', fontSize: '1rem' }}>Info</span>,
      description: `Password quantity changed to ${value}!`,
    });
  };

  return (
    <TooltipProvider>
      <div className="flex justify-center items-center min-h-screen bg-[#0F172A]">
        <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
          <h1 className="text-xl mb-8 text-center font-semibold bg-[#0F172A] p-1 rounded-full text-white">Random Password Generator</h1>
          <div className="mb-4">
            <Label htmlFor="length">Length: {length}</Label>
            <Slider
              id="length"
              min={4}
              max={100}
              value={[length]}
              onValueChange={(value) => handleLengthChange(value[0])}
              className="hover:cursor-pointer mt-4"
            />
            <Input
              type="number"
              value={length}
              onChange={(e) => handleLengthChange(Number(e.target.value))}
              className="mt-4"
            />
          </div>
          <div className="mb-4">
            <Label htmlFor="quantity">Quantity: {quantity}</Label>
            <Input
              type="number"
              id="quantity"
              min={1}
              value={quantity}
              onChange={(e) => handleQuantityChange(Number(e.target.value))}
              className="mt-2"
            />
          </div>
          <div className="mb-4">
            <div>
              <Checkbox
                id="uppercase"
                checked={options.uppercase}
                onCheckedChange={() => handleCheckboxChange('uppercase')}
              />
              <Label htmlFor="uppercase" className="ml-2">Include Uppercase</Label>
            </div>
            <div>
              <Checkbox
                id="lowercase"
                checked={options.lowercase}
                onCheckedChange={() => handleCheckboxChange('lowercase')}
              />
              <Label htmlFor="lowercase" className="ml-2">Include Lowercase</Label>
            </div>
            <div>
              <Checkbox
                id="numbers"
                checked={options.numbers}
                onCheckedChange={() => handleCheckboxChange('numbers')}
              />
              <Label htmlFor="numbers" className="ml-2">Include Numbers</Label>
            </div>
            <div>
              <Checkbox
                id="symbols"
                checked={options.symbols}
                onCheckedChange={() => handleCheckboxChange('symbols')}
              />
              <Label htmlFor="symbols" className="ml-2">Include Symbols</Label>
            </div>
          </div>
          <div className="flex flex-wrap space-x-2">
            <Button onClick={() => generatePasswords(options)}>
              Generate
            </Button>
            <Button onClick={handleCopyAllPasswords}>
              Copy All
            </Button>
          </div>

          {/* Render multiple passwords if quantity > 1 */}
          <ScrollArea className={`mt-4 ${quantity > 5 ? 'h-[200px]' : ''} w-full`}>
          {passwords.map((password, index) => (
            <div key={index} className="relative mt-4 flex items-center">
              <Input className="w-full p-2 border rounded" type="text" readOnly value={password} />
              <div className="absolute right-0 flex items-center space-x-2 mr-2">
                <Tooltip>
                  <TooltipTrigger>
                    <FaCopy
                      size={20}
                      className="cursor-pointer"
                      onClick={() => handleCopyPassword(password)}
                    />
                  </TooltipTrigger>
                  <TooltipContent>Copy Password</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger>
                    <FaSyncAlt
                      size={20}
                      className="cursor-pointer"
                      onClick={() => generateSinglePassword(index)}  // Update only this password
                    />
                  </TooltipTrigger>
                  <TooltipContent>Generate New Password</TooltipContent>
                </Tooltip>
              </div>
            </div>
          ))}
          </ScrollArea>

          <div className="flex flex-wrap gap-4 justify-center mt-2">
            <Link href="https://www.github.com/themrsami" target='_blank'>
              <FaGithub size={30}/>
            </Link>
            <Link href="https://www.instagram.com/themrsami" target='_blank'>
              <FaInstagram size={30}/>
            </Link>
            <Link href="https://www.buymeacoffee.com/mrsami" target='_blank'>
              <img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=themrsami&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff" alt="Buy me a coffee" style={{ height: '30px' }} />
            </Link>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default PasswordGenerator;
