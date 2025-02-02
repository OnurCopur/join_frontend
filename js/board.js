let subtask = [];
let user = [];
tasks = [];
prioBtn = "";
let prioIcon ="";
let prioText = "";


/**
 * loads navBar, header, arrays from backend & renders contacts
 */
async function initBoard() {
  await initInclude();
  await loadData();
  displayUserInitials();
  loadTasksBoard();
  // updateHTML();
  renderEditContacts('addTask-contacts-container-edit');
  contactsRender('addTask-contacts-container');
  BoardBg();
  chooseMedium();
}



/**
 * loads Contacts
 */
function renderEditContacts(contactContainer, isDropdown = false) {
  let container = document.getElementById(contactContainer);
  container.innerHTML = ''; 

  for (let i = 0; i < contacts.length; i++) {
      let name = contacts[i]['name'];
      let initials = getInitials(name); // Initialen generieren
      let color = contacts[i]['color'];
      container.innerHTML += templateEditContact(i, name, initials, color, isDropdown);

      // Fokus-Styling nur für Edit-Modus
      if (!isDropdown) {
          if (contacts[i]['selected'] === true) {
              document.getElementById(`contact-edit-container${i}`).classList.add('contact-container-edit-focus');
          } else {
              document.getElementById(`contact-edit-container${i}`).classList.remove('contact-container-edit-focus');
          }
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
function templateEditContact(i, name, initials, color, isDropdown = false) {
  let containerId = isDropdown ? `contact-container${i}` : `contact-edit-container${i}`;
  let clickHandler = isDropdown ? `selectContact(${i})` : `selectEditContact(${i})`;

  return `
  <div id="${containerId}" onclick="${clickHandler}" class="contact-container" tabindex="1">
      <div class="contact-container-name">
          <span style="background-color: ${color}" id="contactInitals${i}" class="circleName">${initials}</span>
          <span id="contactName${i}">${name}</span>
      </div>
      <div class="contact-container-check"></div>
  </div> 
  `;
}



/**
 *  To open the AddTask with addTask Button 
*/
function openAddTask() {
  let content = document.getElementById("addTask");
  content.classList.remove("hidden");
  let overlay = document.getElementsByClassName("overlay")[0];
  overlay.classList.remove("hidden");
  let dialog = document.querySelector('.addTaskBoard');
  dialog.classList.remove('slide-in'); 
  setTimeout(() => {
      dialog.classList.add('slide-in');
  }, 50);
}


/**
 *  to close the Task or the addTask section
*/
function closeMe() {
  const taskId = getCurrentTaskId();  // Hole die aktuelle Task-ID über die Funktion

  if (taskId === null) {
    console.error("Kein Task geöffnet.");
    return;
  }

  saveSubtaskChanges(taskId);  // Speichere die Subtask-Änderungen

  let content = document.getElementById("addTask");
  let showContent = document.getElementById("showTask");
  let editContent = document.getElementById("addTask-edit");
  showContent.classList.add("hidden");
  content.classList.add("hidden");
  editContent.classList.add("hidden");
  let overlay = document.getElementsByClassName("overlay")[0];
  overlay.classList.add("hidden");

  updateHTML();
  contacts = [];
  selectedEditContacts = [];
  loadData();
}




async function saveSubtaskChanges(taskId) {
  const task = tasks.find(t => t.id === taskId);  // Finde den Task mit der richtigen ID

  if (task && Array.isArray(task.subtasks)) {
    // Speichere den neuen Status der Subtasks (true/false)
    task.subtasks.forEach((subtask, index) => {
      const checkbox = document.getElementById(`checkbox${index}`);
      if (checkbox) {
        subtask.completed = checkbox.checked;  // Setze den completed-Wert basierend auf dem Checkbox-Status
      }
    });

    // Sende die aktualisierten Daten an das Backend
    const updatedTaskData = {
      title: task.title,          // Füge den Titel des Tasks hinzu
      category: task.category,    // Füge die Kategorie des Tasks hinzu
      date: task.date,            // Füge das Datum des Tasks hinzu
      prio: task.prio,            // Füge die Priorität des Tasks hinzu
      subtasks: task.subtasks     // Nur die Subtasks an das Backend senden
    };

    const updatedTask = await putData(taskId, updatedTaskData);

    // if (updatedTask) {
    //   console.log("Task erfolgreich aktualisiert:", updatedTask);
    // } else {
    //   console.error("Fehler beim Aktualisieren des Tasks");
    // }
  }
}



/** 
 * to change the color of the Category tilte after add 
*/
function changeColorOfCategoryTitle() {
  for (let i = 0; i < tasks.length; i++) {
    let content = document.getElementById(`cardCategoryTitle${tasks[i].id}`);
    
    // Überprüfen, ob das Element existiert
    if (content) {
      let category = tasks[i]["category"];
      if (category.includes("User Story")) {
        content.classList.add("blue");
      } else if (category.includes("Technical Task")) {
        content.classList.add("green");
      }
    } else {
      console.warn(`Element für Task ${tasks[i].id} nicht gefunden.`);
    }
  }
}



/**
 * Deletes the Task at the specified index in the task list.
 * @param {number} taskIndex - The index of the task to be edited.
 */
function deleteTask(taskId) {
  const taskIndex = tasks.findIndex(task => task.id === taskId);

  if (taskIndex === -1) {
    console.log('Task not found!');
    return;
  }

  // Lösche den Task aus dem Array
  tasks.splice(taskIndex, 1);

  // Sende die DELETE-Anfrage mit der Task-ID
  deleteData(taskId); // Nur Task-ID übergeben
  updateHTML();
  styleOfNoTaskToDo();
  styleOfNoTaskInProgress();
  styleOfNoTaskAwaitFeedback();
  closeMe();
}


/** 
 * to search the Task 
*/
function searchTask() {
  let search = document.getElementById("search-input").value.toLowerCase();
  for (let i = 0; i < tasks.length; i++) {
    let task = tasks[i];
    let taskCard = document.getElementById(`cardId${task.id}`);  // Verwende task.id hier
    const title = task.title.toLowerCase();  // Zugriff auf title ohne Array-Zugriff
    const description = task.description.toLowerCase();  // Zugriff auf description ohne Array-Zugriff
    if (taskCard) {
      if (title.includes(search) || description.includes(search)) {
        taskCard.style.display = "block";
      } else {
        taskCard.style.display = "none";
      }
    } else {
      console.log("Task Card not Found");
    }
  }
}


/**
 * Converts a date object or date string to a desired format.
 * @param {Date|string} date - The date to be converted, either as a Date object or a date string.
 * @returns {string} The converted date as a string.
*/
function convertDate(date) {
  let datePart = date.split("-");
  let newDate = datePart[2] + "/" + datePart[1] + "/" + datePart[0];
  return newDate;
}


let currentDraggedElement;

/**
 *  to generate the Task in right position toDo - inProgress - await - done
*/
function updateHTML() {
  // Filtere Tasks mit der Phase "To Do"
  let toDo = tasks.filter((t) => t["phases"] == "To Do");
  let toDoConetnt = document.getElementById("newTask-toDo");
  toDoConetnt.innerHTML = "";

  for (let index = 0; index < toDo.length; index++) {
      const element = toDo[index];
      document.getElementById("newTask-toDo").innerHTML += genereteAllTasksHTML(element);
      styleOfNoTaskToDo(); // Wenn keine Tasks in "To Do", dann Anpassung vornehmen
  }

  // Filtere Tasks mit der Phase "In Progress"
  let inProgress = tasks.filter((t) => t["phases"] == "In progress");
  let inProgressContent = document.getElementById("newTask-inProgress");
  inProgressContent.innerHTML = "";

  for (let index = 0; index < inProgress.length; index++) {
      const element = inProgress[index];
      document.getElementById("newTask-inProgress").innerHTML += genereteAllTasksHTML(element);
      styleOfNoTaskInProgress(); // Wenn keine Tasks in "In Progress", dann Anpassung vornehmen
  }

  // Filtere Tasks mit der Phase "Await feedback"
  let await = tasks.filter((t) => t["phases"] == "Await feedback");
  document.getElementById("newTask-await").innerHTML = "";
  for (let index = 0; index < await.length; index++) {
      const element = await[index];
      document.getElementById("newTask-await").innerHTML += genereteAllTasksHTML(element);
      styleOfNoTaskAwaitFeedback(); // Wenn keine Tasks in "Await feedback", dann Anpassung vornehmen
  }

  // Filtere Tasks mit der Phase "Done"
  let done = tasks.filter((t) => t["phases"] == "Done");
  document.getElementById("newTask-done").innerHTML = "";
  for (let index = 0; index < done.length; index++) {
      const element = done[index];
      document.getElementById("newTask-done").innerHTML += genereteAllTasksHTML(element);
      styleOfNoTaskDone(); // Wenn keine Tasks in "Done", dann Anpassung vornehmen
  }

  // Weitere allgemeine Styles oder Anpassungen
  changeColorOfCategoryTitle();  // Färbe die Titel der Kategorien je nach Task
  contactsRender(); // Rendern der Kontakte, falls benötigt
}


/**
 * 
 * @param {string} id - id of Taskcard
*/
function startDragging(taskId) {
  currentDraggedElement = taskId;
}


/**
 * change the value of the progress at the specified index in the task list.
 * @param {number} taskIndex - position of the Task accroding to Subtasks
 * @returns 
*/
function valueOfProgressBar(taskId) {
  let value = 0;
  const task = tasks.find(t => t.id === taskId);  // Finde den Task mit der richtigen ID

  if (task && Array.isArray(task.subtasks)) {
    const totalSubtasks = task.subtasks.length;
    if (totalSubtasks === 0) {
      value = 0;
    } else {
      // Zähle, wie viele Subtasks abgeschlossen sind
      const completedSubtasks = task.subtasks.filter(subtask => subtask.completed).length;
      
      // Berechne den Fortschritt basierend auf der Anzahl der abgeschlossenen Subtasks
      value = (completedSubtasks / totalSubtasks) * 100;
    }
  }
  return value;
}



function contactsRender() {
  for (let i = 0; i < tasks.length; i++) {
      let task = tasks[i];
      let maxContacts = 3;
      let content = document.getElementById(`newDiv${task.id}`);
      
      if (!content) {
          console.warn(`Element mit der ID newDiv${task.id} nicht gefunden.`);
          continue;
      }

      // Wenn keine Kontakte vorhanden sind, nichts tun
      if (!task.contacts || task.contacts.length === 0) {
          content.innerHTML = ''; // Leere Inhalte anzeigen, wenn keine Kontakte vorhanden sind
          continue;
      }
      
      content.innerHTML = ''; // Sicherstellen, dass alte Inhalte gelöscht werden
      
      for (let j = 0; j < Math.min(task.contacts.length, maxContacts); j++) {
          let contactId = task.contacts[j];  // Erwartet, dass dies die Kontakt-ID ist
          let contact = contacts.find(contact => contact.id === contactId); // Hole den Kontakt aus contacts anhand der ID
          
          if (!contact || !contact.name || !contact.color) {
              console.warn(`Ungültige Kontaktdaten für Kontakt ${contactId} in Task ${task.id}:`, contact);
              continue;
          }

          let initials = contact.name
              .split(" ")
              .map(word => word.charAt(0).toUpperCase())
              .join("");
              
          content.innerHTML += `<div class="user-task-content" style="background-color:${contact.color}">${initials}</div>`;
      }

      if (task.contacts.length > maxContacts) {
          let additionalContacts = task.contacts.length - maxContacts;
          let numberOfContacts = document.getElementById(`plus-number-contacts${task.id}`);
          if (numberOfContacts) {
              numberOfContacts.innerHTML = `+${additionalContacts}`;
          }
      }
  }
}


/**
 * to load the Tasks
 * @param {*} element 
 * @returns 
*/
function genereteAllTasksHTML(element) {
  const progressValue = valueOfProgressBar(element["id"]);  // Hole den Fortschrittswert hier
  return ` 
  <div id="cardId${element["id"]}" draggable="true" ondragstart="startDragging(${element["id"]})" onclick="showTask(${element["id"]})">
    <div class="card">
      <div id="cardCategoryTitle${element["id"]}" 
        class="card-category-title" 
        style="background-color: ${element["category_color"] || 'transparent'};">${element["category"]}</div>
      <div class="title-description-content">
        <h2 class="card-title">${element["title"]}</h2>
        <p class="card-description">${element["description"]}</p>
      </div>
      <div class="progress-bar-content">
        <progress value="${progressValue}" max="100" id="progressBar${element["id"]}"></progress>
        <p class="card-subtasks-text">
        <span id="numberOfSubtask${element["id"]}" class="numberOfSubtask">
        ${element["subtasks"].filter(subtask => subtask.completed).length}/${element["subtasks"].length}
  </span> Subtasks
</p>

      </div>
      <div class="card-user-content">
        <div class="user-container-board">
          <div class="user-inner-container" id="newDiv${element['id']}"></div>
          <div class="number-of-contacts" id="plus-number-contacts${element['id']}"></div>
        </div>
        <img src="${element["prioIcon"]}" alt="">
      </div>
    </div>
  </div>`;
}



/**
 * Erlaubt das Ablegen eines Elements durch Verhindern des Standardverhaltens beim Drag-and-Drop.
 * @param {Event} ev - Das dragover-Ereignisobjekt.
*/
function allowDrop(ev) {
  ev.preventDefault();
}


/**
 * Moves the Task to the specified phase.
 * @param {string} phase - The target phase of the Task.
*/
async function moveTo(phase) {
  const taskIndex = tasks.findIndex(task => task.id === currentDraggedElement);

  if (taskIndex !== -1) {
      tasks[taskIndex].phases = phase; // Phase aktualisieren

      // Task-ID und aktualisiertes Task-Objekt an putData übergeben und auf Abschluss warten
      const updatedTask = await putData(tasks[taskIndex].id, tasks[taskIndex]);

      if (updatedTask) {
          // Wenn das Backend erfolgreich geantwortet hat, aktualisiere die Ansicht
          tasks[taskIndex] = updatedTask; // Task im lokalen Array aktualisieren
          updateHTML(); // HTML neu rendern
      }

      styleOfNoTaskToDo();
      styleOfNoTaskInProgress();
      styleOfNoTaskAwaitFeedback();
      styleOfNoTaskDone();
  } else {
      console.error("Task mit id", currentDraggedElement, "wurde nicht gefunden.");
  }
}



/**
 * to change the style of no Task to do in toDo-section if there no Tasks more
*/
function styleOfNoTaskToDo() {
  let toDoConetnt = document.getElementById("newTask-toDo");
  if(toDoConetnt.childElementCount > 0){
    document.getElementById('noTask-toDo').classList.add('hidden');
  }else{
    document.getElementById('noTask-toDo').classList.remove('hidden');
  }
}


/**
 * to change the style of no Task to do in Progress-section if there no Tasks more
*/
function styleOfNoTaskInProgress(){
  let inProgressContent = document.getElementById("newTask-inProgress");
  if(inProgressContent.childElementCount > 0){
    document.getElementById('noTask-inProgress').classList.add('hidden');
  }else{
    document.getElementById('noTask-inProgress').classList.remove('hidden');
  }
}


/**
 * to change the style of no Task to do in await-section if there no Tasks more
*/
function styleOfNoTaskAwaitFeedback(){
  let inProgressContent = document.getElementById("newTask-await");
  if(inProgressContent.childElementCount > 0){
    document.getElementById('noTask-await').classList.add('hidden');
  }else{
    document.getElementById('noTask-await').classList.remove('hidden');
  }
}


/**
 * to change the style of no Task to do in done-section if there no Tasks more
*/
function styleOfNoTaskDone(){
  let inProgressContent = document.getElementById("newTask-done");
  if(inProgressContent.childElementCount > 0){
    document.getElementById('noTask-done').classList.add('hidden');
  }else{
    document.getElementById('noTask-done').classList.remove('hidden');
  }
}


/**
 * Checks the screen width and navigates to addTask.html if the width is 1075 pixels.
*/
function checkwidthForAddTask(){
    window.location.href = '../html/addTask.html';
}


/**
 * Checks the screen width and navigates to addTask.html if the width is 1075 pixels.
*/
function updateButtonOnClick(){
  let plusbutton = document.getElementsByClassName('plus-btn');
  if(plusbutton.length > 0){
    if(window.innerWidth <= 1075){
      for(let i = 0; i < plusbutton.length; i++){
        plusbutton[i].setAttribute('onclick', "window.location.href = './addTask.html'");
      }
    }else{
      for(let i = 0; i < plusbutton.length; i++){
      plusbutton[i].setAttribute('onclick', 'openAddTask()');
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', () =>{
  updateButtonOnClick();
  window.addEventListener('resize', updateButtonOnClick)
});


/**
 * Adds bgcolor on current Page in the NavBar 
*/
function BoardBg() {
  document.getElementById('board').classList.add("bgfocus");
}