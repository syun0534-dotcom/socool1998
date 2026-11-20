Attribute VB_Name = "modUpbitAuth"
Option Explicit

Private Function AuthHeader(Optional ByVal queryString As String = "") As String
    Dim cfg As AppConfig
    cfg = EnsureConfig()
    AuthHeader = "Bearer " & BuildJwtHs256(cfg.AccessKey, cfg.SecretKey, queryString)
End Function

Private Function BuildQuery(ParamArray pairs() As Variant) As String
    Dim i As Long, out As String
    For i = LBound(pairs) To UBound(pairs) Step 2
        If i + 1 <= UBound(pairs) Then
            If Len(out) > 0 Then out = out & "&"
            out = out & CStr(pairs(i)) & "=" & UrlEncode(CStr(pairs(i + 1)))
        End If
    Next i
    BuildQuery = out
End Function

Public Function GetAccounts() As Collection
    Dim raw As String
    raw = HttpGet(UPBIT_API & "/v1/accounts", AuthHeader())
    Set GetAccounts = JsonArrayObjects(raw)
End Function

Public Function GetKrwBalance() As Double
    Dim accs As Collection, a As Variant
    Set accs = GetAccounts()
    For Each a In accs
        If JsonGetString(CStr(a), "currency") = "KRW" Then
            GetKrwBalance = JsonGetDouble(CStr(a), "balance")
            Exit Function
        End If
    Next a
    GetKrwBalance = 0
End Function

' Market buy with KRW amount (ord_type=price)
Public Function PlaceMarketBuyKrw(ByVal market As String, ByVal krwAmount As Double) As String
    Dim q As String, body As String, jwtQ As String
    Dim amt As String
    amt = Format$(krwAmount, "0")
    ' query_hash uses the same parameter string as request body fields for Upbit
    jwtQ = "market=" & UrlEncode(market) & "&side=bid&ord_type=price&price=" & UrlEncode(amt)
    body = "{""market"":""" & market & """,""side"":""bid"",""ord_type"":""price"",""price"":""" & amt & """}"
    PlaceMarketBuyKrw = HttpPostForm(UPBIT_API & "/v1/orders", body, AuthHeader(jwtQ))
End Function

' Market sell with volume (ord_type=market)
Public Function PlaceMarketSellQty(ByVal market As String, ByVal volume As Double) As String
    Dim vol As String, jwtQ As String, body As String
    vol = Trim$(Str$(volume))
    vol = Replace(vol, ",", ".")
    jwtQ = "market=" & UrlEncode(market) & "&side=ask&ord_type=market&volume=" & UrlEncode(vol)
    body = "{""market"":""" & market & """,""side"":""ask"",""ord_type"":""market"",""volume"":""" & vol & """}"
    PlaceMarketSellQty = HttpPostForm(UPBIT_API & "/v1/orders", body, AuthHeader(jwtQ))
End Function

Public Function GetOrder(ByVal uuid As String) As String
    Dim q As String
    q = "uuid=" & UrlEncode(uuid)
    GetOrder = HttpGet(UPBIT_API & "/v1/order?" & q, AuthHeader(q))
End Function
