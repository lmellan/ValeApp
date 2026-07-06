$root = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $root

Write-Host "Iniciando PostgreSQL..." -ForegroundColor Cyan
docker compose up -d postgres

$services = @(
    'usuario-service',
    'audit-service',
    'casino-service',
    'configuracion-service',
    'vale-service',
    'reporte-service',
    'notificacion-service'
)

foreach ($service in $services) {
    $servicePath = Join-Path $root "services\$service"
    $windowTitle = "ValeApp - $service"
    $command = "`$host.UI.RawUI.WindowTitle = '$windowTitle'; cd '$servicePath'; npm install; npm start"

    Write-Host "Iniciando $service..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $command
}

Write-Host "Todos los servicios se iniciaron. Revisa las ventanas de PowerShell abiertas." -ForegroundColor Yellow
