import React, { useState } from 'react';
import { Menu, X, User, Crown, Home, FileText, Shield, TrendingUp, BarChart3, Users, Zap, Target, Award } from 'lucide-react';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.85)), url('https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop')`
        }}
      />

      {/* Top Navigation */}
      <nav className="relative z-50 bg-gray-800/90 backdrop-blur-xl border-b border-gray-700/30">
        <div className="w-full px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-4">
              <button 
                className="lg:hidden p-2 text-gray-300 hover:text-white transition-colors duration-200 rounded-lg hover:bg-gray-700/50"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <span className="text-2xl font-bold tracking-tight">PICKIT</span>
              </div>
            </div>

            {/* Center Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-gray-300 hover:text-white transition-all duration-200 text-lg font-medium tracking-wide hover:scale-105">MLB</a>
              <a href="#" className="text-gray-300 hover:text-white transition-all duration-200 text-lg font-medium tracking-wide hover:scale-105">NFL</a>
              <a href="#" className="text-gray-300 hover:text-white transition-all duration-200 text-lg font-medium tracking-wide hover:scale-105">NBA</a>
              <a href="#" className="text-gray-300 hover:text-white transition-all duration-200 text-lg font-medium tracking-wide hover:scale-105">NHL</a>
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-3">
              <button className="hidden sm:inline-flex items-center px-6 py-2.5 bg-yellow-500/90 backdrop-blur-md text-gray-900 text-sm font-bold rounded-xl hover:bg-yellow-400 transition-all duration-200 shadow-lg hover:shadow-xl tracking-wide hover:scale-105">
                UPGRADE
              </button>
              <button className="hidden sm:inline-flex items-center px-6 py-2.5 bg-gray-700/80 backdrop-blur-md text-white text-sm font-bold rounded-xl hover:bg-gray-600/80 transition-all duration-200 tracking-wide hover:scale-105">
                ACCOUNT
              </button>
              <button className="p-2.5 bg-gray-700/80 backdrop-blur-md rounded-xl hover:bg-gray-600/80 transition-all duration-200 hover:scale-105">
                <User className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-40 w-64 h-full bg-blue-800/95 backdrop-blur-xl border-r border-blue-700/30 transform transition-all duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="pt-20 px-6">
          <nav className="space-y-4">
            <a href="#" className="flex items-center space-x-3 text-white hover:text-blue-200 transition-all duration-200 text-lg font-medium py-3 px-4 rounded-xl hover:bg-white/10 hover:scale-105">
              <Home className="w-5 h-5" />
              <span>Home</span>
            </a>
            <a href="#" className="flex items-center space-x-3 text-white hover:text-blue-200 transition-all duration-200 text-lg font-medium py-3 px-4 rounded-xl hover:bg-white/10 hover:scale-105">
              <FileText className="w-5 h-5" />
              <span>Terms of Service</span>
            </a>
            <a href="#" className="flex items-center space-x-3 text-white hover:text-blue-200 transition-all duration-200 text-lg font-medium py-3 px-4 rounded-xl hover:bg-white/10 hover:scale-105">
              <Shield className="w-5 h-5" />
              <span>Privacy Policy</span>
            </a>
          </nav>
        </div>
      </aside>

      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="relative z-10 lg:ml-64">
        {/* Hero Section - Centered Text */}
        <section className="min-h-screen flex items-center justify-center px-6">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold mb-8 leading-tight tracking-tight">
              Pickit:
              <br />
              <span className="text-gray-200">
                Betting Solutions
              </span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
              Advanced analytics and expert insights to elevate your sports betting strategy
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <button className="px-8 py-4 bg-white/10 backdrop-blur-md text-white text-lg font-semibold rounded-2xl hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl min-w-[200px] border border-white/20 hover:scale-105">
                Get Started
              </button>
              <button className="px-8 py-4 border-2 border-white/30 text-white text-lg font-semibold rounded-2xl hover:bg-white hover:text-gray-900 transition-all duration-300 min-w-[200px] backdrop-blur-md hover:scale-105">
                Learn More
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
                Why Choose Pickit?
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto font-light leading-relaxed">
                Professional-grade tools designed for serious sports bettors
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: "Real-time Analytics",
                  description: "Live data streams and instant performance metrics across all major leagues.",
                  icon: <BarChart3 className="w-8 h-8" />
                },
                {
                  title: "AI Predictions",
                  description: "Machine learning algorithms trained on years of historical sports data.",
                  icon: <TrendingUp className="w-8 h-8" />
                },
                {
                  title: "Multi-Sport Coverage",
                  description: "Comprehensive analysis for MLB, NFL, NBA, and NHL with specialized insights.",
                  icon: <Award className="w-8 h-8" />
                },
                {
                  title: "Risk Management",
                  description: "Smart bankroll tools and risk assessment to protect your investments.",
                  icon: <Shield className="w-8 h-8" />
                },
                {
                  title: "Live Notifications",
                  description: "Instant alerts on market movements and betting opportunities.",
                  icon: <Zap className="w-8 h-8" />
                },
                {
                  title: "Expert Community",
                  description: "Connect with professional bettors and share winning strategies.",
                  icon: <Users className="w-8 h-8" />
                }
              ].map((feature, index) => (
                <div key={index} className="group bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                  <div className="text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4 tracking-tight">{feature.title}</h3>
                  <p className="text-gray-300 leading-relaxed font-light">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-12 border border-white/10">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
                Ready to Win Smarter?
              </h2>
              <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
                Join thousands of successful bettors who trust Pickit for their sports betting insights.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <button className="px-10 py-4 bg-yellow-500/90 backdrop-blur-md text-gray-900 text-lg font-semibold rounded-2xl hover:bg-yellow-400 transition-all duration-300 shadow-lg hover:shadow-xl min-w-[220px] hover:scale-105">
                  Start Free Trial
                </button>
                <p className="text-sm text-gray-400 font-light">No credit card required</p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-6 border-t border-white/10">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                  <span className="text-white font-bold text-xs">P</span>
                </div>
                <span className="text-xl font-bold tracking-tight">PICKIT</span>
              </div>
              <div className="flex space-x-8">
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 font-light">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 font-light">Terms of Service</a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200 font-light">Support</a>
              </div>
              <p className="text-gray-400 text-sm font-light">© 2024 Pickit. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default App;