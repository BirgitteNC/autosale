fetch('https://meny.dk/opskrifter')
    .then(r => r.text())
    .then(t => {
        const matches = t.match(/\d+[\.,]?\d*\s+opskrifter/gi);
        if (matches) {
            console.log("Fandt antal:", matches);
        } else {
            console.log("Fandt ikke 'X opskrifter' tekst på siden.");
        }
    });
