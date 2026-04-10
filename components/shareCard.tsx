"use client";

import { useRef, useState } from "react";
import * as htmlToImage from "html-to-image";
import { storage, db } from "@/app/social/_utils/firebase";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

type Cardio = {
  id: string;
  name: string;
  minutes: number;
  caloriesBurned: number;
};

type Strength = {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
};

export default function ShareCard({
  cardio,
  strength,
  user
}: {
  cardio: Cardio[];
  strength: Strength[];
  user: any;
}) {
  const refDiv = useRef<HTMLDivElement>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  // Convert card → PNG
  const generateImage = async () => {
    if (!refDiv.current) return null;
    return await htmlToImage.toPng(refDiv.current);
  };

  // Upload PNG to Firebase Storage
  const uploadToFirebase = async (pngDataUrl: string) => {
    const fileRef = ref(storage, `share-cards/${user.uid}-${Date.now()}.png`);
    await uploadString(fileRef, pngDataUrl, "data_url");
    return await getDownloadURL(fileRef);
  };

  // Create post in Firestore
  const createPost = async (imageUrl: string) => {
    await addDoc(collection(db, "posts"), {
      userId: user.uid,
      imageUrl,
      content: "Shared my workout summary!",
      timestamp: serverTimestamp()
    });
  };

  // Full pipeline
  const handleShareToFeed = async () => {
    try {
      const png = await generateImage();
      if (!png) return;

      const url = await uploadToFirebase(png);
      setShareUrl(url);

      await createPost(url);

      alert("Shared to your feed!");
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  // Facebook share
  const handleFacebookShare = () => {
    if (!shareUrl) return;
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        shareUrl
      )}`,
      "_blank"
    );
  };

  return (
    <div className="flex flex-col items-center space-y-4 mt-6">

      {/* CARD */}
      <div
        ref={refDiv}
        className="w-96 p-6 bg-gradient -to-r from-yellow-600 to-yellow-500 rounded-xl text-white shadow-xl"
      >
        <h1 className="text-2xl font-bold mb-4">Today's Workout Summary</h1>

        <h2 className="text-xl font-semibold mb-2">Cardio</h2>
        {cardio.length === 0 && <p>No cardio logged</p>}
        {cardio.map((c) => (
          <div key={c.id} className="mb-2">
            <p className="font-medium">{c.name}</p>
            <p className="text-sm">
              {c.minutes} min • {c.caloriesBurned} calories
            </p>
          </div>
        ))}

        <hr className="my-4 border-white/40" />

        <h2 className="text-xl font-semibold mb-2">Strength</h2>
        {strength.length === 0 && <p>No strength logged</p>}
        {strength.map((s) => (
          <div key={s.id} className="mb-2">
            <p className="font-medium">{s.name}</p>
            <p className="text-sm">
              {s.sets} sets × {s.reps} reps @ {s.weight} lbs
            </p>
          </div>
        ))}
      </div>

      {/* BUTTONS */}
      <button
        onClick={handleShareToFeed}
        className="px-4 py-2 bg-yellow-400 text-black rounded-lg shadow hover:bg-yellow-500 transition"
      >
        Share to My Feed
      </button>

      {shareUrl && (
        <button
          onClick={handleFacebookShare}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
        >
          Share on Facebook
        </button>
      )}
    </div>
  );
}
