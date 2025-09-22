import React from "react";
import { motion } from "framer-motion";
import { Shield, Settings, Zap, Globe } from "lucide-react";

export default function HowItWorksSection() {
  const steps = [
    {
      number: "1",
      title: "Sign Up",
      description: "Sign up securely with our internet identity verification system to ensure data privacy and regulatory compliance.",
      icon: Shield,
    },
    {
      number: "2", 
      title: "Connect",
      description: "Integrate with your existing POS, inventory, and supply chain management systems for seamless data flow.",
      icon: Settings,
    },
    {
      number: "3",
      title: "AI Analysis", 
      description: "Our advanced AI algorithms analyze your data patterns to provide intelligent insights and predictions.",
      icon: Zap,
    },
    {
      number: "4",
      title: "Automation",
      description: "Automated optimization suggestions and real-time adjustments to maximize your creator economy potential.",
      icon: Globe,
    }
  ];

  return (
    <section className="py-32 bg-slate-50" id="how-it-works">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-slate-800 mb-6">
            How PULSE Works
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Get started with our intelligent creator economy platform in four simple steps
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative"
            >
              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 -right-4 w-8 h-0.5 bg-slate-300 z-0" />
              )}

              {/* Card */}
              <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200">
                {/* Large Number in Background */}
                <div className="absolute top-4 right-4 text-6xl font-bold text-slate-100 z-0">
                  {step.number}
                </div>

                {/* Icon */}
                <div className="relative z-10 w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <step.icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-slate-800 mb-4">
                    {step.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}