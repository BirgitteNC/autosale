import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const annotatedItems = [
    "æbleeddike", "auberginer", "babysalatblade", "bakke blåbær", "bakke rucolasalat", 
    "banan i skiver", "blåbær", "Bladsselleri", "blandede salatblade", "blomkål", 
    "blomkål i mindre buketter", "blommetomater", "brombær", "ca. 250 g romainesalat", 
    "champignoner", "cherrytomater", "cherrytomater på stilk, klippet i små klaser", 
    "citroner  i tykke skiver", "citronsaft", "citronskal", "clementiner", "dadler", 
    "enokisvampe", "fennikler skåret i tynde strimler", "ferskner eller nektariner", 
    "finthakket grønkål", "finthakket estragonblade", "finthakkede skalotteløg", 
    "finthakkede tørrede æbler", "friske hindbær", "friske krusemynteblade", 
    "friske løvstikkeblade", "friske majskolber", "friske myntekviste", 
    "friske Santa Maria Green Jalapeño", "friske timianblade", "friskpresset appelsinsaft", 
    "friskpresset citronsaft", "friskpresset clementinsaft", "friskpresset limesaft", 
    "græskar", "granatæblekerne", "granatæblekerner", "grøn chilipeber", "guldborg æbler", 
    "hakket citrongræs", "hakket estragonblade", "hakket græskarkerner", "hakket kruspersille", 
    "hakket kyllingekød", "håndfuld ærteskud", "haricots verts", "hindbær", "hjertesalat"
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
    console.log(`Fjernede ${removedCount} kommenterede varer fra listen i runde 2.`);
}

run();
