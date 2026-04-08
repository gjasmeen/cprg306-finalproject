// lib/api/food/food.ts

export type OpenFood = {
  product_name?: string;
  nutriments?: {
    "energy-kcal"?: number;
    energy_kcal?: number;
    carbohydrates?: number;
    proteins?: number;
    fat?: number;
    sodium?: number;
    sugars?: number;
  };
};

export type Food = {
  name: string;
  calories: number;
  carbs: number;
  fat: number;
  protein: number;
  sodium: number;
  sugar: number;
};


export const searchFood = async (query: string): Promise<Food[]> => {
  if (!query.trim()) return [];

  try {
    const res = await fetch(`/api/food?q=${encodeURIComponent(query)}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("API ERROR");
      return [];
    }

    const data = await res.json();


    return (data.products as OpenFood[] || [])
      .map(convertFood)
      .filter((item): item is Food => item !== null);

  } catch (error) {
    console.error("FETCH ERROR:", error);
    return [];
  }
};


export const convertFood = (item: OpenFood): Food | null => {
  const nutriments = item.nutriments || {};

  const calories =
    nutriments["energy-kcal"] ??
    nutriments.energy_kcal ??
    0;


  if (!item.product_name || calories <= 0) {
    return null;
  }

  return {
    name: item.product_name,
    calories: Number(calories.toFixed(2)),
    carbs: Number((nutriments.carbohydrates ?? 0).toFixed(2)),
    fat: Number((nutriments.fat ?? 0).toFixed(2)),
    protein: Number((nutriments.proteins ?? 0).toFixed(2)),
    sodium: Number((nutriments.sodium ?? 0).toFixed(2)),
    sugar: Number((nutriments.sugars ?? 0).toFixed(2)),
  };
};