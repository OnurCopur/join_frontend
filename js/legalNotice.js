async function init() {
    await includeHTML();
    legalNoticeBg();
    await loadDataLogin();
    displayUserInitials();
}

async function initSignupLegal() {
    await includeHTML();
    legalNoticeBg();
}


function legalNoticeBg() {
    document.getElementById('legalNotice').classList.add("bgfocus");
}