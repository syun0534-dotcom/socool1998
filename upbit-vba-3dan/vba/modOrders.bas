Attribute VB_Name = "modOrders"
Option Explicit

Public Const MIN_ORDER_KRW As Double = 5000#

Public Sub LogTrade(ByVal side As String, ByVal market As String, ByVal qty As Double, _
                    ByVal price As Double, ByVal amountKrw As Double, ByVal fee As Double, _
                    ByVal uuid As String, ByVal reason As String, Optional ByVal pnlKrw As Double = 0)
    Dim ws As Worksheet
    Dim r As Long
    EnsureSheetHeaders
    Set ws = ThisWorkbook.Worksheets("Trades")
    r = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row + 1
    If r < 2 Then r = 2
    ws.Cells(r, 1).Value = Now
    ws.Cells(r, 2).Value = side
    ws.Cells(r, 3).Value = market
    ws.Cells(r, 4).Value = qty
    ws.Cells(r, 5).Value = price
    ws.Cells(r, 6).Value = amountKrw
    ws.Cells(r, 7).Value = fee
    ws.Cells(r, 8).Value = uuid
    ws.Cells(r, 9).Value = reason
    ws.Cells(r, 10).Value = pnlKrw
End Sub

Public Sub LogSignal(ByVal minuteKey As String, ByVal market As String, ByVal trend15 As String, _
                     ByVal zone5 As String, ByVal trigger1 As String, ByVal hogaOk As String, _
                     ByVal result As String, ByVal detail As String)
    Dim ws As Worksheet
    Dim r As Long
    EnsureSheetHeaders
    Set ws = ThisWorkbook.Worksheets("Signals")
    r = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row + 1
    If r < 2 Then r = 2
    ws.Cells(r, 1).Value = Now
    ws.Cells(r, 2).Value = minuteKey
    ws.Cells(r, 3).Value = market
    ws.Cells(r, 4).Value = trend15
    ws.Cells(r, 5).Value = zone5
    ws.Cells(r, 6).Value = trigger1
    ws.Cells(r, 7).Value = hogaOk
    ws.Cells(r, 8).Value = result
    ws.Cells(r, 9).Value = detail
End Sub

Public Function ExecuteMarketBuy(ByVal market As String, ByVal krwAmount As Double, ByVal reason As String) As Boolean
    Dim cfg As AppConfig
    Dim resp As String, uuid As String, price As Double, qty As Double
    cfg = EnsureConfig()

    If krwAmount < MIN_ORDER_KRW Then
        LogSignal MinuteKeyNow(), market, "", "", "", "", "SKIP", "amount<min"
        ExecuteMarketBuy = False
        Exit Function
    End If

    If cfg.PaperTrading Then
        price = EstimateLastPrice(market)
        If price <= 0 Then price = 1
        qty = (krwAmount * (1 - cfg.FeeRate)) / price
        uuid = "PAPER-" & NewUuidV4()
        LogTrade "BUY", market, qty, price, krwAmount, krwAmount * cfg.FeeRate, uuid, reason, 0
        AddPosition market, qty, price, uuid
        ExecuteMarketBuy = True
        Exit Function
    End If

    On Error GoTo Fail
    resp = PlaceMarketBuyKrw(market, krwAmount)
    uuid = JsonGetString(resp, "uuid")
    price = EstimateLastPrice(market)
    If price <= 0 Then price = 1
    qty = (krwAmount * (1 - cfg.FeeRate)) / price
    LogTrade "BUY", market, qty, price, krwAmount, krwAmount * cfg.FeeRate, uuid, reason, 0
    AddPosition market, qty, price, uuid
    ExecuteMarketBuy = True
    Exit Function
Fail:
    LogSignal MinuteKeyNow(), market, "", "", "", "", "ERROR", Err.Description
    DashboardError Err.Description
    ExecuteMarketBuy = False
End Function

Public Function ExecuteMarketSell(ByVal market As String, ByVal qty As Double, ByVal reason As String, _
                                  Optional ByVal entryPrice As Double = 0) As Boolean
    Dim cfg As AppConfig
    Dim resp As String, uuid As String, price As Double, pnl As Double, amount As Double
    cfg = EnsureConfig()
    If qty <= 0 Then
        ExecuteMarketSell = False
        Exit Function
    End If

    price = EstimateLastPrice(market)
    If price <= 0 Then price = entryPrice
    amount = qty * price
    If entryPrice > 0 Then
        pnl = (price - entryPrice) * qty
    Else
        pnl = 0
    End If

    If cfg.PaperTrading Then
        uuid = "PAPER-" & NewUuidV4()
        LogTrade "SELL", market, qty, price, amount, amount * cfg.FeeRate, uuid, reason, pnl
        RemovePosition market
        RecordDailyPnL pnl
        ExecuteMarketSell = True
        Exit Function
    End If

    On Error GoTo Fail
    resp = PlaceMarketSellQty(market, qty)
    uuid = JsonGetString(resp, "uuid")
    LogTrade "SELL", market, qty, price, amount, amount * cfg.FeeRate, uuid, reason, pnl
    RemovePosition market
    RecordDailyPnL pnl
    ExecuteMarketSell = True
    Exit Function
Fail:
    LogSignal MinuteKeyNow(), market, "", "", "", "", "ERROR", Err.Description
    DashboardError Err.Description
    ExecuteMarketSell = False
End Function

Private Function EstimateLastPrice(ByVal market As String) As Double
    Dim tickers As Collection
    On Error GoTo Fail
    Set tickers = GetTickers(market)
    If tickers.Count > 0 Then
        EstimateLastPrice = JsonGetDouble(CStr(tickers(1)), "trade_price")
        Exit Function
    End If
Fail:
    EstimateLastPrice = 0
End Function

Public Function MinuteKeyNow() As String
    MinuteKeyNow = Format$(SyncedNow(), "yyyy-mm-dd hh:nn")
End Function
