// This is for the storing of the inventory items
let inventory = JSON.parse(localStorage.getItem('inventory')) || [];

// This is for the form
const inventoryForm = document.getElementById('inventoryForm');
const inventoryTableBody = document.getElementById('inventoryTableBody');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const clearFormBtn = document.getElementById('clearForm');
const noItemsDiv = document.getElementById('noItems');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');
const unitPriceInput = document.getElementById('unitPrice');
const quantityInput = document.getElementById('quantity');

// This is for the notification
const notification = document.createElement('div');
notification.className = 'notification';
document.body.appendChild(notification);

// Add these variables at the top with your other declarations
const updateModal = document.getElementById('updateModal');
const updateForm = document.getElementById('updateForm');
const closeUpdateModal = document.getElementById('closeUpdateModal');
const cancelUpdate = document.getElementById('cancelUpdate');

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
    updateDashboard(); // Add this to update dashboard immediately
}

function readItems() {
    return inventory;
}

function updateItem(id, updatedItem) {
    const index = inventory.findIndex(item => item.id === id);
    if (index !== -1) {
        // Validate the updated values
        const quantity = parseInt(updatedItem.quantity);
        const unitPrice = parseFloat(updatedItem.unitPrice);
        
        if (isNaN(quantity) || isNaN(unitPrice) || quantity <= 0 || unitPrice <= 0) {
            showNotification('Please enter valid quantity and price values', 'error');
            return false; // Return false to indicate update failed
        }
        
        // If validation passes, update the item
        const item = {
            ...inventory[index],
            ...updatedItem,
            quantity: quantity,
            unitPrice: unitPrice
        };
        inventory[index] = item;
        saveInventory();
        updateInventoryDisplay();
        updateDashboard();
        showNotification('Item updated successfully!', 'success');
        return true; // Return true to indicate update succeeded
    }
    return false;
}

// Function to delete an item
function deleteItem(id) {
    const item = inventory.find(item => item.id === id);
    if (!item) return;

    Swal.fire({
        title: 'Delete Item?',
        text: `Are you sure you want to delete "${item.itemName}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            // Remove the item from inventory
            inventory = inventory.filter(i => i.id !== id);
            saveInventory();
            updateInventoryDisplay();
            updateDashboard();

            // Show success message
            Swal.fire({
                title: 'Deleted!',
                text: 'Item has been deleted successfully.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
        }
    });
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

// Function to show modal
function showModal() {
    updateModal.classList.remove('hidden');
    updateModal.classList.add('flex');
    document.body.style.overflow = 'hidden';
}

// Function to hide modal
function hideModal() {
    updateModal.classList.add('hidden');
    updateModal.classList.remove('flex');
    document.body.style.overflow = '';
    updateForm.removeEventListener('submit', updateHandler);
}

// Update the editItem function
function editItem(id) {
    const item = inventory.find(item => item.id === id);
    if (!item) return;
    
    // Populate the update form
    document.getElementById('updateItemName').value = item.itemName;
    document.getElementById('updateDescription').value = item.description;
    document.getElementById('updateQuantity').value = item.quantity;
    document.getElementById('updateUnitPrice').value = item.unitPrice;
    
    // Show the modal
    showModal();
    
    // Update handler function
    const updateHandler = (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const updatedItem = {
            id: id,
            itemName: formData.get('itemName'),
            description: formData.get('description'),
            quantity: parseInt(formData.get('quantity')),
            unitPrice: parseFloat(formData.get('unitPrice'))
        };
        
        if (updateItem(id, updatedItem)) {
            hideModal();
            showNotification('Item updated successfully!', 'success');
        }
    };
    
    // Add event listener for form submission
    updateForm.addEventListener('submit', updateHandler);
}

// Add event listeners for modal controls
closeUpdateModal.addEventListener('click', hideModal);
cancelUpdate.addEventListener('click', hideModal);

// Close modal when clicking outside
updateModal.addEventListener('click', (e) => {
    if (e.target === updateModal) {
        hideModal();
    }
});

// Close modal on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !updateModal.classList.contains('hidden')) {
        hideModal();
    }
});

// This is for the search functionality
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const filteredItems = inventory.filter(item => 
        item.itemName.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm)
    );
    renderInventory(filteredItems);
    updateInventoryStats(filteredItems);
    updateDashboard(); // Add this to update dashboard with filtered data
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
    updateDashboard(); // Add this to update dashboard with sorted data
}

// This is for the clearing of the form
function clearForm() {
    inventoryForm.reset();
    const submitButton = inventoryForm.querySelector('button[type="submit"]');
    submitButton.innerHTML = '<i class="fas fa-plus mr-2"></i>Add Item';
}

// This is for the updating of the inventory statistics
function updateInventoryStats(items = inventory) {
    // Remove references to removed elements but keep the calculation logic
    // for other parts of the application that might need it
    const totalValue = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    return { totalItems: items.length, totalValue }; // Return values for other functions that might need them
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
    updateDashboard(); // Add this to ensure dashboard updates with inventory changes
}

// Dashboard Analytics
function updateDashboard() {
    // Update total items
    const totalItems = inventory.length;
    document.getElementById('dashboardTotalItems').textContent = totalItems;
    
    // Update total value
    const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    document.getElementById('dashboardTotalValue').textContent = `₱${totalValue.toFixed(2)}`;
    
    // Update low stock items (items with quantity < 10)
    const lowStock = inventory.filter(item => item.quantity < 10).length;
    document.getElementById('lowStockItems').textContent = lowStock;
    
    // Update average item value
    const avgValue = totalItems > 0 ? totalValue / totalItems : 0;
    document.getElementById('avgItemValue').textContent = `₱${avgValue.toFixed(2)}`;

    // Update charts
    updateCharts(inventory);
}

// Initialize and update charts
function updateCharts(inventory) {
    // Value Distribution Chart
    const valueCtx = document.getElementById('valueDistributionChart').getContext('2d');
    if (window.valueChart) window.valueChart.destroy();
    
    const valueData = inventory.map(item => ({
        name: item.itemName,
        value: item.quantity * item.unitPrice
    })).sort((a, b) => b.value - a.value).slice(0, 5);

    window.valueChart = new Chart(valueCtx, {
        type: 'doughnut',
        data: {
            labels: valueData.map(item => item.name),
            datasets: [{
                data: valueData.map(item => item.value),
                backgroundColor: [
                    '#3B82F6',
                    '#10B981',
                    '#F59E0B',
                    '#6366F1',
                    '#EC4899'
                ]
            }]
        },
        options: {
            responsive: true,
            animation: {
                duration: 750, // Add smooth animation
                easing: 'easeInOutQuart'
            },
            plugins: {
                legend: {
                    position: 'bottom'
                },
                title: {
                    display: true,
                    text: 'Top 5 Items by Value'
                }
            }
        }
    });

    // Stock Level Chart
    const stockCtx = document.getElementById('stockLevelChart').getContext('2d');
    if (window.stockChart) window.stockChart.destroy();

    const stockData = inventory.map(item => ({
        name: item.itemName,
        quantity: item.quantity
    })).sort((a, b) => b.quantity - a.quantity).slice(0, 5);

    window.stockChart = new Chart(stockCtx, {
        type: 'bar',
        data: {
            labels: stockData.map(item => item.name),
            datasets: [{
                label: 'Quantity',
                data: stockData.map(item => item.quantity),
                backgroundColor: '#3B82F6',
                borderColor: '#2563EB',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            animation: {
                duration: 750, // Add smooth animation
                easing: 'easeInOutQuart'
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Top 5 Items by Quantity'
                }
            }
        }
    });
}

// This is for the initial render
renderInventory();
updateDashboard(); // Initialize dashboard on page load
