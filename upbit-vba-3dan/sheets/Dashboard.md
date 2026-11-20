# Dashboard 시트

| 셀 | 라벨 | 값/용도 |
|----|------|---------|
| A1 | Status | Idle / Running / Stopped / DailyLimit / Cooldown |
| B1 | (값) | VBA가 갱신 |
| A2 | ServerTime | 동기화된 서버시각 |
| A3 | NextEvalAt | 다음 :57 평가 시각 |
| A4 | OpenPositions | 현재 보유 수 |
| A5 | DailyPnLKrw | 당일 실현손익(KRW) |
| A6 | DailyPnLPct | 당일 손익% |
| A7 | LastSignal | 최근 시그널 요약 |
| A8 | LastError | 최근 오류 |
| A9 | KillSwitch | Config!StopTrading 미러 |
| A10 | PaperMode | Config!PaperTrading 미러 |
| A11 | ConsecutiveLosses | 연속 손절 횟수 |
| A12 | UniverseCount | 유니버스 종목 수 |

## 버튼 (양식 컨트롤 → 매크로 지정)
| 버튼 텍스트 | 매크로 |
|-------------|--------|
| 실행 시작 | `StartTrading` |
| 안전 중지 | `StopTradingSafe` |
| 킬스위치 ON | `KillSwitchOn` |
| 유니버스 갱신 | `RefreshUniverseNow` |
| 포지션 점검 | `ManagePositionsNow` |
