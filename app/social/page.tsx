
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/utils/supabase";
import Mainfeed from "./components/mainfeed";
import InputPost from "./components/inputpost";
import FriendsSidebar from "./components/friendssidebar";
import Sidebar from "@/components/sidebar";
//import {addFriend, removeFriend} from "./_utils/friends"; 

export default function Page() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
        const { data, error } = await supabase.auth.getUser();

        if (error) {
            console.error("Error fetching user:", error);
    }
        setUser(data?.user ?? null);
        setLoading(false);
    };

    loadUser();
  }, []);

  return (
    <div className="flex min-h-screen bg-black text-white">
        {/* LEFT SIDEBAR */}
        <div className="w-64 sticky top-0 h-screen flex flex-col justify-between">
            <Sidebar />
        </div>

      {/* MAIN FEED */}
      <div className="flex-1 p-6 space-y-6">
            <InputPost user={user} />
            <Mainfeed user={user} />
      </div>

      {/* FRIENDS SIDEBAR */}
      <div className="w-64 border-l border-zinc-800">
        <FriendsSidebar user={user} />
      </div>

    </div>
  );
}