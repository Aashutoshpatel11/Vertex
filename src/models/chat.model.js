import { Mongoose, Schema } from "mongoose"
import mongoose from 'mongoose'

const chatSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            unique: true 
        },
        description: {
            type: String,
            required: true,
            unique: true 
        },
        storeId: {
            type: String,
            required: true,
            unique: true
        }
    },
    {
        timestamps: true
    }
)

export const Chat = mongoose.models.Chat || mongoose.model("Chat", chatSchema);