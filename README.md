# 포포 플리마켓 · 프론트엔드 (Level 3)

마포구에서 열리는 오프라인 플리마켓을 **한눈에 보고(구매자), 부스를 신청하고(셀러), 운영하는(주최측)** 웹앱의 화면입니다.
기획 내용은 [기획서.md](기획서.md)에 있습니다. 모든 인물, 단체, 계좌번호, 연락처는 **가상**이며 실제 결제는 하지 않습니다.

- 배포 주소: https://popo-fleamarket-level3-frontend.vercel.app
- 백엔드 주소: https://popo-fleamarket-level3-backend.onrender.com (DB 연결 확인: [/health](https://popo-fleamarket-level3-backend.onrender.com/health))
- 백엔드 저장소: https://github.com/thingjae/popo-fleamarket-level3-backend

> ⏳ 백엔드가 Render 무료 서버라, 한동안 아무도 쓰지 않았다면 첫 화면에 "서버를 깨우는 중" 안내가 뜨고 1분 가까이 걸릴 수 있어요. 고장이 아니에요.

## 확인용 계정 (가상)

| 역할 | 이메일 | 비밀번호 | 볼 수 있는 것 |
| --- | --- | --- | --- |
| **관리자** (주최측) | `admin@popo.test` | `popo1234!` | 현황, 신청 관리(승인·입금 확인), 마켓·장비 관리, 문의함 |
| **일반** (셀러) | `seller1@popo.test` | `popo1234!` | 부스 신청, AI 소개글, 내 신청 |

`seller1`~`seller10`이 모두 같은 비밀번호예요. 셀러 가입 화면에서 새 계정을 만들어도 돼요. 구매자는 로그인 없이 마켓을 볼 수 있어요.

**확인해 보기 좋은 순서**
1. 로그인 없이 마켓 목록 → **포포 망원 주말 플리마켓** → 키워드 모음과 셀러 미리보기
2. 셀러 가입 → 망원 마켓 **부스 신청** → 키워드 입력 → **✨ AI로 소개글 만들기** → 사진 올리기 → 신청
3. `admin@popo.test` 로그인 → **신청 관리** → 승인 → 입금 대기 탭에서 입금 확인
4. 셀러로 다시 로그인 → **내 신청**에서 상태와 가상계좌 확인
5. 규칙 거절 보기: **포포 상수 선데이 마켓**(남은 부스 1)에 2개 신청, **합정** 마켓(마감)에 신청, 셀러가 관리자 주소(`/admin`) 열기

## 화면

| 누가 | 화면 | 주소 |
| --- | --- | --- |
| 누구나 | 마켓 목록 (검색, 동네·상태 필터, 이번 주말) | `/` |
| 누구나 | 마켓 상세 (키워드 모음, 셀러 미리보기, 장비, 신청·문의) | `/markets/[id]` |
| 누구나 | 로그인 / 셀러 가입 | `/login`, `/signup` |
| 셀러 | 부스 신청 (부스·장비·금액, 키워드 → AI 소개글, 판매 링크, 사진 최대 10장) | `/markets/[id]/apply` |
| 셀러 | 내 신청 (상태, 가상계좌, 입금 기한, 취소) | `/my` |
| 관리자 | 현황 (남은 부스 / 심사 대기 / 입금 확인 금액), 가상 데이터 다시 채우기 | `/admin` |
| 관리자 | 신청 관리 / 마켓 관리 / 장비 관리 / 문의함 | `/admin/applications`, `/admin/markets`, `/admin/equipment`, `/admin/inquiries` |

메뉴는 역할에 따라 달라지고, 권한이 없는 화면은 안내만 보여요. **실제로 막는 건 서버**예요 (권한 없는 요청은 서버가 거절).

## 기술

Next.js 16 (App Router), React 19, Tailwind CSS 4. 데이터는 브라우저에서 백엔드 API를 직접 불러오고, 로그인 출입증은 브라우저 `localStorage`에 둡니다(프론트와 백엔드 도메인이 달라서 쿠키 대신).

## 설정값

| 이름 | 뜻 | 예시 |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | 백엔드 주소 (끝에 `/` 없이) | `https://popo-fleamarket-level3-backend.onrender.com` |

GPT API 키는 **프론트엔드에 넣지 않습니다.** AI 소개글은 백엔드가 대신 GPT를 부릅니다.

## 내 컴퓨터에서 실행

```bash
npm install
cp .env.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:4100
npm run dev                  # http://localhost:3100
```
