"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.memberService = void 0;
const member_1 = require("../entity/member");
const district_1 = require("../entity/district");
const score_1 = require("../entity/score");
const data_source_1 = require("../config/data-source");
const fs = __importStar(require("fs"));
exports.memberService = {
    //초기 데이터 저장
    insertInitData: () => __awaiter(void 0, void 0, void 0, function* () {
        let result = 0;
        const entityManager = data_source_1.AppDataSource.manager;
        yield entityManager.transaction((transactionalEntityManager) => __awaiter(void 0, void 0, void 0, function* () {
            result = yield exports.memberService.insertMemberInitData();
            if (result === 0) {
                result = yield exports.memberService.insertDistrictInitData();
            }
        }));
        return result;
    }),
    //멤버 초기 데이터 저장
    insertMemberInitData: () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            console.log("Member 초기 데이터 Insert 시작");
            for (let i = 1; i <= 12; i++) {
                const fileName = `user${i.toString().padStart(2, '0')}.json`;
                const jsonData = fs.readFileSync('user_data/' + fileName, 'utf-8');
                const members = JSON.parse(jsonData);
                for (let j = 0; j < members.length; j += 2000) {
                    const startIdx = j;
                    const endIdx = j + 2000 < members.length ? j + 2000 : members.length;
                    const sliceMember = members.slice(startIdx, endIdx).map((data) => {
                        const member = new member_1.Member();
                        member.name = data.name;
                        member.nickname = data.nickname;
                        member.birthday = data.birthday;
                        member.createdAt = new Date(data.createdAt);
                        member.updatedAt = new Date(data.updatedAt);
                        member.location = {
                            type: 'Point',
                            coordinates: data.coordinates
                        };
                        return member;
                    });
                    yield data_source_1.AppDataSource.manager.save(sliceMember);
                }
            }
            console.log("Member 초기 데이터 Insert 완료");
            return 0;
        }
        catch (error) {
            console.error(error);
            return -1;
        }
    }),
    // distrrict 초기 데이터 저장
    insertDistrictInitData: () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            console.log("district 초기 데이터 Insert 시작");
            const jsonData = fs.readFileSync("geo_data/korea.geojson", 'utf-8');
            const districtData = JSON.parse(jsonData);
            const districts = districtData.features.map((data) => {
                const district = new district_1.District();
                district.osm_id = data.properties.osm_id;
                district.geometry = data.geometry;
                return district;
            });
            yield data_source_1.AppDataSource.manager.save(districts);
            console.log('district 초기 데이터 Insert 완료');
            return 0;
        }
        catch (error) {
            console.error(error);
            return -2;
        }
    }),
    //회원 목록 불러오기
    getMemberList: (param) => __awaiter(void 0, void 0, void 0, function* () {
        let queryBuilder = data_source_1.AppDataSource.getRepository(member_1.Member)
            .createQueryBuilder("member")
            .leftJoinAndSelect('member.score', 'score');
        //osm_id / start_date / end_date / name / nickname                                                                                            
        //지역
        if (param.osm_id) {
            queryBuilder = queryBuilder.andWhere('ST_Contains((SELECT geometry FROM district WHERE osm_id = :osm_id), member.location)', { osm_id: param.osm_id });
        }
        //생년 월일
        if (param.start_date && param.end_date) {
            queryBuilder = queryBuilder.andWhere('member.birthday BETWEEN :startDate AND :endDate', { startDate: param.start_date, endDate: param.end_date });
        }
        else if (param.start_date) {
            queryBuilder = queryBuilder.andWhere('member.birthday >= :startDate', { startDate: param.start_date });
        }
        else if (param.end_date) {
            queryBuilder = queryBuilder.andWhere('member.birthday <= :endDate', { endDate: param.end_date });
        }
        //이름
        if (param.name) {
            queryBuilder = queryBuilder.andWhere('member.name Like :name', { name: `%${param.name}%` });
        }
        //닉네임
        if (param.nickname) {
            queryBuilder = queryBuilder.andWhere('member.nickname Like :nickname', { nickname: `%${param.nickname}%` });
        }
        queryBuilder = queryBuilder.orderBy('member.birthday', 'DESC').addOrderBy('member.createdAt', 'DESC');
        const memberList = yield queryBuilder.getMany();
        return memberList;
    }),
    //해당 지역에 살고있는 회원들의 과목별 점수 평균값 불러오기
    getAvgScoreFromLocation: (param) => __awaiter(void 0, void 0, void 0, function* () {
        let queryBuilder = data_source_1.AppDataSource.getRepository(score_1.Score)
            .createQueryBuilder('score')
            .innerJoinAndSelect('score.member', 'member');
        queryBuilder.select('score.subject', 'subject')
            .addSelect('TRUNC(AVG(score.score), 2)', 'avgScore')
            .where('ST_Contains((SELECT geometry FROM district WHERE osm_id = :osm_id), member.location)', { osm_id: param.osm_id })
            .groupBy('score.subject');
        const avgScore = yield queryBuilder.getRawMany();
        return avgScore;
    }),
    //회원 데이터를 CSV 파일로 다운로드
    downloadMemberList: (param, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const memberList = yield exports.memberService.getMemberList(param);
            let csvContent = 'id, name, nickname, bitrhday, createAt\n';
            memberList.forEach(member => {
                const formatCreateAt = formatDate(member.createdAt);
                csvContent += `${member.id}, ${member.name}, ${member.nickname}, ${member.birthday}, ${formatCreateAt}\n`;
            });
            const fileName = 'memberList.csv';
            const bom = '\uFEFF';
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.write(bom + csvContent, 'utf-8');
            res.end();
            console.log('memberList.csv 파일을 전송했습니다.');
        }
        catch (error) {
            console.error(error);
        }
    }),
    //신규 회원 등록
    registerMember: (body) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!body.nickname) {
                return -3;
            }
            let member = yield data_source_1.AppDataSource.getRepository(member_1.Member).findOneBy({ nickname: body.nickname });
            if (member) {
                return -1; //닉네임 중복
            }
            member = new member_1.Member();
            member.name = body.name;
            member.nickname = body.nickname;
            member.birthday = body.birthday;
            member.location = {
                type: 'Point',
                coordinates: body.coordinates
            };
            member.createdAt = new Date();
            member.updatedAt = new Date();
            const memberEntity = yield data_source_1.AppDataSource.manager.save(member);
            if (body.score && memberEntity) {
                for (let i = 0; i < body.score.length; i++) {
                    body.score[i].memberId = memberEntity.id;
                }
                const scoreResult = yield exports.memberService.registerScore(body.score);
                if (scoreResult != 0) {
                    yield data_source_1.AppDataSource.manager.delete(member_1.Member, memberEntity.id);
                    return -2;
                }
            }
        }
        catch (error) {
            console.error(error);
            return -3;
        }
        return 0; // 정상 등록
    }),
    //회원 점수 등록
    registerScore: (body) => __awaiter(void 0, void 0, void 0, function* () {
        let result = 0; // 정상등록시 0 반환
        const entityManager = data_source_1.AppDataSource.manager;
        yield entityManager.transaction((transactionalEntityManager) => __awaiter(void 0, void 0, void 0, function* () {
            for (let i = 0; i < body.length; i++) {
                const member = yield data_source_1.AppDataSource.getRepository(member_1.Member).findOneBy({ id: body[i].memberId });
                if (!member) {
                    throw new Error('멤버를 찾을 수 없습니다.');
                }
                const isVaildSubject = parseSubject(body[i].subject);
                if (isVaildSubject === -1) {
                    throw new Error('유효하지 않은 과목입니다.');
                }
                if (body[i].score < 0 || body[i].score > 100) {
                    throw new Error('스코어가 0과 100사이의 숫자가 아닙니다.');
                }
                let score = yield data_source_1.AppDataSource.getRepository(score_1.Score).findOneBy({ memberId: body[i].memberId, subject: body[i].subject });
                if (!score) {
                    score = new score_1.Score();
                    score.memberId = body[i].memberId;
                    score.score = body[i].score;
                    score.subject = body[i].subject;
                    score.createdAt = new Date();
                    score.updatedAt = new Date();
                }
                score.score = body[i].score;
                score.updatedAt = new Date();
                yield transactionalEntityManager.save(score);
            }
        })).catch(error => {
            console.error('스코어 등록 실패 : ', error.message);
            if (error.message === '멤버를 찾을 수 없습니다.') {
                result = -1;
            }
            else if (error.message === '유효하지 않은 과목입니다.') {
                result = -2;
            }
            else if (error.message === '스코어가 0과 100사이의 숫자가 아닙니다.') {
                result = -3;
            }
            else {
                result = -4; // 데이터베이스 등록시 에러
            }
        });
        return result;
    }),
    //회원 삭제
    deleteMember: (body) => __awaiter(void 0, void 0, void 0, function* () {
        let result = 0;
        const entityManager = data_source_1.AppDataSource.manager;
        yield entityManager.transaction((transactionalEntityManager) => __awaiter(void 0, void 0, void 0, function* () {
            if (!body.memberId) {
                throw new Error('멤버Id가 비어있음');
            }
            //await transactionalEntityManager.delete(Score, body.memberId);
            yield transactionalEntityManager.createQueryBuilder()
                .delete()
                .from(score_1.Score)
                .where("memberId = :memberId", { memberId: body.memberId })
                .execute();
            yield transactionalEntityManager.delete(member_1.Member, body.memberId);
        })).catch(error => {
            console.error(' 데이터 삭제 실패 : ', error.message);
            if (error.message === '멤버Id가 비어있음') {
                result = -1;
            }
            else {
                result = -2;
            }
        });
        return result;
    })
};
//subject 유효성 검사
function parseSubject(subject) {
    switch (subject) {
        case 'math':
            return score_1.SubjectType.MATH;
        case 'science':
            return score_1.SubjectType.SCIENCE;
        case 'english':
            return score_1.SubjectType.ENGLISH;
        default:
            return -1;
    }
}
//날짜 0000-00-00 형식으로 변경
function formatDate(date) {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + (date.getDate())).slice(-2);
    return `${year}-${month}-${day}`;
}
