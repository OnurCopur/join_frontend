/**
 * @file summary.js is the JavaScript file for the summary.html page.
 *
 */
async function initSummary() {
    await includeHTML();
    await loadDataLogin();
    summaryBg();
    updateGreeting();
    displayUsername();
    displayUserInitials();
    showContent();
    handleGreetingMobile();
    await getTasksAndProcess();
}


/**
 * highlight the summary link in the sidebar
 */
function summaryBg() {
    document.getElementById('summary').classList.add("bgfocus");
}


/**
 * Determines the appropriate greeting based on the current time of day.
 * @returns {string} The greeting message according to the time of day.
 */
function updateGreeting() {
    let currentTime = new Date();
    let currentHour = currentTime.getHours();

    if (currentHour < 12) {
        greeting = "Good morning";
    } else if (currentHour < 18) {
        greeting = "Good afternoon";
    } else {
        greeting = "Good evening";
    }
    document.getElementById("daytimeGreeting").innerText = greeting;
    document.getElementById("daytimeGreetingMobile").innerText = greeting
    }


/**
 * get the Username from the session storage and display it in the welcome message
 */
function displayUsername() {
    // Den Benutzernamen aus der Session abrufen
    let username = sessionStorage.getItem('loggedInUser');
    console.log("Logged in user:", username); // Log, um den Wert zu prüfen

    let greetingName = document.getElementById('nameGreeting');
    let greetingNameMobile = document.getElementById('nameGreetingMobile');

    // Wenn der Benutzername existiert, setze ihn in die HTML-Elemente
    if (username) {
        greetingName.innerText = username;
        greetingNameMobile.innerText = username;
    } else {
        greetingName.innerText = "Guest"; // Fallback, wenn kein Benutzername gefunden wird
        greetingNameMobile.innerText = "Guest";
    }
}




/**
 * show initials from username
 */
function displayUserInitials() {
    // Den Benutzernamen aus der Session abrufen
    let username = sessionStorage.getItem('loggedInUser');
    let userInitials = document.getElementById('userInitials');

    if (username) {
        let words = username.split(' ');    // Den Benutzernamen in Wörter aufteilen
        let initials = calculateUserInitials(words);    // Berechnen der Initialen mit der neuen Funktion

        userInitials.innerText = initials;  // Setzen des Texts des Elements
    } else {
        userInitials.innerText = "G";   // Falls kein Benutzer angemeldet ist, zeigen Sie ein Standardzeichen an
    }
}

/**
 * function to find out the initials of the first and last name of the user
 */
function calculateUserInitials(words) {
    if (words.length >= 2) {
        // Den Anfangsbuchstaben des ersten und letzten Wortes extrahieren
        let firstInitial = words[0].charAt(0).toUpperCase();
        let lastInitial = words[words.length - 1].charAt(0).toUpperCase();
        return firstInitial + lastInitial;
    } else if (words.length === 1) {
        // Wenn der Benutzername nur aus einem Wort besteht, zeige den Anfangsbuchstaben dieses Wortes an
        return words[0].charAt(0).toUpperCase();
    } else {
        // Wenn der Benutzername leer ist, zeige ein Standardzeichen an
        return "G";
    }
}


/**
 * this function shows the main content after 1500 ms
 */
function showContent() {
if (window.innerWidth >= 850) {
    const content = document.getElementById('content');
    content.style.display = 'flex';
    content.style.flexDirection = 'column';
} else {
    setTimeout(function() {
    const content = document.getElementById('content');
    content.style.display = 'flex';
    content.style.flexDirection = 'column';
    }, 1000);
}
}


/**
 * this function hides the greeting message after 1500 ms in the responsive view
 */
function handleGreetingMobile() {
    if (window.innerWidth <= 850) {
        setTimeout(function() {
            document.getElementById('greeting-mobile').style.display = 'none';
        }, 1000);
    } else {
        document.getElementById('greeting-mobile').style.display = 'none';
    }
}


/**
 * allocate the tasks to the respective categories
 */
let todo = 0;
let done = 0;
let urgentTask = 0;
let taskInBoard = 0;
let inProgress = 0;
let awaitFeedback = 0;
let dates = [];

async function getTasksAndProcess() {
    await getTask();
    countTasks();
    getUrgentTask(tasks);
    dates.push(tasks);
    taskInBoard = todo + inProgress + awaitFeedback + done;
    assignTasks();
    const earliestDate = filterEarliestDate(tasks);
    getEarliestDate(earliestDate);
}


/**
 * get the tasks from firebase
 */
async function getTask() {
    try {
        let response = await fetch(BASE_URL + "tasks/", {
            headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        let tasksData = await response.json();

        if (tasksData) {
            tasks = Object.keys(tasksData).map(key => tasksData[key]);
        } else {
            tasks = [];
        }
    } catch (error) {
        console.error('Error loading tasks:', error.message);
        tasks = [];
    }
}



/**
 * gets the earliest date of the urgent task
 */
function getEarliestDate(earliestDate) {
    if (earliestDate) {
        const options = {year: "numeric", month: "long", day: "numeric"};
        document.getElementById("summaryUrgentTaskNextDate").innerHTML =
            earliestDate.toLocaleDateString("en-US", options);
        document.getElementById("summaryUrgentTaskInfo").innerHTML =
            "Upcoming Deadline";
    } else {
        document.getElementById("summaryUrgentTaskNextDate").innerHTML =
            "No urgent deadlines";
        document.getElementById("summaryUrgentTaskInfo").innerHTML =
            "Upcoming Deadline";
    }
}


/**
 * allocate the tasks to the respective categories
 */
function assignTasks() {
    document.getElementById("todoCounter").innerHTML = todo;
    document.getElementById("doneCounter").innerHTML = done;
    document.getElementById("tasksInBoardNum").innerHTML = taskInBoard;
    document.getElementById("taskInProgressNum").innerHTML = inProgress;
    document.getElementById("awaitingFeedbackNum").innerHTML = awaitFeedback;
}


/**
 * count the tasks in the respective categories
 */
function countTasks() {
    for (i = 0; i < tasks.length; i++) {
        let taskArr = tasks[i];
        let phase = taskArr["phases"];
        if (phase == "To Do") {
            todo++;
        } else if (phase == "In progress") {
            inProgress++;
        } else if (phase == "Await feedback") {
            awaitFeedback++;
        } else if (phase == "Done") {
            done++;
        }
    }
}


/**
 * count the urgent tasks from the task array
 */
function getUrgentTask(tasks) {
    const taskCount = tasks.filter((t) => t.prio === "Urgent");
    document.getElementById("urgentCount").innerHTML =
        taskCount.length;
}


/**
 * check valid date and return the earliest date of the urgent tasks
 */
function filterEarliestDate(tasks) {
    const urgentTasks = filterUrgentTasks(tasks);
    if (urgentTasks.length > 0) {
        return findEarliestDate(urgentTasks);
    }
    return null;
}


/**
 * filters the transferred list of tasks for those that are marked as "Urgent"
 */
function filterUrgentTasks(tasks) {
    return tasks.filter((t) => t.prio === "Urgent");
}


/**
 * searches for the earliest date among the given tasks
 */
function findEarliestDate(tasks) {
    const validDates = tasks.map(t => new Date(t.date)).filter(d => !isNaN(d));
    if (validDates.length === 0) {
        console.error("No valid dates found.");
        return null;
    }
    const earliestDate = new Date(Math.min(...validDates));
    return earliestDate;
}