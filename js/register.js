let users = [];


/**
 * Changes the form into the signup form
 */
function changeForm() {
    document.querySelector('.signUpMobile').classList.add("d-none");
    document.getElementById('signUpContainer').innerHTML = "";
    let form = document.getElementById('form');
    form.classList.add("formSignUp");
    let checkboxSignUp = document.getElementById('checkboxSignUp');
    checkboxSignUp.classList.add("loginCheckboxSignUp");

    form.innerHTML = getFormContent();
}


/**
 * HTML-Template for function changeForm()
 */
function getFormContent() {
    return `
        <form onsubmit="addUser(); return false;">
            <div class="formHeadline">
                <div class="headline">
                    <img onclick="returnToHome()" class="vector" src="/img/Vector.png">
                    <h1 class="formHeadlineTextSignUp">Sign up</h1>
                </div>            
                <div class="formHeadlineBorder"></div>
            </div>    
            <div class="mailPassword">
                <div>
                    <input class="inputNameSignUp" type="text" placeholder="Name" required id="name">
                </div>    
                <div>
                    <input class="inputMailSignUp" type="email" placeholder="Email" required id="email">
                </div>
                <div>
                    <input class="inputPasswordSignUp" type="password" placeholder="Password" required id="password">
                </div>
                <div>
                    <input class="inputPasswordSignUp" type="password" placeholder="Confirm Password" required id="password-confirm">
                </div>
                
                <div class="notification">
                    <p id="msgbox-signup"><p>
                </div>  
                <div class="loginCheckboxSignUp">
                    <input type="checkbox" class="loginCheckBoxRememberMe" id="loginCheckBoxRememberMe">
                    <label for="loginCheckBoxRememberMe" class="loginCheckBoxRememberMeLabel"></label>
                    <p class="privacy-text">I accept the <a class="policeLink" onclick="redirectToPrivacyPoliceSignup()">Privacy Police</a></label>
                </div>
                <div class="buttons">
                    <button class="buttonLogin">Sign up</button>
                </div>
            </div>
        </form> 
    `;
}


/**
 * The addUser function registers a new user after it has performed various validations. 
 * It uses several auxiliary functions to ensure that the entries are correct and that there 
 * are no conflicts with existing users
 */
async function addUser() {
    let name = document.getElementById('name').value.trim();
    let email = document.getElementById('email').value.trim();
    let password = document.getElementById('password').value.trim();
    let passwordConfirm = document.getElementById('password-confirm').value.trim();
    let msgbox = document.getElementById('msgbox-signup');

    if (!validateUserInput(name, email, password, passwordConfirm, msgbox)) {
        return;
    }

    try {
        let response = await fetch("http://127.0.0.1:8000/api/auth/register/", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: name,
                email: email,
                password: password,
                password_confirm: passwordConfirm
            })
        });
        if (response.ok) {
            let data = await response.json();
            alert("Registration successful! Token: " + data.token);
            localStorage.setItem('token', data.token); // Token speichern
            window.location.href = 'index.html'; // Weiterleitung nach erfolgreicher Registrierung
        }
        else {
            let errorData = await response.json();
            msgbox.innerHTML = JSON.stringify(errorData);
        }
    } catch (error) {
        console.error("Error during registration:", error);
        msgbox.innerHTML = "An error occurred. Please try again.";
    }
}



/**
 * The validateUserInput function checks the validity of the user input 
 * and ensures that all required criteria are met before the registration of a new user is continued.
 */
function validateUserInput(name, email, password, passwordConfirm, msgbox) {
    if (!checkPasswordMatch(password, passwordConfirm, msgbox)) {
        return false;
    }
    if (!checkPrivacyPolicy(msgbox)) {
        return false;
    }
    if (!checkInputValidity(name, email, password, msgbox)) {
        return false;
    }
    if (users.some(user => user.email === email)) {  // Überprüfen, ob E-Mail bereits existiert
        msgbox.innerHTML = "Email already exists";
        return false;
    }
    return true;
}



/**
 * The checkPasswordMatch function checks whether the password entered and the password confirmation match
 */
function checkPasswordMatch(password, passwordConfirm, msgbox) {
    if (password !== passwordConfirm) {
        msgbox.innerHTML = "Your passwords don't match";
        return false;
    }
    return true;
}


/**
 * The checkPrivacyPolicy function checks whether a checkbox confirming that the user has accepted the privacy policy is activated
 */
function checkPrivacyPolicy(msgbox) {
    if (!document.getElementById('loginCheckBoxRememberMe').checked) {
        msgbox.innerHTML = "Please accept the Privacy Policy";
        return false;
    }
    return true;
}


/**
 * This function checks the validity of the data entered, namely the name, e-mail address and password
 */
function checkInputValidity(name, email, password, msgbox) {
    const allowedCharacters = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/;
    if (!name.match(/^[a-zA-Z\s]+$/)) {     // Überprüfen, ob Name gültig ist
        msgbox.innerHTML = "Name can only contain letters and spaces";
        return false;
    }
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {       // Überprüfen, ob E-Mail gültig ist
        msgbox.innerHTML = "Invalid email address";
        return false;
    }
    if (!password.match(allowedCharacters)) {       // Überprüfen, ob das Passwort gültig ist
        msgbox.innerHTML = "Password can only contain letters, numbers, and certain special characters";
        return false;
    }
    return true;
}


/**
 * checks whether a user with the specified e-mail address or password already exists in a list of users
 */
function checkExistingUser(email, password, msgbox) {
    // Überprüfen, ob die E-Mail bereits existiert
    if (users.some(user => user.email === email)) {
        msgbox.innerHTML = "Email already exists";
        return false;
    }

    // Überprüfen, ob das Passwort bereits existiert
    if (users.some(user => user.password === password)) {
        msgbox.innerHTML = "Password already exists";
        return false;
    }

    return true;
}


/**
 * clears the input fields of a signup form
 */
function clearInputFields() {
    document.getElementById('name').value = "";
    document.getElementById('email').value = "";
    document.getElementById('password').value = "";
    document.getElementById('password-confirm').value = "";
}


/**
 * this function is for the login
 */
async function login() {
    let email = document.getElementById('email-login').value.trim();
    let password = document.getElementById('password-login').value.trim();
    let msgbox = document.getElementById('msgbox');

    try {
        let response = await fetch(BASE_URL + "auth/login/", {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email, password: password })
        });

        if (response.ok) {
            let data = await response.json();
            console.log("Login response data:", data);
            // Das Token nach erfolgreichem Login speichern
            localStorage.setItem('token', data.token);  
            sessionStorage.setItem('loggedInUser', data.username);
            sessionStorage.setItem('loggedInEmail', data.email);

            // Nach dem erfolgreichen Login, den Benutzer aus dem Backend laden:
            let usersResponse = await fetch(BASE_URL + "auth/users/", {
                headers: {
                    'Authorization': `Token ${data.token}`
                }
            });
            let usersData = await usersResponse.json();
            users = usersData;  // Benutzer im lokalen Array speichern
            console.log("Loaded users:", users);

            alert("Login successful!");
            window.location.href = 'summary.html';  // Weiterleitung zur Seite
        } else {
            msgbox.innerHTML = "Invalid email or password.";
        }
    } catch (error) {
        console.error("Login error:", error);
        msgbox.innerHTML = "An error occurred. Please try again.";
    }
}




/**
 * The handleLogin function checks the user input and performs the actions required for login
 */
function handleLogin(email, password, rememberMeChecked, msgbox) {
    const user = users.find(user => user.email === email && user.password === password);    // Überprüfe, ob die Benutzereingaben mit den im Array befindlichen Benutzerdaten übereinstimmen

    if (user) {
        sessionStorage.setItem('loggedInUser', user.name);
        localStorage.setItem('lastLoggedInEmail', email); // Speichere die E-Mail-Adresse im Local Storage
        localStorage.setItem('lastLoggedInPassword', password); // Speichere das Passwort im Local Storage
        localStorage.setItem('rememberMeChecked', rememberMeChecked); // Speichere den Status der Checkbox im Local Storage

        alert("Login successful!");
        window.location.href = "summary.html"; // Weiterleitung zur summary.html-Seite
    } else {
        msgbox.innerHTML = "Keine gültige Email oder Passwort eingetragen";
    }
}


/**
 * this function is for the logout
 */
async function logout() {
    try {
        let token = localStorage.getItem('token');
        await fetch(BASE_URL + "auth/logout/", {
            method: 'POST',
            headers: { 'Authorization': `Token ${token}` }
        });
        localStorage.removeItem('token');
        sessionStorage.removeItem('loggedInUser');
        sessionStorage.removeItem('loggedInEmail');
        alert("Logout successful!");
        window.location.href = "index.html";
    } catch (error) {
        console.error("Logout error:", error);
    }
}



/**
 * Fills the input fields with the last logged-in credentials from the local storage
 */
function fillRemembereInputs() {
    const lastLoggedInEmail = localStorage.getItem('lastLoggedInEmail');
    const lastLoggedInPassword = localStorage.getItem('lastLoggedInPassword');
    const rememberMeChecked = localStorage.getItem('rememberMeChecked');

    if (lastLoggedInEmail && lastLoggedInPassword && rememberMeChecked === 'true') {
        document.getElementById('email-login').value = lastLoggedInEmail;
        document.getElementById('password-login').value = lastLoggedInPassword;
        document.getElementById('loginCheckBoxRememberMe').checked = true; // Stelle sicher, dass die Checkbox aktiviert ist
    }
}


/**
 * Changes the animation image in the responsive view
 */
function changeImage() {
    // Prüfen, ob Bildschirmbreite kleiner oder gleich 720px ist
    if (window.innerWidth <= 720) {
        document.getElementById('logo2').style.display="block";
        // Wenn ja, ändere das Bild nach 500 Millisekunden
        setTimeout(function(){
            document.getElementById('logo2').style.display="none";
        }, 500) 
        document.getElementById('logo').style.display="block";}
    }