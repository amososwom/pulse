import React from "react";
import { motion } from "framer-motion";

export default function PartnersSection() {
  const partners = [
    { name: "Coop", logo: "🏪" },
    { name: "Quantum", logo: "⚡" },
    { name: "Echo Valley", logo: "🏔️" },
    { name: "Celestial", logo: "✨" },
    { name: "PULSE", logo: "💫" },
    { name: "NovaTech", logo: "🔮" }
  ];

  return (
    <div className="text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="mb-12"
      >
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-8">
          Trusted by Industry Leaders
        </h3>
      </motion.div>

      {/* Moving Partners Carousel */}
      <div className="relative overflow-hidden">
        <motion.div
          animate={{ x: [0, -100 * partners.length] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 15,
              ease: "linear",
            },
          }}
          className="flex gap-12 items-center opacity-60"
          style={{ width: `${partners.length * 180}px` }}
        >
          {[...partners, ...partners, ...partners].map((partner, index) => (
            <motion.div
              key={index}
              className="flex items-center gap-3 min-w-[160px] justify-center"
            >
              <div className="text-2xl">{partner.logo}</div>
              <span className="font-semibold text-slate-400 text-lg whitespace-nowrap">
                {partner.name}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}