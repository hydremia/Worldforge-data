
param(
  [ValidateSet('import','suggest','reserve','stats','help')]
  [string]$cmd = 'help',
  [int]$retries = 4,
  [int]$delayMs = 300
)

function Write-Heading($text) {
  Write-Host "== $text ==" -ForegroundColor Cyan
}

function Invoke-NominaApi {
  param(
    [Parameter(Mandatory)][string]$Path,
    [Parameter(Mandatory)][ValidateSet('GET','POST')]$Method,
    [hashtable]$Body,
    [int]$Retries = 4,
    [int]$DelayMs = 300
  )
  $uri = "http://127.0.0.1:8787$Path"

  if ($Method -eq 'GET') {
    return Invoke-RestMethod -Method GET -Uri $uri
  }

  $json = ($Body | ConvertTo-Json -Depth 15)
  $attempt = 0
  while ($true) {
    try {
      return Invoke-RestMethod -Method POST -Uri $uri -ContentType "application/json" -Body $json
    } catch {
      $attempt++
      $msg = $_.Exception.Message
      if ($attempt -le $Retries -and $msg -like "*restarted mid-request*") {
        Start-Sleep -Milliseconds $DelayMs
        continue
      } else {
        throw
      }
    }
  }
}

function Import-NominaSeeds {
  param(
    [string]$Root = (Join-Path $PWD "LEXICON\NOMINA\sets")
  )
  Write-Heading "Importing Nomina seeds from $Root"

  if (-not (Test-Path $Root)) {
    Write-Error "Seed path not found: $Root"
    exit 1
  }

  $imported = 0
  Get-ChildItem -Path $Root -Recurse -File -Filter *.jsonl | ForEach-Object {
    $relative = $_.FullName.Substring($Root.Length).TrimStart('\','/')
    $parts = $relative -split '[\\/]'
    if ($parts.Length -lt 3) { return }

    $species   = $parts[0]
    $name_type = $parts[1]
    $bucket    = $parts[-1]

    $lines = Get-Content -LiteralPath $_.FullName
    $entries = @()
    foreach ($line in $lines) {
      $trim = $line.Trim()
      if ($trim.Length -gt 0) {
        try { $entries += ($trim | ConvertFrom-Json) } catch {}
      }
    }
    if ($entries.Count -eq 0) { return }

    $payload = @{
      species   = $species
      name_type = $name_type
      bucket    = $bucket
      entries   = $entries
    }

    $res = Invoke-NominaApi -Path "/nomina/import" -Method POST -Body $payload -Retries $retries -DelayMs $delayMs
    Write-Host ("Imported {0} → {1}" -f $entries.Count, $res.key) -ForegroundColor Green
    $imported += $entries.Count
  }

  Write-Heading "Done. Imported $imported entries."
}

function Suggest-Nomina {
  param(
    [string[]]$Species = @("human"),
    [string]$NameType = "personal",
    [string]$Gender = "any",
    [int]$Count = 5,
    [string[]]$Culture = @(),   # optional
    [string]$Seed = "roll_id:test"
  )
  $body = @{
    species   = $Species
    name_type = $NameType
    gender    = $Gender
    count     = $Count
    seed      = $Seed
  }
  if ($Culture.Count -gt 0) { $body.culture = $Culture }
  $res = Invoke-NominaApi -Path "/nomina/suggest" -Method POST -Body $body -Retries $retries -DelayMs $delayMs
  $res | Format-List
}

function Reserve-Nomina {
  param(
    [string]$CapsuleId = "demo",
    [int]$Cooldown = 30,
    [string[]]$Names = @("alys","rusk")
  )
  $body = @{
    capsule_id = $CapsuleId
    cooldown   = $Cooldown
    names      = @()
  }
  foreach ($n in $Names) { $body.names += @{ slug = $n } }
  $res = Invoke-NominaApi -Path "/nomina/reserve" -Method POST -Body $body -Retries $retries -DelayMs $delayMs
  $res | Format-List
}

function Stats-Nomina {
  param([string]$Id = "demo")
  $res = Invoke-NominaApi -Path "/nomina/stats/$Id" -Method GET
  $res | Format-List
}

switch ($cmd) {
  'import'  { Import-NominaSeeds }
  'suggest' { Suggest-Nomina }
  'reserve' { Reserve-Nomina }
  'stats'   { Stats-Nomina }
  default {
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  powershell -File tools\ps_nomina_helpers_retry.ps1 import" 
    Write-Host "  powershell -File tools\ps_nomina_helpers_retry.ps1 suggest"
    Write-Host "  powershell -File tools\ps_nomina_helpers_retry.ps1 reserve"
    Write-Host "  powershell -File tools\ps_nomina_helpers_retry.ps1 stats"
  }
}
