Attribute VB_Name = "modUpbitPublic"
Option Explicit

Public Type Candle
    Market As String
    Ts As Date
    OpenP As Double
    HighP As Double
    LowP As Double
    CloseP As Double
    Volume As Double
End Type

Public Function GetMarketsKrw() As Collection
    Dim raw As String, objs As Collection, o As Variant
    Dim col As New Collection
    raw = HttpGet(UPBIT_API & "/v1/market/all?isDetails=false")
    Set objs = JsonArrayObjects(raw)
    For Each o In objs
        If Left$(JsonGetString(CStr(o), "market"), 4) = "KRW-" Then
            col.Add CStr(o)
        End If
    Next o
    Set GetMarketsKrw = col
End Function

Public Function GetTickers(ByVal marketsCsv As String) As Collection
    Dim raw As String
    raw = HttpGet(UPBIT_API & "/v1/ticker?markets=" & UrlEncode(marketsCsv))
    Set GetTickers = JsonArrayObjects(raw)
End Function

' unit: minutes|days  — for minutes use "1","3","5","15","60","240"
Public Function GetCandlesMinutes(ByVal market As String, ByVal unit As Long, Optional ByVal count As Long = 50) As Candle()
    Dim raw As String, objs As Collection, o As Variant
    Dim arr() As Candle, i As Long, n As Long
    Dim url As String
    url = UPBIT_API & "/v1/candles/minutes/" & CStr(unit) & "?market=" & UrlEncode(market) & "&count=" & CStr(count)
    raw = HttpGet(url)
    Set objs = JsonArrayObjects(raw)
    n = objs.Count
    If n = 0 Then
        Erase arr
        GetCandlesMinutes = arr
        Exit Function
    End If
    ReDim arr(0 To n - 1)
    i = 0
    For Each o In objs
        arr(i) = ParseCandle(CStr(o))
        i = i + 1
    Next o
    ' Upbit returns newest first; reverse to oldest->newest for strategy math
    GetCandlesMinutes = ReverseCandles(arr)
End Function

Private Function ParseCandle(ByVal json As String) As Candle
    Dim c As Candle
    Dim ts As String
    c.Market = JsonGetString(json, "market")
    ts = JsonGetString(json, "candle_date_time_kst")
    If Len(ts) = 0 Then ts = JsonGetString(json, "candle_date_time_utc")
    c.Ts = ParseUpbitTime(ts)
    c.OpenP = JsonGetDouble(json, "opening_price")
    c.HighP = JsonGetDouble(json, "high_price")
    c.LowP = JsonGetDouble(json, "low_price")
    c.CloseP = JsonGetDouble(json, "trade_price")
    c.Volume = JsonGetDouble(json, "candle_acc_trade_volume")
    ParseCandle = c
End Function

Public Function ParseUpbitTime(ByVal s As String) As Date
    ' 2024-01-01T12:34:56 or with Z
    Dim t As String
    t = Replace(Replace(s, "T", " "), "Z", "")
    If Len(t) >= 19 Then
        ParseUpbitTime = CDate(Left$(t, 19))
    ElseIf Len(t) >= 16 Then
        ParseUpbitTime = CDate(Left$(t, 16))
    Else
        ParseUpbitTime = Now
    End If
End Function

Private Function ReverseCandles(ByRef src() As Candle) As Candle()
    Dim n As Long, i As Long, out() As Candle
    If (Not Not src) = 0 Then
        ReverseCandles = src
        Exit Function
    End If
    n = UBound(src) - LBound(src) + 1
    If n <= 0 Then
        ReverseCandles = src
        Exit Function
    End If
    ReDim out(0 To n - 1)
    For i = 0 To n - 1
        out(i) = src(UBound(src) - i)
    Next i
    ReverseCandles = out
End Function

Public Function GetServerTimeKst() As Date
    ' Use BTC ticker timestamp as proxy for server clock
    Dim raw As String, objs As Collection
    Dim tsMs As Double
    On Error GoTo Fallback
    raw = HttpGet(UPBIT_API & "/v1/ticker?markets=KRW-BTC")
    Set objs = JsonArrayObjects(raw)
    If objs.Count > 0 Then
        tsMs = JsonGetDouble(CStr(objs(1)), "timestamp")
        If tsMs > 0 Then
            ' Unix ms -> UTC then approximate KST (+9h). Excel epoch 1970-01-01.
            GetServerTimeKst = DateAdd("s", CLng(tsMs / 1000#), DateSerial(1970, 1, 1)) + TimeSerial(9, 0, 0)
            Exit Function
        End If
    End If
Fallback:
    GetServerTimeKst = Now
End Function
