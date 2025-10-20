import { Module } from "@nestjs/common";
import { SchedulerService } from "./scheduler.service";
import { PayrollModule } from "../payroll/payroll.module";

@Module({
  imports: [PayrollModule],
  providers: [SchedulerService],
  exports: [SchedulerService],
})
export class SchedulerModule {}
