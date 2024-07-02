"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.memberController = void 0;
const member_service_1 = require("../service/member.service");
const url_1 = __importDefault(require("url"));
exports.memberController = {
    //초기 데이터 저장
    insertInitData: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield member_service_1.memberService.insertInitData();
        res.json({
            //0: 초기데이터 저장 성공, -1: member 데이터 등록 실패, -2: ditrict 데이터 등록 실패
            result: result
        });
    }),
    //회원 목록 불러오기
    getMemberList: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const param = url_1.default.parse(req.url, true).query;
        const memberList = yield member_service_1.memberService.getMemberList(param);
        res.json(memberList);
    }),
    //해당 지역에 살고있는 회원들의 과목별 점수 평균값 불러오기
    getAvgScoreFromLocation: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const param = url_1.default.parse(req.url, true).query;
        const result = yield member_service_1.memberService.getAvgScoreFromLocation(param);
        res.json(result);
    }),
    //회원 데이터를 CSV 파일로 다운로드
    downloadMemberList: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        let param = url_1.default.parse(req.url, true).query;
        try {
            yield member_service_1.memberService.downloadMemberList(param, res);
        }
        catch (error) {
            console.error(error);
            res.json({
                //다운로드 실패
                result: -1
            });
        }
    }),
    //신규 회원 등록
    registerMember: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield member_service_1.memberService.registerMember(req.body);
        res.json({
            // 0: 정상 처리, -1: 닉네임 중복, -2: 점수 등록 실패, -3: DB등록 에러
            result: result
        });
    }),
    //회원 점수 등록
    registerScore: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield member_service_1.memberService.registerScore(req.body);
        res.json({
            //0:정상 처리, -1 : 멤버없음, -2 : 유효하지 않은 과목, -3: 점수 범위 에러, -4 : DB등록 에러
            result: result
        });
    }),
    //회원 삭제
    deleteMember: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield member_service_1.memberService.deleteMember(req.body);
        res.json({
            // 0: 정상처리, -1 : 파라미터에 memberId가 비어있음, -2: DB등록 에러
            result: result
        });
    })
};
