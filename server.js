//for coloring console output
import colors from 'colors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import express from 'express';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoute.js';
import categoryRoutes from "./routes/categoryRoute.js"
import productRoutes from "./routes/productRoutes.js"
import cors from 'cors'
// config env
dotenv.config();

// connect to database
connectDB();

// rest object
const app = express();

//middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));     //middleware(npm package) for showing different req, res

//routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/category', categoryRoutes);
app.use('/api/v1/product', productRoutes)

app.get('/', (req, res) =>{
    res.send({
        message: "welcom to ecommerce app"
    })
})

const PORT = process.env.PORT||8080;

app.listen(PORT, ()=>{
    console.log(`app running on port ${PORT}`.bgCyan.white)
})