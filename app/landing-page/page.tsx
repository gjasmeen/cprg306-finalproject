"use client";
import Link from 'next/link';
import { Dumbbell, Heart, Target, CircleUserRound } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';

function LandingPage() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="min-h-screen text-white overflow-hidden relative">
      {/* Background Gradient */}
      <div>
        <Image 
          src="/images/shapes/background.png" 
          alt="Gradient Background" 
          fill
          className="object-cover object-center"
        />
      </div>
      {/* Backdrop */}
      <div className= "absolute top right-[5%]">
        <Image 
          src="/images/shapes/backdrop.png" 
          alt="Backdrop" 
          width={650}
          height={900}
        />
      </div>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Punching Bag */}
        <div className="absolute top-0 right-[7%] opacity-40">
          <Image 
            src="/images/equipments/punching bag.png" 
            alt="Punching Bag" 
            width={290} 
            height={430}
            className="drop-shadow-2xl"
          />
        </div>

        {/* Handgrip */}
        <div className="absolute top-10 right-[30%] rotate-[-25deg] opacity-30">
          <Image 
            src="/images/equipments/handgrip.png" 
            alt="Handgrip" 
            width={240} 
            height={160}
            className="drop-shadow-2xl"
          />
        </div>

        {/* Barbell */}
        <div className="absolute top-[15%] right-[-4%]">
          <Image 
            src="/images/equipments/barbell.png" 
            alt="Barbell" 
            width={900} 
            height={700}
          />
        </div>

        {/* Bananas */}
        <div className="absolute bottom-[-10] right-13">
          <Image 
            src="/images/foods/bananas.png" 
            alt="Bananas" 
            width={630} 
            height={480}
            className="drop-shadow-2xl"
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        {/* Navbar */}
        <nav className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-3">
            {/* Your actual logo */}
            <div className="w-14 h-14 relative">
              <Image 
                src="/images/branding/fitMONKEYLogo.png" 
                alt="fitMONKEY Logo" 
                width={56} 
                height={56}
                className="object-contain"
              />
            </div>
            {/* fitMONKEY Text */}
            <div>
              <Image 
                src="/images/branding/fitMONKEY.png" 
                alt="fitMONKEY" 
                width={180} 
                height={48}
                className="object-contain"
              />
            </div>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-8">
            <div className="w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center cursor-pointer transition-all">
              <CircleUserRound className="w-10 h-10"/>
            </div>
          </div>
        </nav>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <h1 className="text-6xl lg:text-7xl font-bold leading-tight tracking-tighter">
              swing into your<br />
              strongest self
            </h1>

            <p className="text-xl text-white/90 max-w-lg">
              Track every rep, crush every goal, and turn consistency into your super power. 
              Whether you're a gym beast, a home workout warrior, or just starting your fitness journey, 
              fitMONKEY makes it fun, simple and engaging to keep track of your journey.
            </p>

            <div className="flex items-center gap-4">
              <button 
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="px-10 py-4 bg-black hover:bg-zinc-900 text-white font-semibold text-lg rounded-4xl transition-all active:scale-95 flex items-center gap-3 group"
              >
                Get started
                <span className={`inline-block transition-transform ${isHovered ? 'translate-x-1' : ''}`}></span>
              </button>
            </div>
          </div>

          {/* Right Visual Area */}
          <div className="relative flex justify-center lg:justify-end h-[500px]">
            {/* Empty on purpose - background images handle the visuals now */}
          </div>
        </div>

        {/* Feature Cards */}
        <div className="mt-32 grid md:grid-cols-3 gap-6">
          {[
            { icon: <Dumbbell className="w-8 h-8" />, num: "01", title: "Track every rep", desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Faucibus in libero risus." },
            { icon: <Heart className="w-8 h-8" />, num: "02", title: "Crush your goals", desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Faucibus in libero risus." },
            { icon: <Target className="w-8 h-8" />, num: "03", title: "Stay consistent", desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Faucibus in libero risus." },
          ].map((card, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 hover:bg-white/15 transition-all group"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="text-3xl text-white/80 group-hover:text-white transition-colors">
                  {card.icon}
                </div>
                <div className="text-4xl font-bold text-white/30">{card.num}</div>
              </div>
              <h3 className="text-2xl font-semibold mb-3">{card.title}</h3>
              <p className="text-white/70 leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LandingPage;