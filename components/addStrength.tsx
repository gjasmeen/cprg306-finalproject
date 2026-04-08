import { useState } from "react";
import { Strengh } from "@/lib/api/exercise/exercise";
import { supabase } from "@/app/utils/supabase";
import { format } from 'date-fns';
type StrengthData = {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
}

type Props = {
  onAddStrength: (strength: StrengthData) => void;
  onCancel?: () => void;
  currentDate?: Date;
}

export default function AddStrength({ onAddStrength, onCancel, currentDate }: Props) {
  const [selectExercise, setSelectExercise] = useState("");
  const [sets, setSet] = useState<number>(0);
  const [reps, setRep] = useState<number>(0);
  const [weight, setWeight] = useState<number>(0);
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<Strengh[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState("");

  const formattedDate = format(currentDate ?? new Date(), 'yyyy-MM-dd');

  const handleSearch = async () => {
    if (!query.trim()) return;
    try {
      setHasSearched(true);
      setResult([]);
      setIsLoading(true);
      const res = await fetch(`/api/exercise?q=${encodeURIComponent(query)}&type=strength`);
      const dataFromAPI = await res.json();
      const data: Strengh[] = Array.isArray(dataFromAPI) ? dataFromAPI : [];
      setResult(data);
    } catch (error) {
      console.error(error);
      setResult([]);
    } finally {
      setIsLoading(false);
    }
  }

  const handleAddStrength = async () => {
    if (!selectExercise || sets <= 0 || reps <= 0 || weight <= 0) {
      setErrorMsg("Please Fill all fields!");
      return;
    }
    try {
      setErrorMsg("");


      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setErrorMsg("User not logged In");
        return;
      }

      const res = await fetch("/api/exercise", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          type: "strength",
          name: selectExercise,
          sets: sets,
          reps: reps,
          weight: weight,
          date: formattedDate,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      onAddStrength({
        id: data.id,
        name: data.name,
        sets: data.sets,
        reps: data.reps,
        weight: data.weight,
      });

      setSelectExercise("");
      setSet(0);
      setRep(0);
      setWeight(0);
      setQuery("");
      setResult([]);
      setHasSearched(false);
    } catch (err) {
      console.error(err);
      setErrorMsg("failed to save strength");
    }
  }

  return (
    <div className="w-120 sticky top-0 h-screen bg-zinc-900 rounded-2xl p-6 text-center">
      <h2 className="text-white text-2xl font-semibold mb-4">
        Add Strength Exercise
      </h2>

      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value.toLowerCase())}
          placeholder="Enter your Exercise"
          className="h-15 flex-1 px-3 py-2 rounded-md text-sm bg-gray-200 text-black outline-none"
        />
        <button
          onClick={() => handleSearch()}
          className="bg-yellow-400 text-black px-3 py-2 rounded-md text-sm font-medium hover:bg-yellow-300 hover:cursor-pointer">
          search
        </button>
      </div>

      {!hasSearched ? (
        <h3 className="mt-10 font-extrabold text-xl">Click search to find exercise</h3>
      ) : isLoading ? (
        <h3 className="mt-10 font-extrabold text-xl">Loading exercise...</h3>
      ) : !isLoading && result.length === 0 ? (
        <p className="mt-4 text-xl">Cannot find Exercise!</p>
      ) : (
        <>
          <h3 className="mt-10 font-extrabold text-xl">Matching Exercise</h3>
          <div className="bg-gray-200 mt-5 rounded-lg p-2 max-h-[350px] overflow-y-auto">
            {result.map((item, index) => (
              <div key={index}
                onClick={() => setSelectExercise(item.name)}
                className="border-b last:border-none py-2 cursor-pointer hover:bg-gray-300 rounded px-2"
              >
                <p className="font-semibold text-black">{item.name}</p>
                <p className="text-xs text-black italic">Equipment: {item.equipment}</p>
              </div>
            ))}
          </div>
        </>
      )}

      <h2 className="mt-5 text-xl font-bold">Adding: {selectExercise}</h2>

      <div className="mt-2 flex flex-row justify-center items-center gap-3">
        <h2 className="text-xl font-bold">number of sets</h2>
        <input
          type="number"
          value={sets}
          onChange={(e) => setSet(Number(e.target.value))}
          className="h-10 bg-white w-15 rounded text-black text-center" />
      </div>
      <div className="mt-2 flex flex-row justify-center items-center gap-3">
        <h2 className="text-xl font-bold">repitition per set</h2>
        <input
          type="number"
          value={reps}
          onChange={(e) => setRep(Number(e.target.value))}
          className="h-10 bg-white w-15 rounded text-black text-center" />
      </div>
      <div className="mt-2 flex flex-row justify-center items-center gap-3">
        <h2 className="ml-12 text-xl font-bold">weight per set</h2>
        <input
          type="number"
          value={weight}
          onChange={(e) => setWeight(Number(e.target.value))}
          className="h-10 bg-white w-15 rounded text-black text-center" />
        <h2 className="text-xl font-bold">kg</h2>
      </div>

      {errorMsg && (
        <h2 className="text-2xl text-red-500 mt-2">{errorMsg}</h2>
      )}

      <div className="flex flex-col mt-10 gap-5 items-center">
        <button
          onClick={() => handleAddStrength()}
          className="bg-amber-400 w-100 h-15 rounded text-2xl text-black font-bold hover:opacity-70 hover:cursor-pointer">
          add Exercise
        </button>
        <button
          onClick={() => onCancel && onCancel()}
          className="border-amber-400 border-2 w-100 h-15 rounded text-2xl text-white font-bold hover:opacity-70 hover:cursor-pointer">
          Cancel
        </button>
      </div>
    </div>
  )
}