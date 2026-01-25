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
            enum: ["user", "assistant", "system"], 
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