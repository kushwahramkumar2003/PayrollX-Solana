import { Button } from "@payrollx/ui";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@payrollx/ui";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Wallet } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <header className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Wallet className="h-12 w-12 text-blue-600 dark:text-blue-400 mr-3" />
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white">
              PayrollX
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Decentralized payroll management on Solana blockchain. Secure,
            transparent, and efficient payroll processing for the future of
            work.
          </p>
        </header>

        {/* Wallet Connection */}
        <div className="flex justify-center mb-16">
          <WalletMultiButton className="!bg-blue-600 hover:!bg-blue-700 !rounded-lg !px-6 !py-3 !text-white !font-semibold" />
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-green-600 dark:text-green-400 text-sm font-bold">
                    $
                  </span>
                </div>
                Multi-Token Support
              </CardTitle>
              <CardDescription>
                Pay employees in SOL, USDC, or any SPL token with automatic
                conversions
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-blue-600 dark:text-blue-400 text-sm font-bold">
                    🔒
                  </span>
                </div>
                MPC Security
              </CardTitle>
              <CardDescription>
                Threshold signature technology ensures secure, decentralized key
                management
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-purple-600 dark:text-purple-400 text-sm font-bold">
                    ⚡
                  </span>
                </div>
                Instant Payments
              </CardTitle>
              <CardDescription>
                Lightning-fast transactions on Solana with sub-second
                confirmation times
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-orange-600 dark:text-orange-400 text-sm font-bold">
                    📊
                  </span>
                </div>
                Real-time Analytics
              </CardTitle>
              <CardDescription>
                Comprehensive dashboards and reporting for payroll management
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-red-600 dark:text-red-400 text-sm font-bold">
                    🛡️
                  </span>
                </div>
                Compliance Ready
              </CardTitle>
              <CardDescription>
                Built-in audit trails and compliance features for regulatory
                requirements
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-indigo-600 dark:text-indigo-400 text-sm font-bold">
                    🔗
                  </span>
                </div>
                API Integration
              </CardTitle>
              <CardDescription>
                RESTful APIs and webhooks for seamless integration with existing
                systems
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to revolutionize your payroll?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Connect your wallet and start managing payroll on the blockchain
            today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Get Started
            </Button>
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
