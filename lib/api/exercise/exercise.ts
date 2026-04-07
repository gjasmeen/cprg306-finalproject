export type Cardio = {
  name: string;
  MET: number;
  bodyPart: string,
};
export type Strengh = {
  name: string;
  bodyPart: string,
  equipment: string,
}
const getMET = (name: string): number => {
  const n = name.toLowerCase();

  // 🔥 Cardio
  if (n.includes("running")) return 9.8;
  if (n.includes("jog")) return 7;
  if (n.includes("walk")) return 3.5;
  if (n.includes("cycling") || n.includes("bike")) return 7.5;
  if (n.includes("jump rope")) return 12;
  if (n.includes("swim")) return 8;
  if (n.includes("row")) return 7;
  if (n.includes("elliptical")) return 5;
  if (n.includes("stair")) return 8.5;
  if (n.includes("hiking")) return 6;


  // default
  return 6;
};
const isCardio = (name: string) => {
  const n = name.toLowerCase();
  return (
    n.includes("run") ||
    n.includes("walk") ||
    n.includes("cycle") ||
    n.includes("bike") ||
    n.includes("jump") ||
    n.includes("row") ||
    n.includes("swim")
  );
};
export async function searchCardio(query: string): Promise<Cardio[]> {
  if (!query) return [];

  try {

    const res = await fetch(
      `https://exercisedb.p.rapidapi.com/exercises/name/${encodeURIComponent(
        query
      )}`,
      {
        headers: {
          "X-RapidAPI-Key": process.env.RAPIDAPI_KEY || "",
          "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
        },
      }
    );
    if (!res.ok) throw new Error("Failed to fetch");

    const data = await res.json();
    const exercises = Array.isArray(data) ? data : [];

    const filtered = exercises.filter((item: Cardio) => {
      const name = item.name.toLowerCase();
      const q = query.toLowerCase();
      return (
        isCardio(name) && name.includes(q))
    });
    // Map MET
    return filtered.map((item: Cardio) => ({
      name: item.name,
      MET: getMET(item.name),
      bodyPart: item.bodyPart,
    }));
  } catch (err) {
    console.error(err);
    return [];
  }
}
export async function searchStrength(query: string): Promise<Strengh[]> {
  if (!query) return [];
  try {
    const res = await fetch(
      `https://exercisedb.p.rapidapi.com/exercises/name/${encodeURIComponent(query)}`,
      {
        headers: {
          "X-RapidAPI-Key": process.env.RAPIDAPI_KEY || "",
          'X-RapidAPI-Host': "exercisedb.p.rapidapi.com",
        },
      }
    );
    if (!res.ok) throw new Error("Failed to fetch");
    const data = await res.json();
    const exercises = Array.isArray(data) ? data : [];
    const filtered = exercises.filter(
      (item: Strengh) => item.bodyPart !== "cardio"
    );
    return filtered.map((item: Strengh) => ({
      name: item.name,
      equipment: item.equipment,
      bodyPart: item.bodyPart,
    }));
  }
  catch (error) {
    console.error(error);
    return [];
  }
}