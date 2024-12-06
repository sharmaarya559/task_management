import { BadRequestException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User, UserDocument } from "src/schema/user.schema";
import { Request, Response } from "express";
import mongoose, { Model } from "mongoose";
import * as bcrypt from "bcrypt";
import { Otp, OtpDocument } from "src/schema/otp.schema";
import {
  Token_Authentication,
  Token_Authentication_Document,
} from "src/schema/token-authentication.schema";
import { CustomException } from "src/exception/custom.exception";
import { SignupDto } from "src/users/dto/signup.dto";
import {
  ErrorMessages,
  SuccessMessages,
} from "src/utils/response-message.helper";
import { VerifyOtpDto } from "src/users/dto/verify-otp.dto";
import { JwtService } from "@nestjs/jwt";
import { LoginDto } from "src/users/dto/login.dto";
import { Attachment, AttachmentDocument } from "src/schema/attachment.schema";
import {
  Map_User_Task,
  Map_User_Task_Document,
} from "src/schema/map-user-task.schema";
import { Team, TeamDocument } from "src/schema/team.schema";
import { AssignTaskDto } from "./dto/assign-task.dto";
import { Task, TaskDocument } from "src/schema/task.schema";
import { UpdateTeamDto } from "./dto/update-team.dto";
import { ChangeTaskStatusDto } from "./dto/change-task-status.dto";

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Otp.name) private readonly otpModel: Model<OtpDocument>,
    @InjectModel(Token_Authentication.name)
    private readonly authModel: Model<Token_Authentication_Document>,
    private readonly jwtService: JwtService,
    @InjectModel(Attachment.name)
    private readonly attachmentModel: Model<AttachmentDocument>,
    @InjectModel(Map_User_Task.name)
    private readonly mapUserTaskModel: Model<Map_User_Task_Document>,
    @InjectModel(Team.name)
    private readonly teamModel: Model<TeamDocument>,
    @InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>
  ) {}

  /***************************SIGNUP*****************************/
  async signup(lang: string, body: SignupDto, res: Response) {
    try {
      if (body?.password !== body?.confirm_password) {
        throw new BadRequestException(
          ErrorMessages?.BOTH_PASSWORD_MATCH[lang || "EN"]
        );
      }
      const findUser = await this.userModel.findOne({
        $or: [{ username: body?.username }, { email: body?.email }],
      });
      if (findUser) {
        throw new BadRequestException(ErrorMessages?.USER_EXIST[lang || "EN"]);
      }
      const hashedPassword = await bcrypt.hash(body?.password, 10);
      await new this.userModel({
        ...body,
        password: hashedPassword,
      }).save();
      await new this.otpModel({
        email: body?.email,
        action: "verify_email",
        otp: 123456,
        expired_at: new Date(new Date().getTime() + 5 * 60 * 1000),
      }).save();
      return res.status(HttpStatus.CREATED).json({
        success: true,
        message: SuccessMessages?.OTP_SENT[lang || "EN"],
      });
    } catch (error) {
      throw new CustomException(error, error.status);
    }
  }

  /***************************VERIFY OTP*****************************/
  async verifyOtp(lang: string, body: VerifyOtpDto, res: Response) {
    try {
      const user = await this.userModel
        .findOne({ email: body?.email })
        .select({ password: 0 });
      if (!user) {
        throw new BadRequestException(
          ErrorMessages?.EMAIL_NOT_EXIST[lang || "EN"]
        );
      }
      const findOtp = await this.otpModel.findOne({
        email: body?.email,
        action: body?.action,
        expired_at: { $gte: new Date() },
      });
      if (!findOtp) {
        throw new BadRequestException(
          ErrorMessages?.OTP_NOT_FOUND[lang || "EN"]
        );
      }
      if (findOtp?.otp !== body.otp) {
        throw new BadRequestException(
          ErrorMessages?.WRONG_OTP_ENTERED[lang || "EN"]
        );
      }
      const token = await this.jwtService.sign(
        { id: user?._id, role: "user" },
        { secret: process.env.JWT_SECRET_KEY, expiresIn: "24h" }
      );
      const decode = await this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET_KEY,
      });
      await new this.authModel({
        user_id: new mongoose.Types.ObjectId(user?._id),
        iat: decode?.iat,
      }).save();
      return res.status(HttpStatus.CREATED).json({
        success: true,
        message: SuccessMessages?.OTP_VERIFIED[lang || "EN"],
        token,
        user,
      });
    } catch (error) {
      throw new BadRequestException(error, error.status);
    }
  }

  /***************************LOGIN*********************************/
  async login(lang: string, body: LoginDto, res: Response) {
    try {
      const user = await this.userModel.findOne({
        $or: [
          { email: body?.email_or_username },
          { username: body?.email_or_username },
        ],
      });
      if (!user) {
        throw new BadRequestException(
          ErrorMessages?.USER_NOT_EXIST[lang || "EN"]
        );
      }
      const matchPassword = await bcrypt.compare(
        body?.password,
        user?.password
      );
      if (!matchPassword) {
        throw new BadRequestException(
          ErrorMessages?.INVALID_CREDENTIALS[lang || "EN"]
        );
      }
      if (user?.is_blocked) {
        throw new BadRequestException(
          ErrorMessages?.ACCOUNT_BLOCKED[lang || "EN"]
        );
      }
      const token = await this.jwtService.sign(
        { id: user?._id, role: user?.role },
        { secret: process.env.JWT_SECRET_KEY, expiresIn: "24h" }
      );
      const decode = await this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET_KEY,
      });
      const findAuth = await this.authModel.findOne({
        user_id: new mongoose.Types.ObjectId(user?._id),
      });
      if (findAuth) {
        await this.authModel.findByIdAndDelete(findAuth?._id, {
          iat: decode?.iat,
        });
      } else {
        await new this.authModel({
          user_id: new mongoose.Types.ObjectId(user?._id),
          iat: decode?.iat,
        }).save();
      }
      return res.status(HttpStatus.CREATED).json({
        success: true,
        message: SuccessMessages?.LOGIN_SUCCESSFULL[lang || "EN"],
        token,
        user,
      });
    } catch (error) {
      throw new BadRequestException(error, error.status);
    }
  }

  /***************************LOG OUT*******************************/
  async logout(req: Request, lang: string, res: Response) {
    try {
      await this.authModel.findOneAndDelete({
        user_id: new mongoose.Types.ObjectId(req["user"]["_id"]),
      });
      return res.status(HttpStatus.CREATED).json({
        success: true,
        message: SuccessMessages?.LOGOUT_SUCCESSFULL[lang || "EN"],
      });
    } catch (error) {
      throw new BadRequestException(error, error.status);
    }
  }

  /***********************UPLOAD PROFILE PICTURE********************/
  async uploadProfilePicture(
    req: Request,
    lang: string,
    file: Express.Multer.File,
    res: Response
  ) {
    try {
      if (!file) {
        throw new BadRequestException(
          ErrorMessages?.IMAGE_REQUIRED[lang || "EN"]
        );
      }
      if (req["fileValidationError"]) {
        throw new BadRequestException(req["fileValidationError"]);
      }
      await new this.attachmentModel({
        name: file?.fieldname,
        file_name: file?.filename,
        original_name: file?.originalname,
        mime_type: file?.mimetype,
        type: "document",
        user_id: new mongoose.Types.ObjectId(req["user"]["_id"]),
        path: file?.path,
        base_url: `${req.protocol}://${req.headers.host}/`,
        uploaded_by: "user",
      }).save();
      return res.status(HttpStatus.CREATED).json({
        success: true,
        message: SuccessMessages?.PROFILE_UPLOADED[lang || "EN"],
      });
    } catch (error) {
      throw new BadRequestException(error, error.status);
    }
  }

  /****************************GET PROFILE**************************/
  async getProfile(req: Request, res: Response) {
    try {
      const user = req["user"];
      delete user?._doc?.password;
      return res.status(HttpStatus.CREATED).json({
        success: true,
        user,
      });
    } catch (error) {
      throw new BadRequestException(error, error.status);
    }
  }

  /****************************GET MY TASKS*************************/
  async getMyTasks(
    req: Request,
    type = "",
    page = 1,
    limit = 10,
    res: Response
  ) {
    try {
      const query = [];
      if (req["user"]["role"] === "manager") {
        query.push(
          {
            $lookup: {
              from: "users",
              as: "assigned_to",
              let: { assigned_to: "$assigned_to" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$_id", "$$assigned_to"],
                    },
                  },
                },
              ],
            },
          },
          {
            $unwind: {
              path: "$assigned_to",
            },
          }
        );
      } else {
        query.push(
          {
            $lookup: {
              from: "users",
              as: "manager",
              let: { manager_id: "$manager_id" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$_id", "$$manager_id"],
                    },
                  },
                },
              ],
            },
          },
          {
            $unwind: {
              path: "$manager",
            },
          }
        );
      }
      const data = await this.mapUserTaskModel.aggregate([
        {
          $match: {
            $or: [
              { assigned_to: req["user"]["_id"] },
              { manager_id: req["user"]["_id"] },
            ],
            status: { $regex: `.*${type}.*`, $options: "i" },
          },
        },
        {
          $lookup: {
            from: "tasks",
            as: "task",
            let: { task_id: "$task_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$_id", "$$task_id"],
                  },
                },
              },
            ],
          },
        },
        {
          $unwind: {
            path: "$task",
          },
        },
        ...query,
        {
          $facet: {
            paginatedResults: [
              { $sort: { createdAt: -1 } },
              { $skip: (Number(page) - 1) * Number(limit) },
              { $limit: Number(limit) },
            ],
            totalCount: [{ $count: "count" }],
          },
        },
        {
          $addFields: {
            total: {
              $ifNull: [{ $arrayElemAt: ["$totalCount.count", 0] }, 0],
            },
          },
        },
        {
          $project: {
            paginatedResults: 1,
            total: 1,
          },
        },
      ]);
      return res.status(HttpStatus.OK).json({
        success: true,
        statusCode: 200,
        current_page: Number(page),
        total_pages: Math.ceil(Number(data[0].total) / Number(limit)) || 0,
        limit: Number(limit),
        total: Number(data[0].total),
        data: data[0].paginatedResults,
      });
    } catch (error) {
      throw new BadRequestException(error, error.status);
    }
  }

  /****************************GET MY TEAM**************************/
  async getMyTeam(req: Request, res: Response) {
    try {
      const data = await this.teamModel.aggregate([
        {
          $match: {
            $or: [
              { manager_id: new mongoose.Types.ObjectId(req["user"]["_id"]) },
              {
                users: {
                  $in: [new mongoose.Types.ObjectId(req["user"]["_id"])],
                },
              },
            ],
          },
        },
        {
          $lookup: {
            from: "users",
            as: "manager",
            let: { manager_id: "$manager_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$_id", "$$manager_id"],
                  },
                },
              },
            ],
          },
        },
        {
          $unwind: {
            path: "$manager",
          },
        },
        {
          $lookup: {
            from: "users",
            as: "manager",
            let: { manager_id: "$manager_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$_id", "$$manager_id"],
                  },
                },
              },
            ],
          },
        },
        {
          $unwind: {
            path: "$manager",
          },
        },
        {
          $lookup: {
            from: "users",
            as: "users",
            let: { user_id: "$users" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $in: ["$_id", "$$user_id"],
                  },
                },
              },
            ],
          },
        },
      ]);
      return res.status(HttpStatus.OK).json({
        success: true,
        statusCode: 200,
        data,
      });
    } catch (error) {
      throw new BadRequestException(error, error.status);
    }
  }

  /****************************ASSIGN TASK**************************/
  async assignTask(
    req: Request,
    lang: string,
    body: AssignTaskDto,
    res: Response
  ) {
    try {
      if (req["user"]["role"] === "user") {
        throw new BadRequestException(
          ErrorMessages?.YOU_CANT_ASSIGN[lang || "EN"]
        );
      }
      await new this.mapUserTaskModel({
        assigned_by: "manager",
        manager_id: new mongoose.Types.ObjectId(req["user"]["_id"]),
        assigned_to: new mongoose.Types.ObjectId(body?.user_id),
        task_id: new mongoose.Types.ObjectId(body?.task_id),
      });
      return res.status(HttpStatus.CREATED).json({
        success: true,
        statusCode: 201,
        message: SuccessMessages?.TASK_ASSIGNED[lang || "EN"],
      });
    } catch (error) {
      throw new BadRequestException(error, error.status);
    }
  }

  /****************************GET ALL TASKS************************/
  async getAllTasks(
    req: Request,
    lang: string,
    page = 1,
    limit = 10,
    search = "",
    res: Response
  ) {
    try {
      if (req["user"]["role"] === "user") {
        throw new BadRequestException(
          ErrorMessages?.UNAUTHORIZED[lang || "EN"]
        );
      }
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
      throw new BadRequestException(error, error.status);
    }
  }

  /****************************UPDATE TEAM**************************/
  async updateTeam(
    req: Request,
    lang: string,
    body: UpdateTeamDto,
    res: Response
  ) {
    try {
      if (req["user"]["role"] === "user") {
        throw new BadRequestException(
          ErrorMessages?.UNAUTHORIZED[lang || "EN"]
        );
      }
      const data = {};
      if (body?.users) {
        data["users"] = body?.users.map(
          (item) => new mongoose.Types.ObjectId(item)
        );
      }
      await this.teamModel.findOneAndUpdate(
        {
          manager_id: new mongoose.Types.ObjectId(req["user"]["_id"]),
        },
        data
      );
      return res.status(HttpStatus.CREATED).json({
        success: true,
        statusCode: 201,
        message: SuccessMessages?.TEAM_UPDATED[lang || "EN"],
      });
    } catch (error) {
      throw new BadRequestException(error, error.status);
    }
  }

  /**************************CHANGE TASK STATUS*********************/
  async changeTaskStatus(
    req: Request,
    lang: string,
    body: ChangeTaskStatusDto,
    res: Response
  ) {
    try {
      await this.mapUserTaskModel.findOneAndUpdate(
        {
          $or: [
            { manager_id: new mongoose.Types.ObjectId(req["user"]["_id"]) },
            { assigned_to: new mongoose.Types.ObjectId(req["user"]["_id"]) },
          ],
        },
        { status: body?.status }
      );
      return res.status(HttpStatus.CREATED).json({
        success: true,
        statusCode: 201,
        message: SuccessMessages?.TASK_UPDATED[lang || "EN"],
      });
    } catch (error) {
      throw new BadRequestException(error, error.status);
    }
  }
}
