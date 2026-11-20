Attribute VB_Name = "modHoga"
Option Explicit

' Skip long entry when ask wall (top N) is too heavy vs bids.
Public Function OrderbookAllowsLong(ByVal market As String, Optional ByVal topN As Long = 5, _
                                    Optional ByVal askBidRatioMax As Double = 1.8) As Boolean
    Dim askSum As Double, bidSum As Double, ratio As Double
    On Error GoTo Fail
    If Not GetOrderbookTopSums(market, topN, askSum, bidSum) Then
        OrderbookAllowsLong = False
        Exit Function
    End If
    If bidSum <= 0 Then
        OrderbookAllowsLong = False
        Exit Function
    End If
    ratio = askSum / bidSum
    OrderbookAllowsLong = (ratio <= askBidRatioMax)
    Exit Function
Fail:
    OrderbookAllowsLong = False
End Function

' Avoid storing UDTs in Collection (VBA limitation).
Public Function GetOrderbookTopSums(ByVal market As String, ByVal topN As Long, _
                                    ByRef askSum As Double, ByRef bidSum As Double) As Boolean
    Dim raw As String, objs As Collection, first As String
    Dim units As String, uObjs As Collection, u As Variant
    Dim i As Long, n As Long
    askSum = 0
    bidSum = 0
    raw = HttpGet(UPBIT_API & "/v1/orderbook?markets=" & UrlEncode(market))
    Set objs = JsonArrayObjects(raw)
    If objs.Count = 0 Then
        GetOrderbookTopSums = False
        Exit Function
    End If
    first = CStr(objs(1))
    units = JsonNestedArray(first, "orderbook_units")
    Set uObjs = JsonArrayObjects(units)
    n = uObjs.Count
    If n = 0 Then
        GetOrderbookTopSums = False
        Exit Function
    End If
    If topN < 1 Then topN = 5
    If topN > n Then topN = n
    i = 0
    For Each u In uObjs
        i = i + 1
        If i > topN Then Exit For
        askSum = askSum + JsonGetDouble(CStr(u), "ask_size")
        bidSum = bidSum + JsonGetDouble(CStr(u), "bid_size")
    Next u
    GetOrderbookTopSums = True
End Function
