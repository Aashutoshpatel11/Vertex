import { NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs/promises"
import { RAGIndexing } from "@/services/RAGIndexing";
import { Chat } from "@/models/chat.model";
import { connectDB } from "@/services/db.connect";

let pathOfFile

const saveFileToLocal = async (file, storeName) => {
    await connectDB()
    try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const uploadDir = path.join(process.cwd(), "uploads");
        await fs.mkdir(uploadDir, { recursive: true });
        const filePath = path.join(uploadDir, storeName+'.pdf');
        await fs.writeFile(filePath, buffer);
        pathOfFile = filePath
        
    } catch (error) {
        console.log("Save File to Local :: Error ::", error.message);
    }
}

export async function POST(req){
    try {
        const reqBody = await req.formData()
        const file = reqBody.get("file")
        const title = reqBody.get("title")
        const description = reqBody.get("description")
    
        const existingChat = await Chat.findOne({title})
    
        if(existingChat){
            return NextResponse.json(
                {
                    message: "Chat Title Already Exists",
                    data: null
                },
                {
                    status: 409
                }
            )
        }
    
        const storeName = title.replaceAll(" ", "-").toLowerCase().trim()
    
        await saveFileToLocal(file, storeName)
    
        await RAGIndexing(storeName)
    
        const chat = await Chat.create({
            title,
            description,
            storeId: storeName
        })
    
        if( !chat ){
            throw new Error("Chat Not Created")
        }
    
        fs.rm(pathOfFile)
    
        return NextResponse.json(
            {
                message: "chat created successfully",
                data: chat
            },
            {
                status: 200
            }
        )
    } catch (error) {
        console.log("ERROR IN CREATE CHAT ROUTE :: ", error.message)
        return NextResponse.json(
            {
                message: "Error Creating Chat",
                data: null
            },
            {
                status: 500
            }
        )
    }
}