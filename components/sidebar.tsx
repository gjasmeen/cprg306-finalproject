'use client';

import { useState } from 'react';
import { Home, Dumbbell, Apple, Users, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation'
export default function Sidebar() {
  // State lưu tên mục hiện tại
  const [activeItem, setActiveItem] = useState("MY HOME");

  // Danh sách menu
  const menuItems = [
    { name: "MY HOME", icon: <Home size={18} /> },
    { name: "WORKOUTS", icon: <Dumbbell size={18} /> },
    { name: "NUTRITION", icon: <Apple size={18} /> },
    { name: "SOCIAL", icon: <Users size={18} /> },
  ];
  const router = useRouter();
  return (
    <div className="w-64 h-screen bg-black text-white flex flex-col justify-between p-6">
      <div>
        <h1 className="text-2xl font-bold mb-10" style={{ color: "#FFCC00" }}>
          fitMONKEY
        </h1>

        <nav className="space-y-4">
          {menuItems.map((item) => (
            <div
              key={item.name}
              onClick={() => setActiveItem(item.name)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold cursor-pointer
                ${activeItem === item.name
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
        onClick={(e) => (
          router.push("/")
        )}
        className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-400 text-white py-3 rounded-xl font-semibold">
        <LogOut size={18} />
        Log Out
      </button>
    </div>
  );
}