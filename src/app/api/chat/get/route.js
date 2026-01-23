import { Chat } from "@/models/chat.model";
import { connectDB } from "@/services/db.connect";
import { NextResponse } from "next/server";

export async function GET(req){
    await connectDB()
    try {
        let chats = []
        chats = await Chat.find()

        return NextResponse.json(
            {
                message: "Chats Fetched",
                data: chats
            },
            {
                status: 200
            }
        )

    } catch (error) {
        return NextResponse.json(
            {
                message: "Error Fetching Chat",
                data: null
            },
            {
                status: 404
            }
        )
    }
}