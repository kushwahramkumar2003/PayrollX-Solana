import { Controller, Get, Post, Body, Param } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { TransactionService } from "./transaction.service";

@ApiTags("Transactions")
@Controller("transactions")
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get()
  @ApiOperation({ summary: "Get all transactions" })
  @ApiResponse({
    status: 200,
    description: "Transactions retrieved successfully",
  })
  async findAll() {
    return this.transactionService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get transaction by ID" })
  @ApiResponse({
    status: 200,
    description: "Transaction retrieved successfully",
  })
  async findOne(@Param("id") id: string) {
    return this.transactionService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: "Create a new transaction" })
  @ApiResponse({ status: 201, description: "Transaction created successfully" })
  async create(@Body() createTransactionDto: any) {
    return this.transactionService.create(createTransactionDto);
  }

  @Post(":id/execute")
  @ApiOperation({ summary: "Execute transaction" })
  @ApiResponse({
    status: 200,
    description: "Transaction executed successfully",
  })
  async execute(@Param("id") id: string) {
    return this.transactionService.execute(id);
  }
}
