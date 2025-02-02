let contacts = [];
let tasks = [];

async function onloadFunc() {
    await loadDataLogin();
    fillRemembereInputs();
    changeImage();
}

async function onloadTasks() {
    await loadContacts();
    await loadTasks();
}


const BASE_URL = "http://127.0.0.1:8000/api/";

async function loadDataLogin() {
    let response = await fetch(BASE_URL + "auth/users/");
    let usersData = await response.json();

    // Überprüfen, ob Daten vorhanden sind
    if (usersData) {
        // Iteriere durch die Benutzerdaten und füge sie dem users-Array hinzu
        Object.keys(usersData).forEach(key => {
            users.push(usersData[key]);
        });
    }
}


async function guestLogin() {
    try {
        // Anfrage an den Backend-Endpoint für den Gast-Login
        let response = await fetch(BASE_URL + 'auth/guest-login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (response.ok) {
            let data = await response.json();
            localStorage.setItem('token', data.token);  // Token im LocalStorage speichern
            sessionStorage.setItem('loggedInUser', 'Guest');  // Gast-Benutzernamen speichern
            redirectToSummary();  // Weiterleitung zur Zusammenfassung
        } else {
            console.error('Error logging in as guest');
        }
    } catch (error) {
        console.error('Error logging in as guest:', error);
    }
}




async function loadData() {
    const token = localStorage.getItem('token'); // Token aus dem LocalStorage abrufen

    if (!token) {
        console.error('Kein Token vorhanden. Benutzer muss sich anmelden.');
        return;
    }

    try {
        let response = await fetch(BASE_URL + "contacts/", {
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.error('Fehler beim Laden der Kontakte:', response.status, await response.text());
            return;
        }

        let contactsData = await response.json();

        if (contactsData) {
            contactsData.forEach(contact => {
                contacts.push(contact);
            });
        }
    } catch (error) {
        console.error('Fehler beim Laden der Kontakte:', error);
    }
}




async function loadTasks() {
    const token = localStorage.getItem('token'); // Stelle sicher, dass du den Token korrekt speicherst und abrufst
    if (!token) {
        console.error('Kein Token vorhanden. Benutzer muss sich anmelden.');
        return;
    }

    try {
        let response = await fetch(BASE_URL + "tasks/", {
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.error('Fehler beim Laden der Aufgaben:', response.status, await response.text());
            return;
        }

        let tasksData = await response.json();

        if (tasksData) {
            tasksData.forEach(task => {
                // Stelle sicher, dass 'subtasks' immer ein Array ist
                if (!Array.isArray(task.subtasks)) {
                    task.subtasks = [];
                }
                tasks.push(task);
            });
        }
    } catch (error) {
        console.error('Fehler beim Laden der Aufgaben:', error);
    }
}

  


async function loadTasksBoard() {
    const token = localStorage.getItem('token');

    if (!token) {
        console.error('Kein Token vorhanden. Benutzer muss sich anmelden.');
        return;
    }

    try {
        let response = await fetch(BASE_URL + "tasks/", {
            method: 'GET',
            headers: {
                'Authorization': `Token ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Fehler beim Laden der Tasks: ${response.status} ${await response.text()}`);
        }

        let tasksData = await response.json();
        console.log("Loaded tasks:", tasksData);

        // Setze tasks direkt auf tasksData (es sollte ein Array sein)
        tasks = tasksData;

        updateHTML(); // Update HTML nach dem Laden der Tasks
    } catch (error) {
        console.error("Fehler beim Laden der Tasks:", error);
    }
}





async function getNextContactId() {
    try {
        const response = await fetch(`${BASE_URL}contacts`);
        const data = await response.json();

        if (!data) {
            return 0;
        }
        return Object.keys(data).length;
    } catch (error) {
        console.error('Error getting next contact ID:', error.message);
        throw error;
    }
}


async function loadContacts(path = "/contacts") {
    resetInputs();
    try {
        const contactsData = await fetchContactsData(path);  // Annahme: fetchContactsData ist korrekt implementiert

        if (!contactsData || contactsData.length === 0) {
            console.log("No contact data found.");
            return;
        }

        // Das contacts Array mit den abgerufenen Daten füllen
        contacts = contactsData.map(contact => contact);

        // Kontaktdaten im Frontend anzeigen
        const contactList = document.getElementById('contactList');
        contactList.innerHTML = '';  // Vorherige Liste zurücksetzen
        processContacts(contactsData, contactList);  // Übergebe die richtigen Daten zum Anzeigen
    } catch (error) {
        console.error("Fehler beim Laden der Kontakte:", error);
    }
}


async function createNewContactBackend(name, email, phoneNumber, color) {
    // Token aus localStorage holen
    const token = localStorage.getItem('token');

    // POST-Request zum Erstellen eines neuen Kontakts
    const response = await fetch(`${BASE_URL}contacts/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`  // Token hinzufügen
        },
        body: JSON.stringify({
            name: name,
            email: email,
            number: phoneNumber,
            color: color
        })
    });

    if (!response.ok) {
        const errorData = await response.text(); // Den Text des Fehlers holen
        console.error('Failed to create contact', errorData); // Fehler ausgeben
        return;
    }
    

    // Erfolgsmeldung oder Weiterleitung
    console.log('Contact created successfully');
}


async function updateContactBackend(id, name, mail, phone, color) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${BASE_URL}contacts/${id}/`, {
            method: 'PUT',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email: mail, number: phone, color }),
        });

        if (!response.ok) {
            throw new Error('Failed to update contact in Backend');
        }

        const updatedContact = await response.json(); // JSON-Daten aus dem Backend
        return updatedContact; // Das gesamte aktualisierte Objekt wird zurückgegeben
    } catch (error) {
        console.error('Error updating contact:', error.message);
        throw error;
    }
}


async function deleteContactBackend(id) {
    const url = `${BASE_URL}contacts/${id}/`.replace(/([^:]\/)\/+/g, "$1"); // URL anpassen
    const token = localStorage.getItem('token'); // Token unter 'token' im localStorage

    // Überprüfe, ob der Token existiert
    if (!token) {
        throw new Error('No authentication token found');
    }

    const response = await fetch(url, {
        method: 'DELETE',
        headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
        },
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        console.error('Delete request failed:', response.status, errorText);
        throw new Error('Failed to delete contact in Backend');
    }
}




async function postData(data = {}) {
    console.log("Daten vor der Anfrage:", data);

    const token = localStorage.getItem('token'); // Token aus dem LocalStorage abrufen

    if (!token) {
        console.error('Kein Token vorhanden. Benutzer muss sich anmelden.');
        return null;
    }

    try {
        const response = await fetch(`${BASE_URL}tasks/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            return await response.json();
        } else {
            console.error("Fehler beim Erstellen der Aufgabe:", await response.text());
            return null;
        }
    } catch (error) {
        console.error("Netzwerk- oder Serverfehler beim Erstellen der Aufgabe:", error);
        return null;
    }
}




async function deleteData(taskId) {
    const url = `${BASE_URL}tasks/${taskId}/`;
    const token = localStorage.getItem('token'); // Token aus dem LocalStorage abrufen
    console.log(`DELETE URL: ${url}`);

    if (!token) {
        console.error('Kein Token vorhanden. Benutzer muss sich anmelden.');
        return;
    }

    try {
        let response = await fetch(url, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Token ${token}` // Authorization-Header hinzufügen
            },
        });

        if (!response.ok) {
            console.error(`Fehler bei DELETE-Anfrage: ${response.status} ${await response.text()}`);
            return;
        }

        if (response.status === 204) {
            console.log('Task erfolgreich gelöscht, keine Antwort zu parsen.');
            return;
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Fehler bei der DELETE-Anfrage:", error);
    }
}



async function putData(taskId, data = {}) {
    const url = `${BASE_URL}tasks/${taskId}/`; // Task-ID in die URL einfügen
    const token = localStorage.getItem('token'); // Token aus dem LocalStorage abrufen
    console.log(`PUT URL: ${url}`);

    if (!token) {
        console.error('Kein Token vorhanden. Benutzer muss sich anmelden.');
        return;
    }

    try {
        let response = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Token ${token}` // Authorization-Header hinzufügen
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            console.error(`Fehler bei PUT-Anfrage: ${response.status} ${await response.text()}`);
            return null; // Rückgabe von null bei Fehler
        }

        // Rückgabe des aktualisierten Tasks aus der Antwort
        return await response.json();
    } catch (error) {
        console.error("Fehler bei der PUT-Anfrage:", error);
        return null;
    }
}