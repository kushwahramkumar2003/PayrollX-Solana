"use client";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, Building2, TrendingUp, Clock, CheckCircle } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-300">
          Welcome back! Here's what's happening with your payroll system.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
        >
          <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:border-purple-500/30 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Total Payroll</CardTitle>
              <DollarSign className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">$45,231.89</div>
              <p className="text-xs text-green-400">
                +20.1% from last month
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:border-purple-500/30 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Employees</CardTitle>
              <Users className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">+2,350</div>
              <p className="text-xs text-green-400">
                +180.1% from last month
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:border-purple-500/30 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Organizations</CardTitle>
              <Building2 className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">+12,234</div>
              <p className="text-xs text-green-400">
                +19% from last month
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:border-purple-500/30 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Growth</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">+573</div>
              <p className="text-xs text-green-400">
                +201 since last hour
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Recent Transactions</CardTitle>
              <CardDescription className="text-gray-300">
                Latest payroll transactions processed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-3" />
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none text-white">John Doe</p>
                    <p className="text-sm text-gray-400">
                      $3,500.00 - Software Engineer
                    </p>
                  </div>
                  <div className="ml-auto font-medium text-gray-400 text-sm">2 hours ago</div>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-3" />
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none text-white">Jane Smith</p>
                    <p className="text-sm text-gray-400">
                      $4,200.00 - Product Manager
                    </p>
                  </div>
                  <div className="ml-auto font-medium text-gray-400 text-sm">4 hours ago</div>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-3" />
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none text-white">Mike Johnson</p>
                    <p className="text-sm text-gray-400">
                      $2,800.00 - Designer
                    </p>
                  </div>
                  <div className="ml-auto font-medium text-gray-400 text-sm">6 hours ago</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Upcoming Payroll</CardTitle>
              <CardDescription className="text-gray-300">
                Scheduled payroll runs for this week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-yellow-400 mr-3" />
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none text-white">Weekly Payroll</p>
                    <p className="text-sm text-gray-400">
                      45 employees - $125,000.00
                    </p>
                  </div>
                  <div className="ml-auto font-medium text-gray-400 text-sm">Tomorrow</div>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-yellow-400 mr-3" />
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none text-white">Monthly Bonus</p>
                    <p className="text-sm text-gray-400">
                      120 employees - $45,000.00
                    </p>
                  </div>
                  <div className="ml-auto font-medium text-gray-400 text-sm">Friday</div>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-yellow-400 mr-3" />
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none text-white">Contractor Payments</p>
                    <p className="text-sm text-gray-400">
                      15 contractors - $18,500.00
                    </p>
                  </div>
                  <div className="ml-auto font-medium text-gray-400 text-sm">Next Monday</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
