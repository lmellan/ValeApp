$root = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $root

$services = @(
    'usuario-service',
    'audit-service',
    'casino-service',
    'configuracion-service',
    'vale-service',
    'reporte-service',
    'notificacion-service'
)

$ports = @(3000, 3001, 3002, 3003, 3004, 3005, 3006)
$stoppedPids = @{}
$currentPid = $PID

function Stop-ProcessOnce {
    param(
        [int] $ProcessId,
        [string] $Reason
    )

    if (-not $ProcessId -or $ProcessId -eq $currentPid -or $stoppedPids.ContainsKey($ProcessId)) {
        return
    }

    try {
        $process = Get-Process -Id $ProcessId -ErrorAction Stop
        Write-Host "Deteniendo $($process.ProcessName) PID $ProcessId ($Reason)..." -ForegroundColor Yellow
        Stop-Process -Id $ProcessId -Force -ErrorAction Stop
        $stoppedPids[$ProcessId] = $true
    } catch {
        Write-Host "No se pudo detener PID $ProcessId ($Reason). $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "Deteniendo microservicios Node.js por puerto..." -ForegroundColor Cyan

foreach ($port in $ports) {
    $connections = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue

    if (-not $connections) {
        Write-Host "Puerto ${port}: sin servicio escuchando." -ForegroundColor DarkGray
        continue
    }

    foreach ($connection in $connections) {
        Stop-ProcessOnce -ProcessId $connection.OwningProcess -Reason "puerto ${port}"
    }
}

Write-Host "Cerrando consolas abiertas por start-all.ps1..." -ForegroundColor Cyan

$servicePaths = $services | ForEach-Object { [regex]::Escape((Join-Path $root "services\$_")) }
$servicePathPattern = ($servicePaths -join '|')

$consoleProcesses = Get-CimInstance Win32_Process |
    Where-Object {
        $_.ProcessId -ne $currentPid -and
        $_.CommandLine -and
        (
            $_.CommandLine -match 'ValeApp - .*service' -or
            $_.CommandLine -match $servicePathPattern
        ) -and
        $_.Name -match '^(powershell\.exe|pwsh\.exe|cmd\.exe|npm\.cmd|npm\.exe)$'
    }

foreach ($process in $consoleProcesses) {
    Stop-ProcessOnce -ProcessId ([int]$process.ProcessId) -Reason "consola de servicio ValeApp"
}

Write-Host "Deteniendo contenedores Docker de ValeApp..." -ForegroundColor Cyan
docker compose stop postgres pgadmin

Write-Host "Backend detenido. Los datos de PostgreSQL se conservan en el volumen Docker." -ForegroundColor Green
