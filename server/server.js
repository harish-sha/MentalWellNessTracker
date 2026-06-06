import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Test Health Route
app.get('/api/health', (req, res) => {
    res.json({ 
        status: "healthy", 
        message: "Mental Wellness Tracker API is up and running!",
        timestamp: new Date()
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});