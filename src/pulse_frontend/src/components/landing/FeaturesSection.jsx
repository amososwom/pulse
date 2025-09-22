
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Database, 
  Lock, 
  BarChart3,
  Users,
  Zap
} from "lucide-react";

export default function FeaturesSection() {
  const features = [
    {
      icon: TrendingUp,
      title: "Forecasting",
      description: "Predict creator needs with data-driven insights for optimal positioning",
      gradient: "from-teal-500 to-cyan-600"
    },
    {
      icon: Lock,
      title: "Dynamic Pricing Adjustments", 
      description: "Adjust prices dynamically based on product lifecycle and demand",
      gradient: "from-teal-500 to-cyan-600"
    },
    {
      icon: Database,
      title: "Real-Time Inventory Insights",
      description: "Track your stock effortlessly with live analytics",
      gradient: "from-teal-500 to-cyan-600"
    },
    {
      icon: BarChart3,
      title: "Blockchain-Based Transparency",
      description: "Secure your data with tamper-proof, blockchain-verified records",
      gradient: "from-teal-500 to-cyan-600"
    },
    {
      icon: Users,
      title: "Customer Buying Patterns",
      description: "Analyze customer behavior to refine your marketing and inventory plans",
      gradient: "from-teal-500 to-cyan-600"
    },
    {
      icon: Zap,
      title: "Inventory Management Systems",
      description: "Streamlined systems for comprehensive inventory control",
      gradient: "from-teal-500 to-cyan-600"
    }
  ];

  return (
    <section className="py-20 bg-white relative overflow-hidden" id="features">
      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-teal-400 rounded-full opacity-20"
            animate={{
              y: [-20, -100, -20],
              x: [0, 30, 0],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 1.5,
            }}
            style={{
              left: `${10 + i * 15}%`,
              top: `${20 + (i % 3) * 30}%`,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="flex items-start gap-12">
          {/* Left Content */}
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-slate-800 rounded-full" />
                  </div>
                </div>
                <span className="text-slate-600 font-medium">Our Features</span>
              </div>
              
              <h2 className="text-5xl md:text-6xl font-bold text-slate-800 mb-6 leading-tight">
                We Pulse down
                <br />creator economy for{" "}
                <span className="bg-gradient-to-r from-teal-500 to-cyan-600 bg-clip-text text-transparent">
                  creators
                </span>
              </h2>
            </motion.div>
          </div>

          {/* Right Moving Cards */}
          <div className="flex-1 relative">
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  animate={{
                    y: [0, -10, 0],
                  }}
                  transition={{
                    y: {
                      duration: 4 + index * 0.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.5,
                    }
                  }}
                  className={`p-6 rounded-2xl bg-gradient-to-br ${feature.gradient} text-white shadow-xl hover:shadow-2xl transition-all duration-300 ${
                    index % 2 === 1 ? 'mt-8' : ''
                  }`}
                >
                  {/* Icon */}
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-bold mb-3 text-white">
                    {feature.title}
                  </h3>
                  <p className="text-white/90 text-sm leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Decorative Element */}
                  <div className="absolute top-4 right-4 w-2 h-2 bg-white/30 rounded-full" />
                </motion.div>
              ))}
            </div>

            {/* Launch Button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="absolute top-0 right-0"
            >
              <Button className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-full shadow-lg">
                Launch PULSE dApp
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
