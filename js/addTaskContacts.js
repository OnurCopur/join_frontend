let selectedContacts = [];
let contactsSearch = [];


/**
 * loads Contacts
 */
function renderContacts(contactContainer) {
    let container = document.getElementById(`${contactContainer}`);
    container.innerHTML = '';
    for (let i = 0; i < contacts.length; i++) {
        let name = contacts[i]['name'];
        let initials = getInitials(name); // from contacts.js
        let color = contacts[i]['color'];
        container.innerHTML += templateContact(i, name, initials, color);
        if (contacts[i]['selected'] === true) {
            document.getElementById(`contact-container${i}`).classList.add('contact-container-focus');
        } else {
            document.getElementById(`contact-container${i}`).classList.remove('contact-container-focus');
        }
    }
}


/**
 * returns HTML of single contact
 * 
 * @param {number} i - position in contacts json
 * @param {string} name - name of contact
 * @param {string} initials - initials of contact
 * @param {string} color - color of contact
 * @returns 
 */
function templateContact(i, name, initials, color) {
    return `
    <div id="contact-container${i}" onclick="selectContact(${i})" class="contact-container" tabindex="1">
        <div class="contact-container-name">
            <span style="background-color: ${color}" id="contactInitals${i}" class="circleName">${initials}</span>
            <span id="contactName${i}">${name}</span>
        </div>
        <div class="contact-container-check"></div>
    </div> 
`;
}


/**
 * opens/closes contacts & shows/hides selected contacts 
 * --> with click within or outside of container
 */
function openContacts() {
    let container = document.getElementById('input-section-element');
    let contacts = document.getElementById('addTask-contacts-container');
    let img = document.getElementById('dropdown-img-contacts');

    window.addEventListener('click', function (e) {
        if (container.contains(e.target)) {
            openDropdown(contacts, img);
            hideSelectedContacts();
        } else {
            closeDropdown(contacts, img);
            showSelectedContacts();
        }
    });
}


/**
 * opens/closes contacts & shows/hides selected contacts
 * --> with click on child element
 * 
 * @param {*} event 
 */
function openCloseContacts(event) {
    event.stopPropagation();
    let container = document.getElementById('addTask-contacts-container');
    let img = document.getElementById('dropdown-img-contacts');

    if (container.classList.contains('d-none')) {
        renderEditContacts('addTask-contacts-container', true); // Kontakte für Dropdown rendern
        openDropdown(container, img);
        hideSelectedContacts();
    } else {
        closeDropdown(container, img);
        showSelectedContacts();
    }
}



/**
 * adds and removes hover style when selecting contact in contact list
 * 
 * @param {number} i - position of contact in contacts array
 */
function selectContact(i) {
    let container = document.getElementById(`contact-container${i}`);
    let contactName = contacts[i]['name'];
    let contactColor = contacts[i]['color'];
    let contactId = contacts[i]['id'];  // Holen der Kontakt-ID
    let indexSelected = selectedContacts.findIndex(contact => contact.name === contactName);
    
    if (contacts[i]['selected'] === true) {
        selectedContacts.splice(indexSelected, 1);
        contacts[i].selected = false;
        container.classList.remove('contact-container-focus');
    } else {
        selectedContacts.push({ 'id': contactId, 'name': contactName, 'color': contactColor, 'selected': true });
        contacts[i].selected = true;
        container.classList.add('contact-container-focus');
    }
}



/**
 * renders selected Contacts
 */
function showSelectedContacts() {
    let container = document.getElementById('selectedContacts');
    container.classList.remove('d-none');
    container.innerHTML = '';
    for (let i = 0; i < selectedContacts.length; i++) {
        let contact = selectedContacts[i];
        let name = contact['name'];
        let initials = getInitials(name); // from contacts.js
        let color = selectedContacts[i]['color'];
        container.innerHTML += `
        <span style="background-color: ${color}" class="circleName">${initials}</span>
        `;
    }
}


/**
 * hides selected contacts
 */
function hideSelectedContacts() {
    let container = document.getElementById('selectedContacts');
    container.classList.add('d-none');
}


/**
 * searches for contacts
 */
function searchContacts() {
    let search = document.getElementById('addTask-assigned').value.toLowerCase();
    contactsSearch = [];
    if (search.length > 0) {
        for (let i = 0; i < contacts.length; i++) {
            findContacts(i, search);
        }
        showContactResults();
    } else {
        renderContacts('addTask-contacts-container');
    }
}


/**
 * push found contacts to contactsSearch
 * 
 * @param {number} i - position of contact in contacts array
 * @param {*} search - value of search input
 */
function findContacts(i, search){
    let contactName = contacts[i]['name'];
    let contactSelected = contacts[i]['selected'];
    let contactColor = contacts[i]['color'];
    if (contactName.toLowerCase().includes(search)) {
        contactsSearch.push({ 'name': contactName, 'color': contactColor, 'selected': contactSelected });
    }
}


/**
 * shows results of search
 */
function showContactResults() {
    let container = document.getElementById('addTask-contacts-container');
    container.innerHTML = '';
    for (let i = 0; i < contactsSearch.length; i++) {
        const contact = contactsSearch[i];
        let name = contact['name'];
        let initials = getInitials(name); // from contacts.js
        let color = contact['color'];
        container.innerHTML += templateContactSearch(i, name, initials, color);
        if (contact['selected'] === true) {
            document.getElementById(`contact-container${i}`).classList.add('contact-container-focus');
        } else {
            document.getElementById(`contact-container${i}`).classList.remove('contact-container-focus');
        }
    }
}


/**
 * returns HTML of single contact while search
 * 
 * @param {number} i - position in contacts json
 * @param {string} name - name of contact
 * @param {string} initials - initials of contact
 * @returns 
 */
function templateContactSearch(i, name, initials, color) {
    return `
    <div id="contact-container${i}" onclick="selectContactSearch(${i})" class="contact-container" tabindex="1">
        <div class="contact-container-name">
            <span style="background-color: ${color}" id="contactInitals${i}" class="circleName">${initials}</span>
            <span id="contactName${i}">${name}</span>
        </div>
        <div class="contact-container-check"></div>
    </div> 
`;
}


/**
 * adds and removes contact and hover style when selecting contact in search list
 * 
 * @param {number} i - position of contact in contactsSearch array
 */
function selectContactSearch(i) {
    let contactSelected = contactsSearch[i]['selected'];
    if (contactSelected === true) {
        removeContactSearch(i);
    } else {
        addContactSearch(i);
    }
}


/**
 * adds contact and hover style when selecting contact in search list
 * 
 * @param {number} i - position of contact in contactsSearch array 
 */
function addContactSearch(i) {
    let container = document.getElementById(`contact-container${i}`);
    let contactName = contactsSearch[i]['name'];
    let contactColor = contactsSearch[i]['color'];
    let contactId = contactsSearch[i]['id'];  // Holen der Kontakt-ID
    let index = contacts.findIndex(contact => contact.name === contactName);
    
    selectedContacts.push({ 'id': contactId, 'name': contactName, 'color': contactColor, 'selected': true });
    contacts[index].selected = true;
    contactsSearch[i].selected = true;
    
    container.classList.add('contact-container-focus');
}



/**
 * removes contact and hover style when selecting contact in search list
 * 
 * @param {number} i - position of contact in contactsSearch array 
 */
function removeContactSearch(i) {
    let container = document.getElementById(`contact-container${i}`);
    let contactName = contactsSearch[i]['name'];
    let contactColor = contactsSearch[i]['color'];
    let index = contacts.findIndex(contact => contact.name === contactName);
    let indexSelected = selectedContacts.findIndex(contact => contact.name === contactName);
    selectedContacts.splice(indexSelected, 1);
    contacts.splice(index, 1, { 'name': contactName, 'color': contactColor, 'selected': false });
    contactsSearch.splice(i, 1, { 'name': contactName, 'color': contactColor, 'selected': true });
    container.classList.remove('contact-container-focus');
}