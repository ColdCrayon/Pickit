import React from 'react';
import { BarChart3, TrendingUp, Award, Shield, Zap, Users } from 'lucide-react';

const Home = () => {
  return (
    <>
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
    </>
  );
};

export default Home;