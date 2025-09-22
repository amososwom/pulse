import React from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  TrendingUp, 
  Filter,
  Lock,
  BarChart3,
  Coins
} from "lucide-react";

export default function TokenomicsSection() {
  
  const tokenomics = [
    {
      icon: Users,
      title: "ICPHubs Network & Team",
      percentage: "5%",
      description: "goes to ICPHubs for partnerships, and 5% is reserved for the team to ensure project success",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: TrendingUp,
      title: "Airdrops & Marketing", 
      percentage: "5%",
      description: "is allocated for airdrops to grow our community and 10% is for marketing to increase visibility",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Filter,
      title: "Development & Private Sale",
      percentage: "15%", 
      description: "is dedicated to platform development, and 10% is raised from private investors",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Lock,
      title: "Public Sale & Treasury",
      percentage: "20%",
      description: "is for the public sale to expand access, while 10% is reserved for the treasury",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: BarChart3,
      title: "DEX Liquidity & Growth Incentives", 
      percentage: "14%",
      description: "ensures liquidity on decentralized exchanges, and 6% is for rewarding early adopters",
      color: "from-indigo-500 to-purple-500"
    },
    {
      icon: Coins,
      title: "PULSE Coin Utility",
      percentage: "",
      description: "PULSE Coin powers creator rewards and will be used for marketplace payments after launch",
      color: "from-teal-500 to-blue-500"
    }
  ];

  return (
    <section className="py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-slate-800 mb-6">
            Token Distribution
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Transparent allocation ensuring sustainable growth and community rewards
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tokenomics.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative"
            >
              {/* Background Glow */}
              <div className={`absolute -inset-0.5 bg-gradient-to-r ${item.color} rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur`} />
              
              {/* Card */}
              <div className="relative bg-slate-50 rounded-2xl p-8 hover:bg-white transition-all duration-500 border border-slate-200 hover:border-slate-300 hover:shadow-xl">
                {/* Icon */}
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className={`w-16 h-16 bg-gradient-to-r ${item.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}
                >
                  <item.icon className="w-8 h-8 text-white" />
                </motion.div>

                {/* Content */}
                <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-slate-900 transition-colors">
                  {item.title}
                </h3>
                
                {item.percentage && (
                  <div className={`text-3xl font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent mb-4`}>
                    {item.percentage}
                  </div>
                )}
                
                <p className="text-slate-600 leading-relaxed group-hover:text-slate-700 transition-colors">
                  {item.description}
                </p>

                {/* Animated Border */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${item.color} rounded-b-2xl origin-left`}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}