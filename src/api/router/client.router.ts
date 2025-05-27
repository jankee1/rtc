import express from 'express';
import { getState } from '../controller';

export const clientRouter = express.Router();

clientRouter.get('/state',getState);