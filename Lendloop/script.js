

let items = JSON.parse(localStorage.getItem("lendloopItems")) || [];

let requests = JSON.parse(localStorage.getItem("lendloopRequests")) || [];

let student = localStorage.getItem("lendloopStudent") || "Sumit Pandey";

let selectedCategory = "All";



if (items.length === 0) {

    items = [
        {
            id: 101,
            name: "Engineering Drawing Kit",
            category: "Study Items",
            description: "Drawing instruments for engineering students.",
            owner: "Aditi Sharma",
            available: true
        },
        {
            id: 102,
            name: "Engineering Mathematics Book",
            category: "Books",
            description: "Useful mathematics textbook for students.",
            owner: "Rahul Verma",
            available: true
        },
        {
            id: 103,
            name: "Scientific Calculator",
            category: "Electronics",
            description: "Scientific calculator for academic use.",
            owner: "Priya Singh",
            available: true
        },
        {
            id: 104,
            name: "Badminton Racket",
            category: "Sports",
            description: "Badminton racket available for borrowing.",
            owner: "Aman Gupta",
            available: true
        }
    ];

    localStorage.setItem("lendloopItems", JSON.stringify(items));
}



function saveData() {

    localStorage.setItem("lendloopItems", JSON.stringify(items));

    localStorage.setItem("lendloopRequests", JSON.stringify(requests));

    localStorage.setItem("lendloopStudent", student);
}



function safeText(value) {
    return String(value).replace(/[&<>"']/g, function(character) {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[character];
    });
}


function displayProfile() {

    document.getElementById("studentName").value = student;
}



document.getElementById("profileForm").addEventListener("submit", function(event) {

    event.preventDefault();

    let name = document.getElementById("studentName").value.trim();

    if (name === "") {
        return;
    }

    student = name;

    saveData();

    displayItems();

    displayRequests();

    updateDashboard();

    document.getElementById("profileMessage").textContent =
        "Profile name saved successfully.";
});



function displayItems() {

    let itemList = document.getElementById("itemList");

    let search = document.getElementById("searchInput").value.toLowerCase();

    itemList.innerHTML = "";

    let filteredItems = items.filter(function(item) {

        let matchesSearch =
            item.name.toLowerCase().includes(search) ||
            item.description.toLowerCase().includes(search);

        let matchesCategory =
            selectedCategory === "All" ||
            item.category === selectedCategory;

        return item.available && matchesSearch && matchesCategory;

    });

    filteredItems.forEach(function(item) {

        let card = document.createElement("div");

        card.className = "item-card";

        let buttonHTML = "";

        if (item.owner === student) {

            buttonHTML = `
                <button class="danger-button"
                    onclick="deleteItem(${item.id})">
                    Delete My Item
                </button>
            `;

        } else {

            buttonHTML = `
                <button class="button"
                    onclick="sendRequest(${item.id})">
                    Request to Borrow
                </button>
            `;

        }

        card.innerHTML = `
            <p class="item-category">${safeText(item.category)}</p>
            <h3>${safeText(item.name)}</h3>
            <p>${safeText(item.description)}</p>
            <p class="item-owner">Listed by: ${safeText(item.owner)}</p>
            ${buttonHTML}
        `;

        itemList.appendChild(card);

    });

    document.getElementById("emptyItems").textContent =
        filteredItems.length === 0 ? "No available items found." : "";

    updateDashboard();
}



document.getElementById("searchInput").addEventListener("input", function() {

    displayItems();

});



document.querySelectorAll(".category-button").forEach(function(button) {

    button.addEventListener("click", function() {

        selectedCategory = button.dataset.category;

        document.querySelectorAll(".category-button").forEach(function(btn) {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        displayItems();

    });

});


document.getElementById("itemForm").addEventListener("submit", function(event) {

    event.preventDefault();

    let name = document.getElementById("itemName").value.trim();

    let category = document.getElementById("itemCategory").value;

    let description = document.getElementById("itemDescription").value.trim();

    if (!name || !category || !description) {
        return;
    }

    let newItem = {

        id: Date.now(),

        name: name,

        category: category,

        description: description,

        owner: student,

        available: true

    };

    items.push(newItem);

    saveData();

    displayItems();

    document.getElementById("itemForm").reset();

    alert("Your item has been listed successfully!");

});



function deleteItem(id) {

    let item = items.find(function(item) {
        return item.id === id;
    });

    if (!item || item.owner !== student) {
        return;
    }

    let hasActiveRequest = requests.some(function(request) {
        return request.itemId === id &&
            (request.status === "Pending" || request.status === "Borrowed");
    });

    if (hasActiveRequest) {
        alert("You cannot delete an item with an active request.");
        return;
    }

    items = items.filter(function(item) {
        return item.id !== id;
    });

    saveData();

    displayItems();

}



function sendRequest(itemId) {

    let item = items.find(function(item) {
        return item.id === itemId;
    });

    if (!item || !item.available) {
        alert("This item is not available.");
        return;
    }

    if (item.owner === student) {
        alert("You cannot borrow your own item.");
        return;
    }

    let alreadyRequested = requests.some(function(request) {

        return request.itemId === itemId &&
            request.borrower === student &&
            request.status !== "Returned" &&
            request.status !== "Rejected";

    });

    if (alreadyRequested) {
        alert("You already have an active request for this item.");
        return;
    }

    let newRequest = {

        id: Date.now(),

        itemId: item.id,

        itemName: item.name,

        owner: item.owner,

        borrower: student,

        status: "Pending"

    };

    requests.push(newRequest);

    saveData();

    displayRequests();

    updateDashboard();

    alert("Borrow request sent successfully!");

}


function displayRequests() {

    let requestList = document.getElementById("requestList");

    requestList.innerHTML = "";

    let visibleRequests = requests.filter(function(request) {

        return request.owner === student ||
            request.borrower === student;

    });

    visibleRequests.forEach(function(request) {

        let card = document.createElement("div");

        card.className = "request-card";

        let actionHTML = "";

    

        if (request.owner === student && request.status === "Pending") {

            actionHTML = `
                <button class="button"
                    onclick="acceptRequest(${request.id})">
                    Accept
                </button>

                <button class="danger-button"
                    onclick="rejectRequest(${request.id})">
                    Reject
                </button>
            `;

        }

        
        if (request.borrower === student && request.status === "Borrowed") {

            actionHTML = `
                <button class="button"
                    onclick="returnItem(${request.id})">
                    Mark as Returned
                </button>
            `;

        }

        card.innerHTML = `
            <h3>${safeText(request.itemName)}</h3>
            <p>Owner: ${safeText(request.owner)}</p>
            <p>Borrower: ${safeText(request.borrower)}</p>
            <p class="status">Status: ${safeText(request.status)}</p>
            ${actionHTML}
        `;

        requestList.appendChild(card);

    });

    document.getElementById("emptyRequests").textContent =
        visibleRequests.length === 0 ?
        "No borrow requests yet." : "";

    updateDashboard();
}



function acceptRequest(id) {

    let request = requests.find(function(request) {
        return request.id === id;
    });

    if (!request || request.owner !== student ||
        request.status !== "Pending") {
        return;
    }

    let item = items.find(function(item) {
        return item.id === request.itemId;
    });

    if (!item || !item.available) {
        alert("This item is no longer available.");
        return;
    }

    request.status = "Borrowed";

    item.available = false;

    saveData();

    displayItems();

    displayRequests();

    alert("Borrow request accepted!");

}



function rejectRequest(id) {

    let request = requests.find(function(request) {
        return request.id === id;
    });

    if (!request || request.owner !== student ||
        request.status !== "Pending") {
        return;
    }

    request.status = "Rejected";

    saveData();

    displayRequests();

}


function returnItem(id) {

    let request = requests.find(function(request) {
        return request.id === id;
    });

    if (!request || request.borrower !== student ||
        request.status !== "Borrowed") {
        return;
    }

    request.status = "Returned";

    let item = items.find(function(item) {
        return item.id === request.itemId;
    });

    if (item) {
        item.available = true;
    }

    saveData();

    displayItems();

    displayRequests();

    alert("Item marked as returned!");

}



function updateDashboard() {

    let availableItems = items.filter(function(item) {
        return item.available;
    });

    let myListedItems = items.filter(function(item) {
        return item.owner === student;
    });

    let myBorrowRequests = requests.filter(function(request) {
        return request.borrower === student;
    });

    let activeBorrowings = requests.filter(function(request) {
        return request.borrower === student &&
            request.status === "Borrowed";
    });

    document.getElementById("totalItems").textContent =
        availableItems.length;

    document.getElementById("myItems").textContent =
        myListedItems.length;

    document.getElementById("myRequests").textContent =
        myBorrowRequests.length;

    document.getElementById("activeBorrows").textContent =
        activeBorrowings.length;
}



displayProfile();

displayItems();

displayRequests();

updateDashboard();
