// const express = require('express');
// const cors = require('cors');
// const mongoose = require('mongoose');
// const cookieParser = require('cookie-parser');
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
// require('dotenv').config();
dotenv.config();

// const authRoutes = require('./routes/authRoutes.js').default || require('./routes/authRoutes.js');
import authRoutes from './routes/authRoutes.js';
import courseRouter from './routes/CourseRouter.js';
import calendarRouter from './routes/CalendarRoutes.js';
// import aiRoutes from './routes/AiRoutes.js';
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/nova_learn', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRouter);
app.use('/api/calendar', calendarRouter);
// app.use('/api/ai', aiRoutes);

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
