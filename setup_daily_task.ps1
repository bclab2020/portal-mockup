# Windows Task Scheduler registration script for daily_publisher.py

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$PythonScript = Join-Path $ScriptDir "daily_publisher.py"
$TaskName = "CoreConnectDailyPublish"
$TriggerTime = "09:00" # Runs daily at 9:00 AM

# Check if python is in PATH
$PythonPath = (Get-Command python -ErrorAction SilentlyContinue).Source
if (-not $PythonPath) {
    # Default path for User install of Python if not in system PATH
    $PythonPath = "$env:LOCALAPPDATA\Programs\Python\Python313\python.exe"
    if (-not (Test-Path $PythonPath)) {
        $PythonPath = "$env:LOCALAPPDATA\Programs\Python\Python312\python.exe"
    }
}

if (-not (Test-Path $PythonPath)) {
    Write-Warning "Python executable could not be detected. Please verify python is installed and in your environment PATH."
    $PythonPath = "python"
}

Write-Host "Registering task: $TaskName"
Write-Host "Target script: $PythonScript"
Write-Host "Python Path: $PythonPath"

# Register the task
$Action = New-ScheduledTaskAction -Execute $PythonPath -Argument """$PythonScript""" -WorkingDirectory $ScriptDir
$Trigger = New-ScheduledTaskTrigger -Daily -At $TriggerTime
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Settings $Settings -Description "Core Connect Daily Automated Article Publisher" -Force

Write-Host "Scheduled task '$TaskName' has been registered successfully!"
Write-Host "It will run daily at $TriggerTime."
