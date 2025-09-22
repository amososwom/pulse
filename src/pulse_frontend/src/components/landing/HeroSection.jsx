import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText } from "lucide-react";
import Navbar from "./Navbar";

export default function HeroSection({ onGetStarted }) {
  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50 overflow-hidden">
      <Navbar onGetStarted={onGetStarted} />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 right-1/4 w-96 h-96 opacity-20"
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            scale: { duration: 8, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          <div className="w-full h-full bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-full blur-3xl" />
        </motion.div>
        
        <motion.div
          className="absolute bottom-1/4 left-1/4 w-72 h-72 opacity-15"
          animate={{
            rotate: -360,
            scale: [1.1, 1, 1.1],
          }}
          transition={{
            rotate: { duration: 25, repeat: Infinity, ease: "linear" },
            scale: { duration: 6, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          <div className="w-full h-full bg-gradient-to-r from-emerald-400 via-cyan-500 to-blue-500 rounded-full blur-2xl" />
        </motion.div>

        {/* Glass Morphism Elements - 3D Objects */}
        <motion.div
          className="absolute top-32 right-20 w-32 h-64 opacity-30"
          animate={{
            y: [0, -20, 0],
            rotateY: [0, 180, 360],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="w-full h-full bg-gradient-to-r from-white/40 to-white/60 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl" 
               style={{
                 background: "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 100%)",
                 transform: "perspective(1000px) rotateX(15deg)"
               }} />
        </motion.div>
        
        <motion.div
          className="absolute bottom-40 right-1/3 w-24 h-48 opacity-25"
          animate={{
            y: [0, 15, 0],
            rotateZ: [0, -5, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        >
          <div className="w-full h-full bg-gradient-to-r from-white/50 to-white/20 backdrop-blur-xl rounded-2xl border border-white/25 shadow-xl"
               style={{
                 background: "linear-gradient(45deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.2) 100%)",
                 transform: "perspective(800px) rotateY(-10deg)"
               }} />
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center pt-16">
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          {/* Logo/Brand */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <h1 className="text-8xl md:text-9xl font-bold text-slate-800 tracking-tight">
              PULSE
            </h1>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Button
              onClick={onGetStarted}
              className="bg-slate-800 hover:bg-slate-900 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
              size="lg"
            >
              GET STARTED
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            
            <Button
              variant="outline"
              className="border-2 border-slate-800 text-slate-800 hover:bg-slate-800 hover:text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300"
              size="lg"
            >
              <FileText className="mr-2 w-5 h-5" />
              WHITEPAPER
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}