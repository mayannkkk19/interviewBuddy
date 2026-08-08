import { z } from 'zod';

export const interviewPayloadSchema = z.object({
  sessionId: z.string({ required_error: "sessionId is required" }).min(1, "sessionId cannot be empty"),
  candidate: z.object({
    id: z.string().optional(),
    name: z.string().optional(),
    title: z.string().optional(),
    experienceLevel: z.string().optional(),
    skills: z.array(z.string()).optional(),
    projects: z.array(z.any()).optional()
  }).passthrough().optional(),
  message: z.string().optional()
});