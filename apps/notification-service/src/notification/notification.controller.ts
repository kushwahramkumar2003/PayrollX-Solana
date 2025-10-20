import { Controller, Get, Post, Body, Param } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { NotificationService } from "./notification.service";

@ApiTags("Notifications")
@Controller("notifications")
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: "Get all notifications" })
  @ApiResponse({
    status: 200,
    description: "Notifications retrieved successfully",
  })
  async findAll() {
    return this.notificationService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get notification by ID" })
  @ApiResponse({
    status: 200,
    description: "Notification retrieved successfully",
  })
  async findOne(@Param("id") id: string) {
    return this.notificationService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: "Create a new notification" })
  @ApiResponse({
    status: 201,
    description: "Notification created successfully",
  })
  async create(@Body() createNotificationDto: any) {
    return this.notificationService.create(createNotificationDto);
  }

  @Post(":id/send")
  @ApiOperation({ summary: "Send notification" })
  @ApiResponse({ status: 200, description: "Notification sent successfully" })
  async send(@Param("id") id: string) {
    return this.notificationService.send(id);
  }
}

