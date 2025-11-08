// --- Globalūs elementai ---
const productIDField = document.getElementById('product-id');                   // Nuoroda į 'Product Code' įvesties lauką
const productNameField = document.getElementById('product-name');               // Nuoroda į 'Product Name' įvesties lauką
const productQuantityField = document.getElementById('product-quantity');       // Nuoroda į 'Product Quantity' įvesties lauką
const insertNewBtn = document.getElementById('insert-new-btn');                 // Mygtukas 'Insert new'
const editItemBtn = document.getElementById('edit-item-btn');                   // Mygtukas 'Edit Item'
const deleteItemBtn = document.getElementById('delete-item-btn');               // Mygtukas 'Delete Item'
const editIdField = document.getElementById('edit-id-field');                   // Naudojamas formos būsenai valdyti
const messageArea = document.getElementById('message-area');                    // Vieta pranešimams vartotojui rodyti (klaidos/sėkmė)
const inventoryList = document.getElementById('inventory-list');                // Nuoroda į 'Inventory' <tbody>                
const cartList = document.getElementById('cart-list');                          // Nuoroda į Krepšelio lentelės <tbody>
const searchForm = document.getElementById('search-form');                      // Paieškos forma
const searchIDField = document.getElementById('search-id');                     // Paieškos laukas 'Product Code'
const selectFromLSBtn = document.getElementById('select-from-ls-btn');          // Mygtukas 'Select From LS' (nuoroda į formą)

// --- Pagrindinės Duomenų Funkcijos ---

function getInventory() {                                                       // Nuskaito duomenis iš LS, naudojant raktą 'inventory'.
    const data = localStorage.getItem('inventory');                             
    return data ? JSON.parse(data) : [];                                        // Grąžina JSON tekstą paverstą JavaScript masyvu arba tuščią masyvą, jei duomenų nėra.
}

function saveInventory(inventory) {                                             // Įrašo JavaScript masyvą atgal į localStorage, paversdamas jį JSON tekstu.
    localStorage.setItem('inventory', JSON.stringify(inventory));               
}

// --- Pagalbinės Funkcijos ---

function displayMessage(message, type = 'info') {
    messageArea.textContent = message;
    messageArea.className = `alert-${type}`;
    messageArea.style.display = 'block';
    // Rodo vartotojo pranešimus. Nustato tekstą ir stilių ('success', 'error', 'info').
    setTimeout(() => {
        messageArea.style.display = 'none';                                     // Paslepia pranešimą po 5 sekundžių.
    }, 5000);
}

function clearForm() {                                                          // Išvalo valdymo formos laukus.
    productIDField.value = ''; 
    productNameField.value = '';
    productQuantityField.value = '1';                                           
    productIDField.disabled = false;                                            // Atleidžia ID lauką, kad vėl būtų galima įvesti naują ID.                    
    editIdField.value = '';                                                     // Išvalo redagavimo būseną
}

function clearCartList() {                                                      // Išvalo Krepšelio lentelę ir parodo pranešimą, kad prekių nerasta.
    cartList.innerHTML = '<tr><td colspan="3">Nėra surastų prekių.</td></tr>';      
}

// --- Inventory Atvaizdavimas ---  

function renderInventory() {                                                    // Nuskaito visą prekių masyvą.
    const inventory = getInventory();
    inventoryList.innerHTML = ''; 

    if (inventory.length === 0) {                                               // Tikrina, ar sąrašas yra tuščias.
        inventoryList.innerHTML = '<tr><td colspan="4">Sąrašas yra tuščias.</td></tr>';
        return;
    }

    inventory.forEach(item => {                                                 // Ciklas per kiekvieną prekę, atvaizduojant ją lentelėje.
        const row = inventoryList.insertRow();
        row.insertCell().textContent = item.id;
        row.insertCell().textContent = item.name;
        row.insertCell().textContent = item.quantity;
        row.insertCell().textContent = "Pasirinkti";                            // Vizualinis veiksmo indikatorius, leidžiantis pasirinkti produktą.
        
        // Paspaudus eilutę, užpildoma forma koregavimui
        row.onclick = () => selectItemForEdit(item.id); 
    });
}

//5.1 tęsinys
// --- Prekės pasirinkimas ---

function selectItemForEdit(id) {                                                // Randa prekę masyve pagal ID.
    const inventory = getInventory();
    const itemToEdit = inventory.find(item => item.id === id);

    if (!itemToEdit) return displayMessage('Klaida: Prekė nerasta.', 'error');

    productIDField.value = itemToEdit.id;                                       // Užpildo Sandėlio formą duomenimis.
    productIDField.disabled = true;                                             // Neleidžia keisti ID redaguojant.
    productNameField.value = itemToEdit.name;
    productQuantityField.value = itemToEdit.quantity;
    
    editIdField.value = id;                                                     // Nustato redagavimo būseną

    displayMessage(`Pasirinkta prekė su ID: ${id} koregavimui.`, 'info');
}

// --- Koregavimas ---
function handleEdit() {                                                         // "Edit item" paspaudimo funkcija
    const id = productIDField.value.trim();
    const name = productNameField.value.trim();
    const quantity = productQuantityField.value.trim();
    const editingId = editIdField.value;

    if (!editingId) {                                                           // Tikrina, ar vartotojas pasirinko įrašą koregavimui.
        return displayMessage('Klaida: Pirmiausia pasirinkite įrašą iš lentelės.', 'error');
    }

    if (!name || !quantity) {
        return displayMessage('Klaida: Pavadinimas ir Kiekis negali būti tušti.', 'error');
    }

    let inventory = getInventory();
    let found = false;

    inventory = inventory.map(item => {                                        // Atnaujina prekės duomenis (Pavadinimą ir Kiekį) masyve.
        if (item.id === editingId) {
            found = true;
            return { id: item.id, name: name, quantity: quantity };
        }
        return item;
    });

    if (found) {                                                              // Išsaugo atnaujintą masyvą ir atnaujina lentelės atvaizdą.
        saveInventory(inventory);
        renderInventory();
        displayMessage(`Prekė su ID: ${id} sėkmingai atnaujinta.`, 'success');
        clearForm();
    } else {
         displayMessage('Klaida atnaujinant: Prekė nerasta.', 'error');
    }
}

// --- Trinimas ---

function handleDelete() {                                                   // "Delete item" paspaudimo funkcija
    const idToDelete = productIDField.value.trim();
    
    if (!idToDelete) {
        return displayMessage('Klaida: Įveskite ID į "Product Code" lauką arba pasirinkite eilutę trynimui.', 'error');
    }
    
    // Patvirtinimas
    if (!confirm(`Ar tikrai norite ištrinti prekę su ID: ${idToDelete} iš sandėlio?`)) return;

    let inventory = getInventory();
    const initialLength = inventory.length;
    
    inventory = inventory.filter(item => item.id !== idToDelete);          // Filtruoja masyvą, pašalindama prekę su nurodytu ID.

    if (inventory.length < initialLength) {                                // Išsaugo ir atnaujina abiejų lentelių atvaizdą.
        saveInventory(inventory);
        renderInventory();
        clearCartList(); 
        displayMessage(`Prekė su ID: ${idToDelete} sėkmingai ištrinta.`, 'success');
        clearForm();
    } else {                                                               // ID nerastas
        displayMessage(`Informacija: Prekė su ID: ${idToDelete} sandėlyje nerasta.`, 'info');
    }
}


// --- Naujo Įrašo Įrašymas ---

function handleInsertNew() {                                              // "Insert new" paspaudimo funkcija
    const id = productIDField.value.trim();
    const name = productNameField.value.trim();
    const quantity = productQuantityField.value.trim();

    if (editIdField.value) {                                             // Tikrina, ar vartotojas netyčia nebandė įrašyti būdamas redagavimo režime.
        return displayMessage('Klaida: Pirmiausia išvalykite formą arba spauskite "Edit Item".', 'error');
    }
    if (!id || !name || !quantity) {                                    // Laukų užpildymo validacija.
        return displayMessage('Klaida: Visi laukai privalo būti užpildyti.', 'error');
    }
    
    let inventory = getInventory();

    // ID unikalumo tikrinimas
    if (inventory.some(item => item.id === id)) {
        return displayMessage(`Klaida: Prekė su ID "${id}" jau egzistuoja.`, 'error');
    }

    const newItem = { id, name, quantity };                            // Sukuria ir įrašo naują įrašą.
    inventory.push(newItem);
    saveInventory(inventory);
    renderInventory();
    clearForm(); 
    displayMessage(`Nauja prekė "${name}" sėkmingai pridėta.`, 'success');
}


// --- 2. Paieška ir Krepšelio Atvaizdavimas ---

function renderCartItem(item) {                                       // Atvaizduoja rastą prekę Krepšelio lentelėje.
    cartList.innerHTML = '';
    const row = cartList.insertRow();
    row.insertCell().textContent = item.id;
    row.insertCell().textContent = item.name;
    row.insertCell().textContent = item.quantity;
}

function handleSearch(e) {
    e.preventDefault();
    const searchId = searchIDField.value.trim();

    if (!searchId) {
        clearCartList();
        return displayMessage('Klaida: Įveskite produkto ID paieškai.', 'error');
    }

    const inventory = getInventory();                               // Ieško prekės masyve pagal ID.
    const foundItem = inventory.find(item => item.id === searchId);

    if (foundItem) {
        renderCartItem(foundItem);
        displayMessage(`Prekė su ID: ${searchId} sėkmingai rasta.`, 'success');
    } else {
        clearCartList();
        displayMessage(`Informacija: Prekė su ID: ${searchId} nerasta.`, 'info');
    }
}

function handleSelectFromLS() {                                    // "Select from LS" paspaudimo funkcija
    const searchId = searchIDField.value.trim();
    if (searchId) {
        selectItemForEdit(searchId);                              // Naudoja paieškos ID, kad pasirinktų prekę Sandėlio formoje (įjungia redagavimo režimą).
        searchIDField.value = '';
    } else {
        displayMessage('Klaida: Pirmiausia įveskite ID į paieškos laukelį.', 'error');
    }
}


// --- Įvykių Klausytojai ir Inicializavimas ---

document.addEventListener('DOMContentLoaded', () => {             // Vykdo šias funkcijas, kai puslapis pilnai užsikrauna.
    renderInventory();
    clearCartList();
});

// Valdymo mygtukai
insertNewBtn.addEventListener('click', handleInsertNew);
editItemBtn.addEventListener('click', handleEdit);
deleteItemBtn.addEventListener('click', handleDelete);

// Paieškos mygtukai                                            // Priskiria funkcijas paieškos formai (submit reaguos ir į Enter klavišą) ir mygtukui.
searchForm.addEventListener('submit', handleSearch);
selectFromLSBtn.addEventListener('click', handleSelectFromLS);