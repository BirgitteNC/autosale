# Patch: Erstat/fjern forkerte Torskefileter-raekker

$InputFile  = "src\manglende_maengder_rettet.csv"
$OutputFile = "src\manglende_maengder_rettet.csv"
$LogFile    = "src\aendringslog_torskefileter.txt"

$content = [System.IO.File]::ReadAllLines($InputFile, [System.Text.UTF8Encoding]::new($false))
$header  = $content[0]
$sep     = ";"

$log = [System.Collections.Generic.List[string]]::new()
$log.Add("TORSKEFILETER PATCH")
$log.Add("=" * 60)

$out = [System.Collections.Generic.List[string]]::new()
$out.Add($header)

$changed = 0
$deleted = 0

foreach ($line in $content[1..($content.Length - 1)]) {
    if ($line.Trim() -eq "") { continue }
    $parts   = $line -split $sep, -1
    $ingName = if ($parts.Count -ge 4) { $parts[3].Trim() } else { "" }
    $ingQty  = if ($parts.Count -ge 5) { $parts[4].Trim() } else { "" }
    $title   = if ($parts.Count -ge 2) { $parts[1].Trim() } else { "" }

    if ($ingName -eq "Torskefileter" -and $ingQty -eq "") {

        $action  = "BEHOLD"
        $newName = ""
        $newQty  = ""
        $newUnit = ""

        if ($title -match "Sliders med torpedorejer") {
            $action = "RET"; $newName = "Torpedo Rejer"; $newQty = "12"; $newUnit = "stk"
        } elseif ($title -match "Ovnstegt kylling med kartofler") {
            $action = "SLET"
        } elseif ($title -match "Tacos med grillet laks") {
            $action = "SLET"
        } elseif ($title -match "linser og spinat") {
            $action = "RET"; $newName = "Laksefileter"; $newQty = "300"; $newUnit = "g"
        } elseif ($title -match "Muslinger med dijonsauce") {
            $action = "RET"; $newName = "Kammuslinger"; $newQty = "1"; $newUnit = "kg"
        } elseif ($title -match "Rejer i hvid") {
            $action = "RET"; $newName = "Kaeemperejer"; $newQty = "100"; $newUnit = "g"
        } elseif ($title -match "stsild") {
            $action = "RET"; $newName = "Benfri Sild"; $newQty = "8"; $newUnit = "stk"
        } elseif ($title -match "dspaette med majssalsa") {
            $action = "RET"; $newName = "Roedspaettefileter"; $newQty = "600"; $newUnit = "g"
        } elseif ($title -match "Grillet kulmule") {
            $action = "RET"; $newName = "Kulmulefilet"; $newQty = "700"; $newUnit = "g"
        } elseif ($title -match "Fishburger") {
            $action = "RET"; $newName = "Panerede Fiskefileter"; $newQty = "2"; $newUnit = "stk"
        } elseif ($title -match "Menuierestegt") {
            $action = "RET"; $newName = "Roedspaettefileter"; $newQty = "8"; $newUnit = "stk"
        }

        if ($action -eq "SLET") {
            $log.Add("SLETTET: [$title] Torskefileter fjernet (ingen torsk i opskriften)")
            $deleted++
            continue
        } elseif ($action -eq "RET") {
            $parts[3] = $newName
            $parts[4] = $newQty
            $parts[5] = $newUnit
            $log.Add("RETTET:  [$title] -> $newName $newQty $newUnit")
            $changed++
            $out.Add(($parts -join $sep))
        } else {
            $log.Add("BEHOLD:  [$title] Torskefileter - ingen regel, behold")
            $out.Add($line)
        }
    } else {
        $out.Add($line)
    }
}

$log.Add("")
$log.Add("Resultat: $changed rettet, $deleted slettet")

[System.IO.File]::WriteAllLines($OutputFile, $out.ToArray(), [System.Text.UTF8Encoding]::new($false))
[System.IO.File]::WriteAllLines($LogFile,    $log.ToArray(), [System.Text.UTF8Encoding]::new($false))

Write-Host "Faerdig: $changed rettet, $deleted slettet"
Get-Content $LogFile
