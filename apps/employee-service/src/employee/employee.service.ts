import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import {
  CreateEmployeeDto,
  UpdateEmployeeDto,
  KycDocumentDto,
  KycStatus,
} from "@payrollx/contracts";

@Injectable()
export class EmployeeService {
  private readonly logger = new Logger(EmployeeService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createEmployeeDto: CreateEmployeeDto, createdBy: string) {
    const { organizationId, userId, salary, paymentToken } = createEmployeeDto;

    // Check if employee already exists for this user in this organization
    const existingEmployee = await this.prisma.employee.findFirst({
      where: {
        organizationId,
        userId,
        deletedAt: null,
      },
    });

    if (existingEmployee) {
      throw new ConflictException(
        "Employee already exists for this user in this organization"
      );
    }

    // Create employee
    const employee = await this.prisma.employee.create({
      data: {
        organizationId,
        userId,
        salary: salary ? parseFloat(salary.toString()) : null,
        paymentToken,
        kycStatus: KycStatus.PENDING,
      },
    });

    this.logger.log(`Employee created: ${employee.id}`);

    // Emit RabbitMQ event
    await this.emitEvent("EmployeeCreated", {
      employeeId: employee.id,
      organizationId: employee.organizationId,
      userId: employee.userId,
      createdAt: employee.createdAt,
    });

    return employee;
  }

  async findOne(id: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id, deletedAt: null },
      include: {
        organization: true,
      },
    });

    if (!employee) {
      throw new NotFoundException("Employee not found");
    }

    return employee;
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto) {
    const employee = await this.prisma.employee.findUnique({
      where: { id, deletedAt: null },
    });

    if (!employee) {
      throw new NotFoundException("Employee not found");
    }

    const updatedEmployee = await this.prisma.employee.update({
      where: { id },
      data: {
        ...updateEmployeeDto,
        salary: updateEmployeeDto.salary
          ? parseFloat(updateEmployeeDto.salary.toString())
          : undefined,
      },
    });

    this.logger.log(`Employee updated: ${id}`);

    return updatedEmployee;
  }

  async linkWallet(employeeId: string, walletAddress: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId, deletedAt: null },
    });

    if (!employee) {
      throw new NotFoundException("Employee not found");
    }

    // Validate Solana wallet address format
    if (!this.isValidSolanaAddress(walletAddress)) {
      throw new BadRequestException("Invalid Solana wallet address");
    }

    const updatedEmployee = await this.prisma.employee.update({
      where: { id: employeeId },
      data: { walletAddress },
    });

    this.logger.log(`Wallet linked for employee: ${employeeId}`);

    return updatedEmployee;
  }

  async uploadKycDocuments(
    employeeId: string,
    kycDocumentDto: KycDocumentDto,
    file: Express.Multer.File
  ) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId, deletedAt: null },
    });

    if (!employee) {
      throw new NotFoundException("Employee not found");
    }

    // In a real implementation, you would upload the file to cloud storage
    // For now, we'll just store the metadata
    const documentMetadata = {
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      uploadedAt: new Date().toISOString(),
      documentType: kycDocumentDto.documentType,
    };

    const updatedEmployee = await this.prisma.employee.update({
      where: { id: employeeId },
      data: {
        kycDocuments: documentMetadata,
        kycStatus: KycStatus.VERIFIED,
      },
    });

    this.logger.log(`KYC documents uploaded for employee: ${employeeId}`);

    return updatedEmployee;
  }

  async verifyKyc(employeeId: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId, deletedAt: null },
    });

    if (!employee) {
      throw new NotFoundException("Employee not found");
    }

    if (employee.kycStatus !== KycStatus.VERIFIED) {
      throw new BadRequestException("Employee KYC is not in verified status");
    }

    const updatedEmployee = await this.prisma.employee.update({
      where: { id: employeeId },
      data: { kycStatus: KycStatus.APPROVED },
    });

    this.logger.log(`KYC approved for employee: ${employeeId}`);

    // Emit RabbitMQ event
    await this.emitEvent("EmployeeVerified", {
      employeeId: employee.id,
      organizationId: employee.organizationId,
      verifiedAt: new Date().toISOString(),
    });

    return updatedEmployee;
  }

  private isValidSolanaAddress(address: string): boolean {
    // Basic Solana address validation (Base58, 32-44 characters)
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    return base58Regex.test(address);
  }

  private async emitEvent(eventType: string, data: any) {
    // This would emit events to RabbitMQ
    // For now, we'll just log the event
    this.logger.log(`Event emitted: ${eventType}`, data);
  }
}

