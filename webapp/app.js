// define where all required files from the data branch are located

const itemsLocation = "https://raw.githubusercontent.com/SuitablyMysterious/Wild-Cosmos/refs/heads/data/data/items.json";
const themesLocation = "https://raw.githubusercontent.com/SuitablyMysterious/Wild-Cosmos/refs/heads/data/data/themes.json";
const weaponsLocation = "https://raw.githubusercontent.com/SuitablyMysterious/Wild-Cosmos/refs/heads/data/data/weapons.json";
const templateLocation = "https://raw.githubusercontent.com/SuitablyMysterious/Wild-Cosmos/refs/heads/data/templates/template.html";
const cssLocation = "https://raw.githubusercontent.com/SuitablyMysterious/Wild-Cosmos/refs/heads/data/templates/template.css";


// functions to load json files

async function loadThemes() {
    try {
        const response = await fetch(themesLocation);
        if (!response.ok) {
            throw new Error(`Failed to load themes (status ${response.status})`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error loading themes data:", error);
        throw new Error("Could not load themes data. Please try again later.");
    }
}
async function loadWeapons() {
    try {
        const response = await fetch(weaponsLocation);
        if (!response.ok) {
            throw new Error(`Failed to load weapons (status ${response.status})`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error loading weapons data:", error);
        throw new Error("Could not load weapons data. Please try again later.");
    }
}
async function loadItems() {
    try {
        const response = await fetch(itemsLocation);
        if (!response.ok) {
            throw new Error(`Failed to load items (status ${response.status})`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error loading items data:", error);
        throw new Error("Could not load items data. Please try again later.");
    }
}


// load template files

async function loadTemplate() {
    try {
        const response = await fetch(templateLocation);
        if (!response.ok) {
            throw new Error(`Failed to load HTML template (status ${response.status})`);
        }
        return await response.text();
    } catch (error) {
        console.error("Error loading HTML template:", error);
        throw new Error("Could not load the HTML template. Please try again later.");
    }
}

async function loadCSS() {
    try {
        const response = await fetch(cssLocation);
        if (!response.ok) {
            throw new Error(`Failed to load CSS (status ${response.status})`);
        }
        return await response.text();
    } catch (error) {
        console.error("Error loading CSS:", error);
        throw new Error("Could not load the CSS. Please try again later.");
    }
}


// returns theme names to populate dropdown

async function getThemeNames() {
    const themesData = await loadThemes();
    const themes = themesData && themesData.themes ? themesData.themes : [];
    return themes.map(t => t.name);
}


// function to populate HTML template with theme data

async function populateHTML(theme) {
    const [template, allWeapons, allItems, css] = await Promise.all([
        loadTemplate(),
        loadWeapons(),
        loadItems(),
        loadCSS()
    ]);
    const availableItemsRaw = theme.availableItems || theme.available_items || '';
    const availableItemNames = availableItemsRaw
        ? availableItemsRaw.split(',').map(s => s.trim())
        : [];
    const availableWeaponsRaw = theme.availableWeapons || theme.available_weapons || '';
    const availableWeaponNames = availableWeaponsRaw
        ? availableWeaponsRaw.split(',').map(s => s.trim())
        : [];
    const weaponsList = allWeapons && Array.isArray(allWeapons.weapons) ? allWeapons.weapons : [];
    const itemsList = allItems && Array.isArray(allItems.items) ? allItems.items : [];
    const themeWeapons = weaponsList.filter(w => 
        availableWeaponNames.includes(w.name)
    );
    const themeItems = itemsList.filter(i => 
        availableItemNames.includes(i.name)
    );
    const parser = new DOMParser();
    const doc = parser.parseFromString(template, 'text/html');
    doc.title = theme.name;
    
    const pageTitle = doc.getElementById('pageTitle');
    if (pageTitle) pageTitle.textContent = theme.name;
    
    const h1 = doc.querySelector('h1');
    if (h1) h1.textContent = theme.name;
    
    const paragraphs = doc.querySelectorAll('p');
    if (paragraphs[0]) paragraphs[0].textContent = theme.introduction;
    if (paragraphs[1]) paragraphs[1].textContent = theme.contents;
    
    const weaponsTableBody = doc.querySelector('table tbody');
    if (weaponsTableBody) {
        weaponsTableBody.innerHTML = '';

    themeWeapons.forEach(weapon => {
        const row = doc.createElement('tr');
        const cells = [
            weapon.name,
            weapon.rng,
            weapon.atk,
            weapon.pen,
            weapon.str,
            weapon.abilities,
            weapon['⬓']
        ];
        cells.forEach(cellContent => {
            const td = doc.createElement('td');
            td.textContent = cellContent;
            row.appendChild(td);
        });
        weaponsTableBody.appendChild(row);
    });
    }

    
    const itemsTableBody = doc.querySelector('#itemsTable tbody');
    if (itemsTableBody) {
        itemsTableBody.innerHTML = '';
        themeItems.forEach(item => {
            const row = doc.createElement('tr');
            const cells = [item.name, item.abilities];
            cells.forEach(cellContent => {
                const td = doc.createElement('td');
                td.textContent = cellContent;
                row.appendChild(td);
            });
            itemsTableBody.appendChild(row);
        });
    }
    const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${theme.name}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Palanquin+Dark:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
${css}
    </style>
</head>
${doc.body.outerHTML}
</html>`;

    return fullHTML;
}




function downloadHTML(html, filename) {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}




async function downloadPDF(html, filename) {
    // Create a temporary container
    const container = document.createElement('div');
    container.innerHTML = html;
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    document.body.appendChild(container);

    // Configure html2pdf options
    const opt = {
        margin: 10,
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Generate PDF
    await html2pdf().set(opt).from(container).save();

    // Clean up
    document.body.removeChild(container);
}




async function generateThemeDocument(themeName, format = 'pdf') {
    const themesData = await loadThemes();

    if (!themesData || !Array.isArray(themesData.themes)) {
        throw new Error('Failed to load themes data');
    }
    
    const theme = themesData.themes.find(t => t.name === themeName);
    
    if (!theme) {
        throw new Error(`Theme "${themeName}" not found`);
    }

    const html = await populateHTML(theme);
    
    if (format === 'html') {
        downloadHTML(html, `${themeName}.html`);
    } else {
        try {
            await downloadPDF(html, `${themeName}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            throw new Error('Failed to generate PDF. Please try again.');
        }
    }
}


// export functions

window.loadThemes = loadThemes;
window.getThemeNames = getThemeNames;
window.loadWeapons = loadWeapons;
window.loadItems = loadItems;
window.populateHTML = populateHTML;
window.generateThemeDocument = generateThemeDocument;
window.downloadHTML = downloadHTML;
window.downloadPDF = downloadPDF;