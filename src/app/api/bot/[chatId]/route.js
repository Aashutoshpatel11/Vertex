import { Chat } from "@/models/chat.model";
import { Message } from "@/models/message.model";
import { connectDB } from "@/services/db.connect";
import { RAG } from "@/services/RAG";
import { NextResponse } from "next/server";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { HumanMessage } from "langchain";



export async function POST(req, { params }) {
    await connectDB()
    
    const {chatId} = await params
    const {content} = await req.json()
    

    try {
        const chat = await Chat.findById(chatId)
        if(!chat){
            return NextResponse.json(
                {
                    message:"Chat Doesn't Exists"
                },
                {
                    status: 404
                }
            )
        }
    
        const userMsg = await Message.create({
            chatId,
            role:"user",
            content: content.trim()
        })
        if(!userMsg){
            return NextResponse.json(
                {
                    message:"Error Creating User Message"
                },
                {
                    status: 404
                }
            )
        }
    
        const previousMessages = await Message.find({chatId}).select("role content -_id").sort({createdAt:1})
        
        // // console.log("PREVIOUS MESSAGES :: ", previousMessages)
        // const prompt = ChatPromptTemplate.fromMessages([
        //     ["system","You are a helpful assistant that helps users find information."],
        //     ...previousMessages.map( (m) => [m.role, m.content] ),
        //     ["human","Use the following context to answer the question: {context}\nQuestion: {question}"]
        // ])

        // console.log("PROMPT :: :: :: ", await prompt.invoke({question:"Health and care", context:"sdifgsdiufgbsifugiweg"}))

        const response = await RAG({
            vectorStoreName: chat.storeId, query:content, messages: previousMessages
        })
    
        console.log("RESPONSE :: ", response)
    
        return NextResponse.json(
            {
                message: "FETCHED",
                data:response
            },
            {
                status: 200
            }
        )

    } catch (error) {
        console.log("ERROR IN BOT ROUTE :: ", error)
        return NextResponse.json(
            {
                message: "INTERNAL SERVER ERROR",
                error: error.message
            },
            {
                status: 500
            }
        )
    }

}




