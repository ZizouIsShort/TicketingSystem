import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    try {
        const { id, name} = await req.json();

        if (!id || !name) {
            return NextResponse.json({ error: "Missing fields" });
        }

        const { data: existingUser, error: fetchError } = await supabase
            .from("admin")
            .select("name")
            .eq("name", name)
            .single();

        if (fetchError && fetchError.code !== "PGRST116") {
            console.error("Fetch Error:", fetchError);
            throw fetchError;
        }

        if (!existingUser) {
            const { error: insertError } = await supabase
                .from("admin")
                .insert([{ id, name }]);

            if (insertError) {
                console.error("Insert Error:", insertError);
                throw insertError;
            }

            return NextResponse.json({ message: "User added to Supabase" });
        }

        return NextResponse.json({ message: "User already exists" });

    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: error.message });
    }
}
