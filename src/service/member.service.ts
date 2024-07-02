import { Member } from '../entity/member';
import { District } from '../entity/district';
import {SubjectType, Score } from '../entity/score';
import { AppDataSource } from '../config/data-source';
import { EntityManager, SelectQueryBuilder } from 'typeorm';
import { Response } from 'express';
import * as fs from'fs';


export const memberService = {
    //초기 데이터 저장
    insertInitData : async (): Promise<number> =>{
        let result = 0;
        const entityManager: EntityManager = AppDataSource.manager;
        await entityManager.transaction(async transactionalEntityManager =>{
            result = await memberService.insertMemberInitData();
            if(result === 0){
                result = await memberService.insertDistrictInitData();
            }            
            
        })
        return result;

    },
    

    //멤버 초기 데이터 저장
    insertMemberInitData : async (): Promise<number> =>{
        try{
            console.log("Member 초기 데이터 Insert 시작");
            for(let i = 1; i <=12; i++){
                const fileName = `user${i.toString().padStart(2, '0')}.json`;
                const jsonData = fs.readFileSync('user_data/'+fileName, 'utf-8');
                const members = JSON.parse(jsonData);

                for(let j = 0; j <members.length; j += 2000){
                    const startIdx = j;
                    const endIdx = j+2000 < members.length ? j+2000 : members.length;
                    const sliceMember = members.slice(startIdx, endIdx).map((data : any) =>{
                        const member = new Member();
                    
                        member.name = data.name;
                        member.nickname = data.nickname;
                        member.birthday = data.birthday;
                        member.createdAt = new Date(data.createdAt);
                        member.updatedAt = new Date(data.updatedAt);            
                        member.location = {
                            type: 'Point',
                            coordinates : data.coordinates
                        }
                        return member;
                    })
                    await AppDataSource.manager.save(sliceMember)
                }
            }            
            console.log("Member 초기 데이터 Insert 완료")
            return 0;
        } catch (error){
            console.error(error);
            return -1;
        }
    },


    // distrrict 초기 데이터 저장
    insertDistrictInitData : async (): Promise<number> =>{
        try{
            console.log("district 초기 데이터 Insert 시작")
            const jsonData = fs.readFileSync("geo_data/korea.geojson", 'utf-8');
            const districtData = JSON.parse(jsonData);

            const districts = districtData.features.map((data: any) =>{
                const district = new District();
                district.osm_id = data.properties.osm_id;
                district.geometry = data.geometry;
                return district;
            })

            await AppDataSource.manager.save(districts);
            console.log('district 초기 데이터 Insert 완료');
            return 0;
        } catch (error){
            console.error(error);
            return -2;
        }
    },


    //회원 목록 불러오기
    getMemberList: async (param: any) =>{
        let queryBuilder: SelectQueryBuilder<Member> = AppDataSource.getRepository(Member)
                                                                    .createQueryBuilder("member")
                                                                    .leftJoinAndSelect('member.score', 'score');
        //osm_id / start_date / end_date / name / nickname                                                                                            
        //지역
        if(param.osm_id){
            queryBuilder = queryBuilder.andWhere(
                    'ST_Contains((SELECT geometry FROM district WHERE osm_id = :osm_id), member.location)', {osm_id : param.osm_id}
                );
        }
        
        //생년 월일
        if(param.start_date && param.end_date){
            queryBuilder = queryBuilder.andWhere('member.birthday BETWEEN :startDate AND :endDate', {startDate: param.start_date, endDate : param.end_date});
        }else if(param.start_date){
            queryBuilder = queryBuilder.andWhere('member.birthday >= :startDate', {startDate : param.start_date});
        }else if(param.end_date){
            queryBuilder = queryBuilder.andWhere('member.birthday <= :endDate', {endDate : param.end_date});
        }

        //이름
        if(param.name){
            
            queryBuilder = queryBuilder.andWhere('member.name Like :name', {name : `%${param.name}%`});
        }

        //닉네임
        if(param.nickname){
            queryBuilder = queryBuilder.andWhere('member.nickname Like :nickname', {nickname : `%${param.nickname}%`});
        }

        queryBuilder = queryBuilder.orderBy('member.birthday', 'DESC').addOrderBy('member.createdAt', 'DESC');

        const memberList: Member[] | null = await queryBuilder.getMany();

        return memberList;

    },


    //해당 지역에 살고있는 회원들의 과목별 점수 평균값 불러오기
    getAvgScoreFromLocation : async(param: any): Promise<Object[]> =>{
        let queryBuilder: SelectQueryBuilder<Score> = AppDataSource.getRepository(Score)
                                                                    .createQueryBuilder('score')
                                                                    .innerJoinAndSelect('score.member', 'member');
        queryBuilder.select('score.subject', 'subject')
                    .addSelect('TRUNC(AVG(score.score), 2)', 'avgScore')
                    .where('ST_Contains((SELECT geometry FROM district WHERE osm_id = :osm_id), member.location)', {osm_id : param.osm_id})
                    .groupBy('score.subject')
        const avgScore: Object[] = await queryBuilder.getRawMany();
        return avgScore;
    },


    //회원 데이터를 CSV 파일로 다운로드
    downloadMemberList : async (param: any, res : Response) =>{
        try{
            const memberList = await memberService.getMemberList(param);
            let csvContent = 'id, name, nickname, bitrhday, createAt\n';
            memberList.forEach(member =>{
                const formatCreateAt = formatDate(member.createdAt);
                csvContent += `${member.id}, ${member.name}, ${member.nickname}, ${member.birthday}, ${formatCreateAt}\n`
            })

            const fileName = 'memberList.csv';
            const bom = '\uFEFF';

            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.write(bom + csvContent, 'utf-8');
            res.end();

            console.log('memberList.csv 파일을 전송했습니다.');
        } catch (error){            
            console.error(error);
        }
        
    },


    //신규 회원 등록
    registerMember : async (body: any): Promise<number> =>{
        try {
            if(!body.nickname){
                return -3;
            }
            let member: Member | null = await AppDataSource.getRepository(Member).findOneBy({nickname : body.nickname});
            if(member){
                return -1; //닉네임 중복
            }
            member = new Member();
            member.name = body.name;
            member.nickname = body.nickname;
            member.birthday = body.birthday;
            member.location = {
                type: 'Point',
                coordinates : body.coordinates
            }
            member.createdAt = new Date();        
            member.updatedAt = new Date();
            const memberEntity: Member | null = await AppDataSource.manager.save(member);

            if(body.score && memberEntity){
                for(let i = 0; i < body.score.length; i++){
                    body.score[i].memberId = memberEntity.id;
                }
                const scoreResult = await memberService.registerScore(body.score);
                if(scoreResult != 0){
                    await AppDataSource.manager.delete(Member, memberEntity.id);
                    return -2;
                }
            }
            
        } catch (error) {
           console.error(error);
           return -3;
        }


        return 0; // 정상 등록
    },


    //회원 점수 등록
    registerScore : async (body: Score[]): Promise<number> =>{       
        let result = 0; // 정상등록시 0 반환

        const entityManager: EntityManager = AppDataSource.manager;
  
        await entityManager.transaction(async transactionalEntityManager =>{
            for(let i = 0; i < body.length; i++){
                const member: Member | null = await AppDataSource.getRepository(Member).findOneBy({id : body[i].memberId});
                if(!member){
                    throw new Error('멤버를 찾을 수 없습니다.');
                }

                const isVaildSubject = parseSubject(body[i].subject);
                if(isVaildSubject === -1){
                    throw new Error('유효하지 않은 과목입니다.')
                }

                if(body[i].score < 0 || body[i].score > 100){
                    throw new Error('스코어가 0과 100사이의 숫자가 아닙니다.');
                }

                let score: Score | null = await AppDataSource.getRepository(Score).findOneBy({memberId : body[i].memberId, subject : body[i].subject});

                if(!score){
                    score = new Score();
                    score.memberId = body[i].memberId;
                    score.score = body[i].score;
                    
                    score.subject = body[i].subject;
                    score.createdAt = new Date();
                    score.updatedAt = new Date();
        
                }
                score.score = body[i].score;
                score.updatedAt = new Date();

                await transactionalEntityManager.save(score);
            }                        

        }).catch(error =>{
            console.error('스코어 등록 실패 : ', error.message);
            if (error.message === '멤버를 찾을 수 없습니다.') {
                result = -1;
            } else if (error.message === '유효하지 않은 과목입니다.') {
                result = -2;
            } else if (error.message === '스코어가 0과 100사이의 숫자가 아닙니다.') {
                result = -3;
            } else {
                result = -4; // 데이터베이스 등록시 에러
            }
        })
 
        return result;
    },


    //회원 삭제
    deleteMember : async(body: any): Promise<number>=>{
        let result: number = 0;
        const entityManager: EntityManager = AppDataSource.manager;

        await entityManager.transaction(async transactionalEntityManager=>{
            if(!body.memberId){
                throw new Error('멤버Id가 비어있음');
            }

            await transactionalEntityManager.createQueryBuilder()
                                            .delete()
                                            .from(Score)
                                            .where("memberId = :memberId", {memberId: body.memberId})
                                            .execute();
            await transactionalEntityManager.delete(Member, body.memberId);
        }).catch(error =>{
            console.error(' 데이터 삭제 실패 : ', error.message);
            if(error.message === '멤버Id가 비어있음'){
                result = -1;
            }else{
                result = -2;
            }
        })
        return result;
    }

}


//subject 유효성 검사
function parseSubject(subject: string){
    switch(subject) {
        case 'math' :
            return SubjectType.MATH;
        case 'science' :
            return SubjectType.SCIENCE;
        case 'english' : 
            return SubjectType.ENGLISH;
        default :
            return -1
    }
}


//날짜 0000-00-00 형식으로 변경
function formatDate(date: Date): string{
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + (date.getDate())).slice(-2);

    return `${year}-${month}-${day}`;
}