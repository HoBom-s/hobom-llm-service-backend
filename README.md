# hobom-llm-service-backend

Claude API를 활용한 LLM 게이트웨이 서비스. gRPC + REST 하이브리드 앱으로 동작합니다.

---

## Architecture

```
                    ┌────────────────────────────────┐
                    │  hobom-llm-service-backend      │
                    │                                │
  gRPC :50052 ──────┤  StudyMaterialService.Generate │──── Claude API
                    │  StudyMaterialService.Ask       │
  REST :3000  ──────┤  POST /api/v1/ask              │──── Claude API
                    └────────────────────────────────┘
```

| Protocol | Port  | Caller               | 용도                         |
| -------- | ----- | -------------------- | ---------------------------- |
| gRPC     | 50052 | hobom-event-processor | 학습자료 생성 (비동기 배치)   |
| REST     | 3000  | for-hobom-backend    | Q&A 봇 (동기 호출)           |

---

## gRPC Services

| Service                  | RPC        | Description                |
| ------------------------ | ---------- | -------------------------- |
| `StudyMaterialService`   | `Generate` | 법률 변경 사항 → 학습자료 생성 |
| `StudyMaterialService`   | `Ask`      | 법률 관련 Q&A              |

## REST Endpoints

| Method | Path           | Guard          | Description        |
| ------ | -------------- | -------------- | ------------------ |
| POST   | `/api/v1/ask`  | `x-api-key`   | 법률 Q&A 질의응답   |

---

## Configuration

| Variable            | Required | Default   | Description                    |
| ------------------- | -------- | --------- | ------------------------------ |
| `ANTHROPIC_API_KEY` | Yes      | -         | Claude API key                 |
| `HOBOM_GRPC_API_KEY`| Yes      | -         | gRPC/REST 인증 키 (공용)       |
| `HOBOM_GRPC_HOST`   | No       | `0.0.0.0` | gRPC 바인드 주소               |
| `HOBOM_GRPC_PORT`   | No       | `50052`   | gRPC 포트                      |
| `HOBOM_REST_PORT`   | No       | `3000`    | REST 포트                      |

---

## Running locally

```sh
cp .env.example .env   # edit values
npm install
npm run start:dev
```

---

## Proto

gRPC proto 파일은 `hobom-buf-proto` 서브모듈에 위치합니다.

- `llm/v1/generate-study-material.proto` — StudyMaterialService.Generate
- `llm/v1/ask-question.proto` — StudyMaterialService.Ask
