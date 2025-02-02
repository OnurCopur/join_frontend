let subtasks = [];


/**
 * changes icons of subtasks field when click inside or outside of container
 */
function openIcons() {
    let container = document.getElementById('addTask-subtasks-container');
    let icons = document.getElementById('addTask-subtasks-icons');
    let plus = document.getElementById('dropdown-img-plus');
    window.addEventListener('click', function (e) {
        if (container.contains(e.target)) {
            icons.classList.remove('d-none');
            plus.classList.add('d-none');
        } else {
            icons.classList.add('d-none');
            plus.classList.remove('d-none');
        }
    });
}


/**
 * empties subtask input
 */
function emptySubtaskInput() {
    let container = document.getElementById('addTask-subtasks');
    container.value = '';
}


/**
 * adds subtask to list 
 */
function addSubtask() {
    let subtaskTitle = document.getElementById('addTask-subtasks').value;
    if (subtaskTitle.length > 1) {
        // Stelle sicher, dass nur der Text als title hinzugefügt wird
        subtasks.push(subtaskTitle);
        generateSubtasksList();
        emptySubtaskInput();
    }
}



/**
 * adds subtask to list with click on Enter
 */
function addSubtaskEnter(){
    let input = document.getElementById('addTask-subtasks');
    input.addEventListener("keypress", function(event) {
        if (event.key === "Enter"){
            event.preventDefault();
            document.getElementById("add-subtask-button").click();
        } 
    });
}


/**
 * generates list of subtasks
 */
function generateSubtasksList() {
    let container = document.getElementById('subtasks-list');
    container.innerHTML = '';
    for (let i = 0; i < subtasks.length; i++) {
        const subtask = subtasks[i];
        container.innerHTML += templateSubtaskListElement(i, subtask);
    }
}


/**
 * generates HTML of list element
 * 
 * @param {number} i - position in subtasks array
 * @param {string} subtask - name of subtask
 * @returns 
 */
function templateSubtaskListElement(i, subtask) {
    return `
        <div id="subtasks-list-element${i}" class="subtasks-list-element">
            <li ondblclick="editSubtask(${i})">${subtask}</li>
            <div class="subtasks-icon subtasks-icon-hidden">
                <img onclick="editSubtask(${i})" src="/img/edit.svg" alt="Bearbeiten">
                <div class="parting-line subtasks-icon-line"></div>
                <img onclick="deleteSubtask(${i})" src="/img/delete.svg" alt="Löschen">
            </div>
        </div>
    `;
}


/**
 * deletes one list element 
 * 
 * @param {number} i - position in subtasks array
 */
function deleteSubtask(i) {
    subtasks.splice(i, 1);
    generateSubtasksList();
}


/**
 * opens field to edit subtask
 * 
 * @param {number} i - position in subtasks array
 */
function editSubtask(i) {
    let container = document.getElementById(`subtasks-list-element${i}`);
    container.classList.add('subtask-edit-container');
    container.innerHTML = templateEditSubtask(i);
}


/**
 * generates HTML of field to edit subtask
 * 
 * @param {number} i - position in subtasks array
 * @returns 
 */
function templateEditSubtask(i) {
    return `
    <input id="newSubtask" value="${subtasks[i]}" class="inputfield subtask-edit-input" type="text">
    <div id="addTask-subtasks-icons" class="subtasks-icon">
        <img onclick="deleteSubtask(${i})" src="/img/delete.svg" alt="Löschen">
        <div class="parting-line subtasks-icon-line"></div>
        <img onclick="keepSubtask(${i})" src="/img/done.svg" alt="Bestätigen">
    </div>
    `;
}


/**
 * generates list with new Subtask & closes edit field
 * 
 * @param {number} i - position in subtasks array
 */
function keepSubtask(i) {
    let newSubtask = document.getElementById('newSubtask').value;
    if (newSubtask.length > 1) {
        subtasks.splice(i, 1, newSubtask);
        generateSubtasksList();
    }
}