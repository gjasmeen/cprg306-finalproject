import { useState } from "react"
import { Cardio } from "@/lib/api/exercise/exercise";
import { supabase } from "@/app/utils/supabase";
import { format } from 'date-fns';

type CardioData = {
  id: string;
  name: string;
  minutes: number;
  caloriesBurned: number;
};

type Props = {
  onAddCardio: (cardio: CardioData) => void;
  onCancel?: () => void;
  currentDate?: Date;
}

export default function AddCardio({ onAddCardio, onCancel, currentDate }: Props) {
  const [minutes, setMinutes] = useState(0);
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<Cardio[]>([]);
  const [selectExercise, setSelectExercise] = useState<Cardio | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState("");

  const formattedDate = format(currentDate ?? new Date(), 'yyyy-MM-dd');
  const weight = 50;

  const handleSearch = async () => {
    if (!query.trim()) return;
    try {
      setHasSearched(true);
      setResult([]);
      setIsLoading(true);
      const res = await fetch(`/api/exercise?q=${encodeURIComponent(query)}&type=cardio`);
      const dataFromAPI = await res.json();
      const data: Cardio[] = Array.isArray(dataFromAPI) ? dataFromAPI : [];
      setResult(data);
    } catch (error) {
      console.error(error);
      setResult([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCardio = async () => {
    if (!selectExercise || minutes <= 0) {
      setErrorMsg("Please select your exercise and minutes!");
      return;
    }

    try {
      setErrorMsg("");


      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setErrorMsg("User not logged in");
        return;
      }


      const res = await fetch("/api/exercise", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          type: "cardio",
          name: selectExercise.name,
          minutes: minutes,
          calories: calCaloriesBurned,
          date: formattedDate,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");


      onAddCardio({
        id: data.id,
        name: data.name,
        minutes: data.minutes,
        caloriesBurned: data.calories ?? calCaloriesBurned,
      });

      setSelectExercise(null);
      setMinutes(0);
      setQuery("");
      setResult([]);
      setHasSearched(false);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to save cardio");
    }
  };

  const calCaloriesBurned = selectExercise?.MET
    ? Math.round((Number(selectExercise.MET) * weight * 3.5 / 200) * minutes)
    : 0;

  return (
    <div className="w-120 sticky top-0 h-screen bg-zinc-900 rounded-2xl p-6 text-center">
      <h2 className="text-white text-2xl font-semibold mb-4">
        Add Cardio Exercise
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
          <div className="bg-gray-200 text-black font-bold mt-5 rounded-lg p-2 max-h-[350px] overflow-y-auto">
            {result.map((item, index) => (
              <div key={index}
                className="border-b py-2 cursor-pointer hover:bg-gray-300 rounded px-2"
                onClick={() => setSelectExercise(item)}>
                <p className="font-semibold">{item.name}</p>
                <p className="text-xs">MET: {item.MET}</p>
              </div>
            ))}
          </div>
        </>
      )}

      <h2 className="mt-5 text-xl font-bold">
        Adding: {selectExercise ? `${selectExercise.name}` : `No exercise selected`}
      </h2>
      <div className="mt-2 flex flex-row justify-center items-center gap-3">
        <h2 className="text-xl font-bold">How long?</h2>
        <input
          type="number"
          value={minutes}
          onChange={(e) => setMinutes(Number(e.target.value))}
          className="h-10 bg-white w-10 rounded text-black text-center" />
        <h2 className="text-xl font-bold">minutes</h2>
      </div>
      <div className="flex flex-row justify-center items-center gap-3 mt-5">
        <h2 className="mt-3 text-lg font-bold">Calories Burned: {calCaloriesBurned}</h2>
      </div>

      {errorMsg && (
        <h2 className="text-2xl text-red-500 mt-2">{errorMsg}</h2>
      )}
      <div className="flex flex-col mt-10 gap-5 items-center">
        <button
          onClick={() => handleAddCardio()}
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