async function initInclude() {
    await includeHTML();
    await loadDataLogin();
    displayUserInitials();
}


async function includeHTML() {
    let includeElements = document.querySelectorAll('[w3-include-html]');
    for (let i = 0; i < includeElements.length; i++) {
        const element = includeElements[i];
        file = element.getAttribute("w3-include-html"); // "includes/header.html"
        let resp = await fetch(file);
        if (resp.ok) {
            element.innerHTML = await resp.text();
        } else {
            element.innerHTML = 'Page not found';
        }
    }
}


function toggleMenu() {
    let dropdownMenu = document.querySelector('.headerLogoutButton .dropdownMenu');
    dropdownMenu.classList.toggle('d-none');
}


function returnToHome() {
    window.location.href = "index.html";
}

function redirectToHelp() {
    window.location.href = "help.html";
}

function redirectToSummary() {
    window.location.href = "summary.html";
}

function redirectToAddTask() {
    window.location.href = "addTask.html";
}

function redirectToBoard() {
    window.location.href = "board.html";
}

function redirectToContact() {
    window.location.href = "contacts.html";
}

function redirectToLegalNotice() {
    window.location.href = "legalNotice.html";
}

function redirectToPrivacyPolice() {
    window.location.href = "privacyPolice.html";
}

function redirectToPrivacyPoliceSignup() {
    window.open("privacyPoliceSignup.html", "_blank");
}

function redirectToLegalNoticeSignup() {
    window.open("legalNoticeSignup.html", "_blank");
}


async function initHelp() {
    await includeHTML();
    await loadDataLogin();
    displayUserInitials();
}