import { NextRequest, NextResponse } from "next/server";
import { searchCardio, Cardio, searchStrength, Strengh } from "@/lib/api/exercise/exercise";
import { createClient } from "@supabase/supabase-js";

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


async function ensureUser(supabase: ReturnType<typeof supabaseClientWithToken>, user: any) {
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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const type = searchParams.get("type") || "cardio";
    const date = searchParams.get("date");

    // ===== Search =====
    if (query) {
      if (type === "strength") {
        const result: Strengh[] = await searchStrength(query);
        return NextResponse.json(result);
      } else {
        const result: Cardio[] = await searchCardio(query);
        return NextResponse.json(result);
      }
    }

    const token = extractToken(req);
    if (!token) return NextResponse.json([], { status: 401 });

    const supabase = supabaseClientWithToken(token);
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return NextResponse.json([], { status: 401 });

    if (type === "cardio") {
      let queryBuilder = supabase.from("cardios").select("*").eq("user_id", user.id);
      if (date) queryBuilder = queryBuilder.eq("date", date);
      const { data, error } = await queryBuilder.order("date", { ascending: false });
      if (error) throw error;
      return NextResponse.json(Array.isArray(data) ? data : []);
    }

    if (type === "strength") {
      let queryBuilder = supabase.from("strengths").select("*").eq("user_id", user.id);
      if (date) queryBuilder = queryBuilder.eq("date", date);
      const { data, error } = await queryBuilder.order("date", { ascending: false });
      if (error) throw error;
      return NextResponse.json(Array.isArray(data) ? data : []);
    }

    return NextResponse.json([]);
  } catch (error) {
    console.error("[GET exercise]", error);
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type } = body;

    if (!type) return NextResponse.json({ error: "Missing type" }, { status: 400 });

    const token = extractToken(req);
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = supabaseClientWithToken(token);
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });


    await ensureUser(supabase, user);

    const user_id = user.id;

    if (type === "cardio") {
      const { name, minutes, calories, date } = body;
      if (!name || minutes == null || calories == null || !date) {
        return NextResponse.json({ error: "Missing cardio fields" }, { status: 400 });
      }
      const { data: inserted, error } = await supabase
        .from("cardios")
        .insert({ user_id, name, minutes, calories, date })
        .select()
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json(inserted);
    }

    if (type === "strength") {
      const { name, sets, reps, weight, date } = body;
      if (!name || sets == null || reps == null || weight == null || !date) {
        return NextResponse.json({ error: "Missing strength fields" }, { status: 400 });
      }
      const { data: inserted, error } = await supabase
        .from("strengths")
        .insert({ user_id, name, sets, reps, weight, date })
        .select()
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json(inserted);
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("[POST exercise]", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const id = searchParams.get("id");

    if (!type || !id) return NextResponse.json({ error: "Missing type or id" }, { status: 400 });

    const token = extractToken(req);
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = supabaseClientWithToken(token);
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const table = type === "cardio" ? "cardios" : "strengths";
    const { error, count } = await supabase
      .from(table)
      .delete({ count: "exact" })
      .eq("id", id)
      .eq("user_id", user.id);

    console.log("[DELETE exercise] table:", table, "id:", id, "rows deleted:", count, "error:", error?.message);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE exercise]", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
