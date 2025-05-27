import express from 'express';
import { crtConfig } from './config';
import { clientRouter, unknownRouter } from './router';
import { globalErrorHandlerMiddleware } from './middleware';

const app = express();

    app
        .use(express.json())
        .use('/v1/client', clientRouter)
        .use(unknownRouter)
        .use(globalErrorHandlerMiddleware);

app.listen(crtConfig.port, () => {
  console.log(`Server listening on port ${crtConfig.port}`);
});