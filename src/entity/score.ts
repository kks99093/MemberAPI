
import { Entity, Column, ManyToOne, PrimaryColumn, Check } from 'typeorm';
import { Member } from './member';

export enum SubjectType{
    MATH = 'math',
    SCIENCE = 'science',
    ENGLISH = 'english'
}

@Entity()
export class Score{
    
    @PrimaryColumn()    
    memberId : number;

    @PrimaryColumn({type : 'varchar', length: 10})
    subject : SubjectType;

    @Column({ type: 'int', nullable: false})
    @Check(`"score" >= 0 AND "score" <= 100`)
    score : number;

    @Column({ type: 'timestamp', nullable: false })
    createdAt : Date;

    @Column({ type: 'timestamp', nullable: false })
    updatedAt : Date;

    @ManyToOne(() => Member, member => member.score, {
        onDelete: 'CASCADE' //Member 데이터 삭제시 Score데이터도 같이 삭제
    })
    member : Member;
    

}