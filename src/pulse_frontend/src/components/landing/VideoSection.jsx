import React from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import PartnersSection from "./PartnersSection";

export default function VideoSection() {
  return (
    <section className="py-32 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Partners */}
        <PartnersSection />
        
        {/* Demo Video */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-20 text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mb-12"
          >
            <button className="group bg-white/70 backdrop-blur-md hover:bg-white/90 border border-white/30 rounded-full px-6 py-3 transition-all duration-300 hover:scale-105 flex items-center gap-3 mx-auto">
              <Play className="w-5 h-5 text-slate-700 group-hover:text-slate-900" />
              <span className="text-slate-700 group-hover:text-slate-900 font-medium">
                Watch Demo
              </span>
            </button>
          </motion.div>

          <h2 className="text-5xl md:text-6xl font-bold text-slate-800 mb-6">
            See how <span className="bg-gradient-to-r from-teal-500 to-cyan-600 bg-clip-text text-transparent">efficient</span>
            <br />PULSE is
          </h2>

          <div className="relative max-w-4xl mx-auto">
            <div className="bg-slate-900 rounded-3xl aspect-video flex items-center justify-center shadow-2xl overflow-hidden">
              {/* YouTube Video Embed */}
              <div className="relative w-full h-full">
                <iframe
                  className="w-full h-full rounded-3xl"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ" // Replace with actual video
                  title="PULSE: Revolutionizing Creator Economy with AI and Blockchain"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
            
            {/* Video Title */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-full px-6 py-3 shadow-lg border border-slate-200"
            >
              <span className="text-slate-700 font-medium">PULSE: Revolutionizing Creator Economy Management</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}