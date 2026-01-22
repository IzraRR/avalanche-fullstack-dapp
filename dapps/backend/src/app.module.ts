import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core'; 
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'; 
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BlockchainModule } from './blockchain/blockchain.module';

@Module({
  imports: [
    // Rate limiting: 30 requests per 60 seconds (1 minute)
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 60_000, // 1 minute
        limit: 30, // 30 requests per minute
      },
      {
        name: 'long',
        ttl: 900_000, // 15 minutes
        limit: 100, // 100 requests per 15 minutes
      },
    ]),
    BlockchainModule, 
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}