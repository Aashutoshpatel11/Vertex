import mongoose, { Schema } from "mongoose";

const MessageSchema = new Schema(
    {
        chatId: { 
            type: Schema.Types.ObjectId, 
            ref: "Chat", 
            required: true, 
            index: true 
        },
        role: { 
            type: String, 
            enum: ["HUMAN", "AI"], 
            required: true 
        },
        content: { 
            type: String, 
            required: true 
        }
    },
    {
        timestamps: true
    }
);

export const Message = mongoose.models.Message || mongoose.model("Message", MessageSchema);