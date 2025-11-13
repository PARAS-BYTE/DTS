// const express = require('express');
// const cors = require('cors');
// const mongoose = require('mongoose');
// const cookieParser = require('cookie-parser');
import dotenv from 'dotenv';
import fetch from 'node-fetch'
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import { YoutubeTranscript } from "youtube-transcript";
import axios from 'axios'
// require('dotenv').config();
dotenv.config();

// const authRoutes = require('./routes/authRoutes.js').default || require('./routes/authRoutes.js');
import authRoutes from './routes/authRoutes.js';
import courseRouter from './routes/CourseRouter.js';
import calendarRouter from './routes/CalendarRoutes.js';
import QuizRouter from './routes/QuizRouter.js';
import adminAuthRoutes from './routes/adminAuthRoutes.js';
import assignmentRouter from './routes/AssignmentRouter.js';
// import aiRoutes from './routes/AiRoutes.js';
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: true,
     credentials: true,
    withCredentials: true}));
app.use(express.json());
app.use(cookieParser());

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/learn_novar', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRouter);
app.use('/api/calendar', calendarRouter);
app.use('/api/quiz', QuizRouter);
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/assignments', assignmentRouter);

app.post("/trans", async (req, res) => {
    try {
        const { videoUrl } = req.body;
        if (!videoUrl)
            return res.status(400).json({ message: "Video URL is required" });

        // Extract Video ID
        const match = videoUrl.match(
            /(?:youtube\.com\/.*v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
        );
        const videoId = match ? match[1] : null;
        if (!videoId)
            return res.status(400).json({ message: "Invalid YouTube URL" });

        console.log(`🎥 Fetching transcript for video: ${videoId}`);

        // Fetch transcript using youtube-transcript
        const transcriptArray = await YoutubeTranscript.fetchTranscript(videoId);

        if (!transcriptArray || transcriptArray.length === 0)
            return res.status(404).json({ message: "No transcript found." });

        // Combine transcript into one paragraph
        const transcriptText = transcriptArray
            .map((t) => t.text)
            .join(" ")
            .replace(/\s+/g, " ")
            .trim();

        res.json({
            source: "youtube-transcript",
            transcript: transcriptText,
        });
    } catch (error) {
        console.error("❌ Transcript Fetch Error:", error.message);
        res.status(500).json({
            message: "Failed to fetch transcript",
            error: error.message,
        });
    }
});

const db = mongoose.connection;
db.on('error', (err) => console.error('MongoDB connection error:', err));
db.once('open', () => {
    console.log('MongoDB connected successfully');
    app.listen(PORT, () => {
        console.log(`Nova Learn backend server running on http://localhost:${PORT}`);
    });
});

app.get('/', (req, res) => {
    res.send('Nova Learn backend server is running!');
});
