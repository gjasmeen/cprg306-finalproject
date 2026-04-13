"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/utils/supabase";
import Mainfeed from "./components/mainfeed";
import InputPost from "./components/inputpost";
import FriendsSidebar from "./components/friendssidebar";
import Sidebar from "@/components/sidebar";

export default function Page() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            const { data, error } = await supabase.auth.getUser();
            if (error) console.error("Error fetching user:", error);
            
            setUser(data?.user ?? null);
            setLoading(false);
        };
        loadUser();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-yellow-400 animate-pulse font-black italic">LOADING GYM FEED...</div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-black text-white">
            {/* LEFT SIDEBAR - Fixed width */}
            <div className="w-64 sticky top-0 h-screen border-r border-zinc-900">
                <Sidebar />
            </div>

            {/* MAIN FEED - Scrollable area */}
            <div className="flex-1 max-w-2xl mx-auto p-6 space-y-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter text-yellow-400">
                        Community Feed
                    </h1>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">See who's putting in work</p>
                </header>

                <InputPost user={user} />
                <Mainfeed user={user} />
            </div>

            {/* FRIENDS SIDEBAR - Right side */}
            <div className="w-64 border-l border-zinc-800">
                <FriendsSidebar user={user} />
            </div>
        </div>
    );
}