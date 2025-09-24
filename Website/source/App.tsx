import React, { useState } from 'react';
import { Menu, User, Home, FileText, Shield, TrendingUp, BarChart3, Users, Zap, Award, X as CloseIcon } from 'lucide-react';
import logo from '/Users/johnkafumbe/Desktop/Pickit/Website/public/logo.png';


function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.75), rgba(0,0,0,0.85)), url('Background.jpeg')` }}
      />

      {/* Navbar */}
      <nav className="relative z-50 bg-gray-800/90 backdrop-blur-xl border-b border-gray-700/30">
        <div className="w-full px-6 flex items-center h-16 justify-between">
          {/* Left Group: Brand + Links */}
          <div className="flex items-center space-x-6">
            {/* Toggle Button */}
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2">
              {isSidebarOpen ? (
                <CloseIcon className="w-6 h-6 text-white" />
              ) : (
                <div className="flex flex-col space-y-1.5">
                  <span className="block w-6 h-0.5 bg-white"></span>
                  <span className="block w-6 h-0.5 bg-white"></span>
                  <span className="block w-6 h-0.5 bg-white"></span>
                </div>
              )}
            </button>
            <div className="flex items-center space-x-2">
              <img src={logo} alt="PickIt Logo" className="w-10 h-10 rounded-full border border-white/20" />
              <span className="text-2xl font-bold">PickIt</span>
            </div>
            {/* Center Links moved closer to brand */}
            <div className="hidden md:flex space-x-6 ml-6">
              {['MLB','NFL','NBA','NHL'].map(sport => (
                <a href="#" className="text-gray-300 hover:text-white transition">{sport}</a>
              ))}
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center space-x-3">
            <button className="hidden sm:inline-flex px-6 py-2.5 bg-yellow-500/90 text-gray-900 font-bold rounded-xl hover:bg-yellow-400">UPGRADE</button>
            <button className="hidden sm:inline-flex px-6 py-2.5 bg-gray-700/80 text-white font-bold rounded-xl hover:bg-gray-600/80">ACCOUNT</button>
            <button className="p-2.5 bg-gray-700/80 rounded-xl hover:bg-gray-600/80">
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-40 w-64 h-full bg-blue-800/95 backdrop-blur-xl transform transition-transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="pt-20 px-6">
          <nav className="space-y-4">
            <a href="#" className="flex items-center space-x-3 py-3 px-4 rounded-xl hover:bg-white/10">
              <Home className="w-5 h-5" /> <span>Home</span>
            </a>
            <a href="#" className="flex items-center space-x-3 py-3 px-4 rounded-xl hover:bg-white/10">
              <FileText className="w-5 h-5" /> <span>Terms of Service</span>
            </a>
            <a href="#" className="flex items-center space-x-3 py-3 px-4 rounded-xl hover:bg-white/10">
              <Shield className="w-5 h-5" /> <span>Privacy Policy</span>
            </a>
          </nav>
        </div>
      </aside>

      {isSidebarOpen && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}

      {/* Main Content */}
       <main className={`relative z-10 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : ''}`}>
        {/* Hero */}
        <section className="min-h-screen flex items-center justify-center px-6 text-center">
          <div className="w-full">
            <h1 className="text-6xl font-bold mb-8">Pickit<br/><span className="text-gray-200">Betting Solutions</span></h1>
            <p className="text-xl text-gray-300 mb-12">Advanced analytics and expert insights to elevate your sports betting strategy</p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button className="px-8 py-4 bg-white/10 text-white font-semibold rounded-2xl hover:bg-white/20">Get Started</button>
              <button className="px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-2xl hover:bg-white hover:text-gray-900">Learn More</button>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-10 px-6 w-full">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-6">Why Choose Pickit?</h2>
            <p className="text-xl text-gray-300">Professional-grade tools designed for serious sports bettors</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "Real-time Analytics", desc: "Live data streams and instant performance metrics.", icon: <BarChart3 className="w-8 h-8"/> },
              { title: "AI Predictions", desc: "Machine learning algorithms trained on years of data.", icon: <TrendingUp className="w-8 h-8"/> },
              { title: "Multi-Sport Coverage", desc: "Analysis for MLB, NFL, NBA, NHL.", icon: <Award className="w-8 h-8"/> },
              { title: "Risk Management", desc: "Smart bankroll tools and risk assessment.", icon: <Shield className="w-8 h-8"/> },
              { title: "Live Notifications", desc: "Instant alerts on betting opportunities.", icon: <Zap className="w-8 h-8"/> },
              { title: "Expert Community", desc: "Connect with professional bettors.", icon: <Users className="w-8 h-8"/> }
            ].map((f, i) => (
              <div key={i} className="bg-white/5 p-8 rounded-3xl hover:bg-white/10 transition">
                <div className="mb-6">{f.icon}</div>
                <h3 className="text-xl font-semibold mb-4">{f.title}</h3>
                <p className="text-gray-300">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-6 t w-full text-center">
          <div className="bg-white/5 p-12 rounded-3xl max-w-4xl mx-auto">
            <h2 className="text-5xl font-bold mb-6">Ready to Win Smarter?</h2>
            <p className="text-xl text-gray-300 mb-12">Join thousands of successful bettors who trust Pickit.</p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button className="px-10 py-4 bg-yellow-500/90 text-gray-900 font-semibold rounded-2xl hover:bg-yellow-400">Start Free Trial</button>
              <p className="text-sm text-gray-400">No credit card required</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-6 border-t border-white/10 w-full text-center md:text-left">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-6 md:mb-0">
              <div className="flex items-center space-x-2">
              <img src={logo} alt="PickIt Logo" className="w-10 h-10 rounded-full border border-white/20" />
              </div>
              <span className="text-xl font-bold">PickIt</span>
            </div>
            <div className="flex space-x-8 mb-6 md:mb-0">
              <a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white">Support</a>
            </div>
            <p className="text-gray-400 text-sm">© 2025 Pickit. All rights reserved.</p>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default App;