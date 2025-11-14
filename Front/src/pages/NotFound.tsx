import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-white overflow-hidden relative flex items-center justify-center">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-black/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-black/3 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <div className="text-center relative z-10">
        <h1 className="mb-4 text-6xl md:text-8xl font-bold text-black">404</h1>
        <p className="mb-8 text-xl md:text-2xl text-gray-700">Oops! Page not found</p>
        <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white hover:bg-gray-800 rounded-lg shadow-lg shadow-black/20 hover:shadow-black/30 transition-all duration-300">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
