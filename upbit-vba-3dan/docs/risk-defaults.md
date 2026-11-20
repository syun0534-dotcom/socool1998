# 리스크·전략 기본값 요약

## 3단정렬법 흐름
1. **15분 방향** — 최근 3~5봉 HH/HL이면 Up. Down/Side면 매수 금지.
2. **5분 눌림자리** — 직전 저항→지지(눌림) 구간에 가격이 근접했는지.
3. **1분 트리거** — 저점 후 상향 전환 + 양봉(몸통비율 ≥ BodyRatioMin).
4. **호가 필터** — ask_topN / bid_topN ≤ AskBidRatioMax. 매도벽 과다 시 스킵.
5. **타이밍** — 매분 **초 ≥ 57**에만 신규 진입 평가. 같은 분·같은 마켓 중복 진입 금지.
6. **체결** — 조건 통과 시 시장가 매수(마감/다음 시가 의도).

## 리스크 기본값 (Config)
| 항목 | 기본 | 동작 |
|------|------|------|
| StopLossPct | 0.6% | 진입가 대비 손절 |
| TakeProfitPct | 1.0% | 진입가 대비 익절 |
| DailyLossLimitPct | 3.0% | 당일 실현손실 ≥ 한도 → 신규진입 중지 |
| MaxPositions | 3 | 동시 보유 상한 |
| 종목당 포지션 | 1 | Positions OPEN 중복 금지 |
| ConsecutiveLossCooldown | 3회 | 연속 손절 후 CooldownMinutes 대기 |
| TrailActivatePct / TrailDistancePct | 0.5% / 0.3% | 수익 구간 트레일 손절 |
| MinTradeValue24h | 5,000,000,000 KRW | 유니버스 필터 |
| PaperTrading | FALSE | TRUE면 주문 없이 로그만 |
| StopTrading | FALSE | 킬스위치 |

## 안전장치
- Dashboard **안전 중지** / **킬스위치 ON** → OnTime 해제 + 신규진입 차단.
- 워크북 종료 시 `StopTradingSafe` 자동 호출.
- API 키는 주문만, **출금 권한 OFF**.
- SecretKey는 Config 숨김 행 + 플레이스홀더만 저장소에 커밋.
