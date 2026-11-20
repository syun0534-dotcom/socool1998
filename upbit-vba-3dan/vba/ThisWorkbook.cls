VERSION 1.0 CLASS
BEGIN
  MultiUse = -1  'True
END
Attribute VB_Name = "ThisWorkbook"
Attribute VB_GlobalNameSpace = False
Attribute VB_Creatable = False
Attribute VB_PredeclaredId = True
Attribute VB_Exposed = True
Option Explicit

' NOTE: Do NOT import this as a separate class module.
' Open VBA editor → ThisWorkbook → paste the code below (from Option Explicit).

Private Sub Workbook_Open()
    On Error Resume Next
    SetupWorkbookSheets
    LoadConfig
    ThisWorkbook.Worksheets("Dashboard").Range("B1").Value = "Idle"
    On Error GoTo 0
End Sub

Private Sub Workbook_BeforeClose(Cancel As Boolean)
    On Error Resume Next
    StopTradingSafe
    On Error GoTo 0
End Sub
