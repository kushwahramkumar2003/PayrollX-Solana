// import { Button } from "@payrollx/ui";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@payrollx/ui";
// import { WalletConnectionButton } from "../components/wallet/WalletConnectionButton";
// import { WalletInfo } from "../components/wallet/WalletInfo";
// import { Wallet } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <header className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <span className="h-12 w-12 text-blue-600 mr-3 text-4xl">💰</span>
            <h1 className="text-5xl font-bold text-gray-900">PayrollX</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Decentralized payroll management on Solana blockchain. Secure,
            transparent, and efficient payroll processing for the future of
            work.
          </p>
        </header>

        {/* Wallet Connection */}
        <div className="flex justify-center mb-16">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg">
            Connect Wallet
          </button>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-green-600 text-sm font-bold">$</span>
              </div>
              <h3 className="text-lg font-semibold">Multi-Token Support</h3>
            </div>
            <p className="text-gray-600">
              Pay employees in SOL, USDC, or any SPL token with automatic
              conversions
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-blue-600 text-sm font-bold">🔒</span>
              </div>
              <h3 className="text-lg font-semibold">MPC Security</h3>
            </div>
            <p className="text-gray-600">
              Threshold signature technology ensures secure, decentralized key
              management
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-purple-600 text-sm font-bold">⚡</span>
              </div>
              <h3 className="text-lg font-semibold">Instant Payments</h3>
            </div>
            <p className="text-gray-600">
              Lightning-fast transactions on Solana with sub-second confirmation
              times
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-orange-600 text-sm font-bold">📊</span>
              </div>
              <h3 className="text-lg font-semibold">Real-time Analytics</h3>
            </div>
            <p className="text-gray-600">
              Comprehensive dashboards and reporting for payroll management
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-red-600 text-sm font-bold">🛡️</span>
              </div>
              <h3 className="text-lg font-semibold">Compliance Ready</h3>
            </div>
            <p className="text-gray-600">
              Built-in audit trails and compliance features for regulatory
              requirements
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                <span className="text-indigo-600 text-sm font-bold">🔗</span>
              </div>
              <h3 className="text-lg font-semibold">API Integration</h3>
            </div>
            <p className="text-gray-600">
              RESTful APIs and webhooks for seamless integration with existing
              systems
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to revolutionize your payroll?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Connect your wallet and start managing payroll on the blockchain
            today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg">
              Get Started
            </button>
            <button className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold px-6 py-3 rounded-lg">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
