# Config 시트

헤더 행 1, 값 행 2. A열=키, B열=값 권장(또는 아래 열 레이아웃).

| 셀 | 키 | 기본값 | 설명 |
|----|-----|--------|------|
| A1/B1 | AccessKey | `YOUR_ACCESS_KEY` | 업비트 Access Key (플레이스홀더) |
| A2/B2 | SecretKey | `YOUR_SECRET_KEY` | 업비트 Secret Key — **열 숨김 권장** |
| A3/B3 | OrderAmountKrw | `50000` | 1회 시장가 매수 금액(KRW) |
| A4/B4 | StopLossPct | `0.6` | 손절 % |
| A5/B5 | TakeProfitPct | `1.0` | 익절 % |
| A6/B6 | DailyLossLimitPct | `3.0` | 일일 손실 한도 %(당일 신규진입 중지) |
| A7/B7 | MaxPositions | `3` | 최대 동시 포지션 |
| A8/B8 | MinTradeValue24h | `5000000000` | 유니버스 24h 거래대금 하한(KRW) |
| A9/B9 | PaperTrading | `FALSE` | TRUE=주문 없이 로그만, FALSE=실주문 |
| A10/B10 | StopTrading | `FALSE` | **킬스위치** TRUE면 신규진입·타이머 중지 |
| A11/B11 | BodyRatioMin | `0.35` | 1분 양봉 몸통/(고-저) 하한 |
| A12/B12 | AskBidRatioMax | `1.8` | 호가 ask_topN/bid_topN 상한(초과 시 스킵) |
| A13/B13 | HogaTopN | `5` | 호가 합산 깊이 |
| A14/B14 | ConsecutiveLossCooldown | `3` | 연속 손절 N회 후 쿨다운 분 |
| A15/B15 | CooldownMinutes | `15` | 연속손절 쿨다운(분) |
| A16/B16 | UniverseCacheMinutes | `3` | 유니버스 캐시(분) |
| A17/B17 | FeeRate | `0.0005` | 수수료율(왕복 반영용 참고) |
| A18/B18 | TrailActivatePct | `0.5` | 트레일 발동 수익%(0=비활성) |
| A19/B19 | TrailDistancePct | `0.3` | 트레일 거리% |
| A20/B20 | StartingEquityKrw | `1000000` | 일손익% 계산 기준 자본 |

## 보안
- SecretKey 행 숨기기: 행 선택 → 우클릭 → 숨기기
- API 키는 **주문만** 허용, **출금 권한 OFF**
- 워크북 암호 보호 권장
