import { CommandFactory } from 'nest-commander';

import { AppModule } from './modules/app/app.module';

const bootstrap = async () => {
  await CommandFactory.run(AppModule);
};

bootstrap();
