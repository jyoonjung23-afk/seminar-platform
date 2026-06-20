# 병원 브랜딩 세미나 플랫폼

세미나 참가자들이 온라인으로 실습을 진행하고 PDF로 다운로드할 수 있는 플랫폼입니다.

## 기능

✅ **관리자 모드**: 참가자별 고유 링크 생성
✅ **참가자 모드**: 
  - 실습 1: 4가지 질문에 텍스트 입력
  - 실습 2: 6가지 체크리스트 항목 체크
  - 자동 저장 (Supabase)
  - PDF 다운로드

✅ **데이터 격리**: 각 참가자는 자신의 데이터만 볼 수 있음

---

## 필수 설정

### 1. Supabase 정보 입력

`src/App.jsx` 파일의 상단에 있는 다음 부분을 수정하세요:

```javascript
// ⚠️ 여기에 당신의 Supabase 정보를 입력하세요
const SUPABASE_URL = 'https://dyoskqisafdsrjtvgyl.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_LNhjH630SHcpxEHWOht1jA_XVhx_...';
```

**당신의 Supabase 정보로 수정:**
- `SUPABASE_URL`: Supabase 프로젝트의 Project URL
- `SUPABASE_ANON_KEY`: Supabase 프로젝트의 Publishable key (전체 길이)

---

## 로컬 개발

### 1. 설치

```bash
npm install
```

### 2. 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 을 열어서 확인하세요.

---

## Vercel 배포

### 1. GitHub에 업로드

1. GitHub Desktop 또는 git 명령어로 리포지토리에 푸시
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

### 2. Vercel에 배포

1. https://vercel.com 방문
2. "New Project" 클릭
3. GitHub 리포지토리 선택
4. 환경 변수 설정 (선택사항):
   - 추가로 환경변수가 필요하면 "Environment Variables" 섹션에서 추가
5. "Deploy" 클릭

자동으로 배포되고 URL이 생성됩니다!

---

## 사용 방법

### 관리자

1. 사이트 방문
2. "관리자 모드 (링크 생성)" 클릭
3. "새로운 참가자 링크 생성" 클릭
4. 생성된 링크를 참가자에게 공유

### 참가자

1. 관리자가 준 링크를 클릭
2. 병원명 입력
3. 실습 1: 4가지 질문에 답변
4. 실습 2: 체크리스트 항목 체크
5. "PDF 다운로드" 클릭

---

## 기술 스택

- React 18
- Vite
- Supabase
- html2pdf (PDF 생성)

---

## 문제 해결

**PDF 다운로드가 안 돼요**
- 브라우저 팝업 차단 해제 확인
- 인터넷 연결 확인

**저장이 안 돼요**
- Supabase URL과 키가 올바른지 확인
- Supabase 대시보드에서 `responses` 테이블이 있는지 확인

---

## 질문?

세미나 진행 중에 문제가 생기면 관리자에게 문의하세요.
