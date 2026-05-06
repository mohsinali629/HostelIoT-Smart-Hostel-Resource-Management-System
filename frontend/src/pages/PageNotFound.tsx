import React from "react";
import { useLocation } from "wouter";
import { Cpu, WifiOff } from "lucide-react";

const PageNotFound: React.FC = () => {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-950 via-gray-900 to-black text-white flex flex-col items-center px-6 py-10">

      {/* Center Content */}
      <div className="flex flex-col items-center justify-center flex-1 text-center">

        {/* Icons */}
        <div className="flex items-center gap-4 mb-6">
          <Cpu size={48} className="text-cyan-400 animate-pulse" />
          <WifiOff size={48} className="text-red-400" />
        </div>

        {/* 404 */}
        <h1 className="text-7xl font-extrabold bg-linear-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          404
        </h1>

        {/* Message */}
        <p className="mt-4 text-xl text-gray-300 max-w-md">
          Device not found on the network. The page you're looking for doesn’t exist or has been disconnected.
        </p>

        {/* Glow */}
        <div className="mt-8 w-auto h-auto rounded-full bg-cyan-500/10 blur-3xl animate-pulse"></div>

        {/* Button */}
        <button
          onClick={() => setLocation("/")}
          className="mt-6 px-6 py-3 rounded-xl bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-400/40 text-lg font-semibold"
        >
          Return Home
        </button>
      </div>

      {/* Footer (now safe) */}
      <p className="mt-auto text-gray-500 text-sm pt-6">
        IoT Control System • Connection Lost
      </p>
    </div>
  );
};

export default PageNotFound;