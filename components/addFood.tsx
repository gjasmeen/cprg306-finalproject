import { useState } from "react";
import { Food, searchFood } from "@/lib/api/food/food";
import { supabase } from "@/app/utils/supabase";
import { format } from 'date-fns';
type MealType = 'Breakfast' | 'Lunch' | 'Dinner';

type FoodWithId = Food & { id: string };
type Props = {
  onAddFood: (food: FoodWithId, meal: MealType) => void;
  onCancel?: () => void;
  defaultMeal?: MealType;
  currentDate?: Date;
};

export default function AddFood({ onAddFood, onCancel, defaultMeal = 'Lunch', currentDate }: Props) {

  const meal: MealType[] = ['Breakfast', 'Lunch', 'Dinner'];
  const [selectedFood, setSelectFood] = useState<Food | null>(null);
  const [selectMeal, setSelectMeal] = useState<MealType>(defaultMeal);
  const [quantity, setQuantity] = useState(1);
  const [result, setResult] = useState<Food[]>([]);
  const [query, setQuery] = useState("");
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
      const data = await searchFood(query);
      setResult(data);

    } catch (error) {
      console.error(error);
      setResult([]);
    } finally {
      setIsLoading(false);
    }
  };
  const computed = selectedFood
    ? {
      calories: Number((selectedFood.calories * quantity).toFixed(2)),
      carbs: Number((selectedFood.carbs * quantity).toFixed(2)),
      fat: Number((selectedFood.fat * quantity).toFixed(2)),
      protein: Number((selectedFood.protein * quantity).toFixed(2)),
      sodium: Number((selectedFood.sodium * quantity).toFixed(2)),
      sugar: Number((selectedFood.sugar * quantity).toFixed(2)),
    }
    : null;
  const handleAddFood = async () => {
    if (!selectedFood || quantity <= 0) {
      setErrorMsg("Please select food and enter a valid quantity!");
      return;
    }
    try {
      setErrorMsg("");
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setErrorMsg("Not logged in");
        return;
      }
      const res = await fetch("/api/food", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          name: selectedFood.name,
          meal: selectMeal,
          date: formattedDate,
          quantity: quantity,
          calories: computed!.calories,
          carbs: computed!.carbs,
          fat: computed!.fat,
          protein: computed!.protein,
          sodium: computed!.sodium,
          sugar: computed!.sugar,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "failed to save");
      onAddFood(
        {
          id: data.id,
          name: data.name,
          calories: data.calories,
          carbs: data.carbs,
          fat: data.fat,
          protein: data.protein,
          sodium: data.sodium,
          sugar: data.sugar,
        },
        data.meal as MealType
      );
      setSelectFood(null);
      setQuantity(1);
      setQuery("");
      setResult([]);
      setHasSearched(false);
    }
    catch (err) {
      console.error(err);
      setErrorMsg("failted to save food")
    }
  }


  return (
    <div className="w-120 sticky top-0 h-screen bg-zinc-900 rounded-2xl p-6 text-center">
      {/* Title */}
      <h2 className="text-white text-2xl font-semibold mb-4">
        Add Food
      </h2>

      {/* Input + Button */}
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery((e.target.value.toLowerCase()))}
          placeholder="Enter your Food"
          className=" h-15 flex-1 px-3 py-2 rounded-md text-sm bg-gray-200 text-black outline-none"
        />

        <button
          onClick={() => handleSearch()}
          className="bg-yellow-400 text-black px-3 py-2 rounded-md text-sm font-medium hover:bg-yellow-300 hover:cursor-pointer">
          search
        </button>

      </div>

      {!hasSearched ? (
        <h3 className="mt-10 font-extrabold text-xl">
          Click search to find food
        </h3>

      ) : isLoading ? (
        <h3 className="mt-10 font-extrabold text-xl">
          Loading Food...
        </h3>

      ) : !isLoading && result.length === 0 ? (
        <p className="mt-4 text-xl">Cannot find food</p>

      ) : (
        <div className="bg-gray-200 mt-5 rounded-lg p-2 max-h-[350px] overflow-y-auto">
          {result.map((item, index) => (
            <div
              key={index}
              className="border-b last:border-none py-2 cursor-pointer hover:bg-gray-300 rounded px-2"
              onClick={() => setSelectFood(item)}
            >
              <p className="font-semibold text-black">{item.name}</p>
              <p className="text-xs text-gray-600">
                {item.calories.toFixed(2)} kcal
              </p>
            </div>
          ))}
        </div>
      )}

      <h2 className="mt-5 text-xl font-bold">
        Adding: {selectedFood
          ? `${selectedFood.name} (${selectedFood.calories.toFixed(2) ?? "0.00"} kcal)`
          : "No food selected"}
      </h2>
      <div className=" mt-2 flex flex-row justify-center items-center gap-3">
        <h2 className="text-xl font-bold">How much?</h2>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="h-10 bg-white w-10 rounded text-black text-center" />
      </div>
      {errorMsg && (
        <h2 className="text-2xl text-red-500 mt-2">{errorMsg}</h2>
      )}
      <h2 className="text-xl font-bold mt-5">Which meal?</h2>
      <div className=" mt-5 flex flex-row justify-between">
        {meal.map((item, index) => (
          <button
            key={index}
            onClick={() => setSelectMeal(item)}
            className={`w-23 ${selectMeal === item ? 'bg-amber-400' : 'bg-gray-400 '} p-2 rounded-2xl text-black font-bold hover:cursor-pointer hover:opacity-70`}>
            {item}
          </button>
        ))}
      </div>
      {errorMsg && (
        <p className="text-red-500 font-semibold mt-3">{errorMsg}</p>
      )}
      <div className="flex flex-col mt-10 gap-5 items-center">
        <button
          onClick={() => handleAddFood()}
          className="bg-amber-400 w-100 h-15 rounded text-2xl text-black font-bold hover:opacity-70 hover:cursor-pointer">add Food</button>

        <button
          onClick={() => onCancel && onCancel()}
          className="border-amber-400 border-2 w-100 h-15 rounded text-2xl text-white font-bold hover:opacity-70 hover:cursor-pointer ">Cancel</button>
      </div>


    </div>
  )
}