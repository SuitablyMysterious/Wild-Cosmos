const itemsLocation = "https://raw.githubusercontent.com/SuitablyMysterious/Wild-Cosmos/refs/heads/data/data/items.json";
const themesLocation = "https://raw.githubusercontent.com/SuitablyMysterious/Wild-Cosmos/refs/heads/data/data/themes.json";
const weaponsLocation = "https://raw.githubusercontent.com/SuitablyMysterious/Wild-Cosmos/refs/heads/data/data/weapons.json";
const templateLocation = "https://raw.githubusercontent.com/SuitablyMysterious/Wild-Cosmos/refs/heads/data/templates/template.html"

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
async function loadTemplate() {
    
}

window.loadThemes = loadThemes;
window.loadWeapons = loadWeapons;
window.loadItems = loadItems;