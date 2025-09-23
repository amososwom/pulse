import { Bitcoin } from "lucide-react";

export default function CyberpunkTokenButton({render}) {
  return (
    <button
      onClick={() => render(true)}
      className="hidden md:block relative group px-4 py-2 bg-black border-2 border-purple-500 rounded-2xl overflow-hidden transition-all duration-500 hover:border-pink-400 hover:shadow-[0_0_50px_rgba(236,72,153,0.6)] active:scale-95"
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-pink-900/20 to-purple-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      {/* Flowing neon lines */}
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-pink-500 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out"></div>
      <div className="absolute bottom-0 right-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent translate-x-[100%] group-hover:translate-x-[-100%] transition-transform duration-1000 ease-out delay-200"></div>

      {/* Corner accents */}
      <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100"></div>
      <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100"></div>

      {/* Main content */}
      <div className="relative flex items-center justify-center space-x-3 z-10">
        <Bitcoin className="w-6 h-6 text-purple-400 group-hover:text-pink-400 transition-colors duration-300 group-hover:drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]" />
        <span className="text-xl text-nowrap font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent group-hover:from-pink-400 group-hover:via-purple-400 group-hover:to-pink-400 transition-all duration-500">
          CREATE TOKENS
        </span>
      </div>

      {/* Particle effects */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-pink-500 rounded-full animate-ping"></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-purple-500 rounded-full animate-ping animation-delay-300"></div>
        <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-pink-500 rounded-full animate-ping animation-delay-700"></div>
      </div>

      {/* Outer glow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 -z-10 scale-110"></div>
    </button>
  );
}
