// lib/models/Quiz.ts
import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IQuiz extends Document {
    userId: string;
    courseId: string;
    score: number;
    createdAt: Date;
}

const quizSchema: Schema<IQuiz> = new mongoose.Schema({
    userId: { type: String, required: true },
    courseId: { type: String, required: true },
    score: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});

const Quiz: Model<IQuiz> = mongoose.models.Quiz || mongoose.model<IQuiz>("Quiz", quizSchema);

export default Quiz;