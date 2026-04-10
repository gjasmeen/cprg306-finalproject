"use client";

import { useCallback, useEffect, useState } from "react";
import Sidebar from "@/components/sidebar";
import AddFood from "@/components/addFood";
import { ChevronLeft, ChevronRight, Calendar, } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { supabase } from "../utils/supabase";
import { useRouter } from "next/navigation";
type MealType = 'Breakfast' | 'Lunch' | 'Dinner';

type Food = {
  id: string,
  name: string;
  calories: number;
  carbs: number;
  fat: number;
  protein: number;
  sodium: number;
  sugar: number;
  meal: MealType;
};


export default function FoodPage() {
  const router = useRouter();
  const [goal, setGoal] = useState<{
    calories: number;
    carbs: number;
    fat: number;
    protein: number;
    sodium: number;
    sugar: number;
  } | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [breakfast, setBreakfast] = useState<Food[]>([]);
  const [lunch, setLunch] = useState<Food[]>([]);
  const [dinner, setDinner] = useState<Food[]>([]);
  const [isaddFood, setShowAddFood] = useState<boolean>(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentMeal, setCurrentMeal] = useState<MealType>('Breakfast');

  const formattedDate = format(currentDate, 'yyyy-MM-dd');


  const openAddFood = (meal: MealType) => {
    setCurrentMeal(meal);
    setShowAddFood(true);
  }
  const getToken = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  }, [])

  useEffect(() => {
    const fetchFoods = async () => {

      const token = await getToken();
      if (!token) return;
      const res = await fetch(`/api/food?date=${formattedDate}`, {
        headers:
        {
          "Authorization": `Bearer ${token}`
        },
      });
      const data = await res.json();
      if (!Array.isArray(data)) return;

      const mapFood = (item: any): Food => ({
        id: item.id,
        name: item.name,
        calories: item.calories ?? 0,
        carbs: item.carbs ?? 0,
        fat: item.fat ?? 0,
        protein: item.protein ?? 0,
        sodium: item.sodium ?? 0,
        sugar: item.sugar ?? 0,
        meal: item.meal
      });

      setBreakfast(data.filter((i) => i.meal === 'Breakfast').map(mapFood));
      setLunch(data.filter((i) => i.meal === 'Lunch').map(mapFood));
      setDinner(data.filter((i) => i.meal === 'Dinner').map(mapFood));
    };
    fetchFoods();
  }, [formattedDate, getToken])
  useEffect(() => {
    const fetchGoal = async () => {

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      // Lấy goal từ Supabase
      const { data: goalData, error } = await supabase
        .from("goal")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error fetching goal:", error);
        return;
      }

      if (goalData) {
        setGoal({
          calories: goalData.calories,
          carbs: goalData.carbs,
          fat: goalData.fat,
          protein: goalData.protein,
          sodium: goalData.sodium,
          sugar: goalData.sugar,
        });
      }
    };

    fetchGoal();
  }, []);
  const handleDelteFood = async (id: string, meal: MealType) => {
    const token = await getToken();
    if (!token) return;
    const res = await fetch(`/api/food?id=${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      },
    });
    if (res.ok) {
      const setter = meal === 'Breakfast' ? setBreakfast :
        meal === 'Lunch' ? setLunch : setDinner;
      setter(prev => prev.filter(item => item.id !== id));
    }
  };
  const calcTotal = (list: Food[]) => {
    return list.reduce(
      (acc, item) => {
        acc.calories += item.calories;
        acc.carbs += item.carbs;
        acc.fat += item.fat;
        acc.protein += item.protein;
        acc.sodium += item.sodium;
        acc.sugar += item.sugar;
        return acc;
      },
      {
        calories: 0,
        carbs: 0,
        fat: 0,
        protein: 0,
        sodium: 0,
        sugar: 0,
      }
    );
  };

  const renderSection = (
    title: MealType,
    data: Food[],
  ) => {
    const total = calcTotal(data);

    ;
    return (
      <div className="mb-10 mt-10">
        <h2 className="text-xl font-bold mb-4">{title}</h2>

        <table className="w-full text-center border-separate border-spacing-y-2">
          <thead>
            <tr className="text-gray-300">
              <th className="w-100"></th>
              <th>calories<br /><span className="text-xs">kcal</span></th>
              <th>carbs<br /><span className="text-xs">g</span></th>
              <th>fat<br /><span className="text-xs">g</span></th>
              <th>protein<br /><span className="text-xs">g</span></th>
              <th>sodium<br /><span className="text-xs">mg</span></th>
              <th>sugar<br /><span className="text-xs">g</span></th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {data.map((item, index) => (
              <tr key={index} className="bg-zinc-800">
                <td className="text-left px-3 py-2">{item.name}</td>
                <td>{item.calories}</td>
                <td>{item.carbs}</td>
                <td>{item.fat}</td>
                <td>{item.protein}</td>
                <td>{item.sodium}</td>
                <td>{item.sugar}</td>
                <td>
                  <button
                    className="text-red-500 hover:cursor-pointer"
                    onClick={() =>
                      handleDelteFood(item.id, title)
                    }
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>

          <tfoot>
            <tr className="text-yellow-400 font-semibold">
              <td className="text-left pt-2">
                <button className="underline hover:cursor-pointer"
                  onClick={() => openAddFood(title)}
                >Add food</button>
              </td>
              <td>{total.calories.toFixed(2)}</td>
              <td>{total.carbs.toFixed(2)}</td>
              <td>{total.fat.toFixed(2)}</td>
              <td>{total.protein.toFixed(2)}</td>
              <td>{total.sodium.toFixed(2)}</td>
              <td>{total.sugar.toFixed(2)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    );
  };

  const totalAll = calcTotal([...breakfast, ...lunch, ...dinner]);



  const remaining = goal
    ? {
      calories: goal.calories - totalAll.calories,
      carbs: goal.carbs - totalAll.carbs,
      fat: goal.fat - totalAll.fat,
      protein: goal.protein - totalAll.protein,
      sodium: goal.sodium - totalAll.sodium,
      sugar: goal.sugar - totalAll.sugar,
    }
    : {
      calories: 0,
      carbs: 0,
      fat: 0,
      protein: 0,
      sodium: 0,
      sugar: 0,
    };

  return (
    <div className="flex min-h-screen bg-black text-white">

      {/* Sidebar */}
      <aside className="w-64 h-screen sticky top-0 border-r border-zinc-800">
        <Sidebar />
      </aside>

      {/* Center wrapper */}
      <div className="flex-1 flex justify-center">

        {/* Main content (centered) */}
        <main className="w-full max-w-5xl p-6">

          {/* Header */}
          <div className="flex items-center gap-10">
            <h1 className="text-3xl font-bold">Your nutrition diary for:</h1>

            <div className="flex items-center gap-2">
              <button
                className="bg-yellow-400 text-black p-2 rounded hover:opacity-70 hover:cursor-pointer"
                onClick={() => setCurrentDate(prev => addDays(prev, -1))}
              >
                <ChevronLeft />
              </button>
              <div className="bg-yellow-400 text-black px-6 py-2 font-extrabold rounded">
                {formattedDate}
              </div>
              <button
                className="bg-yellow-400 text-black p-2 rounded hover:opacity-70 hover:cursor-pointer"
                onClick={() => setCurrentDate(prev => addDays(prev, 1))}
              >
                <ChevronRight />
              </button>
              <Calendar
                size={40}
                className="ml-2 hover:cursor-pointer"
                onClick={() => setShowDatePicker(prev => !prev)}
              />

              {showDatePicker && (
                <input
                  type="date"
                  value={format(currentDate, 'yyyy-MM-dd')}
                  onChange={(e) => {
                    setCurrentDate(new Date(e.target.value));
                    setShowDatePicker(false);
                  }}
                  className="absolute top-20  bg-white text-black p-2 rounded"
                />
              )}
            </div>
          </div>

          {renderSection("Breakfast", breakfast)}
          {renderSection("Lunch", lunch)}
          {renderSection("Dinner", dinner)}

          {/* Totals */}
          <div className="mt-10">
            <table className="w-full text-center border-separate border-spacing-y-2">
              <tbody>
                <tr className="bg-zinc-800">
                  <td className="text-left px-3 py-2 font-bold">Totals</td>
                  <td>{totalAll.calories.toFixed(2)}</td>
                  <td>{totalAll.carbs.toFixed(2)}</td>
                  <td>{totalAll.fat.toFixed(2)}</td>
                  <td>{totalAll.protein.toFixed(2)}</td>
                  <td>{totalAll.sodium.toFixed(2)}</td>
                  <td>{totalAll.sugar.toFixed(2)}</td>
                </tr>

                <tr className="bg-zinc-700">
                  <td className="text-left px-3 py-2 font-bold">
                    Your daily goal
                  </td>
                  <td>{goal?.calories ?? 0}</td>
                  <td>{goal?.carbs ?? 0}</td>
                  <td>{goal?.fat ?? 0}</td>
                  <td>{goal?.protein ?? 0}</td>
                  <td>{goal?.sodium ?? 0}</td>
                  <td>{goal?.sugar ?? 0}</td>
                </tr>

                <tr className="text-yellow-400 font-bold">
                  <td className="text-left px-3 py-2">Remaining</td>
                  <td>{remaining.calories.toFixed(2)}</td>
                  <td>{remaining.carbs.toFixed(2)}</td>
                  <td>{remaining.fat.toFixed(2)}</td>
                  <td>{remaining.protein.toFixed(2)}</td>
                  <td>{remaining.sodium.toFixed(2)}</td>
                  <td>{remaining.sugar.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

        </main>
      </div>
      <div className="w-120 sticky top-0 h-screen flex flex-col justify-between">
        {isaddFood && (
          <AddFood
            defaultMeal={currentMeal}
            currentDate={currentDate}
            onAddFood={(food, meal) => {
              const setter = meal === 'Breakfast' ? setBreakfast : meal === 'Lunch' ? setLunch : setDinner;
              setter(prev => [...prev, { ...food, meal }]);
              setShowAddFood(false);
            }}
            onCancel={() => setShowAddFood(false)}
          />
        )}
      </div>
    </div>
  );
}