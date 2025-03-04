import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {ticketTable} from "@/db/schema";

export async function POST(req: Request) {
    try {
        const { scannedData } = await req.json();

        if (!scannedData) {
            return NextResponse.json({ error: "Missing scannedData" });
        }

        //if the student exists using raw SQL
        const existingUser = await db.execute(
            sql`SELECT id FROM ${ticketTable} WHERE id = ${scannedData} LIMIT 1`
        );

        if (existingUser.length === 0) {
            return NextResponse.json({ exists: false });
        }

        await db.execute(
            sql`UPDATE ${ticketTable} SET isvalid = FALSE WHERE id = ${scannedData}`
        );

        return NextResponse.json({ exists: true, updated: true});

    } catch (error: any) {
        console.error("API Error:", error);
        return NextResponse.json({ error: error.message });
    }
}
