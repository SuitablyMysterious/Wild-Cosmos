// define where all required files from the data branch are located

const itemsLocation = "https://raw.githubusercontent.com/SuitablyMysterious/Wild-Cosmos/refs/heads/data/data/items.json";
const themesLocation = "https://raw.githubusercontent.com/SuitablyMysterious/Wild-Cosmos/refs/heads/data/data/themes.json";
const weaponsLocation = "https://raw.githubusercontent.com/SuitablyMysterious/Wild-Cosmos/refs/heads/data/data/weapons.json";
const templateLocation = "https://raw.githubusercontent.com/SuitablyMysterious/Wild-Cosmos/refs/heads/data/templates/template.html";
const cssLocation = "https://raw.githubusercontent.com/SuitablyMysterious/Wild-Cosmos/refs/heads/data/templates/template.css";


// functions to load json files

async function loadThemes() {
    const response = await fetch(themesLocation);
    return await response.json();
}
async function loadWeapons() {
    const response = await fetch(weaponsLocation);
    return await response.json();
}
async function loadItems() {
    const response = await fetch(itemsLocation);
    return await response.json();
}


// load template files

async function loadTemplate() {
    const response = await fetch(templateLocation);
    return await response.text();
}

async function loadCSS() {
    const response = await fetch(cssLocation);
    return await response.text();
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
    const availableItemNames = theme.availableItems ? 
        theme.availableItems.split(',').map(s => s.trim()) : [];
    const availableWeaponNames = theme.availableWeapons ? 
        theme.availableWeapons.split(',').map(s => s.trim()) : [];
    const themeWeapons = allWeapons.weapons.filter(w => 
        availableWeaponNames.includes(w.name)
    );
    const themeItems = allItems.items.filter(i => 
        availableItemNames.includes(i.name)
    );
    const parser = new DOMParser();
    const doc = parser.parseFromString(template, 'text/html');
    doc.title = theme.name;
    doc.getElementById('pageTitle').textContent = theme.name;
    doc.querySelector('h1').textContent = theme.name;
    const paragraphs = doc.querySelectorAll('p');
    paragraphs[0].textContent = theme.introduction;
    paragraphs[1].textContent = theme.contents;
    const weaponsTableBody = doc.querySelector('table tbody');
    weaponsTableBody.innerHTML = '';


    themeWeapons.forEach(weapon => {
        const row = doc.createElement('tr');
        row.innerHTML = `
            <td>${weapon.name}</td>
            <td>${weapon.rng}</td>
            <td>${weapon.atk}</td>
            <td>${weapon.pen}</td>
            <td>${weapon.str}</td>
            <td>${weapon.abilities}</td>
            <td>${weapon['⬓']}</td>
        `;
        weaponsTableBody.appendChild(row);
    });

    
    const itemsTableBody = doc.querySelector('#itemsTable tbody');
    itemsTableBody.innerHTML = '';
    themeItems.forEach(item => {
        const row = doc.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.abilities}</td>
        `;
        itemsTableBody.appendChild(row);
    });
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
    const theme = themesData.themes.find(t => t.name === themeName);
    
    if (!theme) {
        throw new Error(`Theme "${themeName}" not found`);
    }

    const html = await populateHTML(theme);
    
    if (format === 'html') {
        downloadHTML(html, `${themeName}.html`);
    } else {
        downloadPDF(html, `${themeName}.pdf`);
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