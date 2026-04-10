'use client';

import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import Sidebar from "@/components/sidebar"
import AddCardio from '@/components/addCardio';
import AddStrength from '@/components/addStrength';
import { useState, useEffect, useCallback } from 'react';
import { format, addDays } from 'date-fns';
import { supabase } from '../utils/supabase';
import ShareCard from '@/components/shareCard';

//fetch loged in user
const [user,setUser] = useState<any>(null);
useEffect(() => {
    const loadUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
    };
    loadUser();
}, []);


type Cardio = {
  id: string,
  name: string,
  minutes: number,
  caloriesBurned: number
}

type Strength = {
  id: string,
  name: string,
  sets: number,
  reps: number,
  weight: number,
}

export default function WorkOut() {
  const [cardioExercises, setCardioExercises] = useState<Cardio[]>([]);
  const [strengthExercises, setStrengthExercises] = useState<Strength[]>([]);
  const [isAddCar, setAddCar] = useState<boolean>(false);
  const [isAddStrength, setAddStrength] = useState<boolean>(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [goal, setGoal] = useState<{
    workout_minutes: number;
    calories_burned: number;
  } | null>(null);
  const formattedDate = format(currentDate, 'yyyy-MM-dd');
  useEffect(() => {
    const fetchGoal = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: goalData, error } = await supabase
        .from("goal")
        .select("workout_minutes, calories_burned")
        .eq("user_id", user.id)
        .single();

      if (goalData) {
        setGoal({
          workout_minutes: goalData.workout_minutes,
          calories_burned: goalData.calories_burned,
        });
      }
    };
    fetchGoal();
  }, []);
  const openAddStrength = () => { setAddStrength(true); setAddCar(false); }
  const openAddCar = () => { setAddCar(true); setAddStrength(false); }

  const minutesGoal = 240;
  const caloriesGoal = 480;

  // dùng useCallback để tránh re-render loop khi dùng trong useEffect
  const getToken = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  }, []);

  const handleDeleteCardio = async (id: string) => {
    const token = await getToken();
    if (!token) return;
    const res = await fetch(`/api/exercise?type=cardio&id=${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` },
    });
    if (res.ok) {
      setCardioExercises(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleDeleteStrength = async (id: string) => {
    const token = await getToken();
    if (!token) return;
    const res = await fetch(`/api/exercise?type=strength&id=${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` },
    });
    if (res.ok) {
      setStrengthExercises(prev => prev.filter(item => item.id !== id));
    }
  };

  const calcTotal = (list: Cardio[]) => {
    return list.reduce(
      (acc, item) => {
        acc.caloriesBurned += item.caloriesBurned;
        acc.minutes += item.minutes;
        return acc;
      },
      { caloriesBurned: 0, minutes: 0 }
    );
  };

  const renderCardioSection = (title: string, data: Cardio[]) => {
    const totalCardio = calcTotal(cardioExercises);

    const remaining = goal
      ? {
        minutes: goal.workout_minutes - totalCardio.minutes,
        calories: goal.calories_burned - totalCardio.caloriesBurned,
      }
      : { minutes: 0, calories: 0 };
    return (
      <div className='mb-10 mt-10'>
        <h2 className='text-xl font-bold'>{title}</h2>
        <table className='w-full text-center border-separate border-spacing-y-2 mb-5 '>
          <thead>
            <tr className='text-gray-300'>
              <th></th>
              <th>minutes</th>
              <th>caloriesBurned</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id} className='bg-zinc-800'>
                <td className='text-left px-1 py-2'>{item.name}</td>
                <td className='px-4 py-2 text-center'>{item.minutes}</td>
                <td className='px-4 py-2 text-center'>{item.caloriesBurned}</td>
                <td>
                  <button
                    className='text-red-500 hover:cursor-pointer'
                    onClick={() => handleDeleteCardio(item.id)}>
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className=''>
            <tr className="bg-zinc-1000 font-semibold ">
              <td className="text-left pt-2">Totals</td>
              <td>{totalCardio.minutes}</td>
              <td>{totalCardio.caloriesBurned}</td>
            </tr>

            {/* Goal */}
            <tr className="bg-zinc-1000 font-semibold">
              <td className="text-left pt-2">Your daily goal</td>
              <td>{goal?.workout_minutes ?? minutesGoal}</td>
              <td>{goal?.calories_burned ?? caloriesGoal}</td>
            </tr>

            {/* Remaining */}
            <tr className="text-yellow-400 font-bold">
              <td className="text-left pt-2">Remaining</td>
              <td>{remaining.minutes}</td>
              <td>{remaining.calories}</td>
            </tr>
          </tfoot>
        </table>
        <button
          onClick={() => openAddCar()}
          className='underline hover:cursor-pointer text-sm font-bold text-yellow-400'>
          Add Exercise
        </button>
      </div>
    )
  }

  const renderStrengthSection = (title: string, data: Strength[]) => {
    return (
      <div className='mb-10 mt-10'>
        <h2 className='text-xl font-bold'>{title}</h2>
        <table className='w-full text-center border-separate border-spacing-y-2'>
          <thead>
            <tr className='text-gray-300'>
              <td className='text-left px-3 py-2'></td>
              <td>sets</td>
              <td>reps/set</td>
              <td>weight/set</td>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id} className='bg-zinc-800'>
                <td className='text-left px-3 py-2'>{item.name}</td>
                <td>{item.sets}</td>
                <td>{item.reps}</td>
                <td>{item.weight}</td>
                <td>
                  <button
                    className="text-red-500 hover:cursor-pointer"
                    onClick={() => handleDeleteStrength(item.id)}>
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td className='text-left pt-2 text-yellow-400 font-bold text-sm'>
                <button className='underline hover:cursor-pointer'
                  onClick={() => openAddStrength()}>
                  Add Exercise
                </button>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    )
  }

  useEffect(() => {
    const fetchData = async () => {
      const token = await getToken();
      if (!token) return;

      const headers = { "Authorization": `Bearer ${token}` };

      // ── Cardio ──
      const cardioRes = await fetch(`/api/exercise?type=cardio&date=${formattedDate}`, { headers });
      const cardioData = await cardioRes.json();
      if (Array.isArray(cardioData)) {
        setCardioExercises(
          cardioData.map((item) => ({
            id: item.id,
            name: item.name,
            minutes: item.minutes,
            caloriesBurned: item.calories ?? 0,
          }))
        );
      } else {
        setCardioExercises([]);
      }

      // ── Strength ──
      const strengthRes = await fetch(`/api/exercise?type=strength&date=${formattedDate}`, { headers });
      const strengthData = await strengthRes.json();
      if (Array.isArray(strengthData)) {
        setStrengthExercises(
          strengthData.map((item: Strength) => ({
            id: item.id,
            name: item.name,
            sets: item.sets,
            reps: item.reps,
            weight: item.weight,
          }))
        );
      } else {
        setStrengthExercises([]);
      }
    };

    fetchData();
  }, [formattedDate, getToken]);

  return (
    <div className="flex min-h-screen bg-black text-white gap-50">


      {/* Add ShareCard for fitness summary */}
      {renderCardioSection('Cardiovascular', cardioExercises)}
      {renderStrengthSection('Strength', strengthExercises)}
      {user &&( 
      <ShareCard 
      cardio={cardioExercises}
      strength={strengthExercises}
      user={user} 
      /> 
      )}
  
      <div className="w-64 sticky top-0 h-screen flex flex-col justify-between">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col gap-6">
        <div className="flex-1 text-white p-6 space-y-8">

          <div className="flex items-center gap-10">
            <h1 className="text-3xl font-bold">Your workout diary for:</h1>
            <div className="flex items-center gap-2">
              <button
                className="bg-yellow-400 text-black p-2 rounded hover:opacity-70 hover:cursor-pointer"
                onClick={() => setCurrentDate(prev => addDays(prev, -1))}>
                <ChevronLeft />
              </button>
              <div className="bg-yellow-400 text-black px-6 py-2 font-extrabold rounded">
                {formattedDate}
              </div>
              <button
                className="bg-yellow-400 text-black p-2 rounded hover:opacity-70 hover:cursor-pointer"
                onClick={() => setCurrentDate(prev => addDays(prev, 1))}>
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
                  className="absolute top-20 bg-white text-black p-2 rounded"
                />
              )}
            </div>
          </div>

          {renderCardioSection('Cardiovascular', cardioExercises)}
          {renderStrengthSection('Strength', strengthExercises)}
        </div>
      </div>

      <div className="w-120 sticky top-0 h-screen flex flex-col justify-between">
        {isAddCar ?
          <AddCardio
            onAddCardio={(cardio) => {
              setCardioExercises(prev => [...prev, cardio]);
              setAddCar(false);
            }}
            onCancel={() => setAddCar(false)}
            currentDate={currentDate}
          />
          : isAddStrength ?
            <AddStrength
              onAddStrength={(strength) => {
                setStrengthExercises(prev => [...prev, strength]);
                setAddStrength(false);
              }}
              onCancel={() => setAddStrength(false)}
              currentDate={currentDate}
            />
            : ""}
      </div>
    </div>
  )
}