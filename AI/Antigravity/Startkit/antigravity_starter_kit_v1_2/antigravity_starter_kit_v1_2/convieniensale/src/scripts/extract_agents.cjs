const fs = require('fs');
const path = require('path');

const agentsDir = "C:\\Users\\birgi\\.gemini\\antigravity\\brain\\022f7582-d5ab-4f47-8508-71d318cfff35\\.agents\\agents";

let markdown = "# Agent Oversigt (AI-Team)\n\nHer er en komplet oversigt over de definerede agenter i projektet, deres roller og primære fokusområder.\n\n";

const dirs = fs.readdirSync(agentsDir).filter(f => fs.statSync(path.join(agentsDir, f)).isDirectory());

// Filtrér gamle test-agenter væk, fokuser på de rigtige navne
const mainAgents = dirs.filter(d => d[0] === d[0].toUpperCase());

for (const dir of mainAgents) {
    const agentFile = path.join(agentsDir, dir, 'agent.json');
    if (fs.existsSync(agentFile)) {
        try {
            const data = JSON.parse(fs.readFileSync(agentFile, 'utf8'));
            const role = data.role || data.Role || 'Ukendt Rolle';
            const focus = data.system_prompt || data.Prompt || data.description || '';
            
            // Extract the first line or a summary of the focus
            const shortFocus = focus.split('\n')[0].substring(0, 200);

            markdown += `## ${dir}\n`;
            markdown += `**Rolle:** ${role}\n\n`;
            markdown += `**Fokusområde / Beskrivelse:**\n${shortFocus}...\n\n---\n\n`;
        } catch(e) {
            console.error('Kunne ikke læse', agentFile);
        }
    }
}

const outPath = "C:\\Users\\birgi\\.gemini\\antigravity\\brain\\022f7582-d5ab-4f47-8508-71d318cfff35\\agent_overview.md";
fs.writeFileSync(outPath, markdown);
console.log('Markdown skrevet til', outPath);
