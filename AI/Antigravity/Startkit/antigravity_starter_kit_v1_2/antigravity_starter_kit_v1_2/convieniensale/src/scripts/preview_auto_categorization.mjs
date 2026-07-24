import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

function run() {
    const listPath = 'C:\\Users\\birgi\\.gemini\\antigravity\\brain\\022f7582-d5ab-4f47-8508-71d318cfff35\\diverse_kategori_liste.md';
    if (!fs.existsSync(listPath)) {
        console.error("Filen findes ikke!");
        return;
    }
    
    const content = fs.readFileSync(listPath, 'utf8');
    const lines = content.split('\n');
    const preview = [];
    
    for (const line of lines) {
        if (line.startsWith('- [ ] **')) {
            const match = line.match(/- \[ \] \*\*(.*?)\*\* ->/);
            if (match && match[1]) {
                const originalName = match[1].trim();
                let newName = originalName;
                let category = 'Manglende Kategori (Diverse)';
                
                // Særlige custom replacements (fejlslagen logik)
                newName = newName.replace(/kogt eller stegt kyllingekød/gi, 'tilberedt kyllingekød');
                
                // 3. Emballage og Mængder (Fjernes)
                newName = newName.replace(/^(bakke|håndfuld|ca\.? \d+ g|glas|dåser|dåse|Lille 1 bundt|Stor 1 håndfuld|lille|stor)\s+/i, '');
                
                // 2. Tilberedninger og tillægsord (Fjernes)
                newName = newName.replace(/\s+(i skiver|i tykke skiver|i tynde skiver|i tern|i strimler|i halve|i både|i mindre stykker|i mindre buketter|på stilk|klippet i.*|delt i.*|skåret i.*)\b/gi, '');
                newName = newName.replace(/\b(hakket|finthakket|friskpresset|sammenpisket|smeltet|koldt|blødt|lunken|daggammelt|friske|frisk|god|ekstrafine|kold, færdiglavet|fintklippet|grofthakkede|tørret|tørrede|flydende|friskkværnet|ristet|ristede|kogt|knust|knuste)\s+/gi, '');
                newName = newName.replace(/\s+(\+ ekstra.*|til pynt|til pensling|til ristning|til stegning|til formen|til servering|fra dagen før)$/i, '');
                newName = newName.replace(/^(evt\.\s+|pynt:\s+|pynt med\s+|gem\s+)/i, '');
                
                // Clean up any remaining double spaces or trailing/leading stuff
                newName = newName.replace(/\s+/g, ' ').trim();
                
                // 4. Ental/Flertal (Simple rules for common words)
                if (newName.toLowerCase() === 'agurker') newName = 'agurk';
                if (newName.toLowerCase() === 'citroner') newName = 'citron';
                if (newName.toLowerCase() === 'rødløg i både') newName = 'rødløg'; // just in case
                if (newName.toLowerCase() === 'isterning') newName = 'isterninger';
                const n = newName.toLowerCase();
                
                // 1. Kategorisering (Simple keywords)
                if (n.match(/(husk|loppefrø|finax|glutenfri melmix)/i)) {
                    category = 'Diverse'; // Specifikt ønske om at lade disse to være i Diverse
                } else if (n.match(/(kikærter|chia|sennep|kulør)/i)) {
                    category = 'Kolonial';
                } else if (n.match(/(kål|salat|løg|tomat|æble|bær|frugt|kartofler|kartoffel|fennikel|asparges|chili|peberfrugt|urter|timian|basilikum|persille|dild|kørvel|purløg|mynte|salvie|estragon|koriander|rosmarin|svampe|champignon|majs|radise|squash|aubergine|citrus|lime|citron|appelsin|fersken|nektarin|dadler|ærter|bønner|linser|rucola|skovsyre|skud|broccolini|nød|nødder)/i)) {
                    category = 'Grønt';
                } else if (n.match(/(bacon|butterdej)/i)) {
                    category = 'Køl'; 
                } else if (n.match(/(ost|mælk|fløde|smør|creme fraiche|skyr|kvark|yoghurt|æg|ymer)$/i) || originalName.match(/(Arla|Cheasy|Puck|Jarlsberg|Castello)/i)) {
                    category = 'Mejeri';
                } else if (n.match(/(kylling|and|kalkun|gris|okse|kalv|hjerter|kød|pancetta|skinke|steak|revelsben|kotelet|fasan)$/i)) {
                    category = 'Slagter';
                } else if (n.match(/(laks|torsk|rødspætte|rejer|krabbe|fisk|rogn|ansjos|kammusling)$/i)) {
                    category = 'Fisk';
                } else if (n.match(/(brød|boller|ciabatta|brioche|flute|baguette)$/i)) {
                    category = 'Bager';
                } else if (n.match(/(mel|sukker|vanilje|bagepulver|gær|chokolade|kakao|sirup|honning|margarine|husblas)$/i)) {
                    category = 'Bagning';
                } else if (n.match(/(salt|peber|krydderi|karry|paprika|chili|fennikelfrø|nellike|kanel|kardemomme|chiliflage)$/i)) {
                    category = 'Krydderier';
                } else if (n.match(/(eddike|olie|sauce|dressing|fond|bouillon|nudler|pasta|ris|gryn|couscous|oliven|aioli|sirup|honning|kiks|bønner|ketchup|pesto|tapenade|tahin|spray|farin)$/i)) {
                    category = 'Kolonial';
                } else if (n.match(/(vand|isterninger|is)$/i)) {
                    category = 'Basis';
                }
                
                preview.push(`| ${originalName} | **${newName}** | ${category} |`);
            }
        }
    }
    
    let output = "# Forslag til Automatisk Kategorisering\n\n";
    output += "Her er et preview af, hvordan resten af listen vil blive behandlet baseret på mønstrene. Ordet i midten er det *rensede navn*, som det vil fremstå for kunden, og til højre er den valgte kategori.\n\n";
    output += "| Originalt Navn i Databasen | Nyt Renset Navn | Kategori |\n";
    output += "|---|---|---|\n";
    output += preview.join('\n');
    
    const outPath = 'C:\\Users\\birgi\\.gemini\\antigravity\\brain\\022f7582-d5ab-4f47-8508-71d318cfff35\\auto_categorized_list.md';
    fs.writeFileSync(outPath, output);
    console.log("Genererede auto_categorized_list.md");
}

run();
