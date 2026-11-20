Attribute VB_Name = "modZone5"
Option Explicit

' 5m pullback zone: prior resistance flipped to support, price near that zone.
' Returns True when last price is within zone band after a pullback in an uptrend context.
Public Function InPullbackZone5(ByRef candles() As Candle, Optional ByVal nearPct As Double = 0.4) As Boolean
    Dim n As Long, i As Long
    Dim swingHigh As Double, swingLow As Double, zoneLow As Double, zoneHigh As Double
    Dim lastClose As Double, lastLow As Double
    Dim peaked As Boolean

    If (Not Not candles) = 0 Then
        InPullbackZone5 = False
        Exit Function
    End If
    n = UBound(candles) - LBound(candles) + 1
    If n < 8 Then
        InPullbackZone5 = False
        Exit Function
    End If

    ' Find recent swing high among older bars (exclude last 2)
    swingHigh = 0
    For i = LBound(candles) To UBound(candles) - 3
        If candles(i).HighP > swingHigh Then swingHigh = candles(i).HighP
    Next i
    If swingHigh <= 0 Then
        InPullbackZone5 = False
        Exit Function
    End If

    ' Confirm price made a higher push then pulled back
    peaked = False
    For i = LBound(candles) + 2 To UBound(candles) - 2
        If candles(i).HighP >= swingHigh * 0.998 Then peaked = True
    Next i

    lastClose = candles(UBound(candles)).CloseP
    lastLow = candles(UBound(candles)).LowP

    ' Resistance->support band around prior swing high * pullback depth
    ' Look for local support: recent lows after the swing
    swingLow = candles(UBound(candles) - 1).LowP
    For i = UBound(candles) - 4 To UBound(candles)
        If i >= LBound(candles) Then
            If candles(i).LowP < swingLow Then swingLow = candles(i).LowP
        End If
    Next i

    ' Zone: between recent pullback low and a fraction below prior resistance
    zoneLow = swingLow
    zoneHigh = swingHigh
    ' Prefer the mid-lower band as "눌림자리"
    Dim band As Double
    band = swingHigh * (nearPct / 100#)
    If band <= 0 Then band = swingHigh * 0.004

    ' In zone if price is below recent swing high (pulled back) and holding above swingLow - band
    If peaked And lastClose < swingHigh And lastLow >= (swingLow - band) Then
        ' Also require not breaking structure badly
        If lastClose >= swingLow * 0.997 Then
            InPullbackZone5 = True
            Exit Function
        End If
    End If

    ' Alternate: last few candles consolidating near prior resistance-turned-support
    Dim nearSupport As Boolean
    nearSupport = Abs(lastClose - swingHigh) / swingHigh * 100# <= nearPct * 2# And lastClose <= swingHigh
    If peaked And nearSupport And lastClose > candles(UBound(candles) - 2).LowP Then
        InPullbackZone5 = True
    Else
        InPullbackZone5 = False
    End If
End Function
