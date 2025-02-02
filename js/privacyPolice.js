async function init() {
    await includeHTML();
    privacyPoliceBg();
    await loadDataLogin();
    displayUserInitials();
}

async function initSignupPrivacy() {
    await includeHTML();
    privacyPoliceBg();
}


function privacyPoliceBg() {
    document.getElementById('privacyPolice').classList.add("bgfocus");
}