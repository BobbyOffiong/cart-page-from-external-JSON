//HEADER FUNCTION
function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    navLinks.classList.toggle('show');
}

const apiEndpoint = "https://cdn.shopify.com/s/files/1/0883/2188/4479/files/apiCartData.json?v=1728384889"; // Replace with your JSON file URL
let cartItems = []; // Local state for cart items
let itemToRemove = null; // Store item to remove for modal confirmation

// Helper function to format prices with commas
function formatPrice(price, useIndianFormat = false) {
    const locale = useIndianFormat ? "en-IN" : "en-US";
    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
    }).format(price / 100);
}

async function fetchCartData() {
    const loader = document.querySelector("#loader");
    loader.classList.remove("hidden");

    try {
        const response = await fetch(apiEndpoint);
        if (!response.ok) {
            throw new Error("Failed to fetch cart data");
        }

        const data = await response.json();

        if (!Array.isArray(data.items)) {
            throw new Error("Invalid cart data format");
        }

        cartItems = data.items;
        renderCartItems(cartItems);
        updateCartTotals(cartItems);
    } catch (error) {
        console.error("Error fetching cart data:", error);
    } finally {
        loader.classList.add("hidden");
    }
}

function renderCartItems(items) {
    const cartItemsTableBody = document.querySelector("#cart-items .cart-table tbody");
    cartItemsTableBody.innerHTML = "";

    items.forEach((item) => {
        const formattedPrice = formatPrice(item.price);
        const subtotal = formatPrice(item.price * item.quantity);

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>
                <div class="cart-product-details">
                    <img src="${item.image}" alt="${item.title}" />
                    <span class="cart-product-name">${item.title}</span>
                </div>
            </td>
            <td class="product-price">${formattedPrice}</td>
            <td>
                <input type="number" min="1" value="${item.quantity}" class="cart-quantity-input" data-id="${item.id}" />
            </td>
            <td>
                ${subtotal}
                <span class="cart-remove-btn remove-item-btn" data-id="${item.id}"><i class="fa-solid fa-trash"></i></span>
            </td>
        `;
        cartItemsTableBody.appendChild(row);
    });

    addCartEventListeners();
}

function formatPrice(price) {
    return `Rs. ${Number(price / 100).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

function updateCartTotals(items) {
    const subtotalElement = document.querySelector("#cart-subtotal");
    const totalElement = document.querySelector("#cart-total");

    let subtotal = 0;

    items.forEach((item) => {
        subtotal += item.price * item.quantity;
    });

    const formattedSubtotal = formatPrice(subtotal);
    subtotalElement.textContent = formattedSubtotal;
    totalElement.textContent = formattedSubtotal;
}

// Update the click event listener for remove buttons
function addCartEventListeners() {
    // Handle Remove Item Buttons
    document.querySelectorAll(".remove-item-btn").forEach((button) => {
        button.addEventListener("click", (event) => {
            const itemId = parseInt(button.dataset.id); // Get the item ID from the dataset
            itemToRemove = itemId; // Store the ID of the item to be removed
            showRemoveConfirmation(); // Show confirmation modal
        });
    });

     // Handle Quantity Change
     document.querySelectorAll(".cart-quantity-input").forEach((input) => {
        input.addEventListener("change", (event) => {
            const newQuantity = Math.max(1, parseInt(input.value));
            const itemId = parseInt(input.dataset.id);

            const item = cartItems.find((item) => item.id === itemId);
            if (item) {
                item.quantity = newQuantity;
            }

            renderCartItems(cartItems);
            updateCartTotals(cartItems);
        });
    });
}

// Function to show the confirmation modal
function showRemoveConfirmation() {
    const modal = document.getElementById("remove-confirmation-modal");
    modal.style.display = "flex";

    const confirmButton = document.getElementById("confirm-remove");
    const cancelButton = document.getElementById("cancel-remove");

    confirmButton.onclick = () => {
        if (itemToRemove !== null) {
            // Remove the item with the matching ID from the cartItems array
            cartItems = cartItems.filter((item) => item.id !== itemToRemove);

            // Re-render the cart items and update totals
            renderCartItems(cartItems);
            updateCartTotals(cartItems);

            // Reset itemToRemove
            itemToRemove = null;
        }
        modal.style.display = "none"; // Hide modal
    };

    cancelButton.onclick = () => {
        modal.style.display = "none"; // Hide modal without removing the item
        itemToRemove = null; // Reset itemToRemove
    };

    // Close modal when clicking outside the content
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
            itemToRemove = null; // Reset itemToRemove
        }
    };
}



document.addEventListener("DOMContentLoaded", fetchCartData);


