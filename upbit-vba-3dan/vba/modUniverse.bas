Attribute VB_Name = "modUniverse"
Option Explicit

Private gUniverseCacheAt As Date
Private gUniverseMarkets As Collection

Public Sub RefreshUniverseNow()
    gUniverseCacheAt = 0
    LoadUniverse True
End Sub

Public Function LoadUniverse(Optional ByVal force As Boolean = False) As Collection
    Dim cfg As AppConfig
    cfg = EnsureConfig()
    If Not force Then
        If Not gUniverseMarkets Is Nothing Then
            If DateDiff("n", gUniverseCacheAt, Now) < cfg.UniverseCacheMinutes Then
                Set LoadUniverse = gUniverseMarkets
                Exit Function
            End If
        End If
    End If

    Dim markets As Collection, m As Variant
    Dim marketCodes As String, batch As String, n As Long
    Dim tickers As Collection, t As Variant
    Dim ws As Worksheet
    Dim row As Long
    Dim tradeVal As Double, market As String, nameKr As String, price As Double
    Dim kept As New Collection

    EnsureSheetHeaders
    Set ws = ThisWorkbook.Worksheets("Universe")
    ws.Range("A2:E" & ws.Rows.Count).ClearContents

    Set markets = GetMarketsKrw()
    marketCodes = ""
    n = 0
    row = 2

    ' Build name map then ticker in batches of ~80
    Dim nameMap As Object
    Set nameMap = CreateObject("Scripting.Dictionary")
    For Each m In markets
        market = JsonGetString(CStr(m), "market")
        nameKr = JsonGetString(CStr(m), "korean_name")
        nameMap(market) = nameKr
        If Len(marketCodes) > 0 Then marketCodes = marketCodes & ","
        marketCodes = marketCodes & market
        n = n + 1
        If n Mod 80 = 0 Or n = markets.Count Then
            Set tickers = GetTickers(marketCodes)
            For Each t In tickers
                market = JsonGetString(CStr(t), "market")
                tradeVal = JsonGetDouble(CStr(t), "acc_trade_price_24h")
                price = JsonGetDouble(CStr(t), "trade_price")
                If tradeVal >= cfg.MinTradeValue24h Then
                    ws.Cells(row, 1).Value = market
                    If nameMap.Exists(market) Then
                        ws.Cells(row, 2).Value = nameMap(market)
                    End If
                    ws.Cells(row, 3).Value = tradeVal
                    ws.Cells(row, 4).Value = price
                    ws.Cells(row, 5).Value = Now
                    kept.Add market
                    row = row + 1
                End If
            Next t
            marketCodes = ""
            Application.Wait Now + TimeSerial(0, 0, 1) ' soft rate-limit
        End If
    Next m

    Set gUniverseMarkets = kept
    gUniverseCacheAt = Now
    On Error Resume Next
    ThisWorkbook.Worksheets("Dashboard").Range("B12").Value = kept.Count
    On Error GoTo 0
    Set LoadUniverse = kept
End Function

Public Function UniverseMarkets() As Collection
    Set UniverseMarkets = LoadUniverse(False)
End Function
