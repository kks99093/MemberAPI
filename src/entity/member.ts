
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import {Score} from './score';

@Entity()
export class Member{
    @PrimaryGeneratedColumn()
    id : number;

    @Column({ type: 'varchar', length: 10, nullable: false })
    name : string;

    @Column({ type: 'varchar', length: 10, nullable: false, unique: true })
    nickname : string;

    @Column({ type: 'varchar', length: 10, nullable: false })
    birthday : string;

    @Column({ type: 'geometry', nullable: false, spatialFeatureType: 'Point', srid: 4326 })
    location : {type: string; coordinates: number[]};

    @Column({ type: 'timestamp', nullable: false })
    createdAt : Date;

    @Column({ type: 'timestamp', nullable: false })
    updatedAt : Date;

    @OneToMany(() => Score, score => score.member)
    score : Score[];
    

}