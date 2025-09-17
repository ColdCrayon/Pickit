import React from 'react';

const About = () => {
  return (
    <section className="min-h-screen py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-12 border border-white/10">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-8 tracking-tight">
            About Pickit
          </h1>
          <div className="space-y-6 text-gray-300 leading-relaxed">
            <p className="text-xl font-light">
              Welcome to Pickit! We are your premier destination for advanced sports betting solutions and analytics.
            </p>
            <p className="text-lg">
              Our platform combines cutting-edge technology with expert insights to provide you with the tools you need to make informed betting decisions across all major sports leagues including MLB, NFL, NBA, and NHL.
            </p>
            <div className="grid md:grid-cols-2 gap-8 mt-12">
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-4">Our Mission</h3>
                <p>To democratize professional-grade sports analytics and provide every bettor with the insights they need to succeed.</p>
              </div>
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold text-white mb-4">Our Vision</h3>
                <p>To become the most trusted platform for sports betting intelligence and community-driven insights.</p>
              </div>
            </div>
            <div className="mt-12">
              <h3 className="text-2xl font-semibold text-white mb-6">What We Offer</h3>
              <ul className="space-y-3 text-lg">
                <li>• Real-time analytics and data streams</li>
                <li>• AI-powered predictions and insights</li>
                <li>• Comprehensive multi-sport coverage</li>
                <li>• Advanced risk management tools</li>
                <li>• Expert community and shared strategies</li>
                <li>• Live notifications and alerts</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;