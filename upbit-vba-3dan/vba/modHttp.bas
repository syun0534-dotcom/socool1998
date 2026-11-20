Attribute VB_Name = "modHttp"
Option Explicit

Public Const UPBIT_API As String = "https://api.upbit.com"

Public Function HttpGet(ByVal url As String, Optional ByVal authHeader As String = "") As String
    Dim http As Object
    Set http = CreateObject("WinHttp.WinHttpRequest.5.1")
    http.Open "GET", url, False
    http.SetTimeouts 5000, 5000, 15000, 15000
    http.SetRequestHeader "Accept", "application/json"
    If Len(authHeader) > 0 Then http.SetRequestHeader "Authorization", authHeader
    http.Send
    If http.Status < 200 Or http.Status >= 300 Then
        Err.Raise vbObjectError + 800, "modHttp", "GET " & url & " -> " & http.Status & " " & http.ResponseText
    End If
    HttpGet = http.ResponseText
End Function

Public Function HttpPostForm(ByVal url As String, ByVal formBody As String, ByVal authHeader As String) As String
    Dim http As Object
    Set http = CreateObject("WinHttp.WinHttpRequest.5.1")
    http.Open "POST", url, False
    http.SetTimeouts 5000, 5000, 15000, 15000
    http.SetRequestHeader "Accept", "application/json"
    http.SetRequestHeader "Content-Type", "application/json"
    If Len(authHeader) > 0 Then http.SetRequestHeader "Authorization", authHeader
    http.Send formBody
    If http.Status < 200 Or http.Status >= 300 Then
        Err.Raise vbObjectError + 801, "modHttp", "POST " & url & " -> " & http.Status & " " & http.ResponseText
    End If
    HttpPostForm = http.ResponseText
End Function

Public Function HttpDelete(ByVal url As String, ByVal authHeader As String) As String
    Dim http As Object
    Set http = CreateObject("WinHttp.WinHttpRequest.5.1")
    http.Open "DELETE", url, False
    http.SetTimeouts 5000, 5000, 15000, 15000
    http.SetRequestHeader "Accept", "application/json"
    If Len(authHeader) > 0 Then http.SetRequestHeader "Authorization", authHeader
    http.Send
    If http.Status < 200 Or http.Status >= 300 Then
        Err.Raise vbObjectError + 802, "modHttp", "DELETE " & url & " -> " & http.Status & " " & http.ResponseText
    End If
    HttpDelete = http.ResponseText
End Function

Public Function UrlEncode(ByVal s As String) As String
    Dim i As Long, ch As String, code As Integer, out As String
    For i = 1 To Len(s)
        ch = Mid$(s, i, 1)
        code = Asc(ch)
        Select Case True
            Case (code >= 48 And code <= 57) Or (code >= 65 And code <= 90) Or (code >= 97 And code <= 122) Or ch = "-" Or ch = "_" Or ch = "." Or ch = "~"
                out = out & ch
            Case ch = " "
                out = out & "%20"
            Case Else
                out = out & "%" & Right$("0" & Hex$(code), 2)
        End Select
    Next i
    UrlEncode = out
End Function
