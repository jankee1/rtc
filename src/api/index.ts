import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { crtConfig } from './config';
import { clientRouter, unknownRouter } from './router';
import { globalErrorHandlerMiddleware } from './middleware';
import { MysteriousCrawlerConsumer } from '../consumer';

const app = express();
  app
      .use(express.json())
      .use('/v1/client', clientRouter)
      .use(unknownRouter)
      .use(globalErrorHandlerMiddleware)
      .listen(crtConfig.port, () =>  console.log(`Server listening on port ${crtConfig.port}`));

new MysteriousCrawlerConsumer();
