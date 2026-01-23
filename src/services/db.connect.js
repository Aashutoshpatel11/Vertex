import mongoose from "mongoose";

export const connectDB = async() => {
    try {
        const dbInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.MONGODB_NAME}` || "")

        dbInstance.connection.on("connected", () => {
            console.log("Database Connected Successfully")
        })

        dbInstance.connection.on("error", (err) => {
            console.log("Database Connection Failed :: ", err.message)
            process.exit()
        })

    } catch (error) {
        console.log("Error Connecting Database :: ", error.message)
        process.exit()
    }
}