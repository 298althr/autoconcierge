$baseUrl = "http://localhost:4000"
$clientUrl = "http://localhost:3000"
$passCount = 0
$failCount = 0

Write-Host "--- VALIDATION ---"

# 1. Backend Health Check
Write-Host "1. Backend Health Check..."
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get -TimeoutSec 10
    if ($health.status -eq "ok") {
        Write-Host " PASS" -ForegroundColor Green
        $passCount++
    }
    else {
        Write-Host " FAIL" -ForegroundColor Red
        $failCount++
    }
}
catch { Write-Host " ERROR: $_" -ForegroundColor Magenta; $failCount++ }

# 2. Vehicle Catalog API
Write-Host "2. Vehicle Catalog API..."
try {
    $vehicles = Invoke-RestMethod -Uri "$baseUrl/api/vehicles" -Method Get -TimeoutSec 10
    if ($vehicles.success -and $vehicles.count -gt 0) {
        Write-Host " PASS ($($vehicles.count) vehicles)" -ForegroundColor Green
        $passCount++
    }
    else {
        Write-Host " FAIL" -ForegroundColor Red
        $failCount++
    }
}
catch { Write-Host " ERROR: $_" -ForegroundColor Magenta; $failCount++ }

# 3. User Registration
Write-Host "3. Auth..."
$testEmail = "val_$(Get-Random)@test.com"
$token = $null
try {
    $reg = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method Post -Body (@{ email = $testEmail; password = "TestPassword1"; display_name = "Val" } | ConvertTo-Json) -ContentType "application/json"
    $login = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body (@{ email = $testEmail; password = "TestPassword1" } | ConvertTo-Json) -ContentType "application/json"
    
    if ($login.success) {
        $token = $login.data.accessToken
        Write-Host " PASS (Token acquired)" -ForegroundColor Green
        $passCount++
    }
    else {
        Write-Host " FAIL" -ForegroundColor Red
        $failCount++
    }
}
catch { Write-Host " ERROR: $_" -ForegroundColor Magenta; $failCount++ }

# 4. Valuation
Write-Host "4. Valuation..."
if ($token) {
    try {
        $val = Invoke-RestMethod -Uri "$baseUrl/api/valuation/predict" -Method Post -Body (@{ make = "Toyota"; model = "Camry"; year = 2020; mileage_km = 50000; condition = "good" } | ConvertTo-Json) -Headers @{ Authorization = "Bearer $token" } -ContentType "application/json"
        
        if ($val.success) {
            Write-Host " PASS (Valuation: $($val.data.estimated_value))" -ForegroundColor Green
            $passCount++
        }
        else {
            Write-Host " FAIL" -ForegroundColor Red
            $failCount++
        }
    }
    catch { Write-Host " ERROR: $_" -ForegroundColor Magenta; $failCount++ }
}
else { Write-Host " SKIPPED (No Token)" -ForegroundColor Yellow }

Write-Host "---"
Write-Host "PASSED: $passCount | FAILED: $failCount"
