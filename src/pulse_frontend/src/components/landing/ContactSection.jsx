import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Mail, 
  MapPin, 
  Phone,
  Twitter,
  Github,
  Linkedin,
  MessageCircle
} from "lucide-react";

export default function ContactSection() {
  const contactInfo = [
    { icon: Mail, label: "Email", value: "hello@pulse.network" },
    { icon: Phone, label: "Phone", value: "+1 (555) 123-4567" },
    { icon: MapPin, label: "Location", value: "San Francisco, CA" }
  ];

  const socialLinks = [
    { icon: Twitter, href: "https://twitter.com/pulse", label: "Twitter" },
    { icon: Github, href: "https://github.com/pulse", label: "GitHub" },
    { icon: Linkedin, href: "https://linkedin.com/company/pulse", label: "LinkedIn" },
    { icon: MessageCircle, href: "https://discord.gg/pulse", label: "Discord" }
  ];

  return (
    <section className="py-32 bg-slate-900 text-white" id="contact">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl font-bold mb-6">
              Get in <span className="bg-gradient-to-r from-teal-400 to-cyan-500 bg-clip-text text-transparent">Touch</span>
            </h2>
            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              Ready to revolutionize your creator economy? Let's discuss how PULSE can transform your platform.
            </p>

            {/* Contact Details */}
            <div className="space-y-6 mb-8">
              {contactInfo.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <div className="w-12 h-12 bg-teal-500/20 rounded-xl flex items-center justify-center">
                    <item.icon className="w-6 h-6 text-teal-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">{item.label}</p>
                    <p className="text-white font-semibold">{item.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
              <div className="flex gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-slate-800 hover:bg-teal-500 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110"
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-slate-800 rounded-3xl p-8 border border-slate-700"
          >
            <h3 className="text-2xl font-bold mb-6">Send us a Message</h3>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="First Name"
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                />
                <Input
                  placeholder="Last Name"
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                />
              </div>
              
              <Input
                type="email"
                placeholder="Email Address"
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
              />
              
              <Input
                placeholder="Company"
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
              />
              
              <Textarea
                placeholder="Tell us about your project..."
                rows={5}
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 resize-none"
              />
              
              <Button className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white py-3 rounded-xl font-semibold">
                Send Message
              </Button>
            </form>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-20 pt-8 border-t border-slate-800 text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-md flex items-center justify-center">
                <div className="w-2 h-2 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-sm" />
              </div>
            </div>
            <span className="text-xl font-bold text-white">PULSE</span>
          </div>
          <p className="text-slate-400">
            © 2024 PULSE. Revolutionizing the Creator Economy on Internet Computer.
          </p>
        </motion.div>
      </div>
    </section>
  );
}