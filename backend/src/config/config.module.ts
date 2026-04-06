import { Module, Global } from '@nestjs/common';

@Global()
@Module({})
export class ConfigModule {
  static forRoot() {
    return {
      module: ConfigModule,
    };
  }
}
