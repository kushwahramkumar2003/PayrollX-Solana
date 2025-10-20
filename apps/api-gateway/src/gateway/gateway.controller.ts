import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GatewayService } from './gateway.service';

@ApiTags('Gateway')
@Controller('gateway')
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @Get('auth/*')
  @ApiOperation({ summary: 'Proxy to auth service' })
  async proxyToAuth(@Param() params: any, @Query() query: any) {
    return this.gatewayService.proxyRequest('auth', params, query);
  }

  @Get('org/*')
  @ApiOperation({ summary: 'Proxy to org service' })
  async proxyToOrg(@Param() params: any, @Query() query: any) {
    return this.gatewayService.proxyRequest('org', params, query);
  }

  @Get('employee/*')
  @ApiOperation({ summary: 'Proxy to employee service' })
  async proxyToEmployee(@Param() params: any, @Query() query: any) {
    return this.gatewayService.proxyRequest('employee', params, query);
  }

  @Get('wallet/*')
  @ApiOperation({ summary: 'Proxy to wallet service' })
  async proxyToWallet(@Param() params: any, @Query() query: any) {
    return this.gatewayService.proxyRequest('wallet', params, query);
  }

  @Get('payroll/*')
  @ApiOperation({ summary: 'Proxy to payroll service' })
  async proxyToPayroll(@Param() params: any, @Query() query: any) {
    return this.gatewayService.proxyRequest('payroll', params, query);
  }

  @Get('transaction/*')
  @ApiOperation({ summary: 'Proxy to transaction service' })
  async proxyToTransaction(@Param() params: any, @Query() query: any) {
    return this.gatewayService.proxyRequest('transaction', params, query);
  }

  @Get('notification/*')
  @ApiOperation({ summary: 'Proxy to notification service' })
  async proxyToNotification(@Param() params: any, @Query() query: any) {
    return this.gatewayService.proxyRequest('notification', params, query);
  }

  @Get('compliance/*')
  @ApiOperation({ summary: 'Proxy to compliance service' })
  async proxyToCompliance(@Param() params: any, @Query() query: any) {
    return this.gatewayService.proxyRequest('compliance', params, query);
  }
}

