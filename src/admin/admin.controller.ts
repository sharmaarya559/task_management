import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
} from "@nestjs/common";
import { AdminService } from "./admin.service";
import { AdminLoginDto } from "./dto/login.dto";
import { ApiOperation } from "@nestjs/swagger";
import { Request, Response } from "express";
import { CreateTaskDto } from "./dto/create-task.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";
import { AssignTaskDto } from "./dto/assign-task.dto";
import { AdminGuard } from "src/guards/admin.auth.guard";
import { CreateTeamDto } from "./dto/create-team.dto";
import { UpdateTeamDto } from "./dto/update-team.dto";

@Controller("admin")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /****************************ADMIN LOGIN**************************/
  @ApiOperation({ summary: "Admin Login" })
  @Post("login")
  async adminLogin(
    @Headers("Content-Language") lang: string,
    @Body() body: AdminLoginDto,
    @Res() res: Response
  ) {
    return await this.adminService.adminLogin(lang, body, res);
  }

  /****************************CREATE MANAGER***********************/
  @ApiOperation({ summary: "Create Manager" })
  @UseGuards(AdminGuard)
  @Post("create_manager/:user_id")
  async createManager(
    @Headers("Content-Language") lang: string,
    @Param("user_id") user_id: string,
    @Res() res: Response
  ) {
    return await this.adminService.createManager(lang, user_id, res);
  }

  /**************************GET ALL USERS**************************/
  @ApiOperation({ summary: "Get All Users" })
  @UseGuards(AdminGuard)
  @Get("get_all_users")
  async getAllUsers(
    @Query("page") page: number,
    @Query("limit") limit: number,
    @Query("search") search: string,
    @Res() res: Response
  ) {
    return await this.adminService.getAllUsers(page, limit, search, res);
  }

  /**************************BLOCK USER****************************/
  @ApiOperation({ summary: "Block User" })
  @UseGuards(AdminGuard)
  @Post("block_user/:user_id")
  async blockUser(
    @Headers("Content-Language") lang: string,
    @Param("user_id") user_id: string,
    @Res() res: Response
  ) {
    return await this.adminService.blockUser(lang, user_id, res);
  }

  /**************************UNBLOCK USER**************************/
  @ApiOperation({ summary: "Unblock User" })
  @UseGuards(AdminGuard)
  @Post("unblock_user/:user_id")
  async unblockUser(
    @Headers("Content-Language") lang: string,
    @Param("user_id") user_id: string,
    @Res() res: Response
  ) {
    return await this.adminService.unblockUser(lang, user_id, res);
  }

  /****************************CREATE TASK**************************/
  @ApiOperation({ summary: "Create Task" })
  @UseGuards(AdminGuard)
  @Get("create_task")
  async createTask(
    @Headers("Content-Language") lang: string,
    @Body() body: CreateTaskDto,
    @Res() res: Response
  ) {
    return await this.adminService.createTask(lang, body, res);
  }

  /****************************UPDATE TASK**************************/
  @ApiOperation({ summary: "Update Task" })
  @UseGuards(AdminGuard)
  @Post("update_task/:task_id")
  async updateTask(
    @Headers("Content-Language") lang: string,
    @Param("task_id") task_id: string,
    @Body() body: UpdateTaskDto,
    @Res() res: Response
  ) {
    return await this.adminService.updateTask(lang, task_id, body, res);
  }

  /****************************DELETE TASK**************************/
  @ApiOperation({ summary: "Delete Task" })
  @UseGuards(AdminGuard)
  @Post("delete_task/:task_id")
  async deleteTask(
    @Headers("Content-Language") lang: string,
    @Param("task_id") task_id: string,
    @Res() res: Response
  ) {
    return await this.adminService.deleteTask(lang, task_id, res);
  }

  /**************************GET ALL TASKS**************************/
  @ApiOperation({ summary: "Get All Tasks" })
  @UseGuards(AdminGuard)
  @Post("get_all_tasks")
  async getAllTasks(
    @Headers("Content-Language") lang: string,
    @Query("page") page: number,
    @Query("limit") limit: number,
    @Query("search") search: string,
    @Res() res: Response
  ) {
    return await this.adminService.getAllTasks(lang, page, limit, search, res);
  }

  /**************************ASSIGN TASK****************************/
  @ApiOperation({ summary: "Assign Task To User" })
  @UseGuards(AdminGuard)
  @Post("assign_task")
  async assignTask(
    @Headers("Content-Language") lang: string,
    @Body() body: AssignTaskDto,
    @Res() res: Response
  ) {
    return await this.adminService.assignTask(lang, body, res);
  }

  /**************************DELETE ASSIGNED TASK****************************/
  @ApiOperation({ summary: "Delete Assigned Task" })
  @UseGuards(AdminGuard)
  @Post("delete_assigned_task/:assign_id")
  async deleteAssignedTask(
    @Headers("Content-Language") lang: string,
    @Param("assign_id") assign_id: string,
    @Res() res: Response
  ) {
    return await this.adminService.deleteAssignedTask(lang, assign_id, res);
  }

  /**************************CREATE TEAM************************************/
  @ApiOperation({ summary: "Create Team" })
  @UseGuards(AdminGuard)
  @Post("create_team")
  async createTeam(
    @Headers("Content-Language") lang: string,
    @Body() body: CreateTeamDto,
    @Res() res: Response
  ) {
    return await this.adminService.createTeam(lang, body, res);
  }

  /**************************UPDATE TEAM************************************/
  @ApiOperation({ summary: "Update Team" })
  @UseGuards(AdminGuard)
  @Post("update_team/:team_id")
  async updateTeam(
    @Headers("Content-Language") lang: string,
    @Param("team_id") team_id: string,
    @Body() body: UpdateTeamDto,
    @Res() res: Response
  ) {
    return await this.adminService.updateTeam(lang, team_id, body, res);
  }
}
