## 실행 순서
1. 소스파일을 받은 후 콘솔에서 npm install을 통해 modules을 받아주세요
2. PostgreSQL에서 데이터베이스를 생성해 주세요 (소스 파일에서는 memberapi라는 이름으로 데이터베이스를 만들었습니다.)
3. PostGIS가 설치가 안되어 있다면 설치해주세요
4. src/config/data-source.ts 파일의 username, password, database를 변경해 주세요
5. 콘솔에서 npm run build를 통해 ts파일을 js파일로 컴파일 해주세요  
6. 콘솔에서 npm start를 입력해 api서버를 실행해 주세요
   </br>(5번 6번의 과정없이 npm run dev를 통해 컴파일 없이 ts파일을 실행 하셔도 됩니다.)
7. http://localhost:3005/api-docs/ 에 접속하셔서 /member/insertInitData를 한번 실행하여 초기데이터를 넣어주세요.
  </br>(데이터를 DB에 넣는데 몇초정도 걸릴수 있습니다)
8. http://localhost:3005/api-docs/ 에서 나머지 기능을 테스트 해보실 수 있습니다.


## GET 요청
* <h4>"/member/insertInitData" : 초기데이터를 저장합니다.</h4>
  + 파라미터 : 없음</br>
  + 반환값 : { result : number} 형태의 JSON 반환</br>
    (number = 0: 초기데이터 저장 성공, -1: member 데이터 등록 실패, -2: district 데이터 등록 실패)
</br>

* <h4>"/member/getMemberList" : 회원 목록을 반환합니다.</h4>
  + 파리미터 : osm_id, start_date, end_date, name, nickname</br>
    (QueryString형태로 파라미터 전달)</br>
  + 반환값 : Id, name, nickname, birthday, createdAt, updatedAt, location 데이터와 </br>(점수 데이터가 있을경우) score, subject, score의 점수 데이터가 아래의 형태로 반환됩니다.</br>
```
[
  {
    "id": 0,
    "name": "string",
    "nickname": "string",
    "birthday": "string",
    "createdAt": "string",
    "updatedAt": "string",
    "location": {
      "type": "string",
      "coordinates": [
        0,
        0
      ]
    },
    "score": [
      {
        "subject": "string",
        "score": 0
      }
    ]
  }
]
```
</br>

* <h4>"/member/downloadMemberList" : 회원 목록을 CSV파일로 다운로드 합니다.</h4>
  +파리미터 : osm_id, start_date, end_date, name, nickname</br>
    (QueryString형태로 파라미터 전달, getMemberList와 같음)</br>
  +반환값 : 실패시 {result : -1} 의 JSON 반환, 성공시 파일이 다운로드 됨

</br>

* <h4>"/member/getAvgScoreFromLocation" : 해당 지역에 살고있는 회원들의 과목별 평균 점수를 반환합니다. </h4>
  + 파라미터 : osm_id</br>
(QueryString형태로 파라미터 전달)</br>
  + 반환값 : 과목 이름과 평균 점수가 배열에 담겨 반환됩니다.</br>
  
  ```
  [
    {english, 88.88},
    {math , 66.66}
  ]
  ```

## POST 요청

* <h4>"/member/registerMember" : 신규 회원을 DB에 저장합니다.(score 정보 포함시 점수 데이터도 함께 저장합니다.)</h4>
  + 파라미터 : name, nickname, birthday, coordinates, (선택사항) subjcet, score</br> 데이터를 아래의 JSON 형태로 요청
  + 헤더셋팅 : Content-Type: application/json
  + 반환값 : { result : number} 형태의 JSON 반환 </br>
  (number = 0: 정상 처리, -1: 닉네임 중복, -2: 점수 등록 실패, -3: DB 등록 에러)</br>
  
   ```
  {
    "name": "string",
    "nickname": "string",
    "birthday": "string",
    "coordinates": [
      0,
      0
    ],
    "score": [
      {
        "subject": "string",
        "score": 0
      }
    ]
  }
   ```
   </br>
* <h4>"/member/registerScore" : 기존 회원의 점수 데이터를 DB에 저장합니다. </h4>
  + 파라미터 : subject, score 데이터를 아래의 JSON 형태로 요청
  + 헤더셋팅 : Content-Type: application/json
  + 반환값 : { result : number} 형태의 JSON 반환</br>
    (number = 0:정상 처리, -1 : 해당 유저의 정보가 DB에 존재하지 않음, -2 : 유효하지 않은 과목, -3: 점수 범위 에러, -4 : DB등록 에러)</br>
    
  ```
  [
    {
      "memberId": 0,
      "subject": "string",
      "score": 0
    }
  ]
  ```
  </br>
* <h4>"/member/deleteMember" : 회원 정보를 DB에서 삭제합니다. </h4>
  + 파라미터 : memberId 데이터를 아래의 JSON 형태로 요청
  + 헤더셋팅 : Content-Type: application/json
  + 반환값 : { result : number} 형태의 JSON 반환</br>
    (number = 0:정상 처리, -1: 파라미터가 비어있음, -2: DB에러)</br>
    
  ```
  {
    "memberId": 0
  }
  ```
