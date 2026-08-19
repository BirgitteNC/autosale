# Type 1 auto-map: kendte navnemismatch med MENY-maengder
# Strategi:
#   - Opdater menge/enhed pa eksisterende CSV-raekke
#   - For Bacon+Pancetta og HakketKalv+HakketGris: behold EN raekke, slet duplikat
#   - Slet meny_auto-raekker der er dubletter af opdaterede raekker

$InputFile  = "src\manglende_maengder_rettet.csv"
$OutputFile = "src\manglende_maengder_rettet.csv"
$LogFile    = "src\aendringslog_type1.txt"

$lines = [System.IO.File]::ReadAllLines($InputFile, [System.Text.UTF8Encoding]::new($false))
$sep   = ";"
$log   = [System.Collections.Generic.List[string]]::new()
$log.Add("TYPE 1 AUTO-MAP PATCH")
$log.Add("=" * 60)

# -------------------------------------------------------
# Definitioner: [raavare_id, ny_navn, qty, unit]
# Slet-raekker: [raavare_id] der skal fjernes for en given opskrift
# -------------------------------------------------------

# Opbyg et dictionary: "titel|raavare_id" -> [ny_navn, qty, unit]
$updates = @{}
# Opbyg et set af raekker der skal slettes: "titel|raavare_id"
$deletes = [System.Collections.Generic.HashSet[string]]::new()

# --- Bacon i tern -> bacontern ---
# Squash fettuccine: ing_bacon=150g, slet ing_pancetta
$updates["Squash 'fettuccine' med soed kartoffelpure, bacon og gedeost|ing_bacon"]     = @("Bacontern","150","g")
$updates["Squash " + [char]0x0027 + "fettuccine" + [char]0x0027 + " med s" + [char]0x00F8 + "d kartoffelpure, bacon og gedeost|ing_bacon"] = @("Bacontern","150","g")
# Helstegt and: ing_bacon=125g, slet ing_pancetta
$updates["Helstegt and med " + [char]0x00E6 + "ble, tranebaer og rosmarin|ing_bacon"]  = @("Bacontern","125","g")

# --- Parmesan -> Parmigiano Reggiano med maengde ---
$updates["Grillet spidsk" + [char]0x00E5 + "l med urtsm" + [char]0x00F8 + "r og parmesan|ing_parmesan"] = @("Parmigiano Reggiano","2","dl")
$updates["madtaerte med cherrytomater ricotta og mozzarella|ing_parmesan"]                               = @("Parmigiano Reggiano","50","g")
$updates["Marry me Chicken (Kylling i cremet sauce med soltorret tomat)|ing_parmesan"]                   = @("Parmigiano Reggiano","25","g")
$updates["Grillet ribeye med knuste kartofler, parmesanost og aertepure|ing_parmesan"]                   = @("Parmigiano Reggiano","50","g")
$updates["Pull apart bread med parmesan, hvidloeg og persille|ing_parmesan"]                             = @("Parmigiano Reggiano","100","g")

# --- Fersk Laks -> Laksefileter med maengde ---
$updates["Cremet fiskesuppe med laks, kartofler og dild|ing_laks"]                                       = @("Laksefileter","250","g")
$updates["Grillet laks med spidsk" + [char]0x00E5 + "ls-tzatziki med for" + [char]0x00E5 + "rsloeg og aerter|ing_laks"] = @("Laksefileter","4","stk")
$updates["Tacos med grillet laks, spidsk" + [char]0x00E5 + "lsalat og avocado|ing_laks"]                = @("Laksefileter","300","g")
# Grillet blomkal: MENY har ingen laks - slet raekken
# (haandteres nedenfor som delete)

# --- Hakket Kalv og Flaesk / Hakket Gris & Kalv -> behold en raekke med maengde ---
# Grillede tortillas: ing_extra_15=400g, slet ing_hakket_gris_kalv
$updates["Grillede tortillas med krydrede koedboller, creme fraiche og roedloeg|ing_extra_15"]           = @("Hakket Grise- og Kalvekoed","400","g")
# Krydrede koedboller: ing_extra_15=400g, slet ing_hakket_gris_kalv
$updates["Krydrede koedboller med frisk pasta og tomatsauce|ing_extra_15"]                               = @("Hakket Grise- og Kalvekoed","400","g")
# Frikadelleburger: ing_extra_15=600g, slet ing_hakket_gris_kalv
$updates["Frikadelleburger med roedbede-slaw|ing_extra_15"]                                              = @("Hakket Grise- og Kalvekoed","600","g")

# --- Skinketern ---
$updates["Crostini med parmaskinke og nektarin|ing_extra_17"]                                            = @("Parmaskinke","60","g")
$updates["Saftig wokret med skinketern|ing_extra_17"]                                                    = @("Kogt Skinke i Tern","500","g")
$updates["Lun peach melba-salat med skinke og gedeost|ing_extra_17"]                                     = @("Lufttoerret Skinke","70","g")

# --- Klementiner ---
$updates["Graeskar-, aeble- og klementinchutney|ing_klementiner"]                                        = @("Klementiner","1.5","stk")
$updates["Oksecuvette med juletwist og julesalat|ing_klementiner"]                                       = @("Klementiner","2","stk")

# --- Enoki Svampe ---
$updates["Ramen med smilende aeg, boghvedenudler og sprod topping|ing_enoki"]                            = @("Enokisvampe","100","g")
$updates["Salat af brombaer, enoki svampe, aebler, hjertesalat og flydende ramsloeg|ing_enoki"]         = @("Enokisvampe","200","g")

# --- Fennikel ---
$updates["Fiskefrikadeller med fennikelsalat|ing_fennikel"]                                              = @("Fennikel","2","stk")

# --- Svinemoerbrad ---
$updates["Asiatisk wok med moerbrad af gris, aegnudler, kaal, foraarsloe g og cashewnoedder|ing_svinemoerbrad"] = @("Svinemoerbrad","350","g")

# --- Gulerod ---
$updates["Bagt kartoffel med linsechili, korianderdressing og ost|ing_extra_4"]                          = @("Gulerod","1","stk")

# --- Ahornsirup: MENY har ingen maengde - skip ---
# --- Oregano: MENY har ingen maengde - skip ---

# -------------------------------------------------------
# Raekker der skal slettes (duplikater)
# -------------------------------------------------------

# Pancetta-raekker slettet (bacontern daekkes af ing_bacon)
$deletes.Add("Squash " + [char]0x0027 + "fettuccine" + [char]0x0027 + " med s" + [char]0x00F8 + "d kartoffelpure, bacon og gedeost|ing_pancetta") | Out-Null
$deletes.Add("Helstegt and med " + [char]0x00E6 + "ble, tranebaer og rosmarin|ing_pancetta") | Out-Null
$deletes.Add("Grillede tortillas med krydrede koedboller, creme fraiche og roedloeg|ing_hakket_gris_kalv") | Out-Null
$deletes.Add("Krydrede koedboller med frisk pasta og tomatsauce|ing_hakket_gris_kalv") | Out-Null
$deletes.Add("Frikadelleburger med roedbede-slaw|ing_hakket_gris_kalv") | Out-Null
# Grillet blomkal: Fersk Laks tilhoerer ikke denne opskrift
$deletes.Add("Grillet blomk" + [char]0x00E5 + "l med kogte nye kartofler, urteyoghurt og brunet sojasm" + [char]0x00F8 + "r|ing_laks") | Out-Null
# Meny-auto dubletter af parmesan
$deletes.Add("Grillet ribeye med knuste kartofler, parmesanost og aertepure|ing_meny_auto_1293") | Out-Null
$deletes.Add("Pull apart bread med parmesan, hvidloeg og persille|ing_meny_auto_1368") | Out-Null

# -------------------------------------------------------
# Hjaelpe-funktion: normaliserer titel til ASCII for matching
# -------------------------------------------------------
function Normalize-Title([string]$s) {
    $s = $s.Trim()
    $s = $s -replace [char]0x00E6, "ae"
    $s = $s -replace [char]0x00F8, "oe"
    $s = $s -replace [char]0x00E5, "aa"
    $s = $s -replace [char]0x00C6, "AE"
    $s = $s -replace [char]0x00D8, "OE"
    $s = $s -replace [char]0x00C5, "AA"
    $s = $s -replace [char]0x00E9, "e"
    $s = $s -replace [char]0x00E8, "e"
    $s = $s -replace [char]0x00EB, "e"
    $s = $s -replace [char]0x00FC, "ue"
    $s = $s -replace [char]0x00F6, "oe"
    $s = $s -replace [char]0x00AD, ""   # soft hyphen
    $s = $s -replace [char]0x0027, "'"
    return $s
}

# -------------------------------------------------------
# Processer CSV
# -------------------------------------------------------
$out     = [System.Collections.Generic.List[string]]::new()
$out.Add($lines[0])  # header

$changed = 0
$deleted = 0

foreach ($line in $lines[1..($lines.Length - 1)]) {
    if ($line.Trim() -eq "") { continue }
    $parts    = $line -split $sep, -1
    $title    = if ($parts.Count -ge 2) { $parts[1].Trim() } else { "" }
    $rawId    = if ($parts.Count -ge 3) { $parts[2].Trim() } else { "" }
    $normT    = Normalize-Title $title
    $key      = "$normT|$rawId"

    if ($deletes.Contains($key)) {
        $log.Add("SLETTET: [$title] [$rawId]")
        $deleted++
        continue
    }

    if ($updates.ContainsKey($key)) {
        $fix = $updates[$key]
        $oldName = $parts[3]
        $parts[3] = $fix[0]
        $parts[4] = $fix[1]
        $parts[5] = $fix[2]
        $log.Add("RETTET:  [$title] $oldName -> $($fix[0]) $($fix[1]) $($fix[2])")
        $changed++
    }

    $out.Add(($parts -join $sep))
}

$log.Add("")
$log.Add("Resultat: $changed rettet, $deleted slettet")

[System.IO.File]::WriteAllLines($OutputFile, $out.ToArray(), [System.Text.UTF8Encoding]::new($false))
[System.IO.File]::WriteAllLines($LogFile,    $log.ToArray(), [System.Text.UTF8Encoding]::new($false))

Write-Host "Faerdig: $changed rettet, $deleted slettet"
Get-Content $LogFile
