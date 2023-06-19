const imapService = require("../js/services/imapService.js");
const emailRendererService = require("../js/services/emailRendererService.js");
const CredentialsManager = require('../js/utils/credentialsManager');

const syncBtn = document.getElementById('sync-btn');
const syncLoadingIcon = document.getElementById('sync-loading-icon');
const logoutBtn = document.getElementById('logout-btn');

const credentialsManager = new CredentialsManager();
let imapEventEmitter = imapService.imapEventEmitter;
let messages = [];
let currentBox = "inbox";
let currentPage = 0;
let totalMessages = 0;

var listElm = document.getElementById('messages');
var isScrollLoading = false;

syncBtn.onclick = refreshBox;
logoutBtn.onclick = logout;

initApp();

function initApp() {
    const { email, password } = credentialsManager.getCredentials();

    showLoading();
    document.title = `${email} - Mailectron`;

    document.querySelectorAll('.menu-btn').forEach(element =>
        element.addEventListener('click', onMenuIconClick));

    imapEventEmitter.on('fetchend', onFetchEnd);
    imapEventEmitter.on('connect', onConnect);
    imapEventEmitter.on('error', onError);

    imapService.connect(email, password);
}

function getMessages(box) {
    showLoading();
    imapService.fetchBox(box, currentPage);
}

function refreshBox() {
    getMessages(currentBox);
}

function onFetchEnd(receivedMessages, boxTotal) {
    messages = receivedMessages;
    totalMessages = boxTotal;
    //console.log(messages);
    console.log('total = ' + boxTotal);

    hideLoading();
    emailRendererService.renderEmailList(messages, onEmailClick);
}

function onConnect() {
    getMessages("inbox");
}

function onError(error) {
    console.log(error);
}

function onEmailClick(uid) {
    let message = messages.find(msg => msg.uid === uid);
    if (message) {
        emailRendererService.renderEmailInfo(message, onDeleteClick);
        if (!message.isSeen()) {
            imapService.markAsSeen(message.uid);
        }
    }
}

function onDeleteClick(uid) {
    if (confirm("Are you sure you want to delete this message?")) {
        emailRendererService.removeMessageFromList(uid);
        imapService.markAsTrash(uid);
    }
}

function onMenuIconClick(event) {
    let menuId = event.currentTarget.getAttribute('id');
    let box = menuId.split('-menu')[0];
    currentBox = box;
    currentPage = 0;
    emailRendererService.changeBox(box);
    getMessages(box);
}

function logout() {
    credentialsManager.clearCredentials();
    window.location.href = "login.html";
    imapService.endConnection();
}

function loadMore() {
    getMessages(currentBox);
}

function showLoading() {
    isScrollLoading = true;

    document.getElementById('scroll-loader').style.display = 'block';
    syncLoadingIcon.classList.add('fa-spin');
}

function hideLoading() {
    isScrollLoading = false;
    syncLoadingIcon.classList.remove('fa-spin');
    document.getElementById('scroll-loader').style.display = 'none';
}

listElm.addEventListener('scroll', function () {
    if (isScrollLoading == true || listElm.scrollTop == 0 || messages.length >= totalMessages) {
        return;
    }

    if (listElm.scrollTop + listElm.clientHeight >= listElm.scrollHeight - 10) {
        listElm.scrollTop = listElm.scrollHeight;

        currentPage++;
        showLoading();
        loadMore();
    }
});