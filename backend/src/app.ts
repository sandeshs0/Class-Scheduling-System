import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import errorHandler from "./middlewares/errorHandler";
import connectDB from "./config/dbConfig";
import redisClient from "./config/redisConfig";


dotenv.config();

const app = express();

// Middleware
app.use(cors({
    origin:process.env.FRONTEND_URL,
    credentials:true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Class Scheduling System APIs!');
});


app.use(errorHandler);

connectDB();

const PORT = process.env.PORT || 5000;

redisClient.ping();

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    await redisClient.quit();
    process.exit(0);
});
