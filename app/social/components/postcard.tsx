"use client";

import { useState, useEffect } from "react";
import { db } from "@/app/social/_utils/firebase";
import { 
  doc, deleteDoc, updateDoc, arrayUnion, arrayRemove, 
  collection, addDoc, onSnapshot, query, orderBy, serverTimestamp 
} from "firebase/firestore";
import { Trash2, Heart, MessageCircle, Send } from "lucide-react";

interface PostCardProps {
  post: any;
  user: any;
}

export default function PostCard({ post, user }: PostCardProps) {
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<any[]>([]);
  const [showComments, setShowComments] = useState(false);

  const myId = user?.uid || user?.id;
  const isOwner = post.userId === myId;
  const likedByMe = post.likes?.includes(myId);

  //comments from Firebase
  useEffect(() => {
    if (!post.id) return;
    const q = query(collection(db, "posts", post.id, "comments"), orderBy("timestamp", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setComments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [post.id]);

  const handleToggleLike = async () => {
    if (!myId) return alert("Please sign in to like posts!");
    const postRef = doc(db, "posts", post.id);
    await updateDoc(postRef, {
      likes: likedByMe ? arrayRemove(myId) : arrayUnion(myId)
    });
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !myId) return;
    
    await addDoc(collection(db, "posts", post.id, "comments"), {
      text: commentText,
      userName: user.user_metadata?.full_name || user.email?.split('@')[0] || "User",
      userId: myId,
      timestamp: serverTimestamp(),
    });
    setCommentText("");
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      await deleteDoc(doc(db, "posts", post.id));
    }
  };

  return (
    <div className="bg-[#121212] border border-zinc-800 rounded-3xl p-5 mb-6 shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden">
            <img 
              src={(post.avatar_url && post.avatar_url !== "") ? post.avatar_url : "/images/default-avatar.jpg"} 
              className="w-full h-full object-cover" 
              alt="Profile" 
            />
          </div>
          <div>
            <p className="font-bold text-white text-sm">
              {post.displayName || post.userName || "Athlete"}
            </p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">
              {post.timestamp?.toDate ? post.timestamp.toDate().toLocaleDateString() : "Just now"}
            </p>
          </div>
        </div>
        {isOwner && (
          <button onClick={handleDelete} className="text-zinc-600 hover:text-red-500 transition-colors p-1">
            <Trash2 size={18} />
          </button>
        )}
      </div>

     {/* Workout Image or Uploaded Photo */}
    {(post.imageUrl || post.postImage) ? (
      <div className="flex justify-center mb-4"> 
        <div className="rounded-2xl overflow-hidden border border-zinc-800 bg-black w-full max-w-75 max-h-50 flex items-center justify-center p-4">
          <img 
            src={post.postImage || post.imageUrl} 
            className="w-full h-full object-contain" 
            alt="Workout Summary" 
          />
        </div>
      </div>
    ) : null}

      

      {/*Post Text */}
      <p className="text-zinc-300 text-sm mb-4 px-1 leading-relaxed">
        {post.content}
      </p>
      {/*Interaction Bar */}
      <div className="flex items-center gap-6 mb-4 px-1">
        <button 
          onClick={handleToggleLike} 
          className={`flex items-center gap-2 transition ${likedByMe ? "text-red-500" : "text-zinc-400 hover:text-white"}`}
        >
          <Heart size={20} fill={likedByMe ? "currentColor" : "none"} />
          <span className="text-sm font-bold">{post.likes?.length || 0}</span>
        </button>
        
        <button 
          onClick={() => setShowComments(!showComments)} 
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition"
        >
          <MessageCircle size={20} />
          <span className="text-sm font-bold">{comments.length}</span>
        </button>
      </div>

      {/*comments*/}
      {showComments && (
        <div className="border-t border-zinc-800 pt-4 mt-4 space-y-3">
          <div className="max-h-40 overflow-y-auto space-y-2 mb-4 scrollbar-hide">
            {comments.map((c) => (
              <div key={c.id} className="text-[11px] bg-zinc-900/40 p-2 rounded-lg border border-zinc-800/50">
                <span className="font-bold text-white mr-2">{c.userName}:</span>
                <span className="text-zinc-400">{c.text}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddComment} className="flex gap-2">
            <input 
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-yellow-400 transition"
            />
            <button 
              type="submit" 
              className="bg-yellow-400 text-black p-2 rounded-xl hover:bg-yellow-500 transition-all active:scale-95 shadow-lg shadow-yellow-400/10"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}