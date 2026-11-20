Attribute VB_Name = "modConfig"
Option Explicit

Public Type AppConfig
    AccessKey As String
    SecretKey As String
    OrderAmountKrw As Double
    StopLossPct As Double
    TakeProfitPct As Double
    DailyLossLimitPct As Double
    MaxPositions As Long
    MinTradeValue24h As Double
    PaperTrading As Boolean
    StopTrading As Boolean
    BodyRatioMin As Double
    AskBidRatioMax As Double
    HogaTopN As Long
    ConsecutiveLossCooldown As Long
    CooldownMinutes As Long
    UniverseCacheMinutes As Long
    FeeRate As Double
    TrailActivatePct As Double
    TrailDistancePct As Double
    StartingEquityKrw As Double
End Type

Public gConfig As AppConfig
Public gConfigLoaded As Boolean

Private Function SheetExists(ByVal name As String) As Boolean
    Dim ws As Worksheet
    On Error Resume Next
    Set ws = ThisWorkbook.Worksheets(name)
    SheetExists = Not ws Is Nothing
    On Error GoTo 0
End Function

Private Function ReadKeyValue(ByVal key As String, ByVal defaultValue As String) As String
    Dim ws As Worksheet
    Dim lastRow As Long, r As Long
    If Not SheetExists("Config") Then
        ReadKeyValue = defaultValue
        Exit Function
    End If
    Set ws = ThisWorkbook.Worksheets("Config")
    lastRow = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
    For r = 1 To lastRow
        If StrComp(Trim$(CStr(ws.Cells(r, 1).Value)), key, vbTextCompare) = 0 Then
            If IsEmpty(ws.Cells(r, 2).Value) Or Len(Trim$(CStr(ws.Cells(r, 2).Value))) = 0 Then
                ReadKeyValue = defaultValue
            Else
                ReadKeyValue = Trim$(CStr(ws.Cells(r, 2).Value))
            End If
            Exit Function
        End If
    Next r
    ReadKeyValue = defaultValue
End Function

Private Function ToBool(ByVal s As String, ByVal defaultValue As Boolean) As Boolean
    s = UCase$(Trim$(s))
    If s = "TRUE" Or s = "1" Or s = "YES" Or s = "Y" Or s = "ON" Then
        ToBool = True
    ElseIf s = "FALSE" Or s = "0" Or s = "NO" Or s = "N" Or s = "OFF" Then
        ToBool = False
    Else
        ToBool = defaultValue
    End If
End Function

Public Sub LoadConfig()
    gConfig.AccessKey = ReadKeyValue("AccessKey", "YOUR_ACCESS_KEY")
    gConfig.SecretKey = ReadKeyValue("SecretKey", "YOUR_SECRET_KEY")
    gConfig.OrderAmountKrw = CDbl(Val(ReadKeyValue("OrderAmountKrw", "50000")))
    gConfig.StopLossPct = CDbl(Val(ReadKeyValue("StopLossPct", "0.6")))
    gConfig.TakeProfitPct = CDbl(Val(ReadKeyValue("TakeProfitPct", "1.0")))
    gConfig.DailyLossLimitPct = CDbl(Val(ReadKeyValue("DailyLossLimitPct", "3.0")))
    gConfig.MaxPositions = CLng(Val(ReadKeyValue("MaxPositions", "3")))
    gConfig.MinTradeValue24h = CDbl(Val(ReadKeyValue("MinTradeValue24h", "5000000000")))
    gConfig.PaperTrading = ToBool(ReadKeyValue("PaperTrading", "FALSE"), False)
    gConfig.StopTrading = ToBool(ReadKeyValue("StopTrading", "FALSE"), False)
    gConfig.BodyRatioMin = CDbl(Val(ReadKeyValue("BodyRatioMin", "0.35")))
    gConfig.AskBidRatioMax = CDbl(Val(ReadKeyValue("AskBidRatioMax", "1.8")))
    gConfig.HogaTopN = CLng(Val(ReadKeyValue("HogaTopN", "5")))
    gConfig.ConsecutiveLossCooldown = CLng(Val(ReadKeyValue("ConsecutiveLossCooldown", "3")))
    gConfig.CooldownMinutes = CLng(Val(ReadKeyValue("CooldownMinutes", "15")))
    gConfig.UniverseCacheMinutes = CLng(Val(ReadKeyValue("UniverseCacheMinutes", "3")))
    gConfig.FeeRate = CDbl(Val(ReadKeyValue("FeeRate", "0.0005")))
    gConfig.TrailActivatePct = CDbl(Val(ReadKeyValue("TrailActivatePct", "0.5")))
    gConfig.TrailDistancePct = CDbl(Val(ReadKeyValue("TrailDistancePct", "0.3")))
    gConfig.StartingEquityKrw = CDbl(Val(ReadKeyValue("StartingEquityKrw", "1000000")))
    gConfigLoaded = True
End Sub

Public Function EnsureConfig() As AppConfig
    If Not gConfigLoaded Then LoadConfig
    EnsureConfig = gConfig
End Function

Public Sub SetConfigValue(ByVal key As String, ByVal value As String)
    Dim ws As Worksheet
    Dim lastRow As Long, r As Long
    Set ws = ThisWorkbook.Worksheets("Config")
    lastRow = ws.Cells(ws.Rows.Count, 1).End(xlUp).Row
    For r = 1 To lastRow
        If StrComp(Trim$(CStr(ws.Cells(r, 1).Value)), key, vbTextCompare) = 0 Then
            ws.Cells(r, 2).Value = value
            gConfigLoaded = False
            Exit Sub
        End If
    Next r
    ws.Cells(lastRow + 1, 1).Value = key
    ws.Cells(lastRow + 1, 2).Value = value
    gConfigLoaded = False
End Sub

Public Sub KillSwitchOn()
    SetConfigValue "StopTrading", "TRUE"
    LoadConfig
    On Error Resume Next
    ThisWorkbook.Worksheets("Dashboard").Range("B1").Value = "Stopped"
    ThisWorkbook.Worksheets("Dashboard").Range("B9").Value = "TRUE"
    On Error GoTo 0
    StopTradingSafe
End Sub

Public Sub KillSwitchOff()
    SetConfigValue "StopTrading", "FALSE"
    LoadConfig
End Sub

Public Sub EnsureSheetHeaders()
    EnsureHeaders "Universe", Array("Market", "KoreanName", "TradeValue24h", "LastPrice", "UpdatedAt")
    EnsureHeaders "Signals", Array("Timestamp", "MinuteKey", "Market", "Trend15", "Zone5", "Trigger1", "HogaOk", "Result", "Detail")
    EnsureHeaders "Positions", Array("Market", "Qty", "EntryPrice", "StopPrice", "TakePrice", "HighestSinceEntry", "Status", "OpenedAt", "Uuid")
    EnsureHeaders "Trades", Array("Timestamp", "Side", "Market", "Qty", "Price", "AmountKrw", "Fee", "Uuid", "Reason", "PnLKrw")
End Sub

Private Sub EnsureHeaders(ByVal sheetName As String, ByVal headers As Variant)
    Dim ws As Worksheet
    Dim i As Long
    On Error Resume Next
    Set ws = ThisWorkbook.Worksheets(sheetName)
    On Error GoTo 0
    If ws Is Nothing Then
        Set ws = ThisWorkbook.Worksheets.Add(After:=ThisWorkbook.Worksheets(ThisWorkbook.Worksheets.Count))
        ws.Name = sheetName
    End If
    For i = LBound(headers) To UBound(headers)
        If Len(Trim$(CStr(ws.Cells(1, i - LBound(headers) + 1).Value))) = 0 Then
            ws.Cells(1, i - LBound(headers) + 1).Value = headers(i)
        End If
    Next i
End Sub

Public Sub InitConfigSheetIfEmpty()
    Dim ws As Worksheet
    On Error Resume Next
    Set ws = ThisWorkbook.Worksheets("Config")
    On Error GoTo 0
    If ws Is Nothing Then
        Set ws = ThisWorkbook.Worksheets.Add(Before:=ThisWorkbook.Worksheets(1))
        ws.Name = "Config"
    End If
    If Len(Trim$(CStr(ws.Range("A1").Value))) > 0 Then Exit Sub
    Dim keys As Variant, vals As Variant, i As Long
    keys = Array("AccessKey", "SecretKey", "OrderAmountKrw", "StopLossPct", "TakeProfitPct", _
                 "DailyLossLimitPct", "MaxPositions", "MinTradeValue24h", "PaperTrading", "StopTrading", _
                 "BodyRatioMin", "AskBidRatioMax", "HogaTopN", "ConsecutiveLossCooldown", "CooldownMinutes", _
                 "UniverseCacheMinutes", "FeeRate", "TrailActivatePct", "TrailDistancePct", "StartingEquityKrw")
    vals = Array("YOUR_ACCESS_KEY", "YOUR_SECRET_KEY", "50000", "0.6", "1.0", _
                 "3.0", "3", "5000000000", "FALSE", "FALSE", _
                 "0.35", "1.8", "5", "3", "15", _
                 "3", "0.0005", "0.5", "0.3", "1000000")
    For i = LBound(keys) To UBound(keys)
        ws.Cells(i - LBound(keys) + 1, 1).Value = keys(i)
        ws.Cells(i - LBound(keys) + 1, 2).Value = vals(i)
    Next i
    ws.Columns(1).ColumnWidth = 28
    ws.Columns(2).ColumnWidth = 22
End Sub
