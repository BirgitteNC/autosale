import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function analyzeLog() {
    const logPath = path.join(__dirname, '../aendringslog.txt');
    if (!fs.existsSync(logPath)) {
        console.error("Filen aendringslog.txt blev ikke fundet.");
        return;
    }

    const content = fs.readFileSync(logPath, 'utf8');
    const lines = content.split('\n');

    let currentRecipe = '';
    const failedRecipes = [];
    const unmatchedIngredients = new Set();

    for (let line of lines) {
        line = line.trim();
        if (line.startsWith('OPSKRIFT: ')) {
            currentRecipe = line.substring(10).trim();
        } else if (line.startsWith('FEJL: ')) {
            failedRecipes.push({ recipe: currentRecipe, error: line.substring(6).trim() });
        } else if (line.startsWith('INGEN MATCH: ')) {
            const ingredient = line.substring(13).trim();
            unmatchedIngredients.add(ingredient);
        }
    }

    console.log("=== ANALYSE AF ÆNDRINGSLOG ===");
    console.log(`\nAntal opskrifter med fejl (kunne ikke hentes): ${failedRecipes.length}`);
    failedRecipes.forEach(f => console.log(` - ${f.recipe}: ${f.error}`));

    const unmatchedArr = Array.from(unmatchedIngredients).sort();
    console.log(`\nAntal unikke ingredienser med 'INGEN MATCH': ${unmatchedArr.length}`);
    console.log("Top 10 unikke u-matchede ingredienser (viser alle, hvis færre):");
    unmatchedArr.slice(0, 10).forEach(i => console.log(` - ${i}`));
}

analyzeLog();
