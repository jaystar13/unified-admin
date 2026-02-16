# Unified Admin (통합 관리자)

여러 서비스의 관리 기능을 하나의 어드민 페이지에서 제공하기 위한 프론트엔드 프로젝트.
현재는 **플레이어스로그(PlayersLog)** 서비스의 어드민 기능을 이전하여 운영 중이며, 향후 다른 서비스를 추가할 수 있는 구조를 목표로 한다.

---

## 기술 스택

| 구분 | 기술 | 버전 |
|------|------|------|
| Framework | React | 18.3.1 |
| Language | TypeScript | 5.7.0 |
| Build Tool | Vite | 6.0.0 |
| Routing | React Router DOM | 7.1.0 |
| 상태/데이터 | TanStack React Query | 5.62.0 |
| HTTP Client | Axios | 1.7.9 |
| 스타일링 | Tailwind CSS | 3.4.17 |
| UI 컴포넌트 | shadcn/ui (Radix UI) | - |
| 테이블 | TanStack React Table | 8.21.3 |
| 차트 | Recharts | 2.15.0 |
| 날짜 | date-fns | 3.6.0 |
| 엑셀 | SheetJS (xlsx) | 0.18.5 |

---

## 프로젝트 기동

### 사전 요구사항

- Node.js (LTS 권장)
- PlayersLog 백엔드 서버가 `localhost:4000`에서 실행 중이어야 함

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (포트 3200)
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과물 미리보기
npm run preview

# 린트 검사
npm run lint

# 클린업 (dist, node_modules 삭제)
npm run clean
```

### 환경 변수

`.env.example`을 참고하여 `.env` 파일을 생성한다.

```env
VITE_PLAYERSLOG_API_URL=/api/playerslog
```

### 개발 서버 프록시

Vite 개발 서버에서 API 프록시가 설정되어 있다. (`vite.config.ts`)

```
/api/playerslog/*  →  http://localhost:4000/api/*
```

프론트엔드의 모든 API 호출은 `/api/playerslog` 경로로 요청되며, Vite 프록시가 PlayersLog 백엔드로 전달한다.

---

## 프로젝트 구조

```
src/
├── main.tsx                          # 엔트리 포인트 (Provider 설정)
├── App.tsx                           # 라우팅 정의
├── styles/index.css                  # 글로벌 스타일
│
├── shared/                           # 공통 모듈
│   ├── hooks/
│   │   └── useAuth.tsx               # 인증 Context & Hook
│   ├── components/
│   │   ├── ProtectedRoute.tsx        # 인증 라우트 가드
│   │   ├── layout/
│   │   │   ├── Layout.tsx            # 전체 레이아웃 (Sidebar + Header + Outlet)
│   │   │   ├── Sidebar.tsx           # 사이드바 내비게이션
│   │   │   └── Header.tsx            # 상단 헤더
│   │   ├── data-table/               # 공통 DataTable 컴포넌트
│   │   └── ui/                       # shadcn/ui 기반 UI 컴포넌트
│   └── lib/
│       └── utils.ts                  # 유틸리티 함수 (cn 등)
│
└── services/
    └── playerslog/                   # 플레이어스로그 서비스 모듈
        ├── api/
        │   ├── api-client.ts         # Axios 인스턴스 (baseURL: /api/playerslog)
        │   ├── auth.ts               # 인증 API (login, getMe)
        │   ├── games.ts              # 경기 API
        │   ├── golls.ts              # 작성 로그 API
        │   ├── settlements.ts        # 정산 API
        │   ├── users.ts              # 사용자 API
        │   ├── admin.ts              # 대시보드/알림 API
        │   └── index.ts              # API export
        ├── hooks/                    # 서비스별 React Query 훅
        ├── pages/                    # 페이지 컴포넌트
        │   ├── Login.tsx
        │   ├── Dashboard.tsx
        │   ├── Games.tsx
        │   ├── Live.tsx
        │   ├── Settlements.tsx
        │   ├── Golls.tsx
        │   ├── Users.tsx
        │   └── */columns.tsx         # 각 페이지별 테이블 컬럼 정의
        ├── types/                    # TypeScript 타입 정의
        ├── constants/                # 상수 (팀, 경기장, enum 등)
        └── utils/                    # 유틸리티 (날짜, 스코어 등)
```

---

## 인증 시스템

### 현재 구조

인증은 **PlayersLog 백엔드에 내장된 인증 로직**을 사용한다. 별도 인증 서버는 없다.

### 인증 흐름

```
1. 사용자 → /login 페이지에서 이메일 + 비밀번호 입력
2. POST /api/playerslog/auth/login → accessToken + user 반환
3. accessToken을 localStorage에 저장 (key: "accessToken")
4. 이후 모든 API 요청에 Authorization: Bearer {token} 헤더 자동 첨부
5. 앱 초기 로드 시 GET /api/playerslog/auth/me로 토큰 유효성 검증
6. 401 응답 시 토큰 제거 → /login으로 리다이렉트
```

### 인증 관련 파일

| 파일 | 역할 |
|------|------|
| `shared/hooks/useAuth.tsx` | AuthContext 제공 (user 상태, login/logout 메서드) |
| `shared/components/ProtectedRoute.tsx` | 미인증 사용자를 /login으로 리다이렉트 |
| `services/playerslog/api/auth.ts` | 인증 API 호출 (login, getMe) |
| `services/playerslog/api/api-client.ts` | Axios 인스턴스, 토큰 인터셉터, 401 처리 |
| `services/playerslog/pages/Login.tsx` | 로그인 UI |

### 사용자 타입

```typescript
interface AuthUser {
  id: string;
  email: string;
  role: 'admin' | 'superadmin';
  nickname: string;
}
```

---

## PlayersLog 종속성 현황 (리팩토링 대상)

현재 "통합 어드민"이라는 이름에도 불구하고, 인증 시스템이 PlayersLog 백엔드에 종속되어 있다.
향후 다른 서비스를 추가할 때 아래 항목들을 범용으로 전환해야 한다.

### 종속 지점 목록

| # | 파일 | 종속 내용 | 전환 방향 |
|---|------|-----------|-----------|
| 1 | `shared/hooks/useAuth.tsx` | `import { authApi } from '@/services/playerslog/api/auth'` | `@/shared/api/auth`로 이동 |
| 2 | `services/playerslog/api/api-client.ts` | `baseURL: '/api/playerslog'`가 인증 요청에도 사용됨 | 공통 API 클라이언트 분리 |
| 3 | `services/playerslog/api/auth.ts` | PlayersLog 전용 API 클라이언트로 인증 요청 | `shared/api/auth.ts`로 이동 |
| 4 | `services/playerslog/pages/Login.tsx` | 로그인 성공 후 `/playerslog/dashboard`로 하드코딩 | 기본 랜딩 경로로 변경 |
| 5 | `App.tsx` | 기본 리다이렉트가 `/playerslog/dashboard` | 공통 대시보드 또는 서비스 선택 페이지 |
| 6 | `vite.config.ts` | 프록시가 `/api/playerslog`만 설정됨 | 서비스별 프록시 추가 구조 |

---

## 범용화 전환 계획

### 개요

현재 시점에서 별도 인증 서버 구축은 불필요하다.
프론트엔드 코드 구조를 먼저 범용화하고, 서비스 추가 시점에 백엔드 인증 전략을 결정한다.

### Phase 1: 프론트엔드 인증 분리 (현재 단계)

목표: 인증 코드를 `shared`로 이동하여 특정 서비스 종속성 제거

작업 내용:

1. **공통 API 클라이언트 생성**
   - `src/shared/api/api-client.ts` 신규 생성 (인증 전용, baseURL은 설정 가능하게)
   - `services/playerslog/api/api-client.ts`는 PlayersLog 비즈니스 API 전용으로 유지

2. **인증 API를 shared로 이동**
   - `services/playerslog/api/auth.ts` → `shared/api/auth.ts`
   - 공통 API 클라이언트 사용하도록 변경

3. **로그인 페이지를 shared로 이동**
   - `services/playerslog/pages/Login.tsx` → `shared/pages/Login.tsx`
   - 로그인 후 리다이렉트 경로를 설정 기반으로 변경
   - placeholder 이메일 등 PlayersLog 특화 텍스트 제거

4. **라우팅 정리**
   - 기본 랜딩 경로를 서비스 비종속적으로 변경
   - `App.tsx`의 import 경로 정리

### Phase 2: 서비스 추가 시 (향후)

새로운 서비스가 추가될 때의 인증 전략은 아래 세 가지 중 선택:

| 방식 | 설명 | 적합한 경우 |
|------|------|------------|
| **BFF 게이트웨이** | 통합 어드민 전용 백엔드가 각 서비스에 인증 대행 | 서비스별 인증 방식이 다를 때 (추천) |
| **멀티 세션** | 프론트엔드에서 서비스별 토큰을 각각 관리 | 서비스가 2~3개 이하이고 인증 방식이 유사할 때 |
| **독립 인증 서버** | SSO/OAuth2 기반 중앙 인증 | 서비스가 많고 장기적 확장이 필요할 때 |

Phase 1 완료 후 인증 코드가 `shared`에 분리되어 있으므로, 어떤 방식을 선택하든 `shared/api/auth.ts`의 엔드포인트만 교체하면 된다.

---

## 라우팅

### 공개 라우트

| 경로 | 페이지 |
|------|--------|
| `/login` | 로그인 |

### 인증 필요 라우트 (PlayersLog)

| 경로 | 페이지 |
|------|--------|
| `/playerslog/dashboard` | 대시보드 |
| `/playerslog/games` | 경기 일정 관리 |
| `/playerslog/live` | 라이브 운영 |
| `/playerslog/settlements` | 정산 관리 |
| `/playerslog/golls` | 작성 로그 관리 |
| `/playerslog/users` | 사용자 관리 |

---

## 주요 의존성 패턴

### 데이터 패칭

TanStack React Query를 사용하며, 서비스별로 커스텀 훅을 제공한다.

- `useGames`, `useUsers`, `useSettlements`, `useGolls`, `useDashboard`
- staleTime: 5분, retry: 1회
- mutation 성공 시 자동 캐시 무효화

### UI 컴포넌트

shadcn/ui 기반으로, `shared/components/ui/`에 공통 컴포넌트가 위치한다.
DataTable 컴포넌트는 `shared/components/data-table/`에서 제공하며, 각 페이지는 `columns.tsx`로 컬럼 정의만 작성하면 된다.
