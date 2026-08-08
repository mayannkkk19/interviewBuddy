import mongoose from 'mongoose';

const curriculumVectorSchema = new mongoose.Schema({
  day: { type: Number, required: true },
  topic: { type: String, required: true },
  module: { type: String, required: true },
  content: { type: String, required: true },
  embedding: { type: [Number], required: true }
});

export const CurriculumVector = mongoose.model('CurriculumVector', curriculumVectorSchema, 'curriculumvectors');