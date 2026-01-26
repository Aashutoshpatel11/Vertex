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
    
        // const userMsg = await Message.create({
        //     chatId,
        //     role:"user",
        //     content: content.trim()
        // })
        // if(!userMsg){
        //     return NextResponse.json(
        //         {
        //             message:"Error Creating User Message"
        //         },
        //         {
        //             status: 404
        //         }
        //     )
        // }
    
        const previousMessages = await Message.find({chatId}).select("role content -_id").sort({createdAt:1})


        const Chain = await RAG({
            vectorStoreName: chat.storeId, query:content, messages: previousMessages
        })

        const response = await Chain.stream({
            query: content
        })

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller){
                for await( const chunk of response ){
                    if(chunk){
                        controller.enqueue(encoder.encode(JSON.stringify(chunk)))
                    }
                }
                controller.close()
            }
        })

        if( !response ){
            return NextResponse.json(
            {
                message: "Error Generating Response",
            },
            {
                status: 501
            }
        )
        }

        // const AIMsg = await Message.create({
        //     chatId,
        //     role:"assistant",
        //     content: response.trim()
        // })
        // if(!AIMsg){ 
        //     return NextResponse.json(
        //         {
        //             message:"Error Creating AI Message"
        //         },
        //         {
        //             status: 404
        //         }
        //     )
        // }
    
        // return NextResponse.json(
        //     {
        //         message: "FETCHED",
        //         data:response
        //     },
        //     {
        //         status: 200
        //     }
        // )
        return new NextResponse(stream, {
            headers: {
                'Content-Type': "text/event-stream",
                'Cache-Control': 'no-cache',
                Connection: 'keep-alive',
            }
        })

    } catch (error) {
        console.log("ERROR IN BOT ROUTE :: ", error)
        // await Message.findByIdAndDelete(userMsg._id)
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




