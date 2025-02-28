import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    try {
        const { id } = await req.json();

        if (!id) {
            return NextResponse.json({ error: "Missing ID" });
        }

        const { data, error } = await supabase
            .from("student")
            .select("id")
            .eq("id", id)
            .single();

        if (error && error.code !== "PGRST116") {
            console.error("Fetch Error:", error);
            return NextResponse.json({ error: error.message });
        }

        if (!data) {
            return NextResponse.json({ exists: false });
        }

        return NextResponse.json({ exists: true });

    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: error.message });
    }
}
