"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/utils/supabase";

import Sidebar from "@/components/sidebar";
import Mainfeed from "./components/mainfeed";
import InputPost from "./components/inputpost";
import FriendsSidebar from "./components/friendssidebar";

export default function SocialPage() {
    const [user, setUser] = useState<any>(null);
     
    useEffect(() => {
        const loadUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
    };
    loadUser();
}, []);
if (!user) {
    return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
    </div>
    );
}
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
