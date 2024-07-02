import {Member} from '../entity/member';
import { Request, Response } from 'express';
import { memberService } from '../service/member.service';
import url from 'url';

export const memberController = {

    //초기 데이터 저장
    insertInitData : async (req: Request, res: Response) => {
        const result: number = await memberService.insertInitData();
        res.json({
            //0: 초기데이터 저장 성공, -1: member 데이터 등록 실패, -2: ditrict 데이터 등록 실패
            result : result 
        })
    },


    //회원 목록 불러오기
    getMemberList : async (req : Request, res : Response) => {
        const param = url.parse(req.url, true).query;
        const memberList: Member[] = await memberService.getMemberList(param);
        res.json(memberList);
    },


    //해당 지역에 살고있는 회원들의 과목별 점수 평균값 불러오기
    getAvgScoreFromLocation : async (req: Request, res: Response) => {
        const param = url.parse(req.url, true).query;
        const result: Object[] = await memberService.getAvgScoreFromLocation(param);
        res.json(result);
    },


    //회원 데이터를 CSV 파일로 다운로드
    downloadMemberList : async (req : Request, res: Response) =>{
        let param = url.parse(req.url, true).query;
        try{
            await memberService.downloadMemberList(param, res);
        } catch (error){
            console.error(error);
            res.json({
                //다운로드 실패
                result : -1
            })
        }
    },
    

    //신규 회원 등록
    registerMember : async (req: Request, res : Response) => {
        const result: number = await memberService.registerMember(req.body);
        res.json({
            // 0: 정상 처리, -1: 닉네임 중복, -2: 점수 등록 실패, -3: DB등록 에러
            result : result 
        })
    },
    

    //회원 점수 등록
    registerScore : async (req: Request, res : Response) => {
        const result: number = await memberService.registerScore(req.body);
        res.json({
            //0:정상 처리, -1 : 멤버없음, -2 : 유효하지 않은 과목, -3: 점수 범위 에러, -4 : DB등록 에러
            result : result 
        });
    },
    

    //회원 삭제
    deleteMember : async (req: Request, res: Response) => {
        const result: number = await memberService.deleteMember(req.body);
        res.json({
            // 0: 정상처리, -1 : 파라미터에 memberId가 비어있음, -2: DB등록 에러
            result : result
        })
    }
}
