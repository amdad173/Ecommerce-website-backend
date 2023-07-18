import colors from 'colors'
import mongoose from 'mongoose';

const connectDB = async ()=>{
    try{
        const conn = await mongoose.connect(process.env.MONGO_URL);
        console.log(`connected to MongoDB ${conn.connection.host}`.bgMagenta.white)
    }catch(err){
        console.log(`Error In  MongoDB ${err}`.bgRed.white);
    }
}

export default connectDB;