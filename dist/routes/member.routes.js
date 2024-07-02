"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.memberRouter = void 0;
const express_1 = __importDefault(require("express"));
const member_controller_1 = require("../controller/member.controller");
exports.memberRouter = express_1.default.Router();
exports.memberRouter.get("/insertInitData", member_controller_1.memberController.insertInitData);
exports.memberRouter.get("/getMemberList", member_controller_1.memberController.getMemberList);
exports.memberRouter.get("/downloadMemberList", member_controller_1.memberController.downloadMemberList);
exports.memberRouter.get("/getAvgScoreFromLocation", member_controller_1.memberController.getAvgScoreFromLocation);
exports.memberRouter.post("/registerMember", member_controller_1.memberController.registerMember);
exports.memberRouter.post("/registerScore", member_controller_1.memberController.registerScore);
exports.memberRouter.post("/deleteMember", member_controller_1.memberController.deleteMember);
