"use client";

import { useEffect, useState } from "react";
import { db } from "@/app/social/_utils/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

export default function FriendsSidebar({ user }: { user: any }) {
  const [friends, setFriends] = useState<any[]>([]);

  useEffect(() => {
    const loadFriends = async () => {
      // Get friend IDs
      const snapshot = await getDocs(collection(db, "friends", user.id, "list"));
      const friendIds = snapshot.docs.map(doc => doc.id);

      // Load friend profiles
      const profiles = [];
      for (const id of friendIds) {
        const profileSnap = await getDoc(doc(db, "users", id));
        if (profileSnap.exists()) {
          profiles.push({ id, ...profileSnap.data() });
        }
      }

      setFriends(profiles);
    };

    loadFriends();
  }, [user.id]);

  return (
    <div className="w-64 bg-[#1a1a1a] text-white p-4 h-full">
      <h2 className="text-lg font-bold mb-4">Friends</h2>

      <div className="space-y-4">
        {friends.map(friend => (
          <div key={friend.id} className="flex items-center space-x-3">
            <img
              src={friend.photoURL}
              className="w-10 h-10 rounded-full"
            />
            <span>{friend.displayName}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
