'use client';
import { usePathname } from 'next/navigation';

import { Home, Dumbbell, Apple, Users, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation'
import { supabase } from '@/app/utils/supabase';
export default function Sidebar() {
  // State lưu tên mục hiện tại
  const pathname = usePathname();
  // Danh sách menu
  const menuItems = [
    { name: "MY HOME", icon: <Home size={18} />, path: "/homepage" },
    { name: "WORKOUTS", icon: <Dumbbell size={18} />, path: "/workout" },
    { name: "NUTRITION", icon: <Apple size={18} />, path: "/nutrition" },
    { name: "SOCIAL", icon: <Users size={18} />, path: "/social" },
  ];
  const router = useRouter();

  return (
    <div className="w-100 h-screen bg-zinc-900  text-white flex flex-col justify-between p-6">
      <div>
        <h1 className="text-3xl font-bold mb-10" style={{ color: "#FFCC00" }}>
          fitMONKEY
        </h1>

        <nav className="space-y-4">
          {menuItems.map((item) => (
            <div
              key={item.name}
              onClick={() => router.push(item.path)}

              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold cursor-pointer
                      ${pathname === item.path
                  ? "bg-yellow-400 text-black"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </div>
          ))}
        </nav>
      </div>

      <button
        onClick={async (e) => {
          e.preventDefault();
          await supabase.auth.signOut();
          router.replace("/");
        }}
        className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-400 text-white py-3 rounded-xl font-semibold hover:cursor-pointer">
        <LogOut size={18} />
        Log Out
      </button>
    </div>
  );
}