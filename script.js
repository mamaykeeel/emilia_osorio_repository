// This is for the storing of the inventory items
let inventory = [];

// This is for the form
const inventoryForm = document.getElementById('inventoryForm');
const inventoryTableBody = document.getElementById('inventoryTableBody');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const clearFormBtn = document.getElementById('clearForm');
const totalItemsSpan = document.getElementById('totalItems');
const totalValueSpan = document.getElementById('totalValue');
const noItemsDiv = document.getElementById('noItems');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');

// This is for the notification
const notification = document.createElement('div');
notification.className = 'notification';
document.body.appendChild(notification);

// This is for the event listeners
inventoryForm.addEventListener('submit', handleFormSubmit);
searchInput.addEventListener('input', handleSearch);
sortSelect.addEventListener('change', handleSort);
clearFormBtn.addEventListener('click', clearForm);

// This is for the form submission handler
function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const item = {
        id: Date.now(),
        itemName: formData.get('itemName'),
        description: formData.get('description'),
        quantity: parseInt(formData.get('quantity')),
        unitPrice: parseFloat(formData.get('unitPrice'))
    };
    
    createItem(item);
    showNotification('Item added successfully!');
    clearForm();
}

// This is for the CRUD operations
function createItem(item) {
    inventory.push(item);
    updateInventoryDisplay();
}

function readItems() {
    return inventory;
}

function updateItem(id, updatedItem) {
    const index = inventory.findIndex(item => item.id === id);
    if (index !== -1) {
     
        const quantity = parseInt(updatedItem.quantity);
        const unitPrice = parseFloat(updatedItem.unitPrice);
        
    
        if (isNaN(quantity) || isNaN(unitPrice) || quantity <= 0 || unitPrice <= 0) {
            showNotification('Please enter valid quantity and price values', 'error');
            return;
        }
        
        const item = {
            ...inventory[index],
            ...updatedItem,
            quantity: quantity,
            unitPrice: unitPrice
        };
        inventory[index] = item;
        updateInventoryDisplay();
        showNotification('Item updated successfully!');
    }
}

function deleteItem(id) {
    inventory = inventory.filter(item => item.id !== id);
    updateInventoryDisplay();
    showNotification('Item deleted successfully!');
}

// This is for the rendering of the inventory table
function renderInventory(items = inventory) {
    inventoryTableBody.innerHTML = '';
    
    if (items.length === 0) {
        noItemsDiv.classList.remove('hidden');
        return;
    }
    
    noItemsDiv.classList.add('hidden');
    
    items.forEach(item => {
        const row = document.createElement('tr');
        const totalValue = item.quantity * item.unitPrice;
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">${item.itemName}</td>
            <td class="px-6 py-4 whitespace-nowrap">${item.description}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="${getQuantityStatusClass(item.quantity)}">
                    ${item.quantity}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">₱${item.unitPrice.toFixed(2)}</td>
            <td class="px-6 py-4 whitespace-nowrap">₱${totalValue.toFixed(2)}</td>
            <td class="px-6 py-4 whitespace-nowrap space-x-2">
                <button onclick="editItem(${item.id})" class="btn btn-edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteItem(${item.id})" class="btn btn-danger">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        inventoryTableBody.appendChild(row);
    });
    
    updateInventoryStats();
}

// This is for the edit item functionality
function editItem(id) {
    const item = inventory.find(item => item.id === id);
    if (!item) return;
    
    // This is for the populating of the form with the item data
    document.getElementById('itemName').value = item.itemName;
    document.getElementById('description').value = item.description;
    document.getElementById('quantity').value = item.quantity;
    document.getElementById('unitPrice').value = item.unitPrice;
    
    // This is for the changing of the form submit button text
    const submitButton = inventoryForm.querySelector('button[type="submit"]');
    submitButton.innerHTML = '<i class="fas fa-save mr-2"></i>Update Item';
    
    // Remove the old event listener
    inventoryForm.removeEventListener('submit', handleFormSubmit);
    
    // This is for the adding of the event listener for the form submission
    const updateHandler = (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const quantity = parseInt(formData.get('quantity'));
        const unitPrice = parseFloat(formData.get('unitPrice'));
        
    
        if (isNaN(quantity) || isNaN(unitPrice) || quantity <= 0 || unitPrice <= 0) {
            showNotification('Please enter valid quantity and price values', 'error');
            return;
        }
        
        const updatedItem = {
            id: id,
            itemName: formData.get('itemName'),
            description: formData.get('description'),
            quantity: quantity,
            unitPrice: unitPrice
        };
        
        updateItem(id, updatedItem);
        clearForm();
        
      
        inventoryForm.removeEventListener('submit', updateHandler);
        inventoryForm.addEventListener('submit', handleFormSubmit);
    };
    
    inventoryForm.addEventListener('submit', updateHandler);
}

// This is for the search functionality
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const filteredItems = inventory.filter(item => 
        item.itemName.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm)
    );
    renderInventory(filteredItems);
}

// This is for the sort functionality
function handleSort(e) {
    const sortBy = e.target.value;
    const sortedItems = [...inventory].sort((a, b) => {
        switch(sortBy) {
            case 'name':
                return a.itemName.localeCompare(b.itemName);
            case 'quantity':
                return b.quantity - a.quantity;
            case 'price':
                return b.unitPrice - a.unitPrice;
            default:
                return 0;
        }
    });
    renderInventory(sortedItems);
}

// This is for the clearing of the form
function clearForm() {
    inventoryForm.reset();
    const submitButton = inventoryForm.querySelector('button[type="submit"]');
    submitButton.innerHTML = '<i class="fas fa-plus mr-2"></i>Add Item';
}

// This is for the updating of the inventory statistics
function updateInventoryStats() {
    totalItemsSpan.textContent = inventory.length;
    const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    totalValueSpan.textContent = `₱${totalValue.toFixed(2)}`;
}

// This is for the getting of the quantity status class
function getQuantityStatusClass(quantity) {
    if (quantity <= 5) return 'status-low';    
    if (quantity <= 10) return 'status-medium'; 
    return 'status-high';                      
}

// This is for the toast notification
function showNotification(message, type = 'success') {
    // Create a new notification element each time
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Force a reflow to ensure the animation plays
    notification.offsetHeight;
    
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
        notification.classList.add('hide');
        setTimeout(() => {
            notification.remove(); // Remove the element from DOM after animation
        }, 300);
    }, 2000);
}

// This is for the updating of the inventory display
function updateInventoryDisplay() {
    renderInventory();
}

// This is for the initial render
renderInventory(); 