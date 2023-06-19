const imapService = require("../js/services/imapService");
const CredentialsManager = require('../js/utils/credentialsManager');


const loginBtn = document.getElementById('login-btn');
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('login-email');
const passwordInput = document.getElementById('login-password');

let imapEventEmitter = imapService.imapEventEmitter;
const credentialsManager = new CredentialsManager();

loginBtn.onclick = login;
imapEventEmitter.on('connect', onConnect);
imapEventEmitter.on('error', onError);

if (credentialsManager.isLoggedIn()) {
    const { email, password } = credentialsManager.getCredentials();
    emailInput.value = email;
    passwordInput.value = password;
    imapService.connect(email, password);
}

function login() {
    let email = emailInput.value;
    let password = passwordInput.value;

    if (loginForm.checkValidity() == false) {
        loginForm.reportValidity();
        return;
    }

    console.log("logging");
    imapService.connect(email, password);
}

function onConnect(email, password) {
    credentialsManager.setCredentials(email, password);

    window.location.href = 'app.html';
}

function onError(error) {
    alert(error + "\n Check your credentials");
}