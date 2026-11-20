Attribute VB_Name = "modTimer"
Option Explicit

Private gTimerArmed As Boolean
Private gNextRun As Date
Private gOffsetSeconds As Double ' server - local
Private Const TIMER_PROC As String = "TradingTick"

Public Function SyncedNow() As Date
    SyncedNow = DateAdd("s", gOffsetSeconds, Now)
End Function

Public Sub SyncServerTime()
    Dim serverT As Date, localT As Date
    On Error Resume Next
    localT = Now
    serverT = GetServerTimeKst()
    If Err.Number = 0 Then
        gOffsetSeconds = DateDiff("s", localT, serverT)
    End If
    On Error GoTo 0
    On Error Resume Next
    ThisWorkbook.Worksheets("Dashboard").Range("B2").Value = SyncedNow()
    On Error GoTo 0
End Sub

Public Sub StartTrading()
    Dim cfg As AppConfig
    SetupWorkbookSheets
    LoadConfig
    cfg = EnsureConfig()
    If cfg.StopTrading Then
        MsgBox "StopTrading=TRUE (킬스위치). Config에서 FALSE로 바꾼 뒤 다시 시작하세요.", vbExclamation
        Exit Sub
    End If
    If cfg.AccessKey = "YOUR_ACCESS_KEY" Or cfg.SecretKey = "YOUR_SECRET_KEY" Then
        If Not cfg.PaperTrading Then
            MsgBox "API 키가 플레이스홀더입니다. PaperTrading=TRUE로 테스트하거나 실제 키를 입력하세요.", vbExclamation
            Exit Sub
        End If
    End If

    SyncServerTime
    ResetDailyIfNeeded
    gTimerArmed = True
    On Error Resume Next
    ThisWorkbook.Worksheets("Dashboard").Range("B1").Value = "Running"
    On Error GoTo 0
    ScheduleNextTick True
End Sub

Public Sub StopTradingSafe()
    gTimerArmed = False
    On Error Resume Next
    If gNextRun <> 0 Then Application.OnTime gNextRun, TIMER_PROC, , False
    On Error GoTo 0
    gNextRun = 0
    On Error Resume Next
    ThisWorkbook.Worksheets("Dashboard").Range("B1").Value = "Stopped"
    On Error GoTo 0
End Sub

Public Sub TradingTick()
    Dim cfg As AppConfig
    Dim sec As Long
    On Error GoTo Fail

    If Not gTimerArmed Then Exit Sub
    LoadConfig
    cfg = EnsureConfig()
    If cfg.StopTrading Then
        StopTradingSafe
        Exit Sub
    End If

    SyncServerTime
    ManagePositionsNow

    sec = Second(SyncedNow())
    If sec >= 57 Then
        EvaluateEntriesAtCloseGate
    End If

    ScheduleNextTick False
    Exit Sub
Fail:
    DashboardError Err.Description
    ScheduleNextTick False
End Sub

Private Sub ScheduleNextTick(ByVal immediatePrep As Boolean)
    Dim sn As Date
    Dim target As Date
    Dim sec As Long, waitSec As Long

    If Not gTimerArmed Then Exit Sub

    ' Cancel previous
    On Error Resume Next
    If gNextRun <> 0 Then Application.OnTime gNextRun, TIMER_PROC, , False
    On Error GoTo 0

    sn = SyncedNow()
    sec = Second(sn)

    If sec < 57 Then
        ' Aim for :57 of current minute
        waitSec = 57 - sec
        If waitSec < 1 Then waitSec = 1
        ' Also wake every ~15s before :57 for position mgmt
        If waitSec > 15 And sec < 42 Then waitSec = 15
    Else
        ' After eval window: next minute :10 for position check, then :57
        If sec < 10 Then
            waitSec = 10 - sec
        Else
            waitSec = 60 - sec + 10
        End If
        If waitSec < 1 Then waitSec = 1
    End If

    ' OnTime uses local Application clock; convert synced wait to local
    target = DateAdd("s", waitSec, Now)
    gNextRun = target
    On Error Resume Next
    ThisWorkbook.Worksheets("Dashboard").Range("B3").Value = DateAdd("s", waitSec, sn)
    On Error GoTo 0
    Application.OnTime gNextRun, TIMER_PROC
End Sub
