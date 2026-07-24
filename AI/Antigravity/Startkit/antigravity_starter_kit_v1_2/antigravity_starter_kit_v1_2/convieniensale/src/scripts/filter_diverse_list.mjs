import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const annotatedItems = [
    "& ærteskud",
    "1 helt fed hvidløg i fed",
    "1/2 rødkål",
    "2 tsk finthakket friske chilier",
    "800 g grisehjerter",
    "æblecidereddike",
    "æbler",
    "æggeblomme",
    "æggeblomme til pensling",
    "æggeblommer",
    "ægnudler",
    "ænder",
    "ært",
    "ærter i bælg",
    "ærteskud",
    "agurk i skiver",
    "agurk i strimler",
    "agurker",
    "aioli",
    "akaciehonning",
    "allround krydderi",
    "ansjosfileter",
    "appelsiner",
    "appelsiner eller blodappelsiner delt i filetter",
    "ark filodej",
    "Arla Buko® Økologisk naturel 70+",
    "Arla Buko® Pikant",
    "Arla Karolines Køkken® Hytteost 4%",
    "Arla Karolines Køkken® Klassisk Salatost i tern",
    "Arla Karolines Køkken® Madlavningsfløde 15%",
    "Arla Karolines Køkken® Piskefløde 38%",
    "Arla® Laktosefri piskefløde 36%",
    "Arla® ØKO letmælk",
    "Cheasy® skyr naturel",
    "creme fraiche 38%",
    "flødeost",
    "flødeost naturel",
    "friske gedeoste",
    "friske gedeoste i saltlage",
    "friske gedeoste rulle",
    "Jarlsberg® Revet",
    "kærnemælk",
    "kvark, 0,3% rørt op med",
    "lagret cheddarost",
    "lunken sødmælk",
    "økologisk creme fraiche 9%",
    "piskefløde",
    "Puck® salatost i blok",
    "revet mozzarellaost",
    "ricotta",
    "rygeost",
    "sødmælk"
];

function run() {
    const listPath = 'C:\\Users\\birgi\\.gemini\\antigravity\\brain\\022f7582-d5ab-4f47-8508-71d318cfff35\\diverse_kategori_liste.md';
    
    if (!fs.existsSync(listPath)) {
        console.error("Filen findes ikke!");
        return;
    }
    
    const content = fs.readFileSync(listPath, 'utf8');
    const lines = content.split('\n');
    const newLines = [];
    
    let removedCount = 0;
    
    for (const line of lines) {
        if (line.startsWith('- [ ] **')) {
            const match = line.match(/- \[ \] \*\*(.*?)\*\* ->/);
            if (match && match[1]) {
                const itemName = match[1].trim();
                // Check if this item is in the annotatedItems list (exact match or very close)
                const isAnnotated = annotatedItems.includes(itemName);
                
                if (isAnnotated) {
                    removedCount++;
                    continue; // Skip this line
                }
            }
        }
        newLines.push(line);
    }
    
    fs.writeFileSync(listPath, newLines.join('\n'));
    console.log(`Fjernede ${removedCount} kommenterede varer fra listen.`);
}

run();
