import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shield, Globe, CheckCircle, ArrowRight, Key, Users, Lock } from "lucide-react";

export default function InternetIdentityModal({ 
  isOpen, 
  onClose, 
  onAuthenticate, 
  onNFID, 
  isLoading,
  authMethod 
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="sm:max-w-md bg-white border-0 shadow-2xl">
            <div className="relative overflow-hidden rounded-2xl">
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50" />
              
              {/* Content */}
              <div className="relative p-8">
                <DialogHeader className="text-center mb-8">
                  {/* Icon */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.6, type: "spring" }}
                    className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                  >
                    <Shield className="w-8 h-8 text-white" />
                  </motion.div>

                  <DialogTitle className="text-2xl font-bold text-slate-800 mb-2">
                    Verify your{" "}
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      identity
                    </span>
                  </DialogTitle>
                  <p className="text-slate-600">
                    Secure, passwordless authentication powered by Internet Computer
                  </p>
                </DialogHeader>

                {/* Steps Preview */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="grid grid-cols-4 gap-2 mb-8"
                >
                  {[
                    { step: 1, title: "Verify Identity", active: true },
                    { step: 2, title: "Business Profile", active: false },
                    { step: 3, title: "Features", active: false },
                    { step: 4, title: "Terms", active: false }
                  ].map((item, index) => (
                    <div key={index} className="text-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-2 mx-auto ${
                        item.active 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-slate-200 text-slate-500'
                      }`}>
                        {item.active ? <CheckCircle className="w-4 h-4" /> : item.step}
                      </div>
                      <div className="text-xs text-slate-600">{item.title}</div>
                    </div>
                  ))}
                </motion.div>

                {/* Authentication Methods */}
                <div className="space-y-4 mb-6">
                  {/* Internet Identity Button */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Button
                      onClick={onAuthenticate}
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-black text-white py-4 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Authenticating...
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 p-2">
                          <Globe className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                          Sign Up with Internet Identity
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                        </div>
                      )}
                    </Button>
                  </motion.div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-slate-500">OR</span>
                    </div>
                  </div>

                  {/* NFID Button */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Button
                      onClick={onNFID}
                      variant="outline"
                      className="w-full border-2 border-slate-300 text-white hover:bg-slate-50 hover:border-green-400 py-4 rounded-xl text-lg font-semibold transition-all duration-300 group relative overflow-hidden"
                      disabled={isLoading}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="relative flex items-center gap-3">
                        <div className="w-6 h-6 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-md flex items-center justify-center">
                          <Key className="w-4 h-4 text-white" />
                        </div>
                        Continue with NFID
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    </Button>
                  </motion.div>
                </div>

                {/* Authentication Comparison */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="grid grid-cols-2 gap-4 mb-6"
                >
                  {/* Internet Identity Features */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Globe className="w-4 h-4 text-slate-600" />
                      <span className="font-medium text-slate-800 text-sm">Internet Identity</span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-slate-600">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        Native IC protocol
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        Biometric auth
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        Maximum security
                      </div>
                    </div>
                  </div>

                  {/* NFID Features */}
                  <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-4 border border-teal-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Key className="w-4 h-4 text-teal-600" />
                      <span className="font-medium text-slate-800 text-sm">NFID</span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-slate-600">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        Google integration
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        Easy onboarding
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        Familiar UX
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Security Notice */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="bg-blue-50 rounded-xl p-4 border border-blue-200"
                >
                  <div className="flex items-start gap-3">
                    <Lock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-blue-900 text-sm mb-1">
                        Secure & Private
                      </h4>
                      <p className="text-blue-700 text-xs leading-relaxed">
                        Both methods use decentralized identity - no passwords, no personal data stored on our servers, complete control over your digital identity.
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Footer */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-center mt-6"
                >
                  <p className="text-xs text-slate-500">
                    Don't have an identity yet? 
                    <button className="text-blue-600 hover:text-blue-700 font-medium ml-1 transition-colors">
                      Learn more about Web3 identity
                    </button>
                  </p>
                </motion.div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}