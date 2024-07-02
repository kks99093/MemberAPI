DB구축
1. 소스파일을 받은 후 콘솔에서 npm install을 통해 modules을 받아주세요
2. PostgreSQL에서 데이터베이스를 생성해 주세요 (소스 파일에서는 memberapi라는 이름으로 데이터베이스를 만들었습니다.)
3. PostGIS가 설치가 안되어 있다면 설치해주세요
4. src/config/data-source.ts 파일의 username, password, database를 변경해 주세요
5. 콘솔에서 npm run build를 통해 ts파일을 js파일로 컴파일 해주세요
6. 콘솔에서 npm start를 입력해 api서버를 실행해 주세요
7. http://localhost:3005/api-docs/ 에 접속하셔서 /member/insertInitData를 한번 실행해주세요 
  (데이터를 DB에 넣는데 몇초정도 걸릴수 있습니다)
8. http://localhost:3005/api-docs/ 에서 나머지 API를 테스트 해보실 수 있습니다.

