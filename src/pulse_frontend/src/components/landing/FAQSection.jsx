import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Plus, Minus } from "lucide-react";

export default function FAQSection() {
  const [openFAQ, setOpenFAQ] = useState(null);

  const faqs = [
    {
      question: "What is XERO and how does it work?",
      answer: "XERO is an AI-powered food waste management platform built on blockchain technology. It uses advanced analytics to track, predict, and optimize waste reduction strategies for businesses of all sizes."
    },
    {
      question: "How secure is my data with Internet Identity?",
      answer: "Your data is completely secure. Internet Identity uses advanced cryptographic protocols and runs on the Internet Computer blockchain, ensuring your identity and data are protected without storing personal information."
    },
    {
      question: "What kind of businesses can benefit from XERO?",
      answer: "XERO works for restaurants, grocery stores, food manufacturers, hotels, catering companies, and any business that handles food inventory. Our AI adapts to your specific industry and business model."
    },
    {
      question: "How much can I save using XERO?",
      answer: "On average, businesses reduce food waste by 35-50% and see cost savings of $2,000-$15,000 monthly depending on their size. Our ROI calculator can provide personalized estimates for your business."
    },
    {
      question: "Is there a free trial available?",
      answer: "Yes! We offer a 30-day free trial with full access to all features. No credit card required, and you can cancel anytime during the trial period."
    },
    {
      question: "How does the AI learn my business patterns?",
      answer: "Our AI analyzes your historical data, seasonal trends, customer behavior, and external factors like weather and events. The more data it has, the more accurate its predictions become."
    },
    {
      question: "Can XERO integrate with my existing systems?",
      answer: "Absolutely! XERO offers seamless integration with popular POS systems, inventory management tools, accounting software, and ERP systems through our robust API."
    },
    {
      question: "What support is available for new users?",
      answer: "We provide 24/7 customer support, onboarding assistance, training materials, webinars, and a dedicated success manager for enterprise clients to ensure you get maximum value from XERO."
    }
  ];

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <section className="py-32 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-slate-800 mb-6">
            Frequently Asked{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
          <p className="text-xl text-slate-600">
            Everything you need to know about XERO
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 hover:border-slate-300 transition-all duration-300"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-slate-100 transition-colors duration-300 group"
              >
                <h3 className="text-lg font-semibold text-slate-800 pr-8 group-hover:text-slate-900">
                  {faq.question}
                </h3>
                <motion.div
                  animate={{ rotate: openFAQ === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0"
                >
                  {openFAQ === index ? (
                    <Minus className="w-6 h-6 text-slate-600" />
                  ) : (
                    <Plus className="w-6 h-6 text-slate-600" />
                  )}
                </motion.div>
              </button>
              
              <AnimatePresence>
                {openFAQ === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-8 pb-6">
                      <motion.p
                        initial={{ y: 10 }}
                        animate={{ y: 0 }}
                        className="text-slate-600 leading-relaxed"
                      >
                        {faq.answer}
                      </motion.p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Contact Support */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-8 border border-blue-100">
            <h3 className="text-2xl font-bold text-slate-800 mb-4">
              Still have questions?
            </h3>
            <p className="text-slate-600 mb-6">
              Our support team is here to help you 24/7
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-slate-800 px-6 py-3 rounded-full font-semibold shadow-md hover:shadow-lg transition-all duration-300 border border-slate-200"
              >
                Contact Support
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-blue-600 text-white px-6 py-3 rounded-full font-semibold shadow-md hover:shadow-lg transition-all duration-300"
              >
                Schedule Demo
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}