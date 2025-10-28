import {
  Controller,
  All,
  Body,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GatewayService } from './gateway.service';

@ApiTags('Gateway')
@Controller()
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @All('auth/*')
  @ApiOperation({ summary: 'Proxy to auth service' })
  async proxyToAuth(
    @Req() req: Request,
    @Param() params: any,
    @Query() query: any,
    @Body() body: any,
  ) {
    return this.gatewayService.proxyRequest('auth', params, query, body, req.method);
  }

  @All('org/*')
  @ApiOperation({ summary: 'Proxy to org service' })
  async proxyToOrg(
    @Req() req: Request,
    @Param() params: any,
    @Query() query: any,
    @Body() body: any,
  ) {
    return this.gatewayService.proxyRequest('org', params, query, body, req.method);
  }

  @All('employee/*')
  @ApiOperation({ summary: 'Proxy to employee service' })
  async proxyToEmployee(
    @Req() req: Request,
    @Param() params: any,
    @Query() query: any,
    @Body() body: any,
  ) {
    return this.gatewayService.proxyRequest('employee', params, query, body, req.method);
  }

  @All('wallet/*')
  @ApiOperation({ summary: 'Proxy to wallet service' })
  async proxyToWallet(
    @Req() req: Request,
    @Param() params: any,
    @Query() query: any,
    @Body() body: any,
  ) {
    return this.gatewayService.proxyRequest('wallet', params, query, body, req.method);
  }

  @All('payroll/*')
  @ApiOperation({ summary: 'Proxy to payroll service' })
  async proxyToPayroll(
    @Req() req: Request,
    @Param() params: any,
    @Query() query: any,
    @Body() body: any,
  ) {
    return this.gatewayService.proxyRequest('payroll', params, query, body, req.method);
  }

  @All('transaction/*')
  @ApiOperation({ summary: 'Proxy to transaction service' })
  async proxyToTransaction(
    @Req() req: Request,
    @Param() params: any,
    @Query() query: any,
    @Body() body: any,
  ) {
    return this.gatewayService.proxyRequest('transaction', params, query, body, req.method);
  }

  @All('notification/*')
  @ApiOperation({ summary: 'Proxy to notification service' })
  async proxyToNotification(
    @Req() req: Request,
    @Param() params: any,
    @Query() query: any,
    @Body() body: any,
  ) {
    return this.gatewayService.proxyRequest('notification', params, query, body, req.method);
  }

  @All('compliance/*')
  @ApiOperation({ summary: 'Proxy to compliance service' })
  async proxyToCompliance(
    @Req() req: Request,
    @Param() params: any,
    @Query() query: any,
    @Body() body: any,
  ) {
    return this.gatewayService.proxyRequest('compliance', params, query, body, req.method);
  }
}

