import express from 'express';
import {memberController} from '../controller/member.controller';


export const memberRouter = express.Router();

memberRouter.get("/insertInitData", memberController.insertInitData);
memberRouter.get("/getMemberList", memberController.getMemberList);
memberRouter.get("/downloadMemberList", memberController.downloadMemberList);
memberRouter.get("/getAvgScoreFromLocation", memberController.getAvgScoreFromLocation);


memberRouter.post("/registerMember", memberController.registerMember);
memberRouter.post("/registerScore", memberController.registerScore);
memberRouter.post("/deleteMember", memberController.deleteMember);
