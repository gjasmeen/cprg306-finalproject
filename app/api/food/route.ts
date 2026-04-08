import { NextRequest, NextResponse } from "next/server";
import { searchFoo, Food } from "@/lib/api/food/food";
import { createClient } from "@supabase/supabase-js";
import { User } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;

function supabaseClientWithToken(token: string) {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

function extractToken(req: NextRequest): string | null {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  return authHeader.slice(7).trim() || null;
}


async function ensureUser(supabase: ReturnType<typeof supabaseClientWithToken>, user: User) {
  const fullName: string = user.user_metadata?.name || user.user_metadata?.full_name || "";
  const [first_name, ...rest] = fullName.split(" ");
  await supabase.from("users").upsert({
    id: user.id,
    email: user.email ?? "",
    first_name: first_name || "",
    last_name: rest.join(" ") || "",
    avatar_url: user.user_metadata?.avatar_url || null,
  });
}

// ─── GET ───
export async function GET(req: NextRequest) {

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");
  const date = searchParams.get("date");

  // Search OpenFoodFacts
  if (query) {
    try {
      const res = await fetch(
        `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=20&fields=product_name,nutriments`,
        { headers: { "User-Agent": "fitness-app/1.0" }, cache: "no-store" }
      );
      if (!res.ok) return NextResponse.json({ products: [] }, { status: 500 });
      const data = await res.json();
      return NextResponse.json({ products: data.products || [] });
    } catch (error) {
      console.error("[GET food search]", error);
      return NextResponse.json({ products: [] }, { status: 500 });
    }
  }


  const token = extractToken(req);
  if (!token) return NextResponse.json([], { status: 401 });

  try {
    const supabase = supabaseClientWithToken(token);
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return NextResponse.json([], { status: 401 });

    let queryBuilder = supabase
      .from("nutritions")
      .select("*")
      .eq("user_id", user.id);

    if (date) queryBuilder = queryBuilder.eq("date", date);

    const { data, error } = await queryBuilder.order("date", { ascending: true });
    if (error) throw error;

    return NextResponse.json(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error("[GET food saved]", error);
    return NextResponse.json([], { status: 500 });
  }
}

// ─── POST ───
export async function POST(req: NextRequest) {
  try {
    const token = extractToken(req);
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = supabaseClientWithToken(token);
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

 
    await ensureUser(supabase, user);
    const user_id = user.id;
    const body = await req.json();
    const { name, meal, date, quantity, calories, carbs, fat, protein, sodium, sugar } = body;

    if (!name || !meal || !date || !quantity) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data: inserted, error } = await supabase
      .from("nutritions")
      .insert({
        user_id,
        name,
        meal,
        date,
        quantity,
        calories,
        carbs,
        fat,
        protein,
        sodium,
        sugar,
      })
      .select()
      .single();

    if (error) {
      console.error("[POST food] insert error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(inserted);
  } catch (error) {
    console.error("[POST food]", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// ─── DELETE ───
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const token = extractToken(req);
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = supabaseClientWithToken(token);
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { error, count } = await supabase
      .from("nutritions")
      .delete({ count: "exact" })
      .eq("id", id)
      .eq("user_id", user.id);

    console.log("[DELETE food] id:", id, "rows deleted:", count, "error:", error?.message);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE food]", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
