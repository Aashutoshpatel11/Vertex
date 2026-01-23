import { Message } from "@/models/message.model";
import { NextResponse } from "next/server";

export async function POST(req, {params}) {
    const {role, content} = await req.json()
    const {chatId} = await params

    console.log(role, content, chatId)

    const message = await Message.create({
        role:role.trim(), 
        content:content.trim(), 
        chatId:chatId.trim()
    })

    if(!message){
        return NextResponse.json(
        {
            Message: "Something Went Wrong"
        },
        {
            status:406
        }
    )
    }

    return NextResponse.json(
        {
            Message: "Message saved",
            data: message
        },
        {
            status:200
        }
    )
}