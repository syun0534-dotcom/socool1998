Attribute VB_Name = "modTrigger1"
Option Explicit

' 1m trigger: after a local low, candle turns up (bullish body) near close.
' Evaluated only when second >= 57 (caller enforces).
Public Function Trigger1m(ByRef candles() As Candle, Optional ByVal bodyRatioMin As Double = 0.35) As Boolean
    Dim n As Long
    Dim cur As Candle, prev As Candle, prev2 As Candle
    Dim body As Double, rangeH As Double, ratio As Double
    Dim madeLow As Boolean

    If (Not Not candles) = 0 Then
        Trigger1m = False
        Exit Function
    End If
    n = UBound(candles) - LBound(candles) + 1
    If n < 4 Then
        Trigger1m = False
        Exit Function
    End If

    cur = candles(UBound(candles))
    prev = candles(UBound(candles) - 1)
    prev2 = candles(UBound(candles) - 2)

    ' Must be bullish (closing up)
    If cur.CloseP <= cur.OpenP Then
        Trigger1m = False
        Exit Function
    End If

    rangeH = cur.HighP - cur.LowP
    If rangeH <= 0 Then
        Trigger1m = False
        Exit Function
    End If
    body = cur.CloseP - cur.OpenP
    ratio = body / rangeH
    If ratio < bodyRatioMin Then
        Trigger1m = False
        Exit Function
    End If

    ' Local low then turn: prev or prev2 made a lower low, current rising
    madeLow = (prev.LowP <= prev2.LowP) Or (prev2.LowP <= candles(UBound(candles) - 3).LowP)
    If Not madeLow Then
        ' Allow bounce if current low is the recent trough
        If cur.LowP > prev.LowP And prev.LowP <= prev2.LowP Then
            madeLow = True
        End If
    End If

    If Not madeLow Then
        Trigger1m = False
        Exit Function
    End If

    ' Close above prior close / reclaim
    If cur.CloseP > prev.CloseP And cur.CloseP > prev.OpenP Then
        Trigger1m = True
    Else
        Trigger1m = False
    End If
End Function
