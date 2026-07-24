# MENY Opskrift Ingrediens-opdatering v3
param([string]$BasePath = "C:\Users\birgi\AI\Antigravity\Startkit\antigravity_starter_kit_v1_2\antigravity_starter_kit_v1_2\convieniensale\src")

$InputFile   = "$BasePath\manglende_maengder.csv"
$OutputFile  = "$BasePath\manglende_maengder_rettet.csv"
$BackupFile  = "$BasePath\manglende_maengder_backup.csv"
$LogFile     = "$BasePath\aendringslog.txt"
$SitemapFile = "$BasePath\meny_urls.txt"

Copy-Item $InputFile $BackupFile -Force
Write-Host "Backup gemt: $BackupFile"
$sitemapSlugs = (Get-Content $SitemapFile) | ForEach-Object { ($_ -split '/opskrift/')[-1] }

function ConvertTo-Slug {
    param([string]$title, [string]$mode = "new")
    $s = $title.Trim().ToLower()
    if ($mode -eq "new") {
        $s = $s -replace ([char]0x00E6),"ae" -replace ([char]0x00F8),"oe" -replace ([char]0x00E5),"aa"
        $s = $s -replace ([char]0x00C6),"ae" -replace ([char]0x00D8),"oe" -replace ([char]0x00C5),"aa"
    } else {
        $s = $s -replace ([char]0x00E6),"a" -replace ([char]0x00F8),"o" -replace ([char]0x00E5),"a"
        $s = $s -replace ([char]0x00C6),"a" -replace ([char]0x00D8),"o" -replace ([char]0x00C5),"a"
    }
    $s = $s -replace ([char]0x00F6),"o" -replace ([char]0x00E9),"e" -replace ([char]0x00E8),"e"
    $s = $s -replace ([char]0x00E0),"a" -replace ([char]0x00E1),"a" -replace ([char]0x00F1),"n" -replace ([char]0x00AE),""
    $s = $s -replace [char]0x0027,"" -replace ",","" -replace "\\.","" -replace "!","" -replace "\?","" -replace ":","" -replace ";",""
    $s = $s -replace "\(","" -replace "\)","" -replace "/","-" -replace '\\\\',"" -replace '"',""
    $s = $s -replace "&"," og "
    $s = [System.Text.RegularExpressions.Regex]::Replace($s, '[^\x00-\x7F]', "")
    $s = [System.Text.RegularExpressions.Regex]::Replace($s, '[^\w\s\-]', "")
    $s = [System.Text.RegularExpressions.Regex]::Replace($s, '\s+', " ")
    return ($s.Trim() -replace " ","-" -replace "-{2,}","-").Trim("-")
}

function Get-Keywords {
    param([string]$slug)
    $stop = @("med","og","i","af","til","fra","paa","den","det","de","en","et","er","la","a","pa")
    return ($slug -split "-") | Where-Object { $_ -notin $stop -and $_.Length -gt 2 }
}

$manualOverrides = @{
    "Falafelburger med myntedressing"                       = "falafelburger-myntedressing"
    "Fastelavnsboller med hindbaer og creme"                = "fastelavnsboller-hindbaer-og-creme"
    "Noeddecreme/nutella-taerte med hindbaer"               = "noeddecreme-taerte-hindbaer"
    "Asparges hotdog med skagenrore i brioche"              = "asparges-hotdog-skagenrore-i-brioche"
    "Brunchtallerken med aeg, brie og soede kartofler"      = "brunchtallerken"
    "Rejer i hvidloeg"                                      = "rejer-hvidloeg"
    "Jalapeno poppers med bacon og cheddar"                 = "jalapeno-poppers-bacon-og-cheddar"
    "Fladbrod med hummus, stegt aubergine og tahindressing" = "fladbrod-hummus-stegt-aubergine-og-tahindressing"
}

function Find-MenyUrl {
    param([string]$title, [array]$sitemap)
    $tn = ConvertTo-Slug $title "new"; $to = ConvertTo-Slug $title "old"
    foreach ($key in $manualOverrides.Keys) {
        $ks = ConvertTo-Slug $key "new"
        if ($tn -eq $ks -or $to -eq $ks -or $tn -like "$ks*" -or $ks -like "$tn*") {
            $slug = $manualOverrides[$key]
            if ($slug -in $sitemap) { return "https://meny.dk/opskrift/$slug" }
        }
    }
    foreach ($s in @($tn, $to)) {
        if ($s -in $sitemap) { return "https://meny.dk/opskrift/$s" }
        foreach ($sfx in @("0","1","2")) { if ("$s-$sfx" -in $sitemap) { return "https://meny.dk/opskrift/$s-$sfx" } }
    }
    foreach ($mode in @("new","old")) {
        $s = ConvertTo-Slug $title $mode; $kw = Get-Keywords $s
        if ($kw.Count -ge 2) {
            $cands = $sitemap | Where-Object { $c=$_; ($kw | Where-Object { $c -like "*$_*" }).Count -eq $kw.Count }
            foreach ($hit in $cands) { $hkw=Get-Keywords $hit; $ex=$hkw|Where-Object{$kw-notcontains$_}; if ($ex.Count -le 1) { return "https://meny.dk/opskrift/$hit" } }
        }
        $kws = $kw | Select-Object -First 4
        if ($kws.Count -ge 2) {
            $cands = $sitemap | Where-Object { $c=$_; ($kws | Where-Object { $c -like "*$_*" }).Count -eq $kws.Count }
            foreach ($hit in $cands) { $hkw=Get-Keywords $hit; $ex=$hkw|Where-Object{$kws-notcontains$_}; if ($ex.Count -le 2) { return "https://meny.dk/opskrift/$hit" } }
        }
    }
    return $null
}

function Parse-MenyIngredients {
    param([string]$html)
    if ($html -match '"recipeIngredient"\s*:\s*\[([^\]]+)\]') {
        $raw   = $matches[1]
        $items = [System.Text.RegularExpressions.Regex]::Matches($raw, '"([^"]+)"') | ForEach-Object { $_.Groups[1].Value }
        $parsed = @()
        $units  = 'g|dl|ml|l|kg|stk|tsk|spsk|fed|stilk|ds|pakke|pose|bundt|nip|drys|blade|skive|liter|cl'
        foreach ($item in $items) {
            $clean = [System.Text.RegularExpressions.Regex]::Replace($item, '\([^)]*\)', "").Replace("*","").Trim().TrimEnd(",").Trim()
            if ($clean -match "^(\d+[,.]?\d*)\s+($units)\s+(.+)$") {
                $parsed += @{Qty=$matches[1]; Unit=$matches[2]; Name=$matches[3].Trim()}
            } elseif ($clean -match '^\d+[,.]?\d*\s+.+$' -and $clean -match '^\d+') {
                $num = [System.Text.RegularExpressions.Regex]::Match($clean, '^\d+[,.]?\d*').Value
                $rest= $clean.Substring($num.Length).Trim()
                $parsed += @{Qty=$num; Unit="stk"; Name=$rest}
            } else {
                $parsed += @{Qty=""; Unit=""; Name=$clean.Trim()}
            }
        }
        return $parsed
    }
    return @()
}

function Normalize-Name {
    param([string]$name)
    $s = $name.ToLower().Trim()
    $s = [System.Text.RegularExpressions.Regex]::Replace($s, '\([^)]*\)', "").Trim()
    foreach ($w in @("frisk","friske","torret","stoedt","fint","fin","groft","hele","revet","kogt","hakket","pillede","frossent","frosne","oekologisk","okologisk","stor","store","lille")) {
        $s = $s -replace "^$w\s+",""
        $s = $s -replace "\s+$w$",""
    }
    $s = $s -replace ([char]0x00E6),"ae" -replace ([char]0x00F8),"oe" -replace ([char]0x00E5),"aa"
    $s = $s -replace ([char]0x00F6),"o" -replace ([char]0x00E9),"e" -replace ([char]0x00E8),"e"
    return ($s.Trim() -replace '\s+'," ")
}

function Match-Ingredient {
    param([string]$csvName, [array]$menyIngs)
    $csvNorm = Normalize-Name $csvName
    foreach ($m in $menyIngs) {
        $mNorm = Normalize-Name $m.Name
        if ($csvNorm -eq $mNorm) { return $m }
        if ($mNorm.Length -gt 3 -and ($mNorm -like "*$csvNorm*" -or $csvNorm -like "*$mNorm*")) { return $m }
        $cw = $csvNorm -split '\s+' | Where-Object { $_.Length -gt 3 }
        $mw = $mNorm   -split '\s+' | Where-Object { $_.Length -gt 3 }
        if ($cw.Count -gt 0 -and ($cw | Where-Object { $mw -contains $_ }).Count -gt 0) { return $m }
    }
    return $null
}

function Make-NewRow {
    param([string]$oid, [string]$otitle, [hashtable]$mi, [string[]]$cols, [int]$idx)
    $row = New-Object PSObject
    foreach ($col in $cols) { $row | Add-Member -MemberType NoteProperty -Name $col -Value "" }
    $row.($cols[0]) = $oid
    $row.($cols[1]) = $otitle
    $row.($cols[2]) = "ing_meny_auto_$idx"
    $row.($cols[3]) = $mi.Name
    $row.($cols[4]) = ($mi.Qty -replace ',','.')   
    $row.($cols[5]) = $mi.Unit
    return $row
}

# ---- MAIN ----
Write-Host "Laesser CSV..."
$allRows  = Import-Csv $InputFile -Delimiter ";" -Encoding UTF8
$colNames = ($allRows | Select-Object -First 1).PSObject.Properties.Name
$colID=$colNames[0]; $colTitle=$colNames[1]; $colRaw=$colNames[2]; $colIng=$colNames[3]; $colQty=$colNames[4]; $colUnit=$colNames[5]
Write-Host "Total rader: $($allRows.Count)"

$firstIdForTitle = @{}
foreach ($row in $allRows) {
    $t = $row.$colTitle.Trim()
    if ($t -ne "" -and -not $firstIdForTitle.ContainsKey($t)) { $firstIdForTitle[$t] = $row.$colID }
}
$uniqueRows = $allRows | Where-Object { $row = $_; $row.$colID -eq $firstIdForTitle[$row.$colTitle.Trim()] }
Write-Host "Rader efter deduplicering: $($uniqueRows.Count)"
$byRecipe = $uniqueRows | Group-Object { $_.$colTitle.Trim() }
Write-Host "Unikke opskrifter: $($byRecipe.Count)"

$outputRows=[System.Collections.Generic.List[object]]::new()
$log=[System.Text.StringBuilder]::new()
[void]$log.AppendLine("AENDRINGSLOG - MENY Opskrift Opdatering v3")
[void]$log.AppendLine("Genereret: $(Get-Date -Format 'yyyy-MM-dd HH:mm')")
[void]$log.AppendLine("="*80)
$autoIdx=1; $statsAdded=0; $statsUpdated=0; $statsNoMatch=0

$n=0
foreach ($group in $byRecipe) {
    $n++
    $rt=$group.Name; $rr=$group.Group; $oid=$rr[0].$colID
    Write-Progress -Activity "Behandler ($n/$($byRecipe.Count))" -Status $rt -PercentComplete ([int](($n/$byRecipe.Count)*100))

    $menyUrl = Find-MenyUrl -title $rt -sitemap $sitemapSlugs
    if (-not $menyUrl) {
        [void]$log.AppendLine(""); [void]$log.AppendLine("OPSKRIFT: $rt")
        [void]$log.AppendLine("  STATUS: MANUEL KONTROL - ikke fundet paa MENY")
        foreach ($r in $rr) { $outputRows.Add($r) }; continue
    }
    [void]$log.AppendLine(""); [void]$log.AppendLine("OPSKRIFT: $rt")
    [void]$log.AppendLine("  MENY-URL: $menyUrl")

    try {
        $resp = Invoke-WebRequest -Uri $menyUrl -UseBasicParsing -TimeoutSec 15
        $menyIngs = Parse-MenyIngredients -html $resp.Content
    } catch {
        [void]$log.AppendLine("  FEJL: $($_.Exception.Message)")
        foreach ($r in $rr) { $outputRows.Add($r) }; continue
    }
    if ($menyIngs.Count -eq 0) {
        [void]$log.AppendLine("  STATUS: Ingen ingredienser i JSON-LD")
        foreach ($r in $rr) { $outputRows.Add($r) }; continue
    }
    $ingList = ($menyIngs | ForEach-Object { "[$($_.Qty) $($_.Unit)] $($_.Name)" }) -join ", "
    [void]$log.AppendLine("  MENY ($($menyIngs.Count) ing): $ingList")

    $matched = @{}
    foreach ($row in $rr) {
        $csvIng = $row.$colIng.Trim()
        $m = Match-Ingredient -csvName $csvIng -menyIngs $menyIngs
        if ($m) {
            $oq=$row.$colQty; $ou=$row.$colUnit
            $nq=($m.Qty -replace ',','.'); $nu=$m.Unit
            $row.$colQty=$nq; $row.$colUnit=$nu; $matched[$m.Name]=$true
            if ($oq -ne $nq -or $ou -ne $nu) { [void]$log.AppendLine("    OPDATERET: $csvIng | $oq $ou => $nq $nu"); $statsUpdated++ }
            else { [void]$log.AppendLine("    UAENDRET:  $csvIng | $nq $nu") }
        } else {
            [void]$log.AppendLine("    INGEN MATCH: $csvIng"); $statsNoMatch++
        }
        $outputRows.Add($row)
    }
    $notInCSV = $menyIngs | Where-Object { -not $matched.ContainsKey($_.Name) -and $_.Name -ne "" }
    if ($notInCSV.Count -gt 0) {
        [void]$log.AppendLine("  TILFOJET ($($notInCSV.Count)):")
        foreach ($mi in $notInCSV) {
            $nr = Make-NewRow -oid $oid -otitle $rt -mi $mi -cols $colNames -idx $autoIdx
            $outputRows.Add($nr)
            [void]$log.AppendLine("    + $($mi.Name) | $($mi.Qty -replace ',','.') $($mi.Unit)")
            $autoIdx++; $statsAdded++
        }
    }
    Start-Sleep -Milliseconds 150
}
Write-Progress -Activity "Behandler" -Completed

$csvLines=[System.Collections.Generic.List[string]]::new()
$csvLines.Add($colNames -join ";")
foreach ($row in $outputRows) { $csvLines.Add(($colNames | ForEach-Object { $row.$_ }) -join ";") }
[System.IO.File]::WriteAllLines($OutputFile, $csvLines, [System.Text.UTF8Encoding]::new($false))
[void]$log.AppendLine(""); [void]$log.AppendLine("="*80)
[void]$log.AppendLine("STATISTIK: Rader=$($csvLines.Count-1) | Opdateret=$statsUpdated | Tilfojet=$statsAdded | IngenMatch=$statsNoMatch")
[System.IO.File]::WriteAllText($LogFile, $log.ToString(), [System.Text.UTF8Encoding]::new($false))
Write-Host "FAERDIG! Output: $($csvLines.Count-1) rader | Tilfojet: $statsAdded | Opdateret: $statsUpdated | IngenMatch: $statsNoMatch"
