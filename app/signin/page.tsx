'use client';
import { Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation'
export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  return (
    <div className="min-h-screen flex">
      {/* Left Side*/}
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
            alt="fitMONKEY Stacked Logo"
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
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Sign In</h1>
          </div>
          <form className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              router.push('/homepage');

            }}>
            <div>
              <input
                type="email"
                placeholder="Email Address..."
                className="w-full px-4 py-4 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 text-gray-900"
              />
            </div>

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
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="text-right">
              <a href="#" className="text-amber-400 hover:underline text-sm font-medium">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-yellow-400 hover:bg-yellow-300 transition-colors text-black font-semibold py-4 rounded-2xl text-lg"
            >
              Sign in
            </button>
          </form>

          <div className="my-8 flex items-center gap-4">
            <div className="h-px bg-gray-200 flex-1"></div>
            <span className="text-gray-400 text-sm">or</span>
            <div className="h-px bg-gray-200 flex-1"></div>
          </div>

          {/* Google & Facebook */}
          {/* Implement Firebase Authentication when available */}
          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-3 border border-gray-300 hover:border-gray-400 rounded-2xl py-4 transition-colors">
              <span className="text-xl">G</span>
              <span className="font-medium">Gmail</span>
            </button>
            <button className="flex items-center justify-center gap-3 border border-gray-300 hover:border-gray-400 rounded-2xl py-4 transition-colors">
              <span className="text-xl text-blue-600">f</span>
              <span className="font-medium">Facebook</span>
            </button>
          </div>

          <div className="mt-8 text-center">
            <a
              href="/signup"
              className="inline-flex items-center gap-1 text-amber-400 hover:underline font-medium"
            >
              Create an account <span className="text-xl leading-none">→</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}