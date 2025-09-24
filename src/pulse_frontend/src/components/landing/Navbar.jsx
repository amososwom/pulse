import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Twitter, 
  Github, 
  Linkedin, 
  Mail,
  Menu,
  X,
  MessageCircle,
  Globe,
  UserPlus,
  LogIn
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Navbar({ onGetStarted, onSignIn }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "How it Works", href: "#how-it-works" },
    { name: "Partners", href: "#partners" },
    { name: "FAQ", href: "#faq" },
    { name: "Contact", href: "#contact" }
  ];

  const socialLinks = [
    { icon: Twitter, href: "https://twitter.com/pulse", label: "Twitter" },
    { icon: Github, href: "https://github.com/pulse", label: "GitHub" },
    { icon: Linkedin, href: "https://linkedin.com/company/pulse", label: "LinkedIn" },
    { icon: MessageCircle, href: "https://discord.gg/pulse", label: "Discord" }
  ];

  return (
    <motion.nav
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/20"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-sm" />
              </div>
            </div>
            <span className="text-xl font-bold text-gray-900">PULSE</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Social Links & CTA */}
          <div className="hidden md:flex items-center gap-4">
            {/* Social Icons */}
            <div className="flex items-center gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-all duration-200"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>

            {/* Contact */}
            <Button
              variant="outline"
              size="sm"
              className="border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              <Mail className="w-4 h-4 mr-2" />
              Contact
            </Button>

            {/* Sign In Button */}
            <Button
              onClick={() => onSignIn && onSignIn()}
              variant="outline"
              size="sm"
              className="border-slate-300 text-slate-600 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </Button>

            {/* Launch dApp / Get Started */}
            <Button
              onClick={() => onGetStarted(true)}
              className="bg-slate-800 hover:bg-slate-900 text-white px-6 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 border-t border-gray-200/20"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-gray-600 hover:text-gray-900 font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              
              {/* Mobile Social Links */}
              <div className="flex items-center gap-2 pt-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600"
                  >
                    <social.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>

              {/* Mobile Auth Buttons */}
              <div className="flex flex-col gap-3 pt-4">
                <Button
                  onClick={() => {
                    onSignIn && onSignIn();
                    setIsMenuOpen(false);
                  }}
                  variant="outline"
                  className="border-slate-300 text-slate-600 justify-center"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
                
                <Button
                  onClick={() => {
                    onGetStarted(true);
                    setIsMenuOpen(false);
                  }}
                  className="bg-slate-800 text-white justify-center"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Get Started
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}