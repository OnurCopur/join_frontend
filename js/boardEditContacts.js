let selectedEditContacts = [];
let editContactsSearch = [];


/**
 * opens/closes contacts & shows/hides selected contacts 
 * --> with click within or outside of container
 */
function openEditContacts(){
  let container = document.getElementById('input-assigned-edit-section');
  let contacts = document.getElementById('addTask-contacts-container-edit');
  let img = document.getElementById('dropdown-img-contacts-edit');

  window.addEventListener('click', function (e) {
    if (container.contains(e.target)) {
      openDropdown(contacts, img);
      hideSelectedEditContacts();
    } else {
      closeDropdown(contacts, img);
      showSelectedEditContacts();
    }
  });
}


/**
 * opens/closes contacts & shows/hides selected contacts
 * --> with click on child element
 * 
 * @param {*} event 
 */
function openCloseEditContacts(event) {
  event.stopPropagation();
  let container = document.getElementById('addTask-contacts-container-edit');
  let img = document.getElementById('dropdown-img-contacts-edit');
  if (container.classList.contains('d-none')) {
      openDropdown(container, img);
      hideSelectedEditContacts();
  } else {
      closeDropdown(container, img);
      showSelectedEditContacts();
  }
};


/**
 * adds and removes hover style when selecting contact in contact list
 * 
 * @param {number} i - position of contact in contacts array
 */
function selectEditContact(i) {
  let container = document.getElementById(`contact-edit-container${i}`);
  let contact = contacts[i];
  let indexSelected = selectedEditContacts.findIndex(c => c.id === contact.id);
  
  if (contact.selected) {
      selectedEditContacts.splice(indexSelected, 1);
      contact.selected = false;
  } else {
      selectedEditContacts.push(contact);
      contact.selected = true;
  }

  // Update the contact state in contacts array
  contacts[i] = { ...contact };
  container.classList.toggle('contact-container-edit-focus');
}


/**
 * renders selected Contacts
 */
function showSelectedEditContacts() {
  let container = document.getElementById('user-content-edit-letter');
  container.classList.remove('d-none');
  container.innerHTML = '';
  for (let i = 0; i < selectedEditContacts.length; i++) {
      let contact = selectedEditContacts[i];
      let name = contact['name'];
      let initials = getInitials(name); // Initialen aus den Kontaktdaten holen
      let color = selectedEditContacts[i]['color'];
      container.innerHTML += `
      <span style="background-color: ${color}" class="circleName">${initials}</span>
      `;
  }
}



/**
 * hides selected contacts
 */
function hideSelectedEditContacts() {
  let container = document.getElementById('selectedContacts-edit');
  container.classList.add('d-none');
}


/**
* searches for contacts
*/
function searchEditContacts() {
  let search = document.getElementById('addTask-edit-assigned').value.toLowerCase();
  editContactsSearch = [];
  if (search.length > 0) {
      for (let i = 0; i < contacts.length; i++) {
          findEditContacts(i, search);
      }
      showEditContactResults();
  } else {
      renderEditContacts('addTask-contacts-container-edit'); // Stelle sicher, dass der Containername korrekt übergeben wird
  }
}


/**
 * push found contacts to editContactsSearch
 * 
 * @param {number} i - position of contact in contacts array
 * @param {*} search - value of search input
 */
function findEditContacts(i, search){
  let contactName = contacts[i]['name'];
  let contactSelected = contacts[i]['selected'];
  let contactColor = contacts[i]['color'];
  if (contactName.toLowerCase().includes(search)) {
      editContactsSearch.push({ 'name': contactName, 'color': contactColor, 'selected': contactSelected });
  }
}


/**
 * shows results of search
 */
function showEditContactResults() {
  let container = document.getElementById('addTask-contacts-container-edit');
  container.innerHTML = '';
  for (let i = 0; i < editContactsSearch.length; i++) {
      const contact = editContactsSearch[i];
      let name = contact['name'];
      let initials = getInitials(name); // from contacts.js
      let color = contact['color'];
      container.innerHTML += templateEditContactSearch(i, name, initials, color);
      if (contact['selected'] === true) {
          document.getElementById(`contact-edit-container${i}`).classList.add('contact-container-edit-focus');
      } else {
          document.getElementById(`contact-edit-container${i}`).classList.remove('contact-container-edit-focus');
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
function templateEditContactSearch(i, name, initials, color) {
  return `
  <div id="contact-edit-container${i}" onclick="selectEditContactSearch(${i})" class="contact-container" tabindex="1">
      <div class="contact-container-name">
          <span style="background-color: ${color}" id="contactEditInitals${i}" class="circleName">${initials}</span>
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
function selectEditContactSearch(i) {
  let contactSelected = editContactsSearch[i]['selected'];
  if (contactSelected === true) {
      removeEditContactSearch(i);
  } else {
      addEditContactSearch(i);
  }
}


/**
 * adds contact and hover style when selecting contact in search list
 * 
 * @param {number} i - position of contact in contactsSearch array 
 */
function addEditContactSearch(i) {
  let container = document.getElementById(`contact-edit-container${i}`);
  let contactName = editContactsSearch[i]['name'];
  let contactColor = editContactsSearch[i]['color'];
  let index = contacts.findIndex(contact => contact.name === contactName);
  selectedEditContacts.push({ 'name': contactName,  'color': contactColor, 'selected': true });
  contacts.splice(index, 1, { 'name': contactName, 'color': contactColor, 'selected': true });
  editContactsSearch.splice(i, 1, { 'name': contactName, 'color': contactColor, 'selected': true });
  container.classList.add('contact-container-edit-focus');
}


/**
 * removes contact and hover style when selecting contact in search list
 * 
 * @param {number} i - position of contact in contactsSearch array 
 */
function removeEditContactSearch(i) {
  let container = document.getElementById(`contact-edit-container${i}`);
  let contactName = editContactsSearch[i]['name'];
  let contactColor = editContactsSearch[i]['color'];
  let index = contacts.findIndex(contact => contact.name === contactName);
  let indexSelected = selectedEditContacts.findIndex(contact => contact.name === contactName);
  selectedEditContacts.splice(indexSelected, 1);
  contacts.splice(index, 1, { 'name': contactName, 'color': contactColor, 'selected': false });
  editContactsSearch.splice(i, 1, { 'name': contactName, 'color': contactColor, 'selected': true });
  container.classList.remove('contact-container-edit-focus');
}