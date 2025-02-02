
/**
 * Deletes a contact.
 * Removes the contact from the arrays and Firebase, and reloads the contacts.
 */
async function deleteContact(id) {
    console.log('Attempting to delete contact with id:', id); // Debugging-Ausgabe

    // Sicherstellen, dass die ID korrekt verglichen wird
    const index = contactIds.indexOf(Number(id)); // id auf eine Zahl konvertieren

    if (index === -1) {
        console.error('Contact not found with id:', id);
        return;
    }

    try {
        // Lösche den Kontakt im Backend
        await deleteContactBackend(id);

        // Entferne den Kontakt aus den lokalen Arrays
        contacts.splice(index, 1);
        nameInput.splice(index, 1);
        emailInput.splice(index, 1);
        phoneNumbersInput.splice(index, 1);
        contactIds.splice(index, 1);
        loadedColors.splice(index, 1);

        // Rendere die aktualisierte Kontaktliste
        sortContactsByNameAndRender();

        // Schließe das Profil-Dialogfeld, falls es geöffnet ist
        let dialog = document.getElementById('contactsRightSectionShowProfil');
        if (dialog) {
            dialog.classList.remove('slide-in');
        }

        // Überprüfe, ob noch Kontakte vorhanden sind, und aktualisiere die Anzeige
        if (contacts.length === 0) {
            document.getElementById('contactList').innerHTML = '';
        } else {
            showFullContactResponsive(); // Falls eine Aktualisierung nötig ist
        }
    } catch (error) {
        console.error('Failed to delete contact in Backend:', error.message);
    }
}


/**
 * Edits a contact.
 * Shows the dialog with the contact details prefilled for editing.
 */
function editContact(id, nextColor) {
    const contact = contacts.find(c => c.id === id);

    document.getElementById('overlay').style.display = 'block'; 
    document.getElementById('dialogNewContactDiv').classList.remove('d-none');
    document.getElementById('dialogNewContactDiv').innerHTML = HTMLTemplateEditContact(id, nextColor); 

    let dialog = document.querySelector('.dialogNewContactDiv');
    dialog.classList.remove('slide-in'); 
    setTimeout(() => {
        dialog.classList.add('slide-in');
    }, 50); 

    document.getElementById('overlay').addEventListener('click', function(event) {
        if (event.target === this) {
            closeContactDialog();
        }
    });
}

/**
 * Returns the HTML template for editing a contact.
 */
function editContact(id, nextColor) {
    const contact = contacts.find(c => Number(c.id) === Number(id));


    if (!contact) {
        console.error('Kontakt nicht gefunden!');
        return;
    }

    document.getElementById('overlay').style.display = 'block'; 
    document.getElementById('dialogNewContactDiv').classList.remove('d-none');
    document.getElementById('dialogNewContactDiv').innerHTML = HTMLTemplateEditContact(contact, nextColor); 

    let dialog = document.querySelector('.dialogNewContactDiv');
    dialog.classList.remove('slide-in'); 
    setTimeout(() => {
        dialog.classList.add('slide-in');
    }, 50); 

    document.getElementById('overlay').addEventListener('click', function(event) {
        if (event.target === this) {
            closeContactDialog();
        }
    });
}

/**
 * Returns the HTML template for editing a contact.
 */
function HTMLTemplateEditContact(contact, nextColor) {
    let { name, email, number } = contact;  // Direktes Destructuring des Kontaktobjekts
    let initials = getInitials(name);  // Initialen aus dem Namen generieren
    
    return `    
        <div class="dialogNewContactInnerDiv">
            <div class="dialogLeft">
                <img class="joinLogoDialog" src="/img/Capa 2.png">
                <div class="dialogLeftInnerDiv">
                    <h1 class="HeadlineDialog">Edit contact</h1>
                </div>
            </div>
            <div class="dialogRight">
                <div class="dialogCloseDiv">
                <img onclick="closeContactDialog()" class="closeResponsiveButton" src="/img/closeVectorBlue.svg">
                </div>
                <div class="dialogProfilPictureDiv">
                    <div class="circleProfilPicShowEdit" style="background-color: ${nextColor}">${initials}</div>
                    <div class="dialogAddData">
                        <div class="dialogInputfield">
                            <div class="dialogInputfieldDiv">
                                <input id="inputName" value="${name}">
                                <img class="dialogIcons" src="/img/person.png">
                            </div>
                            <div class="dialogInputfieldDiv">
                                <input id="inputMail" value="${email}" type="email" pattern=".+@.+" required>
                                <img class="dialogIcons" src="/img/mail.png">
                            </div>
                            <div class="dialogInputfieldDiv">
                                <input id="inputPhone" value="${number}" type="number" class="no-spinners">
                                <img class="dialogIcons" src="/img/call.png">
                            </div>
                        </div>
                        <div class="dialogButtonDiv">
                            <button onclick="closeContactDialog()" class="cancelButton">Cancel</button>
                            <button onclick="saveEditContact(${contact.id}, '${nextColor}')" class="createContactButton">Save<img src="/img/check.png"></button>
                        </div>
                    </div> 
                </div>
            </div>  
        </div>
    `;
}


/**
 * Renders the edited contact.
 * Updates the contact list with the edited contact details.
 */
function renderEditContact(id, nextColor) {
    // Finde den Kontakt anhand der ID
    const contact = contacts.find(c => c.id === id);

    // Überprüfe, ob der Kontakt gefunden wurde
    if (!contact) {
        console.error('Kontakt nicht gefunden!');
        return;
    }

    // Render das HTML für den bearbeiteten Kontakt
    let editedContactHTML = renderHTMLLeftContactSide(contact.name, contact.email, contact.number, id, nextColor);
    
    // Hole das Element anhand der ID
    let contactListItem = document.getElementById(`contactListInner${id}`);
    
    if (contactListItem) {
        contactListItem.innerHTML = editedContactHTML;
    } else {
        console.error(`Element with ID contactListInner${id} not found.`);
    }
}



/**
 * Saves the edited contact.
 * Updates the contact details in the arrays and Backend, sorts and renders the contacts.
 */
async function saveEditContact(id, nextColor) {
    let changedName = document.getElementById('inputName').value;
    let changedMail = document.getElementById('inputMail').value;
    let changedPhone = document.getElementById('inputPhone').value;

    // Hole den Kontakt basierend auf der ID
    const contact = contacts.find(c => c.id === id);

    // Überprüfe, ob der Kontakt gefunden wurde
    if (!contact) {
        console.error('Kontakt nicht gefunden!');
        return;
    }

    try {
        // Aktualisiere den Kontakt im Backend
        const updatedContact = await updateContactBackend(
            id,  // Verwende die ID direkt
            changedName,
            changedMail,
            changedPhone,
            nextColor
        );

        // Aktualisiere den Kontakt im lokalen Array
        const index = contacts.findIndex(c => c.id === id); // Hole den Index des Kontakts anhand der ID
        contacts[index] = updatedContact;
        nameInput[index] = updatedContact.name;
        emailInput[index] = updatedContact.email;
        phoneNumbersInput[index] = updatedContact.number;
        loadedColors[index] = updatedContact.color;

        // Rendere die aktualisierte Ansicht
        renderEditContact(id, updatedContact.color);  // Verwende die ID, nicht den Index
        sortContactsByNameAndRender();

        closeContactDialog();
        showFullContact(id, updatedContact.color);  // Verwende die ID, nicht den Index
    } catch (error) {
        console.error('Failed to update contact in Backend:', error.message);
    }
}



/**
 * Goes back to the previous responsive view.
 * Removes the slide-in class from the right side main div.
 */
function goBackResponsive() {
    let dialog = document.querySelector('.contactsRightSideMainDiv');
    dialog.classList.remove('slide-in'); // Beispiel: Rückwärtsanimation oder andere Rückkehrlogik
    isFullContactShown = false;
    console.log("Zur vorherigen Ansicht zurückgekehrt");
}

/**
 * Toggles the popup visibility.
 * Stops event propagation and toggles the popup display style.
 */
function togglePopup(event) {
    event.stopPropagation();
    const popup = document.getElementById('popup');
    if (popup.style.display === 'none' || popup.style.display === '') {
        popup.style.setProperty('display', 'block', 'important');
    } else {
        popup.style.setProperty('display', 'none', 'important');
    }
}

/**
 * Shows the full contact details in responsive view.
 * Adds the slide-in class to the right side main div.
 */
let isFullContactShown = false;

function showFullContactResponsive() {
    if (!isFullContactShown) {
        let dialog = document.querySelector('.contactsRightSideMainDiv');
        dialog.classList.remove('slide-in'); 
        setTimeout(() => {
            dialog.classList.add('slide-in');
        }, 50); 
        isFullContactShown = true;
    } else {
        console.log("Die Funktion showFullContactResponsive() kann erst nach dem Aufruf von goBackResponsive() erneut aufgerufen werden.");
    }
}