Attribute VB_Name = "modTrend15"
Option Explicit

Public Enum TrendDir
    TrendDown = -1
    TrendSide = 0
    TrendUp = 1
End Enum

' Recent 3~5 closed 15m candles: HH/HL => Up, LH/LL => Down, else Side.
' Uses last completed candles (exclude forming last bar when possible).
Public Function DetectTrend15(ByRef candles() As Candle) As TrendDir
    Dim n As Long, useN As Long, startIdx As Long, i As Long
    Dim hh As Boolean, hl As Boolean, lh As Boolean, ll As Boolean
    Dim highs() As Double, lows() As Double

    If (Not Not candles) = 0 Then
        DetectTrend15 = TrendSide
        Exit Function
    End If
    n = UBound(candles) - LBound(candles) + 1
    If n < 4 Then
        DetectTrend15 = TrendSide
        Exit Function
    End If

    ' Prefer excluding the last (possibly forming) candle
    useN = 4
    If n >= 6 Then useN = 5
    startIdx = UBound(candles) - useN ' end exclusive of last: use candles(startIdx .. UBound-1)
    If startIdx < LBound(candles) Then startIdx = LBound(candles)

    ReDim highs(0 To useN - 2)
    ReDim lows(0 To useN - 2)
    Dim k As Long
    k = 0
    For i = startIdx To UBound(candles) - 1
        If k <= UBound(highs) Then
            highs(k) = candles(i).HighP
            lows(k) = candles(i).LowP
            k = k + 1
        End If
    Next i
    If k < 3 Then
        DetectTrend15 = TrendSide
        Exit Function
    End If

    hh = True: hl = True: lh = True: ll = True
    For i = 1 To k - 1
        If highs(i) <= highs(i - 1) Then hh = False
        If lows(i) <= lows(i - 1) Then hl = False
        If highs(i) >= highs(i - 1) Then lh = False
        If lows(i) >= lows(i - 1) Then ll = False
    Next i

    If hh And hl Then
        DetectTrend15 = TrendUp
    ElseIf lh And ll Then
        DetectTrend15 = TrendDown
    Else
        ' Soft up: close rising over window
        If candles(UBound(candles) - 1).CloseP > candles(startIdx).CloseP And _
           candles(UBound(candles) - 1).CloseP > candles(UBound(candles) - 1).OpenP Then
            DetectTrend15 = TrendUp
        Else
            DetectTrend15 = TrendSide
        End If
    End If
End Function

Public Function TrendToText(ByVal t As TrendDir) As String
    Select Case t
        Case TrendUp: TrendToText = "Up"
        Case TrendDown: TrendToText = "Down"
        Case Else: TrendToText = "Side"
    End Select
End Function
