"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const member_routes_1 = require("./routes/member.routes");
const yamljs_1 = __importDefault(require("yamljs"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || "3005";
app.listen(PORT, () => {
    console.log("3005번 포트 실행");
});
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
const swaggerSpec = yamljs_1.default.load('swagger/swagger.yaml');
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec));
app.use('/member', member_routes_1.memberRouter);
module.exports = app;
