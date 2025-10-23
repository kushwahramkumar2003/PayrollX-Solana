"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  Shield,
  Zap,
  FileText,
  Star,
  Users,
  TrendingUp,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      {/* Navigation */}
      <header className="container mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
            PayrollX-Solana
          </span>
        </div>
        <div className="flex space-x-4">
          <Button
            variant="ghost"
            className="text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
            onClick={() => (window.location.href = "/login")}
          >
            Login
          </Button>
          <Button
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-purple-500/25 transition-all duration-200"
            onClick={() => (window.location.href = "/register")}
          >
            Get Started
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="container mx-auto px-6 py-20 text-center"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="inline-flex items-center px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm font-medium mb-8"
        >
          <Star className="w-4 h-4 mr-2" />
          Trusted by 500+ Enterprises
        </motion.div>

        <h1 className="text-6xl md:text-8xl font-bold text-white mb-8 leading-tight">
          Reimagine Payroll on{" "}
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
            Solana
          </span>
        </h1>

        <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
          Instant, secure, and transparent payroll disbursements using
          blockchain technology. MPC wallets ensure enterprise-grade security
          without the banking delays.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
          <Button
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white text-lg px-10 py-4 rounded-xl shadow-xl hover:shadow-purple-500/25 transition-all duration-200 group"
            onClick={() => (window.location.href = "/register")}
          >
            Start Free Trial
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-white/20 text-white text-lg px-10 py-4 rounded-xl hover:bg-white/10 hover:border-white/30 transition-all duration-200"
            onClick={() => (window.location.href = "/login")}
          >
            Sign In
          </Button>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-20"
        >
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">5s</div>
            <div className="text-gray-400">Average Settlement Time</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">99.9%</div>
            <div className="text-gray-400">Uptime Guarantee</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">$2B+</div>
            <div className="text-gray-400">Processed Volume</div>
          </div>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="grid md:grid-cols-3 gap-8 mt-20"
        >
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:border-purple-500/30 transition-all duration-300 h-full">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-white text-xl">
                  Enterprise Security
                </CardTitle>
                <CardDescription className="text-gray-300 leading-relaxed">
                  MPC wallets and distributed key shares ensure no single point
                  of failure. Bank-grade encryption with zero-knowledge proofs.
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:border-purple-500/30 transition-all duration-300 h-full">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-white text-xl">
                  Instant Settlement
                </CardTitle>
                <CardDescription className="text-gray-300 leading-relaxed">
                  Solana's high-throughput enables payroll execution in under 5
                  seconds. No more waiting for bank processing delays.
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:border-purple-500/30 transition-all duration-300 h-full">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-white text-xl">
                  Full Compliance
                </CardTitle>
                <CardDescription className="text-gray-300 leading-relaxed">
                  Immutable audit trails and automated KYC for regulatory
                  adherence. Built-in compliance reporting and monitoring.
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* Enterprise Section */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="container mx-auto px-6 py-20"
      >
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-6">
            Trusted by Leading Enterprises
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Join hundreds of companies already using PayrollX-Solana for their
            payroll needs
          </p>
        </div>

        <div className="flex justify-center items-center space-x-16 opacity-60">
          <div className="h-12 w-40 bg-gradient-to-r from-white/10 to-white/5 rounded-lg flex items-center justify-center backdrop-blur-sm">
            <span className="text-white font-semibold">TechCorp</span>
          </div>
          <div className="h-12 w-40 bg-gradient-to-r from-white/10 to-white/5 rounded-lg flex items-center justify-center backdrop-blur-sm">
            <span className="text-white font-semibold">FinanceCo</span>
          </div>
          <div className="h-12 w-40 bg-gradient-to-r from-white/10 to-white/5 rounded-lg flex items-center justify-center backdrop-blur-sm">
            <span className="text-white font-semibold">GlobalInc</span>
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="container mx-auto px-6 py-20"
      >
        <div className="bg-gradient-to-r from-purple-600/20 to-purple-800/20 rounded-3xl p-12 text-center border border-purple-500/20 backdrop-blur-sm">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Payroll?
          </h2>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            Join the future of payroll processing. Start your free trial today
            and experience the power of blockchain-based payroll disbursements.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white text-lg px-8 py-4 rounded-xl shadow-xl hover:shadow-purple-500/25 transition-all duration-200"
            >
              Start Free Trial
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white/20 text-white text-lg px-8 py-4 rounded-xl hover:bg-white/10 hover:border-white/30 transition-all duration-200"
            >
              Schedule Demo
            </Button>
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="bg-black/50 py-12 border-t border-white/10 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold text-white">
                  PayrollX-Solana
                </span>
              </div>
              <p className="text-gray-400 text-sm">
                The future of payroll processing on the blockchain.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Security
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    API
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Status
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Community
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2025 PayrollX-Solana. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
