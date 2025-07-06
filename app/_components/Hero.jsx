import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Shield, Zap, BarChart3 } from "lucide-react";
import Link from "next/link";

function Hero() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            {/* Main Heading */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
              Manage your Money with{" "}
              <span className="text-blue-600 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                AI-Driven
              </span>
              <br className="hidden sm:block" />
              Personal{" "}
              <span className="text-blue-800 font-extrabold">
                Finance Advisor
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Take control of your financial future with intelligent budgeting,
              expense tracking, and personalized AI insights.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link href="/dashboard">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" size="lg" className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg rounded-full">
                  View Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose CashTrack?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to simplify your financial management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-6 rounded-2xl bg-blue-50 hover:bg-blue-100 transition-colors duration-300">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Analytics</h3>
              <p className="text-gray-600">
                Get intelligent insights into your spending patterns and financial trends
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-6 rounded-2xl bg-green-50 hover:bg-green-100 transition-colors duration-300">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure & Private</h3>
              <p className="text-gray-600">
                Bank-level security ensures your financial data is always protected
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-6 rounded-2xl bg-purple-50 hover:bg-purple-100 transition-colors duration-300">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Powered</h3>
              <p className="text-gray-600">
                Personalized recommendations and automated financial insights
              </p>
            </div>

            {/* Feature 4 */}
            <div className="text-center p-6 rounded-2xl bg-orange-50 hover:bg-orange-100 transition-colors duration-300">
              <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy Budgeting</h3>
              <p className="text-gray-600">
                Create and manage budgets with intuitive tools and real-time tracking
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 md:py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
              How CashTrack Works
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              Get started in minutes with our simple 3-step process
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {/* Step 1 */}
            <div className="text-center px-4">
              <div className="relative mb-6">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-white font-bold text-xl md:text-2xl">1</span>
                </div>
                <div className="hidden md:block absolute top-8 md:top-10 left-full w-full h-0.5 bg-blue-200 -translate-y-1/2"></div>
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3">Sign Up & Connect</h3>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                Create your account and securely connect your financial accounts in seconds
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center px-4">
              <div className="relative mb-6">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-white font-bold text-xl md:text-2xl">2</span>
                </div>
                <div className="hidden md:block absolute top-8 md:top-10 left-full w-full h-0.5 bg-green-200 -translate-y-1/2"></div>
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3">Set Your Goals</h3>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                Define your budgets, savings goals, and financial objectives with our intuitive tools
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center px-4">
              <div className="relative mb-6">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-white font-bold text-xl md:text-2xl">3</span>
                </div>
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3">Get AI Insights</h3>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                Receive personalized recommendations and track your progress toward financial freedom
              </p>
            </div>
          </div>
        </div>
      </section>
    


      {/* FAQ Section */}
      <section className="py-12 md:py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg md:text-xl text-gray-600 px-4">
              Everything you need to know about CashTrack
            </p>
          </div>

          <div className="space-y-4 md:space-y-6">
            {/* FAQ 1 */}
            <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2 md:mb-3">
                Is my financial data secure with CashTrack?
              </h3>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                Absolutely! We use bank-level encryption and security measures to protect your data. Your information is never shared with third parties and is stored securely in compliance with industry standards.
              </p>
            </div>

            {/* FAQ 2 */}
            <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2 md:mb-3">
                How does the AI-powered advice work?
              </h3>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                Our AI analyzes your spending patterns, income, and financial goals to provide personalized recommendations. It learns from your behavior and suggests actionable steps to improve your financial health.
              </p>
            </div>

            {/* FAQ 3 */}
            <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2 md:mb-3">
                Can I connect multiple bank accounts?
              </h3>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                Yes! CashTrack supports multiple bank accounts, credit cards, and financial institutions. You can get a complete view of your finances in one place.
              </p>
            </div>

            {/* FAQ 4 */}
            <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2 md:mb-3">
                Is CashTrack free to use?
              </h3>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                CashTrack offers a free tier with essential features. Premium plans are available for advanced analytics, unlimited budgets, and priority support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Finances?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of users who have taken control of their financial future with CashTrack
          </p>
          <Link href="/dashboard">
            <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
              Start Your Journey Today
            </Button>
          </Link>
        </div>
      </section>

      
    </div>
  );
}

export default Hero;
