import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
} from "@payrollx/contracts";
import { Connection, PublicKey } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";

@Injectable()
export class OrganizationService {
  private readonly logger = new Logger(OrganizationService.name);
  private connection: Connection;

  constructor(private readonly prisma: PrismaService) {
    this.connection = new Connection(
      process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com",
      "confirmed"
    );
  }

  async create(createOrganizationDto: CreateOrganizationDto, userId: string) {
    const { name, config } = createOrganizationDto;

    // Check if organization already exists
    const existingOrg = await this.prisma.organization.findFirst({
      where: { name },
    });

    if (existingOrg) {
      throw new ConflictException("Organization with this name already exists");
    }

    // Create organization in database
    const organization = await this.prisma.organization.create({
      data: {
        name,
        config: config || {},
        createdBy: userId,
      },
    });

    this.logger.log(`Organization created: ${organization.id}`);

    // Emit RabbitMQ event
    await this.emitEvent("OrganizationCreated", {
      organizationId: organization.id,
      name: organization.name,
      createdAt: organization.createdAt,
    });

    return organization;
  }

  async findOne(id: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        employees: true,
      },
    });

    if (!organization) {
      throw new NotFoundException("Organization not found");
    }

    return organization;
  }

  async update(id: string, updateOrganizationDto: UpdateOrganizationDto) {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
    });

    if (!organization) {
      throw new NotFoundException("Organization not found");
    }

    const updatedOrganization = await this.prisma.organization.update({
      where: { id },
      data: updateOrganizationDto,
    });

    this.logger.log(`Organization updated: ${id}`);

    return updatedOrganization;
  }

  async completeOnboarding(
    organizationId: string,
    authorizedSigners: string[]
  ) {
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new NotFoundException("Organization not found");
    }

    // Validate Solana public keys
    const validSigners = authorizedSigners.filter((signer) => {
      try {
        new PublicKey(signer);
        return true;
      } catch {
        return false;
      }
    });

    if (validSigners.length !== authorizedSigners.length) {
      throw new Error("Invalid Solana public keys provided");
    }

    // Update organization with authorized signers
    const updatedOrganization = await this.prisma.organization.update({
      where: { id: organizationId },
      data: {
        authorizedSigners: validSigners,
        onboardingCompleted: true,
      },
    });

    // Initialize organization on Solana program
    try {
      await this.initializeOrganizationOnSolana(organizationId, validSigners);
    } catch (error) {
      this.logger.error("Failed to initialize organization on Solana:", error);
      // Continue with database update even if Solana fails
    }

    this.logger.log(`Organization onboarding completed: ${organizationId}`);

    return updatedOrganization;
  }

  private async initializeOrganizationOnSolana(
    organizationId: string,
    authorizedSigners: string[]
  ) {
    // This would integrate with the Anchor program
    // For now, we'll just log the action
    this.logger.log(
      `Initializing organization ${organizationId} on Solana with ${authorizedSigners.length} signers`
    );

    // In a real implementation, you would:
    // 1. Load the Anchor program
    // 2. Create the organization account
    // 3. Set up the authorized signers
    // 4. Handle any errors and rollback if needed
  }

  private async emitEvent(eventType: string, data: any) {
    // This would emit events to RabbitMQ
    // For now, we'll just log the event
    this.logger.log(`Event emitted: ${eventType}`, data);
  }
}

