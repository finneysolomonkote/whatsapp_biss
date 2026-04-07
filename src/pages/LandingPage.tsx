import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import {
  MessageSquare,
  Zap,
  Users,
  Send,
  Calendar,
  BarChart3,
  CheckCircle,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Shield,
  Globe,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const features = [
    {
      icon: MessageSquare,
      title: 'Unified Inbox',
      description: 'Manage all your WhatsApp conversations in one powerful inbox',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Zap,
      title: 'Smart Automation',
      description: 'Create intelligent workflows to respond instantly to your customers',
      color: 'from-amber-500 to-orange-500',
    },
    {
      icon: Users,
      title: 'CRM & Contacts',
      description: 'Build and manage your customer database with powerful segmentation',
      color: 'from-emerald-500 to-teal-500',
    },
    {
      icon: Send,
      title: 'Broadcast Campaigns',
      description: 'Send targeted messages to segments of your audience',
      color: 'from-blue-500 to-sky-500',
    },
    {
      icon: Calendar,
      title: 'Appointment Booking',
      description: 'Let customers book appointments directly through WhatsApp',
      color: 'from-cyan-500 to-blue-500',
    },
    {
      icon: BarChart3,
      title: 'Analytics & Insights',
      description: 'Track performance and optimize your customer engagement',
      color: 'from-teal-500 to-emerald-500',
    },
  ];

  const benefits = [
    'Automate customer responses 24/7',
    'Reduce response time by 90%',
    'Increase customer satisfaction',
    'Scale your business operations',
    'Track and measure everything',
    'Enterprise-grade security',
  ];

  const stats = [
    { value: '50K+', label: 'Messages Sent Daily' },
    { value: '2K+', label: 'Active Businesses' },
    { value: '98%', label: 'Customer Satisfaction' },
    { value: '24/7', label: 'Support Available' },
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      <header className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-2 rounded-xl shadow-glow">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                WhatsApp Business Hub
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost" className="text-gray-300 hover:text-white">Sign In</Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-glow">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="relative pt-32 pb-20 overflow-hidden gradient-mesh">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDU5LDEzMCwyNDYsMC4xKSIvPjwvZz48L3N2Zz4=')] opacity-40" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full glass-card mb-8 animate-float">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-medium text-gray-300">Trusted by 2,000+ businesses worldwide</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-black mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent">
                Automate Your
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                WhatsApp Business
              </span>
            </h1>
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              The all-in-one platform to manage conversations, automate responses, run campaigns,
              and scale your business on WhatsApp
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup">
                <Button size="lg" className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-glow text-lg px-8 group">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8 border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-gray-600">
                Watch Demo
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-6">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full glass-card mb-6">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium text-gray-300">Powerful Features</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Powerful features designed for modern businesses
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group glass-card p-8 rounded-2xl hover:shadow-glow transition-all duration-300 hover:-translate-y-2"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full glass-card mb-6">
                <Globe className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-gray-300">Built for Global Scale</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Built for Businesses in India and Beyond
              </h2>
              <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                Join thousands of businesses using WhatsApp Business Hub to automate customer
                communication, capture leads, and drive growth.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3 group">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-300 text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-card p-10 rounded-3xl shadow-glow">
              <h3 className="text-3xl font-bold text-white mb-4">Ready to get started?</h3>
              <p className="text-gray-400 mb-8 text-lg">
                Create your account and start automating your WhatsApp business today
              </p>
              <div className="space-y-6 mb-8">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">1</span>
                  </div>
                  <span className="text-gray-300 text-lg">Sign up in 30 seconds</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">2</span>
                  </div>
                  <span className="text-gray-300 text-lg">Connect your WhatsApp Business</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">3</span>
                  </div>
                  <span className="text-gray-300 text-lg">Start automating conversations</span>
                </div>
              </div>
              <Link to="/signup">
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-glow"
                >
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full glass-card mb-6">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium text-gray-300">Simple Pricing</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Pricing That Scales With You
            </h2>
            <p className="text-xl text-gray-400">
              Start free and upgrade as you grow
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="glass-card p-8 rounded-2xl hover:shadow-glow transition-all">
              <h3 className="text-2xl font-bold text-white mb-2">Starter</h3>
              <p className="text-gray-400 mb-6">Perfect for small businesses</p>
              <div className="mb-8">
                <span className="text-5xl font-bold text-white">₹999</span>
                <span className="text-gray-400 text-lg">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                  10,000 messages/month
                </li>
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                  Unlimited contacts
                </li>
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                  Basic automation
                </li>
              </ul>
              <Button variant="outline" className="w-full border-gray-700 text-gray-300 hover:bg-gray-800">
                Start Trial
              </Button>
            </div>

            <div className="glass-card p-8 rounded-2xl relative overflow-hidden shadow-glow-cyan hover:shadow-glow transition-all">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-glow">
                  Popular
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 mt-4">Growth</h3>
              <p className="text-gray-400 mb-6">For growing businesses</p>
              <div className="mb-8">
                <span className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">₹2,999</span>
                <span className="text-gray-400 text-lg">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                  50,000 messages/month
                </li>
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                  Advanced automation
                </li>
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                  Priority support
                </li>
              </ul>
              <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white">
                Start Trial
              </Button>
            </div>

            <div className="glass-card p-8 rounded-2xl hover:shadow-glow transition-all">
              <h3 className="text-2xl font-bold text-white mb-2">Enterprise</h3>
              <p className="text-gray-400 mb-6">For large organizations</p>
              <div className="mb-8">
                <span className="text-5xl font-bold text-white">Custom</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                  Unlimited messages
                </li>
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                  Dedicated support
                </li>
                <li className="flex items-center text-gray-300">
                  <CheckCircle className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                  Custom integrations
                </li>
              </ul>
              <Button variant="outline" className="w-full border-gray-700 text-gray-300 hover:bg-gray-800">
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900/80 border-t border-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-2 rounded-xl">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-white">WhatsApp Business Hub</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Automate your WhatsApp business and scale customer engagement
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Product</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="hover:text-cyan-400 transition-colors cursor-pointer">Features</li>
                <li className="hover:text-cyan-400 transition-colors cursor-pointer">Pricing</li>
                <li className="hover:text-cyan-400 transition-colors cursor-pointer">Demo</li>
                <li className="hover:text-cyan-400 transition-colors cursor-pointer">API</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Company</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="hover:text-cyan-400 transition-colors cursor-pointer">About</li>
                <li className="hover:text-cyan-400 transition-colors cursor-pointer">Blog</li>
                <li className="hover:text-cyan-400 transition-colors cursor-pointer">Careers</li>
                <li className="hover:text-cyan-400 transition-colors cursor-pointer">Contact</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="hover:text-cyan-400 transition-colors cursor-pointer">Privacy Policy</li>
                <li className="hover:text-cyan-400 transition-colors cursor-pointer">Terms of Service</li>
                <li className="hover:text-cyan-400 transition-colors cursor-pointer">Security</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">&copy; 2024 WhatsApp Business Hub. All rights reserved.</p>
            <div className="flex items-center space-x-2 mt-4 md:mt-0">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span className="text-sm text-gray-500">Enterprise-grade security</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
