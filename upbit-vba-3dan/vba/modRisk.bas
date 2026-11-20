Attribute VB_Name = "modRisk"
Option Explicit

Public gDailyPnLKrw As Double
Public gDailyPnLDate As Date
Public gConsecutiveLosses As Long
Public gCooldownUntil As Date

Public Sub ResetDailyIfNeeded()
    Dim d As Date
    d = DateValue(SyncedNow())
    If gDailyPnLDate <> d Then
        gDailyPnLKrw = 0
        gDailyPnLDate = d
        gConsecutiveLosses = 0
        gCooldownUntil = 0
    End If
End Sub

Public Sub RecordDailyPnL(ByVal pnlKrw As Double)
    ResetDailyIfNeeded
    gDailyPnLKrw = gDailyPnLKrw + pnlKrw
    If pnlKrw < 0 Then
        gConsecutiveLosses = gConsecutiveLosses + 1
        Dim cfg As AppConfig
        cfg = EnsureConfig()
        If gConsecutiveLosses >= cfg.ConsecutiveLossCooldown Then
            gCooldownUntil = DateAdd("n", cfg.CooldownMinutes, SyncedNow())
            gConsecutiveLosses = 0
        End If
    ElseIf pnlKrw > 0 Then
        gConsecutiveLosses = 0
    End If
    UpdateDashboardRisk
End Sub

Public Function CanOpenNewPosition() As Boolean
    Dim cfg As AppConfig
    cfg = EnsureConfig()
    ResetDailyIfNeeded

    If cfg.StopTrading Then
        CanOpenNewPosition = False
        Exit Function
    End If
    If SyncedNow() < gCooldownUntil Then
        CanOpenNewPosition = False
        Exit Function
    End If
    If cfg.StartingEquityKrw > 0 Then
        If (-gDailyPnLKrw / cfg.StartingEquityKrw) * 100# >= cfg.DailyLossLimitPct Then
            CanOpenNewPosition = False
            On Error Resume Next
            ThisWorkbook.Worksheets("Dashboard").Range("B1").Value = "DailyLimit"
            On Error GoTo 0
            Exit Function
        End If
    End If
    If OpenPositionCount() >= cfg.MaxPositions Then
        CanOpenNewPosition = False
        Exit Function
    End If
    CanOpenNewPosition = True
End Function

Public Function HasPosition(ByVal market As String) As Boolean
    Dim ws As Worksheet
    Dim r As Long, lastRow As Long
    EnsureSheetHeaders
    Set ws = ThisWorkbook.Worksheets("Positions")
    lastRow = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
    For r = 2 To lastRow
        If StrComp(CStr(ws.Cells(r, 1).Value), market, vbTextCompare) = 0 Then
            If UCase$(CStr(ws.Cells(r, 7).Value)) = "OPEN" Then
                HasPosition = True
                Exit Function
            End If
        End If
    Next r
    HasPosition = False
End Function

Public Function OpenPositionCount() As Long
    Dim ws As Worksheet
    Dim r As Long, lastRow As Long, n As Long
    EnsureSheetHeaders
    Set ws = ThisWorkbook.Worksheets("Positions")
    lastRow = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
    n = 0
    For r = 2 To lastRow
        If UCase$(CStr(ws.Cells(r, 7).Value)) = "OPEN" Then n = n + 1
    Next r
    OpenPositionCount = n
End Function

Public Sub AddPosition(ByVal market As String, ByVal qty As Double, ByVal entryPrice As Double, ByVal uuid As String)
    Dim cfg As AppConfig
    Dim ws As Worksheet
    Dim r As Long
    cfg = EnsureConfig()
    EnsureSheetHeaders
    Set ws = ThisWorkbook.Worksheets("Positions")
    r = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row + 1
    If r < 2 Then r = 2
    ws.Cells(r, 1).Value = market
    ws.Cells(r, 2).Value = qty
    ws.Cells(r, 3).Value = entryPrice
    ws.Cells(r, 4).Value = entryPrice * (1 - cfg.StopLossPct / 100#)
    ws.Cells(r, 5).Value = entryPrice * (1 + cfg.TakeProfitPct / 100#)
    ws.Cells(r, 6).Value = entryPrice
    ws.Cells(r, 7).Value = "OPEN"
    ws.Cells(r, 8).Value = Now
    ws.Cells(r, 9).Value = uuid
    UpdateDashboardRisk
End Sub

Public Sub RemovePosition(ByVal market As String)
    Dim ws As Worksheet
    Dim r As Long, lastRow As Long
    Set ws = ThisWorkbook.Worksheets("Positions")
    lastRow = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
    For r = lastRow To 2 Step -1
        If StrComp(CStr(ws.Cells(r, 1).Value), market, vbTextCompare) = 0 Then
            If UCase$(CStr(ws.Cells(r, 7).Value)) = "OPEN" Then
                ws.Cells(r, 7).Value = "CLOSED"
            End If
        End If
    Next r
    UpdateDashboardRisk
End Sub

Public Sub ManagePositionsNow()
    Dim cfg As AppConfig
    Dim ws As Worksheet
    Dim r As Long, lastRow As Long
    Dim market As String, qty As Double, entry As Double, stopP As Double, takeP As Double
    Dim highest As Double, price As Double
    Dim tickers As Collection

    cfg = EnsureConfig()
    EnsureSheetHeaders
    Set ws = ThisWorkbook.Worksheets("Positions")
    lastRow = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
    If lastRow < 2 Then Exit Sub

    For r = 2 To lastRow
        If UCase$(CStr(ws.Cells(r, 7).Value)) <> "OPEN" Then GoTo NextRow
        market = CStr(ws.Cells(r, 1).Value)
        qty = CDbl(Val(ws.Cells(r, 2).Value))
        entry = CDbl(Val(ws.Cells(r, 3).Value))
        stopP = CDbl(Val(ws.Cells(r, 4).Value))
        takeP = CDbl(Val(ws.Cells(r, 5).Value))
        highest = CDbl(Val(ws.Cells(r, 6).Value))

        On Error Resume Next
        Set tickers = GetTickers(market)
        On Error GoTo 0
        If tickers Is Nothing Then GoTo NextRow
        If tickers.Count = 0 Then GoTo NextRow
        price = JsonGetDouble(CStr(tickers(1)), "trade_price")
        If price <= 0 Then GoTo NextRow

        If price > highest Then
            highest = price
            ws.Cells(r, 6).Value = highest
        End If

        ' Trailing stop once activated
        If cfg.TrailActivatePct > 0 And entry > 0 Then
            If ((highest - entry) / entry) * 100# >= cfg.TrailActivatePct Then
                Dim trailStop As Double
                trailStop = highest * (1 - cfg.TrailDistancePct / 100#)
                If trailStop > stopP Then
                    stopP = trailStop
                    ws.Cells(r, 4).Value = stopP
                End If
            End If
        End If

        If price <= stopP Then
            ExecuteMarketSell market, qty, "STOP", entry
        ElseIf price >= takeP Then
            ExecuteMarketSell market, qty, "TAKE", entry
        End If
NextRow:
    Next r
    UpdateDashboardRisk
End Sub

Public Sub UpdateDashboardRisk()
    Dim cfg As AppConfig
    Dim pct As Double
    cfg = EnsureConfig()
    On Error Resume Next
    With ThisWorkbook.Worksheets("Dashboard")
        .Range("B4").Value = OpenPositionCount()
        .Range("B5").Value = gDailyPnLKrw
        If cfg.StartingEquityKrw > 0 Then
            pct = gDailyPnLKrw / cfg.StartingEquityKrw * 100#
        Else
            pct = 0
        End If
        .Range("B6").Value = pct
        .Range("B9").Value = IIf(cfg.StopTrading, "TRUE", "FALSE")
        .Range("B10").Value = IIf(cfg.PaperTrading, "TRUE", "FALSE")
        .Range("B11").Value = gConsecutiveLosses
    End With
    On Error GoTo 0
End Sub
