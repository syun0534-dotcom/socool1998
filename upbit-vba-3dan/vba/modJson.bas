Attribute VB_Name = "modJson"
Option Explicit
' Minimal JSON helpers for Upbit array/object payloads (no external VBA-JSON dependency).

Public Function JsonGetString(ByVal json As String, ByVal key As String, Optional ByVal defaultValue As String = "") As String
    Dim pat As String, p As Long, q As Long, startPos As Long
    pat = """" & key & """"
    p = InStr(1, json, pat, vbBinaryCompare)
    If p = 0 Then
        JsonGetString = defaultValue
        Exit Function
    End If
    p = InStr(p + Len(pat), json, ":")
    If p = 0 Then
        JsonGetString = defaultValue
        Exit Function
    End If
    startPos = p + 1
    Do While startPos <= Len(json) And Mid$(json, startPos, 1) Like "[ " & vbTab & vbCr & vbLf & "]"
        startPos = startPos + 1
    Loop
    If Mid$(json, startPos, 1) = """" Then
        q = startPos + 1
        Do While q <= Len(json)
            If Mid$(json, q, 1) = "\" Then
                q = q + 2
            ElseIf Mid$(json, q, 1) = """" Then
                JsonGetString = Mid$(json, startPos + 1, q - startPos - 1)
                Exit Function
            Else
                q = q + 1
            End If
        Loop
        JsonGetString = defaultValue
    ElseIf Mid$(json, startPos, 4) = "null" Then
        JsonGetString = defaultValue
    Else
        q = startPos
        Do While q <= Len(json)
            Dim c As String
            c = Mid$(json, q, 1)
            If c = "," Or c = "}" Or c = "]" Or c = " " Or c = vbCr Or c = vbLf Or c = vbTab Then Exit Do
            q = q + 1
        Loop
        JsonGetString = Trim$(Mid$(json, startPos, q - startPos))
    End If
End Function

Public Function JsonGetDouble(ByVal json As String, ByVal key As String, Optional ByVal defaultValue As Double = 0#) As Double
    Dim s As String
    s = JsonGetString(json, key, "")
    If Len(s) = 0 Then
        JsonGetDouble = defaultValue
    Else
        JsonGetDouble = CDbl(Val(Replace(s, ",", "")))
    End If
End Function

' Split top-level JSON array into object strings. Returns 1-based Collection of strings.
Public Function JsonArrayObjects(ByVal json As String) As Collection
    Dim col As New Collection
    Dim i As Long, depth As Long, inStrq As Boolean, esc As Boolean
    Dim startObj As Long
    Dim c As String
    json = Trim$(json)
    If Left$(json, 1) <> "[" Then
        Set JsonArrayObjects = col
        Exit Function
    End If
    For i = 2 To Len(json)
        c = Mid$(json, i, 1)
        If inStrq Then
            If esc Then
                esc = False
            ElseIf c = "\" Then
                esc = True
            ElseIf c = """" Then
                inStrq = False
            End If
        Else
            If c = """" Then
                inStrq = True
            ElseIf c = "{" Then
                If depth = 0 Then startObj = i
                depth = depth + 1
            ElseIf c = "}" Then
                depth = depth - 1
                If depth = 0 And startObj > 0 Then
                    col.Add Mid$(json, startObj, i - startObj + 1)
                    startObj = 0
                End If
            End If
        End If
    Next i
    Set JsonArrayObjects = col
End Function

Public Function JsonNestedArray(ByVal objJson As String, ByVal key As String) As String
    Dim pat As String, p As Long, i As Long, depth As Long, inStrq As Boolean, esc As Boolean
    Dim c As String, startArr As Long
    pat = """" & key & """"
    p = InStr(1, objJson, pat, vbBinaryCompare)
    If p = 0 Then
        JsonNestedArray = "[]"
        Exit Function
    End If
    p = InStr(p + Len(pat), objJson, "[")
    If p = 0 Then
        JsonNestedArray = "[]"
        Exit Function
    End If
    startArr = p
    depth = 0
    For i = p To Len(objJson)
        c = Mid$(objJson, i, 1)
        If inStrq Then
            If esc Then
                esc = False
            ElseIf c = "\" Then
                esc = True
            ElseIf c = """" Then
                inStrq = False
            End If
        Else
            If c = """" Then
                inStrq = True
            ElseIf c = "[" Then
                depth = depth + 1
            ElseIf c = "]" Then
                depth = depth - 1
                If depth = 0 Then
                    JsonNestedArray = Mid$(objJson, startArr, i - startArr + 1)
                    Exit Function
                End If
            End If
        End If
    Next i
    JsonNestedArray = "[]"
End Function
