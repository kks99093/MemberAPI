"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Score = exports.SubjectType = void 0;
const typeorm_1 = require("typeorm");
const member_1 = require("./member");
var SubjectType;
(function (SubjectType) {
    SubjectType["MATH"] = "math";
    SubjectType["SCIENCE"] = "science";
    SubjectType["ENGLISH"] = "english";
})(SubjectType || (exports.SubjectType = SubjectType = {}));
let Score = class Score {
};
exports.Score = Score;
__decorate([
    (0, typeorm_1.PrimaryColumn)(),
    __metadata("design:type", Number)
], Score.prototype, "memberId", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'varchar', length: 10 }),
    __metadata("design:type", String)
], Score.prototype, "subject", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: false }),
    (0, typeorm_1.Check)(`"score" >= 0 AND "score" <= 100`),
    __metadata("design:type", Number)
], Score.prototype, "score", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: false }),
    __metadata("design:type", Date)
], Score.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: false }),
    __metadata("design:type", Date)
], Score.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => member_1.Member, member => member.score, {
        onDelete: 'CASCADE' //Member 데이터 삭제시 Score데이터도 같이 삭제
    }),
    __metadata("design:type", member_1.Member)
], Score.prototype, "member", void 0);
exports.Score = Score = __decorate([
    (0, typeorm_1.Entity)()
], Score);
