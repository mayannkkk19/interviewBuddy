import mongoose from 'mongoose';

const moduleSchema = new mongoose.Schema({
  n: { type: Number, required: true },
  title: { type: String, required: true },
  days: {
    type: [Number],
    validate: [arr => arr.length === 2, 'Days array must contain [startDay, endDay]']
  }
}, { _id: false });

const daySchema = new mongoose.Schema({
  day: { type: Number, required: true },
  title: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['SETUP', 'BUILD', 'AI_CORE', 'LEARN', 'SHIP_IT', 'OPTIMIZE', 'CAPSTONE']
  },
  tools: [{ type: String }],
  objectives: [{ type: String }]
}, { _id: false });

const curriculumSchema = new mongoose.Schema({
  cohort: { type: String, required: true },
  modules: [moduleSchema],
  days: [daySchema]
}, { timestamps: true });

export const Curriculum = mongoose.model('Curriculum', curriculumSchema);