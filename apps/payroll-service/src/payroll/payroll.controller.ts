import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { ThrottlerGuard } from "@nestjs/throttler";
import { PayrollService } from "./payroll.service";
import { CreatePayrollRunDto, ExecutePayrollRunDto } from "@payrollx/contracts";

@ApiTags("Payroll")
@Controller("payroll")
@UseGuards(ThrottlerGuard)
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Post("runs")
  @ApiOperation({ summary: "Create a new payroll run" })
  @ApiResponse({
    status: 201,
    description: "Payroll run created successfully",
  })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  async createPayrollRun(
    @Body() createPayrollRunDto: CreatePayrollRunDto,
    @Request() req: any
  ) {
    return this.payrollService.createPayrollRun(
      createPayrollRunDto,
      req.user.id
    );
  }

  @Get("runs/:id")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get payroll run by ID" })
  @ApiResponse({
    status: 200,
    description: "Payroll run retrieved successfully",
  })
  @ApiResponse({ status: 404, description: "Payroll run not found" })
  async getPayrollRun(@Param("id") id: string) {
    return this.payrollService.getPayrollRun(id);
  }

  @Post("runs/:id/execute")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Execute payroll run" })
  @ApiResponse({
    status: 200,
    description: "Payroll run executed successfully",
  })
  @ApiResponse({ status: 404, description: "Payroll run not found" })
  @ApiResponse({ status: 400, description: "Payroll run cannot be executed" })
  async executePayrollRun(
    @Param("id") id: string,
    @Body() executePayrollRunDto: ExecutePayrollRunDto
  ) {
    return this.payrollService.executePayrollRun(id, executePayrollRunDto);
  }

  @Get("runs")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get all payroll runs for organization" })
  @ApiResponse({
    status: 200,
    description: "Payroll runs retrieved successfully",
  })
  async getPayrollRuns(@Request() req: any) {
    return this.payrollService.getPayrollRuns(req.user.organizationId);
  }
}

