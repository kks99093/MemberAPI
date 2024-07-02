import {Entity, PrimaryGeneratedColumn, Column} from 'typeorm'

@Entity()
export class District{
    
    @PrimaryGeneratedColumn()
    id : number;

    @Column({type: 'varchar', length: 10, nullable: false, unique: true})
    osm_id : string;

    @Column({type: 'geometry', nullable: false, srid: 4326})
    geometry : {type: string; coordinates: number[]};
}