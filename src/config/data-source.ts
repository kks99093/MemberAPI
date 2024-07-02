import { DataSource } from "typeorm"
import { Member } from "../entity/member"
import { Score } from "../entity/score"
import { District } from "../entity/district"
export const AppDataSource = new DataSource({
    "type": "postgres",
    "host": "localhost",
    "port": 5432,
    "username": "postgres",
    "password": "admin1234",
    "database": "naraspace",
    "synchronize": true,
    "dropSchema" : false,
    "logging": false,
    "entities": [Member, Score, District]

})

AppDataSource.initialize()
.then(() =>{
  console.log('DB연결 확인')
})
