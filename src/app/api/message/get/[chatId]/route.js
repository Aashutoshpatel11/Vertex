import { Message } from "@/models/message.model"
import { connectDB } from "@/services/db.connect"
import { NextResponse } from "next/server"

export async function GET(req, {params}) {
    await connectDB()
    const {chatId} = await params
    const messages = await Message.find({chatId}).sort({createdAt: 1}).select('role content -_id')
    if(!messages){
        return NextResponse.json(
        {
            Message: "No messages found"
        },
        {
            status:404
        }
    )
    }
    return NextResponse.json(
        {   
            Message: "Messages retrieved",
            data: messages
        },
        {
            status:200
        }
    )
}