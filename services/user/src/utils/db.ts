import mongoose from "mongoose";

const connectDb = async () => {
    try {
        mongoose.connect(process.env.MONGO_URI as string, {
            dbName: "MindFrame"
        });

        console.log("Connected to MongoDb");
    } catch (error) {
        console.log(error)
    }
}

export default connectDb;