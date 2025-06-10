// health.controller.ts
import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HealthCheck,
  HttpHealthIndicator,
} from '@nestjs/terminus';

//A health check is a simple API endpoint that platforms like Render ping regularly to verify your app is working, 
//so they can automatically restart it or reroute traffic if it stops responding.

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      // Basic ping check
      () => this.http.pingCheck('basic', 'https://www.google.com/'),
    ]);
  }

  @Get('simple')
  simpleCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
