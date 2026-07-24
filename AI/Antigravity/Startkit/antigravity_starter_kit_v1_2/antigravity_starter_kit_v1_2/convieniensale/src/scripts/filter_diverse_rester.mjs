import fs from 'fs';

const annotatedItems = [
    "Caesardressing S",
    "græskarkerner",
    "havredrik eller en anden plantedrik",
    "kakaopulver",
    "perlespelt",
    "tortilla",
    "nescafé",
    "pankorasp",
    "perlebyg",
    "pinjekerner",
    "pinjekerne",
    "rasp",
    "rasp i at vende bollerne",
    "sesamfrø",
    "sorte sesamfrø",
    "rosiner",
    "salsa",
    "skumfiduser",
    "sriracha mayonnaise",
    "store tortillaer",
    "syltet agurker",
    "syltet rødbede",
    "spaghetti af kvalitet",
    "træspyd",
    "vaniljesukker &",
    "vaniljestang",
    "tacokrydderi el. texmex blanding",
    "stødt gurkemeje",
    "natron",
    "løvstikke",
    "korn af 1 vaniljestang",
    "rålakrids",
    "kanelstænger",
    "hvid peberkorn",
    "hele nelliker",
    "garam masala",
    "rosa peberkorn",
    "5-peberblanding",
    "dobbelt sildefileter",
    "2 spsk andefedt",
    "FiberHUSK loppefrøskaller",
    "Finax Glutenfri Melmix",
    "fiskefrikadeller",
    "frilands griseslag med svær",
    "gedeoste",
    "frossen ært",
    "Fuldkorns tærtedej",
    "grillspyd",
    "grisenakkefilet ca. 1 kg",
    "hønsekødssuppe",
    "jalapeño",
    "kalkunbryster",
    "kalve T-bonesteaks",
    "Kalvebov",
    "kalvecuvette",
    "kalvespidsbryst",
    "karse",
    "knoldselleri",
    "tilberedt kyllingekød uden skind",
    "krabbeklo",
    "kullerfileter",
    "kyllingebrystfileter",
    "kyllingeinderfileter",
    "laksefileter",
    "laksefileter uden skind",
    "lammeculotter",
    "lammekoteletter",
    "lyse rosiner",
    "mango",
    "mangochutney",
    "marcipan",
    "marengs kys",
    "mascarpone",
    "nakkekoteletter",
    "okseculotte",
    "oksecuvette",
    "oksecuvette ca. 1 kg",
    "oksecuvetter",
    "oksemørbrad",
    "Oreo",
    "Oreo cookiecrumbles",
    "panerede fiskefileter",
    "pasteuriserede æggehvider",
    "pastinak"
];

function run() {
    const listPath = 'C:\\Users\\birgi\\.gemini\\antigravity\\brain\\022f7582-d5ab-4f47-8508-71d318cfff35\\diverse_rester.md';
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
            const match = line.match(/- \[ \] \*\*(.*?)\*\*$/) || line.match(/- \[ \] \*\*(.*?)\*\* /);
            if (match && match[1]) {
                const itemName = match[1].trim();
                const isAnnotated = annotatedItems.includes(itemName);
                
                if (isAnnotated) {
                    removedCount++;
                    continue; 
                }
            }
        }
        newLines.push(line);
    }
    
    fs.writeFileSync(listPath, newLines.join('\n'));
    console.log(`Fjernede ${removedCount} kommenterede varer fra diverse_rester.md.`);
}

run();
