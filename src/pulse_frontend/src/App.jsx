import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';


const PulseLandingPage = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const { scrollY } = useScroll();
  const containerRef = useRef(null);

  // Parallax effects
  const y1 = useTransform(scrollY, [0, 300], [0, -50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -100]);
  const opacity = useTransform(scrollY, [0, 200], [1, 0.5]);

  useEffect(() => {
    const updateMousePosition = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', updateMousePosition);
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, []);

  const features = [
    {
      icon: "🎨",
      title: "Custom Creator Tokens",
      desc: "Mint unique tokens for your brand",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: "💱",
      title: "Buy, Sell & Trade",
      desc: "Peer-to-peer token marketplace",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: "🔒",
      title: "On-Chain Security",
      desc: "Built on Internet Computer",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: "🧩",
      title: "Internet Identity",
      desc: "Passwordless authentication",
      gradient: "from-orange-500 to-red-500"
    }
  ];

  const stats = [
    { label: "Creators", value: "10K+", suffix: "" },
    { label: "Tokens Minted", value: "250", suffix: "M" },
    { label: "Volume Traded", value: "$45", suffix: "M" },
    { label: "Holders", value: "500", suffix: "K+" }
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Animated background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20" />
      
      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full opacity-30"
          animate={{
            x: [0, Math.random() * 100 - 50],
            y: [0, Math.random() * 100 - 50],
          }}
          transition={{
            duration: 10 + Math.random() * 10,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        />
      ))}

      {/* Custom cursor */}
      <motion.div
        className="fixed w-6 h-6 border-2 border-purple-400 rounded-full pointer-events-none z-50 mix-blend-difference"
        animate={{
          x: mousePosition.x - 12,
          y: mousePosition.y - 12,
          scale: isHovering ? 1.5 : 1,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />

      {/* Navigation */}
      <motion.nav 
        className="fixed top-0 w-full z-40 backdrop-blur-md bg-black/20 border-b border-gray-800"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <motion.div 
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center font-bold text-xl">
              P
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Pulse
            </span>
          </motion.div>
          
          <div className="hidden md:flex space-x-8">
            {["Features", "Creators", "Roadmap", "Docs"].map((item) => (
              <motion.a
                key={item}
                href="#"
                className="text-gray-300 hover:text-white transition-colors"
                whileHover={{ y: -2 }}
                onHoverStart={() => setIsHovering(true)}
                onHoverEnd={() => setIsHovering(false)}
              >
                {item}
              </motion.a>
            ))}
          </div>

          <motion.button
            className="bg-gradient-to-r from-purple-500 to-cyan-500 px-6 py-2 rounded-full font-semibold"
            whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(139, 69, 255, 0.5)" }}
            whileTap={{ scale: 0.95 }}
            onHoverStart={() => setIsHovering(true)}
            onHoverEnd={() => setIsHovering(false)}
          >
            Launch App
          </motion.button>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6">
        <motion.div 
          className="text-center max-w-6xl mx-auto"
          style={{ y: y1, opacity }}
        >
          <motion.h1
            className="text-6xl md:text-8xl font-bold mb-6 leading-tight"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 1 }}
          >
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Creator Tokens
            </span>
            <br />
            <motion.span
              className="text-white"
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2, duration: 1 }}
            >
              On-Chain
            </motion.span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 1 }}
          >
            Empower creators to mint, trade, and monetize their influence through 
            <span className="text-cyan-400"> decentralized tokens</span> built on the Internet Computer
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8, duration: 1 }}
          >
            <motion.button
              className="bg-gradient-to-r from-purple-500 to-cyan-500 px-8 py-4 rounded-full text-xl font-semibold flex items-center space-x-2 shadow-2xl"
              whileHover={{ 
                scale: 1.05, 
                boxShadow: "0 0 40px rgba(139, 69, 255, 0.6)",
                background: "linear-gradient(45deg, #8B45FF, #00D4FF)"
              }}
              whileTap={{ scale: 0.95 }}
              onHoverStart={() => setIsHovering(true)}
              onHoverEnd={() => setIsHovering(false)}
            >
              <span>Create Your Token</span>
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                →
              </motion.span>
            </motion.button>

            <motion.button
              className="border border-gray-600 px-8 py-4 rounded-full text-xl font-semibold hover:border-purple-400 transition-colors"
              whileHover={{ scale: 1.05, borderColor: "#8B45FF" }}
              whileTap={{ scale: 0.95 }}
              onHoverStart={() => setIsHovering(true)}
              onHoverEnd={() => setIsHovering(false)}
            >
              Explore Tokens
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Floating 3D elements */}
        <motion.div
          className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-purple-500/30 to-cyan-500/30 rounded-3xl"
          animate={{ 
            rotateX: [0, 360],
            rotateY: [0, 360],
            z: [0, 50, 0]
          }}
          transition={{ duration: 20, repeat: Infinity }}
          style={{ y: y2 }}
        />

        <motion.div
          className="absolute bottom-20 left-20 w-24 h-24 bg-gradient-to-br from-pink-500/30 to-purple-500/30 rounded-2xl"
          animate={{ 
            rotateX: [360, 0],
            rotateZ: [0, 180, 0],
            z: [0, -30, 0]
          }}
          transition={{ duration: 15, repeat: Infinity }}
          style={{ y: y1 }}
        />
      </section>

      {/* Stats Section */}
      <motion.section 
        className="py-20 px-6"
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              className="text-center p-6 rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.8 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, borderColor: "#8B45FF" }}
            >
              <motion.div
                className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ delay: index * 0.2 + 0.5, type: "spring", stiffness: 200 }}
                viewport={{ once: true }}
              >
                {stat.value}{stat.suffix}
              </motion.div>
              <div className="text-gray-400 mt-2">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        className="py-20 px-6"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.h2
            className="text-5xl font-bold text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Powerful Features
            </span>
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="p-8 rounded-3xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 group cursor-pointer"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.8 }}
                viewport={{ once: true }}
                whileHover={{ 
                  scale: 1.05, 
                  borderColor: "#8B45FF",
                  boxShadow: "0 20px 40px rgba(139, 69, 255, 0.3)"
                }}
                onHoverStart={() => {
                  setIsHovering(true);
                  setActiveFeature(index);
                }}
                onHoverEnd={() => setIsHovering(false)}
              >
                <motion.div
                  className="text-6xl mb-6"
                  animate={{ 
                    rotateY: activeFeature === index ? [0, 360] : 0,
                    scale: activeFeature === index ? [1, 1.2, 1] : 1
                  }}
                  transition={{ duration: 0.5 }}
                >
                  {feature.icon}
                </motion.div>
                
                <h3 className="text-2xl font-bold mb-4 group-hover:text-purple-400 transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                  {feature.desc}
                </p>

                <motion.div
                  className={`h-1 bg-gradient-to-r ${feature.gradient} mt-6 rounded-full`}
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  transition={{ delay: index * 0.2 + 0.5, duration: 0.8 }}
                  viewport={{ once: true }}
                  style={{ originX: 0 }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Token Preview Section */}
      <motion.section 
        className="py-20 px-6 relative overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-cyan-500/10" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.h2
            className="text-5xl font-bold text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            Launch Your Token in Minutes
          </motion.h2>

          <motion.div
            className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-lg rounded-3xl p-8 border border-gray-700 max-w-2xl mx-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Token Type</span>
                <span className="text-cyan-400 font-semibold">Bonding Curve</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Base Price</span>
                <span className="text-purple-400 font-semibold">0.01 ICP</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Platform Fee</span>
                <span className="text-green-400 font-semibold">2%</span>
              </div>

              <motion.div
                className="bg-gradient-to-r from-purple-500 to-cyan-500 h-2 rounded-full"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                transition={{ delay: 0.5, duration: 1 }}
                viewport={{ once: true }}
                style={{ originX: 0 }}
              />

              <motion.button
                className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 py-4 rounded-2xl font-semibold text-xl"
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "0 0 30px rgba(139, 69, 255, 0.5)"
                }}
                whileTap={{ scale: 0.98 }}
              >
                Create Token Now
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-800 bg-black/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            className="flex items-center justify-center space-x-2 mb-6"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center font-bold text-2xl">
              P
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Pulse
            </span>
          </motion.div>
          
          <p className="text-gray-400 mb-8">
            Built on Internet Computer • Powered by Motoko • Secured by Chain Fusion
          </p>

          <div className="flex justify-center space-x-8">
            {["Twitter", "Discord", "GitHub", "Docs"].map((link) => (
              <motion.a
                key={link}
                href="#"
                className="text-gray-400 hover:text-purple-400 transition-colors"
                whileHover={{ y: -2 }}
              >
                {link}
              </motion.a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PulseLandingPage;