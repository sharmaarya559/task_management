import { HttpStatus, Injectable, UnauthorizedException } from "@nestjs/common";
import {
  ErrorMessages,
  SuccessMessages,
} from "src/utils/response-message.helper";
import { AdminLoginDto } from "./dto/login.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Admin, AdminDocument } from "src/schema/admin.schema";
import mongoose, { Model } from "mongoose";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { Request, Response } from "express";
import { CustomException } from "src/exception/custom.exception";
import { User, UserDocument } from "src/schema/user.schema";
import { CreateTaskDto } from "./dto/create-task.dto";
import { Task, TaskDocument } from "src/schema/task.schema";
import { UpdateTaskDto } from "./dto/update-task.dto";
import {
  Map_User_Task,
  Map_User_Task_Document,
} from "src/schema/map-user-task.schema";
import { AssignTaskDto } from "./dto/assign-task.dto";
import { CreateTeamDto } from "./dto/create-team.dto";
import { Team, TeamDocument } from "src/schema/team.schema";
import { UpdateTeamDto } from "./dto/update-team.dto";

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name) private readonly adminModel: Model<AdminDocument>,
    private readonly jwtService: JwtService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>,
    @InjectModel(Map_User_Task.name)
    private readonly mapUserTaskModel: Model<Map_User_Task_Document>,
    @InjectModel(Team.name)
    private readonly teamModel: Model<TeamDocument>
  ) {}

  /****************************ADMIN LOGIN**************************/
  async adminLogin(lang: string, body: AdminLoginDto, res: Response) {
    try {
      const admin = await this.adminModel.findOne({ email: body.email });
      if (!admin) {
        throw new UnauthorizedException(
          ErrorMessages?.INVALID_CREDENTIALS[lang || "EN"]
        );
      }
      const isMatch = await bcrypt.compare(body?.password, admin?.password);

      if (!isMatch) {
        throw new UnauthorizedException(
          ErrorMessages?.INVALID_CREDENTIALS[lang || "EN"]
        );
      }
      const payload = {
        id: admin?._id,
        role: "admin",
      };
      const token = await this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET_KEY,
        expiresIn: "24h",
      });
      return res.status(HttpStatus.CREATED).json({
        success: true,
        statusCode: 201,
        message: SuccessMessages.LOGIN_SUCCESSFULL[lang || "EN"],
        token,
      });
    } catch (error) {
      throw new CustomException(error, error.status);
    }
  }

  /****************************CREATE MANAGER***********************/
  async createManager(lang: string, user_id: string, res: Response) {
    try {
      await this.userModel.findByIdAndUpdate(user_id, { role: "manager" });
      return res.status(HttpStatus.CREATED).json({
        success: true,
        statusCode: 201,
        message: SuccessMessages.LOGIN_SUCCESSFULL[lang || "EN"],
      });
    } catch (error) {
      throw new CustomException(error, error.status);
    }
  }

  /****************************GET ALL USERS************************/
  async getAllUsers(page = 1, limit = 10, search = " ", res: Response) {
    try {
      const data = await this.userModel
        .find({
          $or: [
            { full_name: { $regex: `.*${search}.*`, $options: "i" } },
            { phone_number: { $regex: `.*${search}.*`, $options: "i" } },
            { username: { $regex: `.*${search}.*`, $options: "i" } },
            { country: { $regex: `.*${search}.*`, $options: "i" } },
            { city: { $regex: `.*${search}.*`, $options: "i" } },
          ],
        })
        .select({ password: 0 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit));
      const total = await this.userModel.countDocuments({
        $or: [
          { full_name: { $regex: `.*${search}.*`, $options: "i" } },
          { phone_number: { $regex: `.*${search}.*`, $options: "i" } },
          { username: { $regex: `.*${search}.*`, $options: "i" } },
          { country: { $regex: `.*${search}.*`, $options: "i" } },
          { city: { $regex: `.*${search}.*`, $options: "i" } },
        ],
      });
      return res.status(HttpStatus.OK).json({
        success: true,
        statusCode: 200,
        current_page: Number(page),
        total_pages: Math.ceil(Number(total) / Number(limit)) || 0,
        limit: Number(limit),
        total: Number(total),
        data,
      });
    } catch (error) {
      throw new CustomException(error, error.status);
    }
  }

  /****************************BLOCK USER***************************/
  async blockUser(lang: string, user_id: string, res: Response) {
    try {
      await this.userModel.findByIdAndUpdate(user_id, { is_blocked: true });
      return res.status(HttpStatus.CREATED).json({
        success: true,
        statusCode: 201,
        message: SuccessMessages.USER_BLOCKED[lang || "EN"],
      });
    } catch (error) {
      throw new CustomException(error, error.status);
    }
  }

  /****************************UNBLOCK USER*************************/
  async unblockUser(lang: string, user_id: string, res: Response) {
    try {
      await this.userModel.findByIdAndUpdate(user_id, { is_blocked: false });
      return res.status(HttpStatus.CREATED).json({
        success: true,
        statusCode: 201,
        message: SuccessMessages.USER_UNBLOCKED[lang || "EN"],
      });
    } catch (error) {
      throw new CustomException(error, error.status);
    }
  }

  /****************************CREATE TASK**************************/
  async createTask(lang: string, body: CreateTaskDto, res: Response) {
    try {
      await new this.taskModel(body).save();
      return res.status(HttpStatus.CREATED).json({
        success: true,
        statusCode: 201,
        message: SuccessMessages?.TASK_CREATED[lang || "EN"],
      });
    } catch (error) {
      throw new CustomException(error, error.status);
    }
  }

  /****************************UPDATE TASK**************************/
  async updateTask(
    lang: string,
    task_id: string,
    body: UpdateTaskDto,
    res: Response
  ) {
    try {
      await this.taskModel.findByIdAndUpdate(task_id, body);
      return res.status(HttpStatus.CREATED).json({
        success: true,
        statusCode: 201,
        message: SuccessMessages?.TASK_UPDATED[lang || "EN"],
      });
    } catch (error) {
      throw new CustomException(error, error.status);
    }
  }

  /****************************DELETE TASK**************************/
  async deleteTask(lang: string, task_id: string, res: Response) {
    try {
      await this.taskModel.findByIdAndDelete(task_id);
      return res.status(HttpStatus.CREATED).json({
        success: true,
        statusCode: 201,
        message: SuccessMessages?.TASK_DELETED[lang || "EN"],
      });
    } catch (error) {
      throw new CustomException(error, error.status);
    }
  }

  /****************************GET ALL TASKS************************/
  async getAllTasks(
    lang: string,
    page: number,
    limit: number,
    search: string,
    res: Response
  ) {
    try {
      const data = await this.taskModel
        .find({
          $or: [
            { title: { $regex: `.*${search}.*`, $options: "i" } },
            { description: { $regex: `.*${search}.*`, $options: "i" } },
          ],
        })
        .select({ password: 0 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit));
      const total = await this.taskModel.countDocuments({
        $or: [
          { title: { $regex: `.*${search}.*`, $options: "i" } },
          { description: { $regex: `.*${search}.*`, $options: "i" } },
        ],
      });
      return res.status(HttpStatus.OK).json({
        success: true,
        statusCode: 200,
        current_page: Number(page),
        total_pages: Math.ceil(Number(total) / Number(limit)) || 0,
        limit: Number(limit),
        total: Number(total),
        data,
      });
    } catch (error) {
      throw new CustomException(error, error.status);
    }
  }

  /****************************ASSIGN TASK**************************/
  async assignTask(lang: string, body: AssignTaskDto, res: Response) {
    try {
      await new this.mapUserTaskModel({
        assigned_by: "admin",
        manager_id: new mongoose.Types.ObjectId(body?.manager_id),
        assigned_to: new mongoose.Types.ObjectId(body?.user_id),
        task_id: new mongoose.Types.ObjectId(body?.task_id),
      });
      return res.status(HttpStatus.CREATED).json({
        success: true,
        statusCode: 201,
        message: SuccessMessages?.TASK_ASSIGNED[lang || "EN"],
      });
    } catch (error) {
      throw new CustomException(error, error.status);
    }
  }

  /**********************DELETE ASSIGNED TASK***********************/
  async deleteAssignedTask(lang: string, assign_id: string, res: Response) {
    try {
      await this.mapUserTaskModel.findByIdAndDelete(assign_id);
      return res.status(HttpStatus.CREATED).json({
        success: true,
        statusCode: 201,
        message: SuccessMessages?.ASSIGNED_TASK_DELETED[lang || "EN"],
      });
    } catch (error) {
      throw new CustomException(error, error.status);
    }
  }

  /***************************CREATE TEAM****************************/
  async createTeam(lang: string, body: CreateTeamDto, res: Response) {
    try {
      const users = body?.users.map(
        (item) => new mongoose.Types.ObjectId(item)
      );
      await new this.teamModel({
        manager_id: new mongoose.Types.ObjectId(body?.manager_id),
        users,
      }).save();
      return res.status(HttpStatus.CREATED).json({
        success: true,
        statusCode: 201,
        message: SuccessMessages?.TEAM_CREATED[lang || "EN"],
      });
    } catch (error) {
      throw new CustomException(error, error.status);
    }
  }

  /***************************UPDATE TEAM****************************/
  async updateTeam(
    lang: string,
    team_id: string,
    body: UpdateTeamDto,
    res: Response
  ) {
    try {
      const data = {};
      if (body?.users) {
        data["users"] = body?.users.map(
          (item) => new mongoose.Types.ObjectId(item)
        );
      }
      if (body?.manager_id) {
        data["manager_id"] = new mongoose.Types.ObjectId(body?.manager_id);
      }
      await this.teamModel.findByIdAndUpdate(team_id, data);
      return res.status(HttpStatus.CREATED).json({
        success: true,
        statusCode: 201,
        message: SuccessMessages?.TEAM_UPDATED[lang || "EN"],
      });
    } catch (error) {
      throw new CustomException(error, error.status);
    }
  }
}
