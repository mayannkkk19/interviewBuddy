import { Candidate } from '../models/Candidate.js';

export const getAllCandidates = async (req, res, next) => {
  try {
    const candidates = await Candidate.find({}).lean();
    res.status(200).json(candidates);
  } catch (error) {
    next(error);
  }
};

export const getCandidateById = async (req, res, next) => {
  try {
    const candidate = await Candidate.findOne({ id: req.params.id }).lean();
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    res.status(200).json(candidate);
  } catch (error) {
    next(error);
  }
};