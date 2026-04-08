"use client"
import Sidebar from "@/components/sidebar";
import Image from "next/image";
import { Edit } from 'lucide-react'
import { supabase } from "../utils/supabase";
import { useEffect, useState } from "react";
import defaultAvatar from '../../public/images/default-avatar.jpg'
type userProfile = {
  id: string;
  first_name: string,
  last_name: string,
  weight: number,
  height: number;
  age: number;
  email: string;
  avatar_url?: string;
  streak: number,
  last_streak_date: string,
}
type goal = {
  user_id: string,
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  sodium: number;
  sugar: number;
  workout_minutes: number;
  calories_burned: number;
}
export default function Homepage() {
  const [user, setUser] = useState<userProfile | null>(null);
  const [goal, setGoal] = useState<goal | null>(null);
  const [streak, setStreak] = useState<number>(0);
  const [lastStreakDate, setLastStreakDate] = useState<string | null>(null);
  const [food, setFood] = useState<number>(0);
  const [workout, setWorkout] = useState<number>(0);
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalForm, setGoalForm] = useState<Partial<goal>>({});
  const [isEditing, setEditing] = useState(false);
  const [isDoneSummary, setDoneSummary] = useState(false);
  const [form, setForm] = useState<Partial<userProfile>>({});
  const [file, setFile] = useState<File | null>(null);
  // load user profile
  useEffect(() => {
    const fetchUserAndGoal = async () => {
      const { data: { user: authUser }, } = await supabase.auth.getUser();
      if (!authUser) return;
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .single();
      if (userError || !userData) return;
      setUser(userData);
      setForm(userData);

      //goal
      const { data: goalData, } = await supabase
        .from("goal")
        .select("*")
        .eq("user_id", authUser.id)
        .maybeSingle();

      if (goalData) {
        setGoal(goalData)
        setGoalForm(goalData);
      }
      // set default value
      else {
        const { data: newGoal, error: insertError } = await supabase
          .from("goal")
          .upsert({
            user_id: authUser.id,
            calories: 2000,
            carbs: 50,
            protein: 30,
            fat: 20,
            sodium: 2000,
            sugar: 50,
            workout_minutes: 60,
            calories_burned: 300
          }, { onConflict: 'user_id' })
          .select()
          .single();
        if (!insertError && newGoal) {
          setGoal(newGoal);
          setGoalForm(newGoal);
        }
      }
    }

    fetchUserAndGoal();
  }, [])
  useEffect(() => {
    if (!user) return;

    const fetchSummary = async () => {
      const today = new Date().toISOString().slice(0, 10); // yyyy-mm-dd
      const { data: nutritionData } = await supabase
        .from("nutritions")
        .select("calories")
        .eq("user_id", user.id)

      const totalFood = nutritionData?.reduce((acc, curr) => acc + (curr.calories || 0), 0) || 0;
      setFood(totalFood);

      const { data: workoutData } = await supabase
        .from("cardios")
        .select("calories")
        .eq("user_id", user.id)

      const totalWorkout = workoutData?.reduce((acc, curr) => acc + (curr.calories || 0), 0) || 0;
      setWorkout(totalWorkout);
      if (user.last_streak_date && user.streak) {
        const lastDate = new Date(user.last_streak_date);
        const diffDays = (new Date(today).getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);

        if (diffDays > 3) setStreak(0);
        else setStreak(user.streak);
        setLastStreakDate(user.last_streak_date);
      }
    }
    fetchSummary();
  }, [user])
  //handle streak
  const handleStreakClick = async () => {
    if (!user) return;
    const today = new Date().toISOString().slice(0, 10);
    let newStreak = 1;

    if (lastStreakDate) {
      const diffDays = (new Date(today).getTime() - new Date(lastStreakDate).getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays <= 1) newStreak = streak + 1;
      else if (diffDays > 3) newStreak = 1;
    }

    setStreak(newStreak);
    setLastStreakDate(today);

    const { data, error } = await supabase
      .from("users")
      .update({ streak: newStreak, last_streak_date: today })
      .eq("id", user.id);

    if (error) console.error("Error updating streak:", error);
  };

  const uploadAvatar = async () => {
    if (!file || !user) return null;
    const filePath = `avatar/${user.id}-${Date.now()}`;
    const { error } = await supabase.storage
      .from("avatar")
      .upload(filePath, file);

    if (error) {
      console.error(error);
      return null;
    }
    const { data } = supabase.storage
      .from('avatar')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }
  // save profile 
  const handleSave = async () => {
    let avatar_url = user?.avatar_url;
    if (file) {
      const url = await uploadAvatar();
      if (url) avatar_url = url;
    }
    const { data, error } = await supabase
      .from("users")
      .update({
        first_name: form.first_name,
        last_name: form.last_name,
        weight: form.weight,
        height: form.height,
        age: form.age,
        avatar_url
      })
      .eq("id", user?.id)
      .select()
      .single();

    if (!error && data) {
      setUser(data);
      setEditing(false);
    }
  }
  const saveGoal = async () => {
    if (!user) return;

    try {

      const { data: updatedData, error: updateError } = await supabase
        .from("goal")
        .update({
          calories: goalForm.calories ?? 0,
          carbs: goalForm.carbs ?? 0,
          protein: goalForm.protein ?? 0,
          fat: goalForm.fat ?? 0,
          sodium: goalForm.sodium ?? 0,
          sugar: goalForm.sugar ?? 0,
          workout_minutes: goalForm.workout_minutes ?? 0,
          calories_burned: goalForm.calories_burned ?? 0,
        })
        .eq("user_id", user.id)
        .select();

      if (updateError) throw updateError;

      if (!updatedData || updatedData.length === 0) {

        const { data: newGoal, error: insertError } = await supabase
          .from("goal")
          .insert({
            user_id: user.id,
            calories: goalForm.calories ?? 2000,
            carbs: goalForm.carbs ?? 50,
            protein: goalForm.protein ?? 30,
            fat: goalForm.fat ?? 20,
            sodium: goalForm.sodium ?? 2000,
            sugar: goalForm.sugar ?? 50,
            workout_minutes: goalForm.workout_minutes ?? 60,
            calories_burned: goalForm.calories_burned ?? 300,
          })
          .select();

        if (insertError) throw insertError;
        if (newGoal && newGoal.length > 0) {
          setGoal(newGoal[0]);
          setGoalForm(newGoal[0]);
        }
      } else {
      
        setGoal(updatedData[0]);
        setGoalForm(updatedData[0]);
      }

      setEditingGoal(false);
    } catch (err) {
      console.error("Error saving goal:", err);
    }
  };

  if (!user) return <div className="p-10 text-xl  text-yellow-500">Loading...</div>;
  const baseGoal = goal?.calories ?? 2000;
  const total = baseGoal + food + workout;

  const baseGoalAngle = Math.round(((goal?.calories || 2000) / total) * 360 * 10) / 10;
  const foodAngle = Math.round((food / total) * 360 * 10) / 10;
  const workoutAngle = Math.round((workout / total) * 360 * 10) / 10;

  // Calculate start/end
  const baseGoalStart = 0;
  const baseGoalEnd = baseGoalAngle;
  const foodStart = baseGoalEnd;
  const foodEnd = foodStart + foodAngle;

  const workoutStart = foodEnd;
  const workoutEnd = workoutStart + workoutAngle; // remainder

  return (
    <div className="flex min-screen bg-black text-white gap-50">
      {/* LEFT: Sidebar */}
      <aside className="w-64 h-screen sticky top-0 border-r border-zinc-800">
        <Sidebar />
      </aside>

      {/* MIDDLE: Main Content */}
      <div className="flex-1 flex flex-col gap-6">
        <h1 className="text-yellow-400 font-bold mb-4 text-xl">
          <span
            onClick={() => handleStreakClick()}
            className="text-3xl hover:cursor-pointer" >🔥</span> {streak} DAY STREAK
        </h1>

        {/* Summary */}
        <div className="bg-zinc-900 rounded-2xl p-6 flex justify-between items-center ">
          {/* Left Info */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Summary</h2>
            <p>Remaining= (Base goal + food)  - workout</p>
            <div className="flex gap-10 flex-col mt-10">
              <div className="flex flex-row justify-between">
                <div>
                  <p className="text-3xl font-bold">{baseGoal}</p>
                  <p className="text-gray-400 text-sm font-bold">Base Goal</p>
                </div>
                <div>
                  <p className="text-3xl font-bold ">{food}</p>
                  <p className="text-orange-400 text-sm font-bold">Food</p>
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold">{workout}</p>
                <p className=" text-blue-400 text-sm font-bold">Workouts</p>
              </div>
            </div>
          </div>

          <div className="w-40 h-40 rounded-full flex items-center justify-center relative">
            {/* Colored ring */}
            <div
              className="absolute w-full h-full rounded-full leading-none"
              style={{
                background: `conic-gradient(
                               #9ca3af ${baseGoalStart}deg ${baseGoalEnd}deg,
                                #f59e0b ${foodStart}deg ${foodEnd}deg,
                                #3b82f6 ${workoutStart}deg ${workoutEnd}deg
                                          )`
              }}
            ></div>

            {/* Inner circle (white/black background to make it look like a donut) */}
            <div className="w-24 h-24 bg-black rounded-full flex flex-col items-center justify-center z-10">
              <p className="text-3xl font-bold leading-none">{baseGoal + food - workout}</p>
              <p className="text-xm text-gray-400">Remaining</p>
            </div>
          </div>
        </div>

        {/* Goals */}
        <h2 className="text-2xl font-bold mb-4">My Goal</h2>
        <div className="grid grid-cols-2 gap-6">
          {/* Nutrition */}
          <div className="bg-zinc-900 rounded-2xl p-5">
            <div className="flex justify-between mb-4">
              <h3 className="font-semibold text-xl">Nutrition</h3>
              <button
                onClick={() => setEditingGoal(true)}
                className=" underline hover: cursor-pointer text-yellow-400 text-sm font-extrabold">Edit</button>
            </div>
            <div className="space-y-3">
              <div className="bg-zinc-800 p-3 rounded-lg flex justify-between">
                <span>Calories</span>
                <span>{goal?.calories}</span>
              </div>
              <div className="bg-zinc-800 p-3 rounded-lg flex justify-between">
                <span>Carbohydrates</span>
                <span>{goal?.carbs}</span>
              </div>
              <div className="bg-zinc-800 p-3 rounded-lg flex justify-between">
                <span>Fat</span>
                <span>{goal?.fat}</span>
              </div>
              <div className="bg-zinc-800 p-3 rounded-lg flex justify-between">
                <span>Protein</span>
                <span>{goal?.protein}</span>
              </div>
              <div className="bg-zinc-800 p-3 rounded-lg flex justify-between">
                <span>Sodium</span>
                <span>{goal?.sodium}</span>
              </div>

              <div className="bg-zinc-800 p-3 rounded-lg flex justify-between">
                <span>Sugar</span>
                <span>{goal?.sugar}</span>
              </div>
            </div>
          </div>

          {/* Workout */}
          <div className="bg-zinc-900 rounded-2xl p-5">
            <div className="flex justify-between mb-4">
              <h3 className="font-semibold text-xl">Workout</h3>
              <button
                onClick={() => setEditingGoal(true)}
                className="underline  hover: cursor-pointer text-yellow-400 text-sm font-extrabold">Edit</button>
            </div>
            <div className="space-y-3">
              <div className="bg-zinc-800 p-3 rounded-lg flex justify-between">
                <span>Calories Burned</span>
                <span>{goal?.calories_burned}</span>
              </div>

              <div className="bg-zinc-800 p-3 rounded-lg flex justify-between">
                <span>Minutes/Workout</span>
                <span>{goal?.workout_minutes}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-120 sticky top-0 h-screen flex flex-col justify-between">
        {/* RIGHT: Profile */}
        <div className="w-120 sticky top-0 h-screen bg-zinc-900 rounded-2xl p-6 text-center">
          <div className=" justify-center flex flex-row gap-5">
            <h2 className="text-3xl font-bold mb-6">My Profile</h2>
            <Edit size={30}
              className="cursor-pointer hover:opacity-90"
              onClick={() => setEditing(true)}
            />
          </div>
          <Image
            src={user?.avatar_url || defaultAvatar}
            alt="avatar"
            width={100}
            height={100}
            className="rounded-full mx-auto mb-4 object-cover"
          />

          <p className="text-2xl font-semibold mb-6">
            {user.first_name ? user.first_name : 'John'} {user.last_name ? user.last_name : 'Doe'}
          </p>

          <div className="flex justify-between items-center text-2xl bg-zinc-800 p-5  rounded-xl h-30 ">
            <div>
              <p className="text-gray-400">Weight</p>
              <p className="font-bold">{user.weight}kg</p>
            </div>
            <div>
              <p className="text-gray-400">Height</p>
              <p className="font-bold">{user.height}cm</p>
            </div>
            <div>
              <p className="text-gray-400">Age</p>
              <p className="font-bold">{user.age}</p>
            </div>
          </div>
        </div>
      </div>
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white text-black p-6 rounded-xl w-[400px]">
            <h2 className="text-lg font-bold mb-4">Edit Profile</h2>

            <input
              placeholder="First Name"
              value={form.first_name || ""}
              onChange={(e) =>
                setForm({ ...form, first_name: e.target.value })
              }
              className="border p-2 w-full mb-2"
            />

            <input
              placeholder="Last Name"
              value={form.last_name || ""}
              onChange={(e) =>
                setForm({ ...form, last_name: e.target.value })
              }
              className="border p-2 w-full mb-2"
            />

            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="mb-2"
            />

            <input
              type="number"
              placeholder="Weight"
              value={form.weight || ""}
              onChange={(e) =>
                setForm({ ...form, weight: Number(e.target.value) })
              }
              className="border p-2 w-full mb-2"
            />

            <input
              type="number"
              placeholder="Height"
              value={form.height || ""}
              onChange={(e) =>
                setForm({ ...form, height: Number(e.target.value) })
              }
              className="border p-2 w-full mb-2"
            />

            <input
              type="number"
              placeholder="Age"
              value={form.age || ""}
              onChange={(e) =>
                setForm({ ...form, age: Number(e.target.value) })
              }
              className="border p-2 w-full mb-2"
            />

            {/* EMAIL DISABLED */}
            <input
              value={form.email || ""}
              disabled
              className="border p-2 w-full mb-4 bg-gray-200"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-500 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {editingGoal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <div className="bg-white text-black p-6 rounded-xl w-[400px]">
            <h2 className="font-bold mb-4">Edit Goals</h2>

            <input
              placeholder="Calories"
              value={goalForm.calories || ""}
              onChange={(e) =>
                setGoalForm({ ...goalForm, calories: Number(e.target.value) })
              }
              className="border p-2 w-full mb-2"
            />

            <input
              placeholder="Carbs %"
              value={goalForm.carbs || ""}
              onChange={(e) =>
                setGoalForm({ ...goalForm, carbs: Number(e.target.value) })
              }
              className="border p-2 w-full mb-2"
            />

            <input
              placeholder="Protein %"
              value={goalForm.protein || ""}
              onChange={(e) =>
                setGoalForm({ ...goalForm, protein: Number(e.target.value) })
              }
              className="border p-2 w-full mb-2"
            />

            <input
              placeholder="Fat %"
              value={goalForm.fat || ""}
              onChange={(e) =>
                setGoalForm({ ...goalForm, fat: Number(e.target.value) })
              }
              className="border p-2 w-full mb-2"
            />
            <input
              placeholder="Sodium"
              value={goalForm.sodium || ""}
              onChange={(e) =>
                setGoalForm({ ...goalForm, sodium: Number(e.target.value) })
              }
              className="border p-2 w-full mb-2"
            />

            <input
              placeholder="Sugar"
              value={goalForm.sugar || ""}
              onChange={(e) =>
                setGoalForm({ ...goalForm, sugar: Number(e.target.value) })
              }
              className="border p-2 w-full mb-2"
            />
            <input
              placeholder="Workout minutes"
              value={goalForm.workout_minutes || ""}
              onChange={(e) =>
                setGoalForm({
                  ...goalForm,
                  workout_minutes: Number(e.target.value),
                })
              }
              className="border p-2 w-full mb-2"
            />

            <input
              placeholder="Calories burned"
              value={goalForm.calories_burned || ""}
              onChange={(e) =>
                setGoalForm({
                  ...goalForm,
                  calories_burned: Number(e.target.value),
                })
              }
              className="border p-2 w-full mb-2"
            />

            <button
              onClick={saveGoal}
              className="bg-black text-white px-4 py-2 rounded mt-3"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
