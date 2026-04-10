'use client';

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/app/utils/supabase";

//to ensure supabase user exists in firebase for social features
import { setDoc, doc} from "firebase/firestore";
import { db } from "@/app/social/_utils/firebase";

async function syncUserToFirebase(user: any) {
  await setDoc(doc(db, "users", user.id), {
    displayName: user.user_metadata?.full_name ?? "Unknown User",
    photoURL: user.user_metadata?.avatar_url ?? null,
    email: user.email
  });
}

const publicRoutes = ["/", "/signin", "/signup", 'forgotPassword'];

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          await syncUserToFirebase(user);
}

        if (!user) {

          if (!publicRoutes.includes(pathname)) {
            router.replace("/signin");
          }

          if (isMounted) setLoading(false);
          return;
        }
        //sync supabase user to firebase for social features
        await syncUserToFirebase(user);

        const { data: existingUser } = await supabase
          .from("users")
          .select("weight, height, age")
          .eq("id", user.id)
          .maybeSingle();

        if (!existingUser) {
          await supabase.from("users").insert({
            id: user.id,
            email: user.email,
            first_name: null,
            last_name: null,
            weight: null,
            height: null,
            age: null,
          });
          router.replace("/boarding");
          if (isMounted) setLoading(false);
          return;
        }

        const isIncompleteProfile =
          existingUser.weight === null ||
          existingUser.height === null ||
          existingUser.age === null;

        if (isIncompleteProfile) {
          if (pathname !== "/boarding") router.replace("/boarding");
          if (isMounted) setLoading(false);
          return;
        }

        if (publicRoutes.includes(pathname) || pathname === "/onboarding") {
          router.replace("/homepage");
        }
      } catch (err) {
        console.error("Auth check error:", err);
        if (pathname !== "/signin") router.replace("/signin");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    checkAuth();

    // subscribe auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAuth();
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-yellow-400 text-2xl font-semibold">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}