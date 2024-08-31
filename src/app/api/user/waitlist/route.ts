import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { initBackendFirebaseApp } from "@/lib/api/middleware/initBackendFirebaseApp";
import { doc, setDoc } from "firebase/firestore"; 

export async function POST(req: Request) {
    const { name, email, university, useCase } = await req.json();

    initBackendFirebaseApp();

    try {
        await getFirestore().collection("waitlist").add({
            name,
            email, 
            university,
            useCase
        })
        return NextResponse.json({  }, { status: 201} )
    }  catch (error: any) {
        console.log("Waitlist registration not successful")
        console.error(error.message);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
