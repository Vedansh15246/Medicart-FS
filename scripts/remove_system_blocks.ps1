param(
    [string]$InFile = "microservices\\fulldump.sql",
    [string]$OutFile = "microservices\\fulldump_no_system.sql"
)

# System DB names to remove (no backticks here)
$systemDbs = @('mysql','performance_schema','sys','information_schema')

# Resolve paths: prefer paths that exist relative to current working directory, then try script location
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
if (Test-Path -Path $InFile) {
    $inPath = (Resolve-Path -Path $InFile).Path
} elseif (Test-Path -Path (Join-Path $scriptDir $InFile)) {
    $inPath = (Resolve-Path -Path (Join-Path $scriptDir $InFile)).Path
} else {
    Write-Error "Input file not found (tried CWD and script dir): $InFile"
    exit 1
}

if (Test-Path -Path $OutFile) {
    $outPath = (Resolve-Path -Path $OutFile).Path
} else {
    # create output under CWD if provided relative there, else under script dir
    $candidateCwd = Join-Path (Get-Location) $OutFile
    if (Test-Path -Path (Split-Path -Path $candidateCwd -Parent)) { $outPath = $candidateCwd }
    else { $outPath = Join-Path $scriptDir $OutFile }
}

$outDir = Split-Path -Parent $outPath
if (-not (Test-Path -Path $outDir)) { New-Item -ItemType Directory -Path $outDir -Force | Out-Null }

Write-Output "Reading: $inPath"
Write-Output "Writing: $outPath"

$reader = New-Object System.IO.StreamReader($inPath)
$writer = New-Object System.IO.StreamWriter($outPath, $false, [System.Text.Encoding]::UTF8)

$skip = $false

try {
    while (-not $reader.EndOfStream) {
        $line = $reader.ReadLine()

        # Detect Current Database: `name`
        if ($line -match '^--\s*Current Database:\s*`([^`]*)`') {
            $db = $matches[1]
            if ($systemDbs -contains $db) {
                # start skipping until next "-- Current Database:" for a non-system db
                $skip = $true
                continue
            } else {
                $skip = $false
                $writer.WriteLine($line)
                continue
            }
        }

        if ($skip) { continue }

        # Also drop standalone USE/CREATE DATABASE that reference system DBs
        if ($line -match '^(USE|CREATE DATABASE).*`([^`]+)`') {
            $db2 = $matches[2]
            if ($systemDbs -contains $db2) { continue }
        }

        # Drop lines that explicitly reference the system db with fully-qualified names like `mysql`.
        if ($line -match '\`(mysql|performance_schema|sys|information_schema)\`') {
            if ($line -match '^(CREATE|DROP|USE|INSERT INTO|LOCK TABLES|ALTER TABLE|GRANT|REVOKE)') { continue }
        }

        $writer.WriteLine($line)
    }
}
finally {
    if ($reader) { $reader.Close() }
    if ($writer) { $writer.Close() }
}

Write-Output "Done. Created: $outPath"
