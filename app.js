

// Array to hold box objects
let boxes = [
    {
        id: 1,
        leader: "Mishary",
        balance: 200000,
        dept: "2000SR",
        goalAchieved: "75%",
        maxVlaue: 100000,
        MinValue: 30000,
        members: [],
        dataOfCreation: "10-2-2004",
        transections: []
    },
    {
        id: 2,
        leader: "Ahmed",
        balance: 200000,
        dept: "20003SR",
        goalAchieved: "7%",
        maxVlaue: 200000,
        MinValue: 239999,
        members: [],
        dataOfCreation: "10-2-2004",
        transections: []
    }
    // Add more box objects here
];

const userId = 1 // شوفوا له دبره

function renderBoxes() {
    const boxesContainer = document.querySelector('.boxes');
    boxesContainer.innerHTML = '<h1>Your Boxes</h1>';  // Clears the previous content and adds title

    if (boxes.length === 0) {
        boxesContainer.innerHTML += '<p>You are not in any box, do you want to <a href="#">join</a> or <a href="#">create</a> a new box?</p>';
    } else {
        boxes.forEach(box => {
            const boxHTML = `
                <div class="box">
                    <h3><i class="fa-solid fa-box"></i> ${box.boxname}</h3>
                    <div class="box-details" class="grid-container">
                        <div class="box-column">
                            <h4 class="box-info">Leader: <span>${box.admin}</span></h4>
                        </div>
                        <div class="box-column">
                            <h4 class="box-info">Balance: <span>${box.balance}</span></h4>
                        </div>
                        <div class="box-column">
                            <h4 class="box-info">Max Value: <span>${box.targetvalue}</span></h4>
                        </div>
                        
        
                        <div class="box-column">
                            <button class="btn-showDetails" id="btn-showDetails-${box.boxid}">Show Options</button>
                        </div>
                    </div>
                </div>`;
            boxesContainer.innerHTML += boxHTML;
        });

        // Attach modal events after boxes are rendered
        attachModalEvents();
    }
}


function attachModalEvents() {
    boxes.forEach(box => {
        document.getElementById(`btn-showDetails-${box.boxid}`).addEventListener('click', function () {
            showModal(box);
        });
    });
}
function showModal(box) {
    var modal = document.getElementById("myModal");
    var boxDetails = document.getElementById('boxDetails');
    boxDetails.innerHTML = `
        <div class="boxDetail">
            <p>Admin: ${box.admin}</p>
            <p>Balance: ${box.balance}</p>
            <p>Max Value: ${box.targetvalue}</p>
            <p>Min Value: ${box.minvalue}</p>
            <p>Date of Creation: ${box.dateofcreation}</p>
        </div>

        <div>
            <h3>Request a Loan</h3>
            <form id="loan-form">
                <input type="number" id="loan-amount" placeholder="Loan Amount" required>
                <textarea id="loan-justification" placeholder="Justification" required></textarea>
                <button type="submit">Submit Loan Request</button>
            </form>
            <div id="other-options-section">
                <h3>Other Options</h3>
                <button class="option-button">Show Members</button>
                <button onclick="showPayDebtModal(${userId})" class="option-button">Pay Your Debt</button>

            </div>

        </div>
    `; // the user id should be dynamic ya salman 
    document.querySelector('#loan-form').onsubmit = (e) => submitLoanRequest(e, box.boxid);
    modal.style.display = "block";
}

function submitLoanRequest(event, boxId) {
    event.preventDefault();
    console.log("Submitting loan request"); // Debugging line
    const amount = document.getElementById('loan-amount').value;
    const justification = document.getElementById('loan-justification').value;

    console.log("Amount:", amount, "Justification:", justification); // Debugging line

    fetch('/submit-loan', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            boxId,
            amount,
            justification,
            userId: 1 // Ensure this matches your intended user ID setup
        })
    })
        .then(response => response.json())
        .then(data => {
            console.log("Response:", data); // Debugging line
            alert('Loan request submitted!');
            document.getElementById("myModal").style.display = "none";
        })
        .catch(error => {
            console.error('Error submitting loan:', error);
        });
}


//____________________________________________________________________
// pay dept function
function showPayDebtModal(userId) {
    console.log("Showing pay debt modal for user:", userId);  // Debugging line

    fetch(`/user-loans?userId=${userId}`)
        .then(response => response.json())
        .then(loans => {
            const modal = document.getElementById("myModal");
            const boxDetails = document.getElementById('boxDetails');
            boxDetails.innerHTML = `
                <h3>Pay Your Debt</h3>
                ${loans.map(loan => `
                    <div class="loan-detail">
                        <p>Loan Amount: ${loan.amount}, Due Date: ${loan.duedate}</p>
                        <button onclick="payLoan(${loan.loanid})">Pay</button>
                    </div>
                `).join('')}
            `;
            modal.style.display = "block";
        })
        .catch(error => {
            console.error('Error loading loans:', error);
        });
}

function payLoan(loanId) {
    console.log("Paying loan with ID:", loanId);  // Debug to confirm loanId is defined

    fetch('/pay-loan', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ loanId })
    })
    .then(response => response.json())
    .then(data => {
        alert('Loan paid successfully');
        // Refresh or handle next actions
    })
    .catch(error => {
        console.error('Error paying loan:', error);
    });
}



//________________________________________________________________________

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
    var modal = document.getElementById("myModal");
    modal.style.display = "none";
}

// Example functions for the options list
function askForLoan() { console.log('Asking for a loan...'); }
function showMembers() { console.log('Showing members...'); }
function payDept() { console.log('Paying dept...'); }
function leaveBox() { console.log('Leaving the box...'); }

window.onload = function () {
    fetch('/boxes')
        .then(response => response.json())
        .then(data => {
            boxes = data;
            renderBoxes();
        })
        .catch(error => console.error('Error loading boxes:', error));
};
;

//______________________________________________________________________________________
//creat new box
function showCreateBoxModal() {
    document.getElementById('createBoxModal').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// This function is to be used when the "Create Box" button is clicked
document.getElementById('create-box-button').addEventListener('click', function(event) {
    event.preventDefault();
    showCreateBoxModal();  // Function to display the modal for creating a new box
});

// Updated form submission function to include 'admin'
document.getElementById('create-box-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const boxName = document.getElementById('boxName').value;
    const targetValue = document.getElementById('targetValue').value;
    const minValue = document.getElementById('minValue').value;
    const admin = document.getElementById('boxAdmin').value;
    const startingBalance = document.getElementById('startingBalance').value; // Get the starting balance from the form

    fetch('/create-box', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ boxName, targetValue, minValue, admin, startingBalance }) // Include the starting balance in the payload
    })
    .then(response => response.json())
    .then(data => {
        alert('Box created successfully!');
        closeModal('createBoxModal');
    })
    .catch(error => {
        console.error('Error creating box:', error);
        alert('Failed to create box: ' + error.message);
    });
});
