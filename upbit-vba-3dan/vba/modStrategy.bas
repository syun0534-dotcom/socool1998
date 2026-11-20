Attribute VB_Name = "modStrategy"
Option Explicit

' Markets already evaluated for entry in this minute key
Private gEvalMinuteKey As String
Private gEvalMarkets As Object

Public Sub EvaluateEntriesAtCloseGate()
    Dim cfg As AppConfig
    Dim markets As Collection
    Dim m As Variant, market As String
    Dim c15() As Candle, c5() As Candle, c1() As Candle
    Dim t15 As TrendDir
    Dim zoneOk As Boolean, trigOk As Boolean, hogaOk As Boolean
    Dim minuteKey As String
    Dim serverNow As Date
    Dim sec As Long

    cfg = EnsureConfig()
    serverNow = SyncedNow()
    sec = Second(serverNow)
    minuteKey = Format$(serverNow, "yyyy-mm-dd hh:nn")

    If sec < 57 Then Exit Sub
    If cfg.StopTrading Then Exit Sub
    If Not CanOpenNewPosition() Then Exit Sub

    If gEvalMinuteKey <> minuteKey Or gEvalMarkets Is Nothing Then
        Set gEvalMarkets = CreateObject("Scripting.Dictionary")
        gEvalMinuteKey = minuteKey
    End If

    Set markets = UniverseMarkets()
    For Each m In markets
        If Not CanOpenNewPosition() Then Exit For
        market = CStr(m)
        If gEvalMarkets.Exists(market) Then GoTo NextMarket
        If HasPosition(market) Then
            gEvalMarkets(market) = "HAS_POS"
            GoTo NextMarket
        End If

        On Error GoTo MarketFail
        c15 = GetCandlesMinutes(market, 15, 12)
        t15 = DetectTrend15(c15)
        If t15 <> TrendUp Then
            LogSignal minuteKey, market, TrendToText(t15), "", "", "", "SKIP", "15m not Up"
            gEvalMarkets(market) = "SKIP15"
            GoTo NextMarket
        End If

        c5 = GetCandlesMinutes(market, 5, 30)
        zoneOk = InPullbackZone5(c5)
        If Not zoneOk Then
            LogSignal minuteKey, market, "Up", "No", "", "", "SKIP", "5m not in pullback zone"
            gEvalMarkets(market) = "SKIP5"
            GoTo NextMarket
        End If

        c1 = GetCandlesMinutes(market, 1, 20)
        trigOk = Trigger1m(c1, cfg.BodyRatioMin)
        If Not trigOk Then
            LogSignal minuteKey, market, "Up", "Yes", "No", "", "SKIP", "1m trigger fail"
            gEvalMarkets(market) = "SKIP1"
            GoTo NextMarket
        End If

        hogaOk = OrderbookAllowsLong(market, cfg.HogaTopN, cfg.AskBidRatioMax)
        If Not hogaOk Then
            LogSignal minuteKey, market, "Up", "Yes", "Yes", "No", "SKIP", "ask wall"
            gEvalMarkets(market) = "SKIPHOGA"
            GoTo NextMarket
        End If

        ' All passed — market buy at close / next open
        LogSignal minuteKey, market, "Up", "Yes", "Yes", "Yes", "ORDER", "3dan aligned"
        gEvalMarkets(market) = "ORDER"
        If ExecuteMarketBuy(market, cfg.OrderAmountKrw, "3DAN_ENTRY") Then
            On Error Resume Next
            ThisWorkbook.Worksheets("Dashboard").Range("B7").Value = market & " BUY " & minuteKey
            On Error GoTo 0
        End If
        GoTo NextMarket

MarketFail:
        LogSignal minuteKey, market, "", "", "", "", "ERROR", Err.Description
        DashboardError Err.Description
        Err.Clear
        gEvalMarkets(market) = "ERR"
NextMarket:
        On Error GoTo 0
        DoEvents
    Next m
End Sub

Public Sub DashboardError(ByVal msg As String)
    On Error Resume Next
    ThisWorkbook.Worksheets("Dashboard").Range("B8").Value = Left$(msg, 200)
    On Error GoTo 0
End Sub

Public Sub SetupWorkbookSheets()
    InitConfigSheetIfEmpty
    EnsureSheetHeaders
    EnsureDashboardSheet
End Sub

Private Sub EnsureDashboardSheet()
    Dim ws As Worksheet
    On Error Resume Next
    Set ws = ThisWorkbook.Worksheets("Dashboard")
    On Error GoTo 0
    If ws Is Nothing Then
        Set ws = ThisWorkbook.Worksheets.Add(After:=ThisWorkbook.Worksheets(ThisWorkbook.Worksheets.Count))
        ws.Name = "Dashboard"
    End If
    If Len(Trim$(CStr(ws.Range("A1").Value))) = 0 Then
        ws.Range("A1").Value = "Status"
        ws.Range("A2").Value = "ServerTime"
        ws.Range("A3").Value = "NextEvalAt"
        ws.Range("A4").Value = "OpenPositions"
        ws.Range("A5").Value = "DailyPnLKrw"
        ws.Range("A6").Value = "DailyPnLPct"
        ws.Range("A7").Value = "LastSignal"
        ws.Range("A8").Value = "LastError"
        ws.Range("A9").Value = "KillSwitch"
        ws.Range("A10").Value = "PaperMode"
        ws.Range("A11").Value = "ConsecutiveLosses"
        ws.Range("A12").Value = "UniverseCount"
        ws.Range("B1").Value = "Idle"
    End If
End Sub
