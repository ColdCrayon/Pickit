import React from "react";
import { Link } from "react-router-dom";

const logo = "/logo.png";

const Footer: React.FC = () => {
  return (
    <footer className="relative z-10 py-4 px-6 border-t border-white/10 w-full text-center md:text-left">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center space-x-3 mb-6 md:mb-0">
          <div className="flex items-center space-x-2">
            <img
              src={logo}
              alt="PickIt Logo"
              className="w-10 h-10 rounded-full border border-white/20"
            />
          </div>
          <span className="text-xl font-bold">PickIt</span>
        </div>
        <div className="flex space-x-8 mb-4 md:mb-0 justify-center mx-auto">
          <Link to="/privacy" className="text-gray-400 hover:text-white">
            Privacy Policy
          </Link>
          <Link to="/termsofservice" className="text-gray-400 hover:text-white">
            Terms of Service
          </Link>
          <Link to="/Support" className="text-gray-400 hover:text-white">
            Support
          </Link>
        </div>
        <p className="text-gray-400 text-sm">
          © 2025 PickIt. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
