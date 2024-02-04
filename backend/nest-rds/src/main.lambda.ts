import { NestFactory } from '@nestjs/core';
import serverlessExpress from '@codegenie/serverless-express';

import helmet from 'helmet';

import { AppModule } from './app.module';
import type { Handler } from 'aws-lambda';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: (req, callback) => callback(null, true),
  });
  app.use(helmet());

  await app.init();
  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
}

let server: Handler;
export const handler: Handler = async (event, context, cb) => {
  server = server ?? (await bootstrap());
  return server(event, context, cb);
};
