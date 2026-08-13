param(
    [string]$cmd,
    [string]$file,
    [int]$port = 8080
)

function Ensure-LogDir {
    $logDir = Join-Path -Path $PSScriptRoot -ChildPath 'logs'
    if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir | Out-Null }
    return (Resolve-Path $logDir).ProviderPath
}

function Log {
    param([string]$msg)
    $logDir = Ensure-LogDir
    $logFile = Join-Path $logDir 'agent.log'
    $time = (Get-Date).ToString('yyyy-MM-dd HH:mm:ss')
    "$time`t$msg" | Out-File -FilePath $logFile -Encoding utf8 -Append
}

function List-Files {
    Log 'Command: list'
    $files = Get-ChildItem -Name
    Write-Output 'Files in project:'
    $files | ForEach-Object { Write-Output "- $_" }
}

function Show-File {
    param([string]$file)
    Log "Command: show $file"
    if (-not $file) {
        Write-Error 'Укажите имя файла для команды show'
        exit 1
    }
    if (-not (Test-Path $file)) {
        Write-Error "Файл не найден: $file"
        exit 1
    }
    Write-Output "--- $file ---"
    Get-Content -Raw -Path $file
}

function Start-HttpServer {
    param([int]$port)
    Add-Type -AssemblyName System.Net.HttpListener
    $listener = New-Object System.Net.HttpListener
    $prefix = "http://localhost:$port/"
    $listener.Prefixes.Add($prefix)
    try {
        $listener.Start()
    } catch {
        $err = $_.Exception.Message
        Write-Error ("Не удалось запустить HTTP-сервер на порту {0}: {1}" -f $port, $err)
        exit 1
    }
    Log "HTTP server started on $prefix"
    Write-Output "HTTP server listening on $prefix"
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $req = $context.Request
        $res = $context.Response
        $path = $req.Url.AbsolutePath
        try {
            if ($path -eq '/list') {
                $items = (Get-ChildItem -Name) -join "\n"
                $buffer = [System.Text.Encoding]::UTF8.GetBytes($items)
                $res.ContentType = 'text/plain; charset=utf-8'
                $res.OutputStream.Write($buffer, 0, $buffer.Length)
            } elseif ($path -eq '/show') {
                $q = $req.QueryString['file']
                if (-not $q) {
                    $msg = 'Missing file parameter'
                    $buf = [System.Text.Encoding]::UTF8.GetBytes($msg)
                    $res.StatusCode = 400
                    $res.OutputStream.Write($buf, 0, $buf.Length)
                } else {
                    if (-not (Test-Path $q)) {
                        $msg = "File not found: $q"
                        $buf = [System.Text.Encoding]::UTF8.GetBytes($msg)
                        $res.StatusCode = 404
                        $res.OutputStream.Write($buf, 0, $buf.Length)
                    } else {
                        $content = Get-Content -Raw -Path $q
                        $buf = [System.Text.Encoding]::UTF8.GetBytes($content)
                        $res.ContentType = 'text/plain; charset=utf-8'
                        $res.OutputStream.Write($buf, 0, $buf.Length)
                    }
                }
            } else {
                $msg = 'Not Found'
                $buf = [System.Text.Encoding]::UTF8.GetBytes($msg)
                $res.StatusCode = 404
                $res.OutputStream.Write($buf, 0, $buf.Length)
            }
        } catch {
            $err = "Server error: $_"
            $buf = [System.Text.Encoding]::UTF8.GetBytes($err)
            $res.StatusCode = 500
            $res.OutputStream.Write($buf, 0, $buf.Length)
        } finally {
            $res.OutputStream.Close()
        }
    }
}

if (-not $cmd) {
    Write-Output "AI Agent PowerShell runner — доступные команды: list, show <file>, serve [port]"
    exit 0
}

if ($cmd -eq 'list') { List-Files; exit 0 }
elseif ($cmd -eq 'show') { Show-File -file $file; exit 0 }
elseif ($cmd -eq 'serve') { Start-HttpServer -port $port; exit 0 }
else { Write-Output "Неизвестная команда: $cmd"; exit 1 }
