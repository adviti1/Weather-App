
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SkyCast Pro - Precision Weather Dashboard",
  description: "A high-performance weather forecasting application featuring real-time data, 5-day forecasts, and geolocation.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <style>{`
          body {
            font-family: 'Inter', sans-serif;
            transition: background-color 0.3s ease, color 0.3s ease;
          }
          .weather-gradient-clear { background: linear-gradient(to bottom, #4facfe 0%, #00f2fe 100%); }
          .weather-gradient-cloudy { background: linear-gradient(to bottom, #8989ba 0%, #a7a6cb 100%); }
          .weather-gradient-rainy { background: linear-gradient(to bottom, #373b44 0%, #4286f4 100%); }
          .weather-gradient-snow { background: linear-gradient(to bottom, #e6e9f0 0%, #eef1f5 100%); }
          .glass-morphism {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          .dark .glass-morphism {
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
        `}</style>
      </head>
      <body className="bg-slate-50 text-slate-900 transition-colors duration-300">
        {children}
      </body>
    </html>
  );
}
