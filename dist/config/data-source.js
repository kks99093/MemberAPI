"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const member_1 = require("../entity/member");
const score_1 = require("../entity/score");
const district_1 = require("../entity/district");
exports.AppDataSource = new typeorm_1.DataSource({
    "type": "postgres",
    "host": "localhost",
    "port": 5432,
    "username": "postgres",
    "password": "admin1234",
    "database": "naraspace",
    "synchronize": true,
    "dropSchema": false,
    "logging": false,
    "entities": [member_1.Member, score_1.Score, district_1.District]
});
exports.AppDataSource.initialize()
    .then(() => {
    console.log('DB연결 확인');
});
