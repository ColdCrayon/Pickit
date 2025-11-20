import React from "react";
import { Footer } from "..";

interface ContentPageLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "5xl";
}

const maxWidthClasses = {
  sm: "max-w-2xl",
  md: "max-w-3xl",
  lg: "max-w-4xl",
  xl: "max-w-5xl",
  "2xl": "max-w-6xl",
  "5xl": "max-w-5xl",
};

const ContentPageLayout: React.FC<ContentPageLayoutProps> = ({
  children,
  title,
  subtitle,
  showLogo = false,
  maxWidth = "5xl",
}) => {
  const logo = "/logo.png";

  return (
    <div className="min-h-screen bg-transparent text-white relative overflow-hidden">
      {/* Background - Removed to use global Liquid Metal theme */}
      {/* <div className="absolute inset-0 bg-cover bg-center pointer-events-none" /> */}

      {/* Main Content */}
      <main className={`relative z-10 ${maxWidthClasses[maxWidth]} mx-auto py-28 px-6`}>
        {/* Header */}
        {(title || showLogo) && (
          <div className="flex flex-col items-center mb-16 text-center">
            {showLogo && (
              <img
                src={logo}
                alt="PickIt Logo"
                className="w-16 h-16 mb-4 rounded-full border border-white/20"
              />
            )}
            {title && <h1 className="text-5xl font-bold">{title}</h1>}
            {subtitle && (
              <p className="text-gray-400 mt-2 text-lg">{subtitle}</p>
            )}
          </div>
        )}

        {/* Page Content */}
        {children}
      </main>

      <Footer />
    </div>
  );
};

export default ContentPageLayout;

