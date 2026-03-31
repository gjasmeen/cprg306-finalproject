'use client';
import { Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="min-h-screen flex">
      {/* Left Side */}
      <div className="flex-1 flex items-center justify-center p-12 relative">
        <Image
            src="/images/shapes/background.png"
            alt="Background Gradient"
            fill
            className="object-cover object-center"
        />
        <div className="text-center">
          <Image
            src="/images/branding/fitMONKEYStacked.png"
            alt="fitMONKEY"
            width={320}
            height={280}
            className="mx-auto drop-shadow-xl"
            priority
          />
        </div>
      </div>

      {/* Right Side */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Back link */}
          <a
            href="/"
            className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-500 font-medium mb-8"
          >
            ← Landing Page
          </a>
        <div className="text-center mb-8 mt-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-1">Create your account</h1>
        </div>
          <form className="space-y-5">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="First Name"
                className="w-full px-4 py-4 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 text-gray-900"
              />
              <input
                type="text"
                placeholder="Last Name"
                className="w-full px-4 py-4 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 text-gray-900"
              />
            </div>

            <input 
              type="email"
              placeholder="Email Address..."
              className="w-full px-4 py-4 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 text-gray-900"
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password..."
                className="w-full px-4 py-4 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 text-gray-900"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
              </button>
            </div>

            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                className="w-full px-4 py-4 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 text-gray-900"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-yellow-400 hover:bg-yellow-300 transition-colors text-black font-semibold py-4 rounded-2xl text-lg mt-6"
            >
              Create account
            </button>
          </form>

          <div className="mt-6 text-center">
            <a
              href="/signin"
              className="inline-flex items-center gap-1 text-amber-400 hover:underline font-medium"
            >
              Already have an account? <span className="font-semibold">Sign In</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}