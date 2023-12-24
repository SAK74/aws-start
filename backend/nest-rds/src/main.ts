import { NestFactory } from '@nestjs/core';
import serverlessExpress from '@codegenie/serverless-express';

import helmet from 'helmet';

import { AppModule } from './app.module';
import { Handler } from 'aws-lambda';

const port = process.env.PORT || 4000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: (req, callback) => callback(null, true),
  });
  app.use(helmet());
  // await app.listen(port);

  app.init();
  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
}
// bootstrap().then(() => {
//   console.log('App is running on %s port', port);
// });

let server: Handler;
export const handler: Handler = async (event, context, cb) => {
  server = server ?? (await bootstrap());
  return server(event, context, cb);
};
