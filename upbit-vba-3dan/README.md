# Upbit 3단정렬법 Excel VBA 단타

Excel 매크로(`.xlsm`)용 **업비트 현물 실주문** 단타 소스입니다.  
전략: **15분 방향 → 5분 눌림자리 → 1분 트리거 → 호가 필터**, 매분 **:57(봉 마감 3초 전)** 에만 신규 진입 평가.

> Linux/CI에서는 `.xlsm` 바이너리를 만들 수 없습니다. **`.bas`/`.cls` 소스 + Import 가이드**가 납품물입니다. Windows Excel에서 조립하세요.

## 폴더 구조

```
upbit-vba-3dan/
  README.md
  docs/           리스크·전략 요약
  sheets/         시트 컬럼·기본값 설명
  vba/            VBA 모듈 소스
```

## 보안 (필수)

1. 업비트 API 키는 **주문 권한만** 켜고 **출금 권한은 OFF**.
2. `Config`의 `SecretKey`는 플레이스홀더만 커밋합니다. 실제 키는 로컬 `.xlsm`에만 넣고 **행 숨김 + 워크북 암호** 권장.
3. 처음에는 `PaperTrading=TRUE`로 시그널/로그만 확인하세요.
4. `StopTrading=TRUE`가 킬스위치입니다. Dashboard 버튼 또는 `KillSwitchOn` 매크로.

## Excel에 조립하는 방법

### 1) 새 매크로 통합 문서
1. Excel → 빈 통합문서 → **다른 이름으로 저장** → 형식을 **Excel 매크로 사용 통합 문서 (*.xlsm)**.
2. **파일 → 옵션 → 보안 센터 → 매크로 설정**에서 본인 환경에 맞게 매크로 허용(신뢰할 수 있는 위치 권장).

### 2) 시트 만들기
아래 6개 시트를 만들고, `sheets/` 문서를 참고해 헤더를 넣습니다.

| 시트 | 용도 |
|------|------|
| Config | API키·리스크·킬스위치 |
| Universe | 50억+ 종목 스냅샷 |
| Signals | 분봉 판단 로그 |
| Positions | 보유 포지션 |
| Trades | 체결 이력 |
| Dashboard | 상태·버튼 |

또는 VBA Immediate 창에서 `SetupWorkbookSheets` 실행 시 Config/헤더/Dashboard 골격을 자동 생성합니다.

**Config 기본값 (A열=키, B열=값):**

| Key | Default |
|-----|---------|
| AccessKey | YOUR_ACCESS_KEY |
| SecretKey | YOUR_SECRET_KEY |
| OrderAmountKrw | 50000 |
| StopLossPct | 0.6 |
| TakeProfitPct | 1.0 |
| DailyLossLimitPct | 3.0 |
| MaxPositions | 3 |
| MinTradeValue24h | 5000000000 |
| PaperTrading | FALSE |
| StopTrading | FALSE |
| BodyRatioMin | 0.35 |
| AskBidRatioMax | 1.8 |
| HogaTopN | 5 |
| ConsecutiveLossCooldown | 3 |
| CooldownMinutes | 15 |
| UniverseCacheMinutes | 3 |
| FeeRate | 0.0005 |
| TrailActivatePct | 0.5 |
| TrailDistancePct | 0.3 |
| StartingEquityKrw | 1000000 |

### 3) VBA 모듈 Import
1. `Alt+F11` → VBA 편집기.
2. 메뉴 **파일 → 파일 가져오기…** 로 `vba/` 아래 **표준 모듈**을 모두 Import:

| 파일 | 모듈명 |
|------|--------|
| modCrypto.bas | JWT HS256 / SHA512 (Windows CryptoAPI) |
| modHttp.bas | WinHttp |
| modJson.bas | JSON 헬퍼 |
| modConfig.bas | Config 로드 |
| modUpbitPublic.bas | 시세·캔들·호가 |
| modUpbitAuth.bas | 잔고·주문(JWT) |
| modUniverse.bas | 50억 필터 |
| modTrend15.bas | 15분 방향 |
| modZone5.bas | 5분 눌림 |
| modTrigger1.bas | 1분 트리거 |
| modHoga.bas | 호가 필터 |
| modOrders.bas | 매수/매도·로그 |
| modRisk.bas | 손절/익절/일한도 |
| modStrategy.bas | :57 평가 오케스트레이션 |
| modTimer.bas | OnTime + 서버시간 |

3. **`ThisWorkbook.cls`는 Import하지 마세요.**  
   VBA 프로젝트 트리의 **ThisWorkbook**을 연 뒤, 파일 안의 `Option Explicit` 이하 코드를 붙여넣습니다. (열 때 시트 초기, 닫을 때 타이머 안전정지)

### 4) Dashboard 버튼
개발 탭 → 삽입 → 양식 컨트롤 단추 → 매크로 지정:

| 버튼 | 매크로 |
|------|--------|
| 실행 시작 | `StartTrading` |
| 안전 중지 | `StopTradingSafe` |
| 킬스위치 ON | `KillSwitchOn` |
| 유니버스 갱신 | `RefreshUniverseNow` |
| 포지션 점검 | `ManagePositionsNow` |

### 5) 실행
1. Config에 키 입력(또는 PaperTrading=TRUE).
2. `StopTrading=FALSE` 확인.
3. **실행 시작** → 서버시간 동기화 후 OnTime 루프.
4. 매분 :57 근처에서 유니버스 종목 3단+호가 평가 → 통과 시 시장가 매수.
5. 보유 중에는 손절/익절/트레일/일손실한도만 점검.

## JWT / 암호 (블로커 해결)

업비트 개인 API는 **JWT HS256** + 쿼리 **SHA512** 해시가 필요합니다.

- 구현: `modCrypto.bas` — **Windows CryptoAPI (`advapi32`)** 로 HMAC-SHA256 / SHA512.
- **추가 COM DLL 불필요** (ADODB.Stream은 UTF-8 변환용, MSXML은 Base64Url).
- **Windows + Excel VBA7(권장 64-bit)** 환경에서 동작. Mac Excel은 CryptoAPI 불가.
- 로컬 검증: Immediate 창에서  
  `? Left(BuildJwtHs256("acc","sec"), 20)`  
  가 에러 없이 나오면 JWT 준비가 된 것입니다.

## 동작 요약

```
OnTime tick → 서버시간 동기화 → 포지션 SL/TP
         → (초≥57 & KillSwitch OFF) → 유니버스
         → 종목별 15m Up → 5m zone → 1m trigger → 호가 OK → 시장가 매수
         → 같은 분 중복 진입 금지
```

자세한 리스크·전략: `docs/risk-defaults.md`, `docs/strategy-rules.md`.

## 면책
자동매매는 원금 손실 위험이 큽니다. 승률·수익을 보장하지 않습니다. 실주문 전 PaperTrading으로 충분히 검증하세요.
