/**
 * Initializes the application.
 * Calls the functions to initialize the inclusion, load contacts, set background menu, and display user initials.
 */
async function init(){
    await initInclude();
    await loadContacts();
    contactsBgMenu();
    // displayUserInitials();
}

let nameInput = [];
let emailInput = [];
let phoneNumbersInput = [];
let contactIds = [];
let colorIndex = 0;
let loadedColors = [];

const colors = [
    "#3380FF",
    "#1d6331",
    "#FFEA33",
    "#FF5733",
    "#7A33FF",
    "#FF33C1",
    "#33E6FF",
    "#FF33A2",
    "#33FFF1"
];

/**
 * Displays the dialog to add a new contact.
 * Reveals the overlay and dialog, and sets the HTML content for the new contact form.
 */
function addNewContact() {
    document.getElementById('overlay').style.display = 'block'; 
    document.getElementById('dialogNewContactDiv').classList.remove('d-none');
    document.getElementById('dialogNewContactDiv').innerHTML = HTMLTemplateNewContact();

    let dialog = document.querySelector('.dialogNewContactDiv');
    dialog.classList.remove('slide-in'); 
    setTimeout(() => {
        dialog.classList.add('slide-in');
    }, 50); 
}

/**
 * Returns the HTML template for adding a new contact.
 */
function HTMLTemplateNewContact() {
    return `    
<form onsubmit="createNewContact(); return false;">
    <div class="dialogNewContactInnerDiv">
        <div class="dialogLeft">
        <img onclick="closeContactDialog()" class="closeResponsiveButton" src="/img/closeVectorBlue.svg">
            <img class="joinLogoDialog" src="/img/Capa 2.png">
            <div class="dialogLeftInnerDiv">
                <h1 class="HeadlineDialog">Add contact</h1>
                <p class="subheadingDialog">Tasks are better with a team!</p>
                <div class="dialogLine"></div>
            </div>
        </div>
        <div class="dialogRight">
            <div class="dialogCloseDiv">
                <img onclick="closeContactDialog()" class="closeIcon" src="/img/close.png">
            </div>
            <div class="dialogProfilPictureDiv">
                <img class="dialogProfilPicture" src="/img/Group 13.png">
                <div class="dialogAddData">
                    <div class="dialogInputfield">
                        <div class="dialogInputfieldDiv">
                            <input id="inputName" placeholder="Name" required>
                            <img class="dialogIcons" src="/img/person.png">
                        </div>
                        <div class="dialogInputfieldDiv">
                            <input id="inputMail" type="email" placeholder="Email" pattern=".+@.+" required>
                            <img class="dialogIcons" src="/img/mail.png">
                        </div>
                        <div class="dialogInputfieldDiv">
                            <input id="inputPhone" type="number" placeholder="Phone" class="no-spinners" required>
                            <img class="dialogIcons" src="/img/call.png">
                        </div>
                    </div> 
                    <div class="dialogButtonDiv">
                        <button type="button" onclick="closeContactDialog()" class="cancelButton">Cancel<img src="/img/close.png"></button>
                        <button type="submit" class="createContactButton">Create contact<img src="/img/check.png"></button>
                    </div>
                </div> 
            </div>
        </div>  
    </div>
</form>
    `;
}

/**
 * Creates a new contact.
 * Retrieves input values, generates the next color, and resets the input fields.
 * Adds the new contact details to the corresponding arrays and hides the dialog.
 * Creates the new contact in Firebase, updates the contact ID array, sorts and renders the contacts.
 */
async function createNewContact(){
    let name = document.getElementById('inputName').value;
    let mail = document.getElementById('inputMail').value;
    let phone = document.getElementById('inputPhone').value;
    const nextColor = getNextColor();

    document.getElementById('inputName').value = '';
    document.getElementById('inputMail').value = '';
    document.getElementById('inputPhone').value = '';

    nameInput.push(name);
    emailInput.push(mail);
    phoneNumbersInput.push(phone);
    loadedColors.push(nextColor);

    document.getElementById('overlay').style.display = 'none'; 
    document.getElementById('dialogNewContactDiv').classList.add('d-none');
    const newContactId = await createNewContactBackend(name, mail, phone, nextColor); 
    contactIds.push(newContactId);
    sortContactsByNameAndRender();
}

/**
 * Sorts the contacts by name.
 * Reorders the name, email, phone number, color, and ID arrays based on the sorted names.
 */
function sortContactsByNameAndRender() {
    // Erstelle ein Array aus allen Kontakten
    const contacts = nameInput.map((name, index) => ({
        name,
        email: emailInput[index],
        number: phoneNumbersInput[index],
        color: loadedColors[index],
        id: contactIds[index],
    }));

    // Sortiere die Kontakte nach Name
    contacts.sort((a, b) => a.name.localeCompare(b.name));

    // Aktualisiere die Arrays basierend auf der sortierten Reihenfolge
    nameInput.length = 0;
    emailInput.length = 0;
    phoneNumbersInput.length = 0;
    loadedColors.length = 0;
    contactIds.length = 0;

    contacts.forEach(contact => {
        nameInput.push(contact.name);
        emailInput.push(contact.email);
        phoneNumbersInput.push(contact.number);
        loadedColors.push(contact.color);
        contactIds.push(contact.id);
    });

    // Render die Kontakte im Frontend
    const contactList = document.getElementById('contactList');
    contactList.innerHTML = '';

    let currentInitial = '';
    contacts.forEach(contact => {
        console.log("Rendering contact with ID:", contact.id); // Überprüfe die ID
        const initial = contact.name.charAt(0).toUpperCase();
        if (initial !== currentInitial) {
            const letterDiv = document.createElement('div');
            letterDiv.classList.add('letter');
            letterDiv.textContent = initial;
            contactList.appendChild(letterDiv);
    
            const lineDiv = document.createElement('div');
            lineDiv.classList.add('lineLeftSection');
            contactList.appendChild(lineDiv);
    
            currentInitial = initial;
        }
    
        const contactDiv = document.createElement('div');
        contactDiv.classList.add('contactListInner');
        contactDiv.innerHTML = renderHTMLLeftContactSide(contact.name, contact.email, contact.number, contact.id, contact.color);
        contactList.appendChild(contactDiv);
    });
}


/**
 * Closes the contact dialog.
 * Hides the overlay and the dialog.
 */
function closeContactDialog() {
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('dialogNewContactDiv').classList.add('d-none');
}

/**
 * Returns the HTML for a contact item.
 */
function renderHTMLLeftContactSide(name, email, phoneNumber, id, nextColor) {
    let initials = getInitials(name);

    return `
    <div onclick="showFullContact(${id}, '${nextColor}')" id="contactListInner${id}" class="contactListInner">
    <div class="contactListInnerDiv" id="contactListInnerDiv${id}" onclick="changeBackgroundColor(this); showFullContactResponsive(${id});">
    <div class="circleProfilPic" style="background-color: ${nextColor}">${initials}</div>
    <div class="nameAndEmail">
        <p id="nameProfil${id}" class="nameProfil">${name}</p>
        <p class="emailAdress">${email}</p>
    </div>
    </div>
    `;
}


/**
 * Changes the background color of the clicked contact element.
 * Adds a clicked class and changes the name text color to white.
 */
function changeBackgroundColor(clickedElement) {
    const previouslyClickedElement = document.querySelector('.contactListInnerDiv.clicked');

    if (previouslyClickedElement) {
        previouslyClickedElement.classList.remove('clicked');
        previouslyClickedElement.querySelector('.nameProfil').classList.remove('color-white');
    }

    clickedElement.classList.add('clicked');
    clickedElement.querySelector('.nameProfil').classList.add('color-white');
}

/**
 * Gets the initials from a name.
 */
function getInitials(name) {
    if (!name) {
        return ''; // Falls der Name nicht definiert ist, gebe eine leere Zeichenkette zurück
    }
    return name.split(' ').map(word => word.charAt(0).toUpperCase()).join(' ');
}


/**
 * Returns the next color from the colors array.
 * Increments the color index for the next call.
 */
function getNextColor() {
    colorIndex = colorIndex % colors.length;  
    const color = colors[colorIndex]; 
    colorIndex++;  
    return color;  
}

/**
 * Shows the full contact details.
 * Updates the right section with the contact details and reveals the dialog.
 */
function showFullContact(id, nextColor) {
    let content = document.getElementById('contactsRightSectionShowProfil');
    content.innerHTML = '';

    // Finde den Kontakt anhand der ID in der contacts-Liste
    const index = contacts.findIndex(c => c.id === id);
    if (index === -1) {
        console.error('Kontakt nicht gefunden mit ID:', id);
        return;
    }

    // Hole die Daten des gefundenen Kontakts
    let name = contacts[index].name;
    let email = contacts[index].email;
    let phone = contacts[index].number;
    let initials = getInitials(name);
    let dialog = document.getElementById('contactsRightSectionShowProfil');
    
    dialog.classList.remove('slide-in');
    setTimeout(() => {
        dialog.classList.add('slide-in');
    }, 150);
    
    content.innerHTML = HTMLTemplateShowFullContact(name, email, phone, initials, nextColor, id);
}




/**
 * Returns the HTML template for displaying full contact details.
 */
function HTMLTemplateShowFullContact(name, email, phone, initials, nextColor, id) {
    return `
    <div onclick="showFullContactResponsive()" id="contactsRightSectionShowProfilInner" class="contactsRightSectionShowProfilInner">
        <div class="circleProfilPicShow" style="background-color: ${nextColor}">${initials}</div>
        <div class="proilNameAndEdit">
            <p class="nameProfilShow">${name}</p>
            <div class="proilNameAndEditInner">
                <p onclick="editContact('${id}', '${nextColor}')" class="profilEdit">Edit
                    <img class="logoRightSection" src="/img/edit.svg">
                </p>
                <p onclick="deleteContact('${id}')" class="profilDelete">Delete
                    <img class="logoRightSection" src="/img/delete.png">
                </p>
            </div>
        </div>
        <div class="contactInformation">
            <p>Contact Information</p>
        </div>
        <div class="contactInformationEmailAndPhone">
            <div>
                <p class="contactInformationlHeadlineMailAndPhone">Email</p>
                <p class="contactInformationMail">${email}</p>
            </div>
            <div>
                <p class="contactInformationlHeadlineMailAndPhone">Phone</p>
                <p class="contactInformationPhone">${phone}</p>
            </div>
        </div>
        <div class="editAndDeleteResponsiveDivOutside">
        <div class="editAndDeleteResponsive">
            <img src="/img/more_vert.png" onclick="togglePopup(event)" alt="More">
                <div id="popup" class="popup">
                    <p onclick="editContact('${id}', '${nextColor}')" class="profilEdit"><img class="logoRightSection" src="/img/edit.svg">Edit</p>
                    <p onclick="deleteContact('${id}')" class="profilDelete"><img class="logoRightSection" src="/img/delete.png">Delete</p>
                </div>
            </div>
        </div>
    </div>
    `;
}


/**
 * Resets the input arrays.
 */
function resetInputs() {
    nameInput = [];
    emailInput = [];
    phoneNumbersInput = [];
    contactIds = [];
}

/**
 * Goes back to the previous responsive view.
 * Removes the slide-in class from the right side main div.
 */
function goBackResponsive() {
    const element = document.getElementById('contactsRightSideMainDivId');
    if (element) {
        element.classList.remove('slide-in');
    } else {
        console.error('Element with ID contactsRightSideMainDiv not found.');
    }
}

/**
 * Fetches contact data from the server.
 */
async function fetchContactsData() {
    try {
        const response = await fetch(BASE_URL + "contacts/", {
            headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            console.error('Failed to fetch contacts:', response.status, await response.text());
            return [];  // Leeres Array zurückgeben, wenn die Anfrage fehlschlägt
        }

        const data = await response.json();
        console.log('Fetched contacts:', data);  // Zum Debuggen

        return data;  // Gib die abgerufenen Daten zurück
    } catch (error) {
        console.error('Error fetching contacts:', error);
        return [];  // Im Fehlerfall auch ein leeres Array zurückgeben
    }
}



/**
 * Processes the contacts data and renders it into the contact list.
 * Extracts and processes up to 10 contacts, then sorts and renders them.
 */
function processContacts(contactsData, contactList) {
    let loadedContacts = 0;

    for (const contact of contactsData) {  // Iteriere direkt über das Array
        if (loadedContacts >= 10) {
            break;
        }

        processContact(contact, contactList);  // Übergebe das ganze Kontakt-Objekt
        loadedContacts++;
    }

    if (nameInput.length > 0 && emailInput.length > 0 && phoneNumbersInput.length > 0) {
        sortContactsByNameAndRender();
    }
}


/**
 * Processes a single contact and renders it into the contact list.
 * Extracts name, email, and number from the contact data, generates HTML, and updates the input arrays.
 */
function processContact(contact, contactList) {
    if (contact) {
        const { id, name, email, number, color } = contact;  // Extrahiere die tatsächliche ID
        const contactHTML = renderHTMLLeftContactSide(name, email, number, id, color);

        nameInput.push(name);
        emailInput.push(email);
        phoneNumbersInput.push(number);
        contactIds.push(id);  // Speichere die tatsächliche ID
        loadedColors.push(color);
    }
}


/**
 * Sets the background menu for contacts.
 * Adds the background focus class to the contacts element.
 */
function contactsBgMenu() {
    document.getElementById('contacts').classList.add("bgfocus");
}

/**
 * Displays the user's initials.
 * Retrieves the logged-in user's name from session storage and displays the initial.
 */
function displayUserInitials() {
    let username = sessionStorage.getItem('loggedInUser');
    let userInitials = document.getElementById('userInitials');

    if (username) {
        let initials = username.charAt(0).toUpperCase();
        userInitials.innerText = initials;
    } else {
        userInitials.innerText = "G";
    }
}

