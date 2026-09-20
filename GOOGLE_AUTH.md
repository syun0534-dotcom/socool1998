# Google 로그인 설정

앱은 구글 OAuth를 사용합니다. Client Secret은 코드에 넣지 않고 Supabase 대시보드에 저장합니다.

## 1. Google Cloud에서 OAuth 클라이언트 만들기

1. [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials)로 이동합니다.
2. 프로젝트를 만들거나 선택합니다.
3. **OAuth 동의 화면**을 구성합니다. User Type은 테스트면 External + 테스트 사용자에 본인 Gmail을 넣습니다.
4. **사용자 인증 정보 만들기 → OAuth 클라이언트 ID → 웹 애플리케이션**을 선택합니다.
5. 승인된 리디렉션 URI에 다음을 추가합니다.

```
https://<YOUR_PROJECT_REF>.supabase.co/auth/v1/callback
```

6. 생성된 **클라이언트 ID**와 **클라이언트 보안 비밀**을 복사합니다.

## 2. Supabase에 Google provider 연결

1. Supabase Dashboard → **Authentication → Sign In / Providers → Google**
2. Enable Google을 켜고 Client ID / Secret을 붙여넣습니다.
3. **Authentication → URL Configuration**
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback`
4. **Authentication → Providers → Email**에서 이메일 가입을 끌 수 있습니다.

## 3. 로컬 앱

`.env.local`에 프로젝트 URL과 anon key를 넣은 뒤 `npm run dev` 후 http://localhost:3000 에서 **Google로 계속하기**를 누르면 됩니다. 값은 저장소에 커밋하지 마세요.
