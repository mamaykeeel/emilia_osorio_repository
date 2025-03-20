// This is for the storing of the inventory items
let inventory = JSON.parse(localStorage.getItem('inventory')) || [];

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
const unitPriceInput = document.getElementById('unitPrice');
const quantityInput = document.getElementById('quantity');

// This is for the notification
const notification = document.createElement('div');
notification.className = 'notification';
document.body.appendChild(notification);

// This is for the saving of the inventory to the localStorage
function saveInventory() {
    localStorage.setItem('inventory', JSON.stringify(inventory));
}

// This is for the validation of the unit price input
unitPriceInput.addEventListener('input', function(e) {
    // This is for the removing of the non-numeric characters except the decimal point
    let value = this.value.replace(/[^0-9.]/g, '');
    
    // This is for the ensuring of the only one decimal point
    const parts = value.split('.');
    if (parts.length > 2) {
        value = parts[0] + '.' + parts.slice(1).join('');
    }
    
 
    if (parts.length === 2) {
        parts[1] = parts[1].slice(0, 2);
        value = parts.join('.');
    }
    
    // This is for the updating of the input value
    this.value = value;
});

// This is for the validation of the quantity input
quantityInput.addEventListener('input', function(e) {

    let value = this.value.replace(/[^0-9]/g, '');
    
  
    this.value = value;
});

// This is for the event listeners
inventoryForm.addEventListener('submit', handleFormSubmit);
searchInput.addEventListener('input', handleSearch);
sortSelect.addEventListener('change', handleSort);
clearFormBtn.addEventListener('click', clearForm);

// This is for the form submission handler
function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const quantity = parseInt(formData.get('quantity'));
    const unitPrice = parseFloat(formData.get('unitPrice'));
    
    // This is for the validation of the numeric values
    if (isNaN(quantity) || isNaN(unitPrice) || quantity <= 0 || unitPrice <= 0) {
        showNotification('Please enter valid quantity and price values', 'error');
        return;
    }
    
    const item = {
        id: Date.now(),
        itemName: formData.get('itemName'),
        description: formData.get('description'),
        quantity: quantity,
        unitPrice: unitPrice
    };

    // This is for the showing of the add confirmation dialog
    showAddConfirmation(item);
}

// This is for the showing of the add confirmation dialog
function showAddConfirmation(item) {
    const totalValue = item.quantity * item.unitPrice;
    const dialog = document.createElement('div');
    dialog.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    dialog.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4 transform transition-all">
            <div class="text-center mb-6">
                <i class="fas fa-clipboard-check text-4xl text-blue-500 mb-4"></i>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Confirm Add Item</h3>
                <p class="text-sm text-gray-500">Please review the item details before adding:</p>
            </div>
            <div class="space-y-3 mb-6">
                <div class="flex justify-between">
                    <span class="text-gray-600">Item Name:</span>
                    <span class="font-medium">${item.itemName}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600">Description:</span>
                    <span class="font-medium">${item.description}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600">Quantity:</span>
                    <span class="font-medium">${item.quantity}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600">Unit Price:</span>
                    <span class="font-medium">₱${item.unitPrice.toFixed(2)}</span>
                </div>
                <div class="flex justify-between border-t pt-2">
                    <span class="text-gray-600">Total Value:</span>
                    <span class="font-medium">₱${totalValue.toFixed(2)}</span>
                </div>
            </div>
            <div class="flex justify-end space-x-3">
                <button class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500" onclick="this.closest('.fixed').remove()">
                    Cancel
                </button>
                <button class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" onclick="confirmAdd(${item.id}, this)">
                    Confirm Add
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(dialog);
}

// This is for the confirmation of the adding of the item
function confirmAdd(id, button) {
    const dialog = button.closest('.fixed');
    
    // This is for the getting of the item data from the form
    const formData = new FormData(inventoryForm);
    const item = {
        id: id,
        itemName: formData.get('itemName'),
        description: formData.get('description'),
        quantity: parseInt(formData.get('quantity')),
        unitPrice: parseFloat(formData.get('unitPrice'))
    };
    
    // This is for the adding of the item
    createItem(item);
    showNotification('Item added successfully!');
    clearForm();
    dialog.remove();
}

// This is for the CRUD operations
function createItem(item) {
    inventory.push(item);
    saveInventory(); // This is for the saving of the inventory to the localStorage
    updateInventoryDisplay();
}

function readItems() {
    return inventory;
}

function updateItem(id, updatedItem) {
    const index = inventory.findIndex(item => item.id === id);
    if (index !== -1) {
        // This is for the validation of the updated values
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
        saveInventory(); // This is for the saving of the inventory to the localStorage
        updateInventoryDisplay();
        showNotification('Item updated successfully!');
    }
}

function deleteItem(id) {
    const item = inventory.find(item => item.id === id);
    if (!item) return;

    // This is for the confirmation dialog
    const dialog = document.createElement('div');
    dialog.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    dialog.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4 transform transition-all">
            <div class="text-center">
                <i class="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Confirm Delete</h3>
                <p class="text-sm text-gray-500 mb-6">Are you sure you want to delete "${item.itemName}"?</p>
            </div>
            <div class="flex justify-end space-x-3">
                <button class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500" onclick="this.closest('.fixed').remove()">
                    Cancel
                </button>
                <button class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500" onclick="confirmDelete(${id}, this)">
                    Delete
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(dialog);
}

// Function to handle the actual deletion after confirmation
function confirmDelete(id, button) {
    const dialog = button.closest('.fixed');
    console.log('Before deletion - Items:', inventory.length);
    inventory = inventory.filter(item => item.id !== id);
    console.log('After deletion - Items:', inventory.length);
    saveInventory(); // Save to localStorage
    updateInventoryDisplay();
    showNotification('Item deleted successfully!');
    dialog.remove();
}

// This is for the rendering of the inventory table
function renderInventory(items = inventory) {
    inventoryTableBody.innerHTML = '';
    
    if (items.length === 0) {
        noItemsDiv.classList.remove('hidden');
        updateInventoryStats([]); // Update stats with empty array when no items
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
    
    updateInventoryStats(items);
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
    updateInventoryStats(filteredItems);
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
    updateInventoryStats(sortedItems);
}

// This is for the clearing of the form
function clearForm() {
    inventoryForm.reset();
    const submitButton = inventoryForm.querySelector('button[type="submit"]');
    submitButton.innerHTML = '<i class="fas fa-plus mr-2"></i>Add Item';
}

// This is for the updating of the inventory statistics
function updateInventoryStats(items = inventory) {
    console.log('Updating stats - Items:', items.length);
    totalItemsSpan.textContent = items.length;
    const totalValue = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    totalValueSpan.textContent = `₱${totalValue.toFixed(2)}`;
    console.log('Updated stats - Count:', items.length, 'Total Value:', totalValue);
}

// This is for the getting of the quantity status class
function getQuantityStatusClass(quantity) {
    if (quantity <= 5) return 'status-low';    
    if (quantity <= 10) return 'status-medium'; 
    return 'status-high';                      
}

// This is for the toast notification
function showNotification(message, type = 'success') {

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(notification);
    
   
    notification.offsetHeight;
    
  
    setTimeout(() => notification.classList.add('show'), 10);
    
  
    setTimeout(() => {
        notification.classList.remove('show');
        notification.classList.add('hide');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 2000);
}

// This is for the updating of the inventory display
function updateInventoryDisplay() {
    renderInventory();
}

// This is for the initial render
renderInventory(); 
