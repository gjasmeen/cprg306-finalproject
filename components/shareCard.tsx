'use client';

import React, { useRef, useState } from 'react';
import * as htmlToImage from 'html-to-image';
import { db } from '@/app/social/_utils/firebase'; 
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Share2, Loader2, Download, Timer, Flame, Send } from 'lucide-react';

interface ShareCardProps {
  cardio: any[];
  strength: any[];
  user: any;
}

export default function ShareCard({ cardio, strength, user }: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  // Calculate Totals
  const totalMinutes = cardio.reduce((acc, curr) => acc + curr.minutes, 0);
  const totalCalories = cardio.reduce((acc, curr) => acc + curr.caloriesBurned, 0);

  const handleAction = async (type: 'post' | 'download' | 'share') => {
    if (!user || !cardRef.current) return;
    setLoading(true);

    try {
      const statsText = `Just finished my workout! 💪 ${totalMinutes} mins | ${totalCalories} kcal. Check out my progress!`;

      // save to social feed Firestore
    
      if (type === 'post' || type === 'share') {
        await addDoc(collection(db, "posts"), {
          userId: user.id,
          displayName: user.user_metadata?.full_name || user.email.split('@')[0],
          avatar_url: user.user_metadata?.avatar_url || "/images/default-avatar.jpg",
          content: statsText,
          imageUrl: "", // internal feed uses the text; shared image goes to social media
          likes: [],
          timestamp: serverTimestamp(),
        });
      }

      // image for sharing or downloading
      if (type === 'download' || type === 'share') {
        const dataUrl = await htmlToImage.toPng(cardRef.current, { 
          cacheBust: true,
          pixelRatio: 2,
          backgroundColor: '#000' 
        });

        //download action
        if (type === 'download') {
          const link = document.createElement('a');
          link.download = `workout-summary-${Date.now()}.png`;
          link.href = dataUrl;
          link.click();
        } 
        
        //
        else if (type === 'share') {
          const blob = await (await fetch(dataUrl)).blob();
          const file = new File([blob], 'my-workout.png', { type: 'image/png' });

          if (navigator.share && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: 'My Gym Progress',
              text: statsText,
            });
          } else {
            // download and alert
            const link = document.createElement('a');
            link.download = `workout-to-share.png`;
            link.href = dataUrl;
            link.click();
            alert("Native sharing not supported on this browser. Image downloaded instead");
          }
        }
      }

      if (type === 'post') alert("Successfully posted to your Social Feed!");

    } catch (err) {
      console.error("Action Error:", err);
      alert("Something went wrong. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center bg-zinc-900/40 p-6 rounded-[2.5rem] border border-zinc-800 shadow-2xl w-full max-w-md backdrop-blur-sm">
      
      {/* image*/}
      <div 
        ref={cardRef} 
        className="bg-black p-8 rounded-4xl w-full mb-8 border-4 border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.15)]"
      >
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-2">
            <h3 className="text-yellow-400 font-black text-xl tracking-tighter">fitMONKEY</h3>
          </div>
          <div className="text-right">
             <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest">My Workout</p>
             <p className="text-white text-[10px] font-bold">{new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 mb-8">
          {/* Minutes Stat */}
          <div className="flex items-center justify-between p-5 bg-zinc-900/50 rounded-2xl border border-zinc-800">
            <div className="flex flex-col">
              <span className="text-zinc-500 text-[10px] uppercase font-black tracking-widest mb-1">Duration</span>
              <span className="text-white text-4xl font-black leading-none">{totalMinutes}<span className="text-yellow-400 text-lg ml-1">MIN</span></span>
            </div>
            <Timer className="text-zinc-700" size={32} />
          </div>
          
          {/* Calories Stat */}
          <div className="flex items-center justify-between p-5 bg-zinc-900/50 rounded-2xl border border-zinc-800">
            <div className="flex flex-col">
              <span className="text-zinc-500 text-[10px] uppercase font-black tracking-widest mb-1">Energy Burned</span>
              <span className="text-white text-4xl font-black leading-none">{totalCalories}<span className="text-yellow-400 text-lg ml-1">KCAL</span></span>
            </div>
            <Flame className="text-zinc-700" size={32} />
          </div>
        </div>

        {/* Exercises Breakdown */}
        <div className="flex justify-around py-4 border-t border-zinc-900">
           <div className="text-center">
              <p className="text-white font-black text-2xl leading-none">{strength.length}</p>
              <p className="text-zinc-500 text-[9px] uppercase font-bold mt-1">Strength</p>
           </div>
           <div className="w-px bg-zinc-800" />
           <div className="text-center">
              <p className="text-white font-black text-2xl leading-none">{cardio.length}</p>
              <p className="text-zinc-500 text-[9px] uppercase font-bold mt-1">Cardio</p>
           </div>
        </div>
      </div>

      {/* --- ACTION BUTTONS --- */}
      <div className="w-full space-y-3">
        {/* Main Sharing Button */}
        <button
          onClick={() => handleAction('share')}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-yellow-400 text-black py-4 rounded-2xl font-black uppercase text-sm hover:bg-yellow-500 transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-yellow-400/10"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Share2 size={20} />}
          Share to Social Media
        </button>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleAction('download')}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-zinc-800/80 text-white py-3 rounded-2xl text-xs font-bold hover:bg-zinc-700 transition-colors"
          >
            <Download size={14} /> Download
          </button>
          <button
            onClick={() => handleAction('post')}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-zinc-800/80 text-white py-3 rounded-2xl text-xs font-bold hover:bg-zinc-700 transition-colors"
          >
            <Send size={14} /> In-App Feed
          </button>
        </div>
      </div>
    </div>
  );
}