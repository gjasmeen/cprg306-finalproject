"use client";

import { useState, useEffect, useRef } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../_utils/firebase";
import { supabase } from "@/app/utils/supabase";
import { ImagePlus, X, Send } from "lucide-react"; // npm install lucide-react if not installed

interface InputPostProps {
  user: any;
}

export default function InputPost({ user }: InputPostProps) {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [postContent, setPostContent] = useState("");
  const [imageString, setImageString] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const { data: userData } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (userData) setUserProfile(userData);
    };
    fetchProfile();
  }, [user]);

  // Handle image selection and convert to Base64
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 800000) { // Limit to 800KB for Firestore document limits
        alert("Image is too large. Please pick a smaller image.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageString(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if ((postContent.trim() === "" && !imageString) || !userProfile) return;

    setLoading(true);

    try {
      await addDoc(collection(db, "posts"), {
        userId: userProfile.id,
        displayName: `${userProfile.first_name} ${userProfile.last_name}`,
        avatar_url: userProfile.avatar_url || "/images/default-avatar.jpg",
        content: postContent,
        postImage: imageString || "", // New field for the Base64 image
        likes: [],
        timestamp: serverTimestamp(),
      });

      setPostContent("");
      setImageString(null);
    } catch (err) {
      console.error("Error adding post: ", err);
    } finally {
      setLoading(false);
    }
  };

  if (!userProfile) return null;

  return (
    <div className="bg-yellow-400 mb-4 rounded-2xl p-4 mt-10 shadow-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center">
          <img
            src={userProfile.avatar_url || "/images/default-avatar.jpg"}
            className="w-10 h-10 rounded-full object-cover mr-3 border-2 border-yellow-600"
            alt="Profile"
          />
          <input
            className="flex-1 bg-yellow-500 text-black placeholder-black/70 p-4 rounded-xl font-medium outline-none focus:ring-2 focus:ring-yellow-600"
            placeholder={`${userProfile.first_name}, share your fitness journey!`}
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
          />
          
          {/* Hidden File Input */}
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleImageChange}
          />
          
          {/* Image Trigger Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="ml-2 p-3 bg-yellow-500 text-black rounded-xl hover:bg-yellow-600 transition"
          >
            <ImagePlus size={24} />
          </button>

          <button
            type="submit"
            className="bg-zinc-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition ml-2 disabled:opacity-50 flex items-center gap-2"
            disabled={loading}
          >
            {loading ? "..." : <><Send size={18}/> Post</>}
          </button>
        </div>

        {/* Image Preview Area */}
        {imageString && (
          <div className="relative mt-2 w-full max-h-64 rounded-xl overflow-hidden border-2 border-yellow-600 bg-black/10">
            <button
              type="button"
              onClick={() => setImageString(null)}
              className="absolute top-2 right-2 bg-zinc-800 text-white p-1 rounded-full hover:bg-red-600 transition"
            >
              <X size={18} />
            </button>
            <img src={imageString} alt="Preview" className="w-full h-full object-contain mx-auto" style={{maxHeight: '250px'}} />
          </div>
        )}
      </form>
    </div>
  );
}