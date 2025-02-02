let currentTaskId = null;  // Dies ist die ID des aktuell geöffneten Tasks

function setCurrentTaskId(taskId) {
  currentTaskId = taskId;  // Setze die aktuelle Task-ID
}

function getCurrentTaskId() {
  return currentTaskId;  // Gib die aktuelle Task-ID zurück
}


/**
 * to show the Task at the specified index in the task list.
 * @param {number} taskIndex - The index of the task to be opened.
 */
function showTask(taskId) {
  currentTaskId = taskId;  // Speichere die ID des aktuell angezeigten Tasks

  const task = tasks.find(t => t.id === taskId);  // Finde den Task basierend auf der ID
  if (!task) {
      console.error(`Task mit ID ${taskId} nicht gefunden.`);
      return;
  }

  let showContent = document.getElementById("showTask");
  showContent.classList.remove("hidden");
  let overlay = document.getElementsByClassName("overlay")[0];
  overlay.classList.remove("hidden");
  showContent.innerHTML = "";
  showContent.innerHTML += generateShowTask(task);
  changeColorOfCategoryTitleShow(task);
  contactsShowLetterRender(task);
  contactsShowNameRender(task);
  subtasksShowRender(task);
  slideInTask();
  heightOfShowTaskAdjust();
}



/**
 * to generate showTask at the specified index in the task list.
 * @param {number} taskIndex - The index of the task to be opened.
 */
function generateShowTask(task) {
  return `
  <div class="category-show-content">
      <div id="card-category-title-show${task.id}" style="background-color: ${task.category_color || 'transparent'};">${task.category}</div>
      <div class="closeImg" onclick="closeMe()"></div>
  </div>
  <div class="title-description-content">
      <div class="title-content-show"><h2 class="show-card-title">${task.title}</h2></div>
      <p class="show-card-description">${task.description}</p>
  </div>
  <div class="dueDate-content">
      <div class="dueDateText-content">Due date:</div>${convertDate(task.date)}
  </div>
  <div class="priority-content">
      <div class="prioText">Priority:</div>
      <div class="prio-icon-text-content">${task.prio} <img src="${task.prioIcon}" alt=""></div>
  </div>
  <div class="show-assignedTo-content">
      <div class="assignedToText">Assigned To:</div>
      <div class="show-user-content">
          <div class="user-task-show-content" id="user-show-letter"></div>
          <div class="user-show-content" id="user-show-name"></div>
      </div>
  </div>
  <div>Subtasks</div>
  <div id="subtask-show"></div>
  <div class="show-btn-content">
      <div class="show-delete-content" onclick="deleteTask(${task.id})">
          <i class="fa fa-trash-o" style="font-size:24px"></i>
          <button>Delete</button>
      </div>
      <div class="show-line-content"></div>
      <div class="show-edit-content" onclick="openEdit(${task.id})">
          <i class="fa fa-edit" style="font-size:24px"></i>
          <button>Edit</button>
      </div>
  </div>
  `;
}

/**
 * to slide a task from right to the middle of the Screen.
 */
function slideInTask(){
  let dialog = document.querySelector('.showTask');
  dialog.classList.remove('slide-in'); 
  setTimeout(() => {
      dialog.classList.add('slide-in');
  }, 50);
}


/**
 * to adjust a Task accroding to the height of 650px.
 */
function heightOfShowTaskAdjust(){
  let showContent = document.getElementById('showTask');
  if(showContent.scrollHeight > 650){
    showContent.style.height = 'auto';
    showContent.style.maxHeight ='none';
  }else{
    showContent.style.maxHeight = '650px';
  }
}


/**
 * to render a Subtask at the specified index in the task list.
 * @param {number} taskIndex - The index of the task to be rendered.
 */
function subtasksShowRender(task) {
  let content = document.getElementById('subtask-show');
  content.innerHTML = '';
  
  if (!task || !task.subtasks || task.subtasks.length === 0) {
    content.innerHTML = "<p>No subtasks available.</p>";
    return;
  }

  for (let subtaskIndex = 0; subtaskIndex < task.subtasks.length; subtaskIndex++) {
    const subtask = task.subtasks[subtaskIndex];
    content.innerHTML += `
      <div class="checkbox-show-content">
        <input type="checkbox" onclick="UpdateProgress(${task.id})" ${subtask.completed ? 'checked' : ''} id="checkbox${subtaskIndex}">
        <label class="subtask-show-text">${subtask.title}</label>
      </div>`;
  }
}




/**
 * to update the progress of a Task at the specified index in the task list.
 * @param {number} taskIndex - The index of the task to be updated.
 */
function UpdateProgress(taskId) {
  // Den Task anhand der ID finden
  const task = tasks.find(t => t.id === taskId);
  
  if (!task) {
    console.error("Task not found with ID:", taskId);
    return;
  }

  if (!task.subtasks || task.subtasks.length === 0) {
    console.warn("No subtasks found for task:", taskId);
    return;
  }

  let checkedCount = 0;

  // Iteriere über alle Subtasks und zähle die abgehakten
  for (let j = 0; j < task.subtasks.length; j++) {
    let checkbox = document.getElementById(`checkbox${j}`);
    if (checkbox && checkbox.checked) {
      checkedCount++;
    }
  }

  // Fortschrittsbalken und Anzeige der Anzahl aktualisieren
  let progress = document.getElementById(`progressBar${taskId}`);
  let numberOfSubtask = document.getElementById(`numberOfSubtask${taskId}`);

  if (!progress || !numberOfSubtask) {
    console.error("Progress bar or subtasks count element not found for task:", taskId);
    return;
  }

  numberOfSubtask.innerHTML = `${checkedCount}/${task.subtasks.length}`;
  progress.value = (checkedCount / task.subtasks.length) * 100;
}


/**
 * to render the letters of contacts at the specified index in the task list.
 * @param {number} taskIndex - The index of the task to be rendered.
 */
function contactsShowLetterRender(task) {
  let content = document.getElementById('user-show-letter');
  content.innerHTML = ""; // Vorherigen Inhalt leeren

  for (let contactId of task.contacts) {
      // Hole den Kontakt basierend auf der ID
      let contact = contacts.find(c => c.id === contactId);
      if (!contact) {
          console.error(`Kontakt mit ID ${contactId} nicht gefunden.`);
          continue;
      }

      // Initialen aus dem Namen des Kontakts generieren
      let letter = contact.name.split(" ");
      let result = "";
      for (let name of letter) {
          result += name.charAt(0).toUpperCase();
      }

      // Kontakt mit farbigem Hintergrund rendern
      content.innerHTML += `<div class="user-task-content-show" style="background-color:${contact.color};">${result}</div>`;
  }
}



/**
 * to render the contacts at the specified index in the task list.
 * @param {number} taskIndex - The index of the task to be rendered.
 */
function contactsShowNameRender(task) {
  let content = document.getElementById('user-show-name');
  content.innerHTML = ""; // Vorherigen Inhalt leeren

  for (let contactId of task.contacts) {
      // Kontakt basierend auf der ID finden
      let contact = contacts.find(c => c.id === contactId);
      if (!contact) {
          console.error(`Kontakt mit ID ${contactId} nicht gefunden.`);
          continue;
      }

      // Kontaktname hinzufügen
      content.innerHTML += `<div class="user-show-name">${contact.name}</div>`;
  }
}



/**
 * to change the color of a category-title at the specified index in the task list.
 * @param {number} taskIndex - The index of the task to be changed.
 */
function changeColorOfCategoryTitleShow(task) {
  let content = document.getElementById(`card-category-title-show${task.id}`);
  if (!content) return;

  if (task.category === "User Story") {
      content.classList.add("blue");
  } else if (task.category === "Technical Task") {
      content.classList.add("green");
  }
}