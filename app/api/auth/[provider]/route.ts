// //use for connect Oauth to Google and FaceBook */
// // app/api/auth/[provider]/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { supabase } from "@/app/utils/supabase";

// const validProviders = ["google", "facebook"] as const;
// type Provider = (typeof validProviders)[number];

// export async function GET(req: NextRequest) {
//   const segments = req.nextUrl.pathname.split("/");
//   const provider = segments[segments.length - 1] as Provider;

//   if (!validProviders.includes(provider)) {
//     return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
//   }

//   const { data, error } = await supabase.auth.signInWithOAuth({
//     provider,
//     options: {
//       redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
//     },
//   });

//   if (error) {
//     console.error("OAuth Error:", error);
//     return NextResponse.json({ error: error.message }, { status: 400 });
//   }

//   return NextResponse.redirect(data.url);
// }