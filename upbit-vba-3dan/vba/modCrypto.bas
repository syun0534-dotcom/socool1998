Attribute VB_Name = "modCrypto"
Option Explicit
'==============================================================================
' Windows CryptoAPI helpers for Upbit JWT (HS256) + query_hash (SHA512).
' HMAC-SHA256 is built manually from SHA-256 hashes (avoids HMAC_INFO alignment).
' No external COM DLL. Windows Excel VBA7 recommended (64-bit OK).
'==============================================================================

#If VBA7 Then
    Private Declare PtrSafe Function CryptAcquireContext Lib "advapi32.dll" Alias "CryptAcquireContextA" ( _
        ByRef phProv As LongPtr, ByVal pszContainer As String, ByVal pszProvider As String, _
        ByVal dwProvType As Long, ByVal dwFlags As Long) As Long
    Private Declare PtrSafe Function CryptReleaseContext Lib "advapi32.dll" (ByVal hProv As LongPtr, ByVal dwFlags As Long) As Long
    Private Declare PtrSafe Function CryptCreateHash Lib "advapi32.dll" (ByVal hProv As LongPtr, ByVal Algid As Long, _
        ByVal hKey As LongPtr, ByVal dwFlags As Long, ByRef phHash As LongPtr) As Long
    Private Declare PtrSafe Function CryptHashData Lib "advapi32.dll" (ByVal hHash As LongPtr, ByRef pbData As Byte, _
        ByVal dwDataLen As Long, ByVal dwFlags As Long) As Long
    Private Declare PtrSafe Function CryptGetHashParam Lib "advapi32.dll" (ByVal hHash As LongPtr, ByVal dwParam As Long, _
        ByRef pbData As Byte, ByRef pdwDataLen As Long, ByVal dwFlags As Long) As Long
    Private Declare PtrSafe Function CryptDestroyHash Lib "advapi32.dll" (ByVal hHash As LongPtr) As Long
    Private Declare PtrSafe Function CoCreateGuid Lib "ole32.dll" (ByRef pGuid As Any) As Long
#Else
    Private Declare Function CryptAcquireContext Lib "advapi32.dll" Alias "CryptAcquireContextA" ( _
        ByRef phProv As Long, ByVal pszContainer As String, ByVal pszProvider As String, _
        ByVal dwProvType As Long, ByVal dwFlags As Long) As Long
    Private Declare Function CryptReleaseContext Lib "advapi32.dll" (ByVal hProv As Long, ByVal dwFlags As Long) As Long
    Private Declare Function CryptCreateHash Lib "advapi32.dll" (ByVal hProv As Long, ByVal Algid As Long, _
        ByVal hKey As Long, ByVal dwFlags As Long, ByRef phHash As Long) As Long
    Private Declare Function CryptHashData Lib "advapi32.dll" (ByVal hHash As Long, ByRef pbData As Byte, _
        ByVal dwDataLen As Long, ByVal dwFlags As Long) As Long
    Private Declare Function CryptGetHashParam Lib "advapi32.dll" (ByVal hHash As Long, ByVal dwParam As Long, _
        ByRef pbData As Byte, ByRef pdwDataLen As Long, ByVal dwFlags As Long) As Long
    Private Declare Function CryptDestroyHash Lib "advapi32.dll" (ByVal hHash As Long) As Long
    Private Declare Function CoCreateGuid Lib "ole32.dll" (ByRef pGuid As Any) As Long
#End If

Private Const PROV_RSA_AES As Long = 24
Private Const CRYPT_VERIFYCONTEXT As Long = &HF0000000
Private Const CALG_SHA_256 As Long = 32780
Private Const CALG_SHA_512 As Long = 32782
Private Const HP_HASHVAL As Long = 2
Private Const SHA256_BLOCK As Long = 64

Public Function BytesToHex(ByRef data() As Byte) As String
    Dim i As Long, s As String
    For i = LBound(data) To UBound(data)
        s = s & Right$("0" & Hex$(data(i)), 2)
    Next i
    BytesToHex = LCase$(s)
End Function

Public Function StringToUtf8Bytes(ByVal s As String) As Byte()
    Dim stream As Object
    Dim out() As Byte
    Dim total As Long
    Dim emptyArr() As Byte
    If Len(s) = 0 Then
        StringToUtf8Bytes = emptyArr
        Exit Function
    End If
    Set stream = CreateObject("ADODB.Stream")
    stream.Type = 2
    stream.Charset = "utf-8"
    stream.Open
    stream.WriteText s
    stream.Position = 0
    stream.Type = 1
    total = CLng(stream.Size)
    If total >= 3 Then
        Dim bom() As Byte
        bom = stream.Read(3)
        If bom(0) = 239 And bom(1) = 187 And bom(2) = 191 Then
            If total > 3 Then
                out = stream.Read
            Else
                StringToUtf8Bytes = emptyArr
                stream.Close
                Exit Function
            End If
        Else
            stream.Position = 0
            out = stream.Read
        End If
    Else
        out = stream.Read
    End If
    stream.Close
    StringToUtf8Bytes = out
End Function

Public Function Base64UrlEncodeBytes(ByRef data() As Byte) As String
    Dim xml As Object, node As Object
    Dim b64 As String
    If (Not Not data) = 0 Then
        Base64UrlEncodeBytes = ""
        Exit Function
    End If
    Set xml = CreateObject("MSXML2.DOMDocument.6.0")
    Set node = xml.createElement("b64")
    node.DataType = "bin.base64"
    node.nodeTypedValue = data
    b64 = Replace(Replace(Replace(node.Text, vbLf, ""), vbCr, ""), " ", "")
    b64 = Replace(b64, "+", "-")
    b64 = Replace(b64, "/", "_")
    Do While Right$(b64, 1) = "="
        b64 = Left$(b64, Len(b64) - 1)
    Loop
    Base64UrlEncodeBytes = b64
End Function

Public Function Base64UrlEncodeString(ByVal s As String) As String
    Base64UrlEncodeString = Base64UrlEncodeBytes(StringToUtf8Bytes(s))
End Function

Public Function Sha512Hex(ByVal s As String) As String
    Sha512Hex = BytesToHex(HashBytes(StringToUtf8Bytes(s), CALG_SHA_512, 64))
End Function

Public Function HmacSha256Bytes(ByVal key As String, ByVal message As String) As Byte()
    HmacSha256Bytes = HmacSha256Raw(StringToUtf8Bytes(key), StringToUtf8Bytes(message))
End Function

Public Function NewUuidV4() As String
    Dim g(0 To 15) As Byte
    Dim i As Long
    If CoCreateGuid(g(0)) <> 0 Then
        Randomize
        For i = 0 To 15
            g(i) = Int(Rnd() * 256)
        Next i
    End If
    g(6) = (g(6) And &HF) Or &H40
    g(8) = (g(8) And &H3F) Or &H80
    NewUuidV4 = LCase$( _
        Right$("0" & Hex$(g(0)), 2) & Right$("0" & Hex$(g(1)), 2) & _
        Right$("0" & Hex$(g(2)), 2) & Right$("0" & Hex$(g(3)), 2) & "-" & _
        Right$("0" & Hex$(g(4)), 2) & Right$("0" & Hex$(g(5)), 2) & "-" & _
        Right$("0" & Hex$(g(6)), 2) & Right$("0" & Hex$(g(7)), 2) & "-" & _
        Right$("0" & Hex$(g(8)), 2) & Right$("0" & Hex$(g(9)), 2) & "-" & _
        Right$("0" & Hex$(g(10)), 2) & Right$("0" & Hex$(g(11)), 2) & _
        Right$("0" & Hex$(g(12)), 2) & Right$("0" & Hex$(g(13)), 2) & _
        Right$("0" & Hex$(g(14)), 2) & Right$("0" & Hex$(g(15)), 2))
End Function

Public Function BuildJwtHs256(ByVal accessKey As String, ByVal secretKey As String, _
                              Optional ByVal queryString As String = "") As String
    Dim headerJson As String, payloadJson As String, nonce As String, signingInput As String
    Dim sig() As Byte
    nonce = NewUuidV4()
    headerJson = "{""alg"":""HS256"",""typ"":""JWT""}"
    If Len(queryString) = 0 Then
        payloadJson = "{""access_key"":""" & accessKey & """,""nonce"":""" & nonce & """}"
    Else
        payloadJson = "{""access_key"":""" & accessKey & """,""nonce"":""" & nonce & _
                      """,""query_hash"":""" & Sha512Hex(queryString) & """,""query_hash_alg"":""SHA512""}"
    End If
    signingInput = Base64UrlEncodeString(headerJson) & "." & Base64UrlEncodeString(payloadJson)
    sig = HmacSha256Bytes(secretKey, signingInput)
    BuildJwtHs256 = signingInput & "." & Base64UrlEncodeBytes(sig)
End Function

' RFC 2104 HMAC-SHA256 using CryptoAPI SHA-256 only
Private Function HmacSha256Raw(ByRef keyBytes() As Byte, ByRef msgBytes() As Byte) As Byte()
    Dim key() As Byte, i As Long, keyLen As Long
    Dim ipad(0 To SHA256_BLOCK - 1) As Byte
    Dim opad(0 To SHA256_BLOCK - 1) As Byte
    Dim inner() As Byte, outer() As Byte
    Dim innerHash() As Byte

    keyLen = UBound(keyBytes) - LBound(keyBytes) + 1
    If keyLen > SHA256_BLOCK Then
        key = HashBytes(keyBytes, CALG_SHA_256, 32)
        keyLen = 32
    Else
        ReDim key(0 To keyLen - 1)
        For i = 0 To keyLen - 1
            key(i) = keyBytes(LBound(keyBytes) + i)
        Next i
    End If

    For i = 0 To SHA256_BLOCK - 1
        Dim kb As Byte
        If i < keyLen Then kb = key(i) Else kb = 0
        ipad(i) = kb Xor &H36
        opad(i) = kb Xor &H5C
    Next i

    inner = ConcatBytes(ipad, msgBytes)
    innerHash = HashBytes(inner, CALG_SHA_256, 32)
    outer = ConcatBytes(opad, innerHash)
    HmacSha256Raw = HashBytes(outer, CALG_SHA_256, 32)
End Function

Private Function ConcatBytes(ByRef a() As Byte, ByRef b() As Byte) As Byte()
    Dim out() As Byte, i As Long, na As Long, nb As Long
    If (Not Not a) = 0 Then na = 0 Else na = UBound(a) - LBound(a) + 1
    If (Not Not b) = 0 Then nb = 0 Else nb = UBound(b) - LBound(b) + 1
    If na + nb = 0 Then
        ConcatBytes = out
        Exit Function
    End If
    ReDim out(0 To na + nb - 1)
    For i = 0 To na - 1
        out(i) = a(LBound(a) + i)
    Next i
    For i = 0 To nb - 1
        out(na + i) = b(LBound(b) + i)
    Next i
    ConcatBytes = out
End Function

#If VBA7 Then
Private Function HashBytes(ByRef data() As Byte, ByVal alg As Long, ByVal hashLen As Long) As Byte()
    Dim hProv As LongPtr, hHash As LongPtr
    Dim out() As Byte, outLen As Long
    If CryptAcquireContext(hProv, vbNullString, vbNullString, PROV_RSA_AES, CRYPT_VERIFYCONTEXT) = 0 Then
        Err.Raise vbObjectError + 700, "modCrypto", "CryptAcquireContext failed"
    End If
    If CryptCreateHash(hProv, alg, 0, 0, hHash) = 0 Then
        CryptReleaseContext hProv, 0
        Err.Raise vbObjectError + 701, "modCrypto", "CryptCreateHash failed"
    End If
    If (Not Not data) <> 0 Then
        If UBound(data) >= LBound(data) Then
            If CryptHashData(hHash, data(LBound(data)), UBound(data) - LBound(data) + 1, 0) = 0 Then
                CryptDestroyHash hHash
                CryptReleaseContext hProv, 0
                Err.Raise vbObjectError + 702, "modCrypto", "CryptHashData failed"
            End If
        End If
    End If
    ReDim out(0 To hashLen - 1)
    outLen = hashLen
    If CryptGetHashParam(hHash, HP_HASHVAL, out(0), outLen, 0) = 0 Then
        CryptDestroyHash hHash
        CryptReleaseContext hProv, 0
        Err.Raise vbObjectError + 703, "modCrypto", "CryptGetHashParam failed"
    End If
    CryptDestroyHash hHash
    CryptReleaseContext hProv, 0
    HashBytes = out
End Function
#Else
Private Function HashBytes(ByRef data() As Byte, ByVal alg As Long, ByVal hashLen As Long) As Byte()
    Dim hProv As Long, hHash As Long
    Dim out() As Byte, outLen As Long
    If CryptAcquireContext(hProv, vbNullString, vbNullString, PROV_RSA_AES, CRYPT_VERIFYCONTEXT) = 0 Then
        Err.Raise vbObjectError + 700, "modCrypto", "CryptAcquireContext failed"
    End If
    If CryptCreateHash(hProv, alg, 0, 0, hHash) = 0 Then
        CryptReleaseContext hProv, 0
        Err.Raise vbObjectError + 701, "modCrypto", "CryptCreateHash failed"
    End If
    If (Not Not data) <> 0 Then
        If UBound(data) >= LBound(data) Then
            If CryptHashData(hHash, data(LBound(data)), UBound(data) - LBound(data) + 1, 0) = 0 Then
                CryptDestroyHash hHash
                CryptReleaseContext hProv, 0
                Err.Raise vbObjectError + 702, "modCrypto", "CryptHashData failed"
            End If
        End If
    End If
    ReDim out(0 To hashLen - 1)
    outLen = hashLen
    If CryptGetHashParam(hHash, HP_HASHVAL, out(0), outLen, 0) = 0 Then
        CryptDestroyHash hHash
        CryptReleaseContext hProv, 0
        Err.Raise vbObjectError + 703, "modCrypto", "CryptGetHashParam failed"
    End If
    CryptDestroyHash hHash
    CryptReleaseContext hProv, 0
    HashBytes = out
End Function
#End If
