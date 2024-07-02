import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { memberRouter } from './routes/member.routes';
import YAML from 'yamljs';


const app = express();

const PORT = process.env.PORT || "3005"

app.listen(PORT, () =>{
    console.log("3005번 포트 실행")
})

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const swaggerSpec = YAML.load('swagger/swagger.yaml');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


app.use('/member', memberRouter);



module.exports = app;
