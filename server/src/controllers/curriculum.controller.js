import { Curriculum } from '../models/Curriculum.js';

export const getCurriculum = async (req, res, next) => {
  try {
    const curriculum = await Curriculum.findOne({}).lean();
    if (!curriculum) {
      return res.status(404).json({ error: 'Curriculum not found. Ensure seeding script has run.' });
    }
    res.status(200).json(curriculum);
  } catch (error) {
    next(error);
  }
};