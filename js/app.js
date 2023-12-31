const imapService = require("../js/services/imapService.js");
const emailRendererService = require("../js/services/emailRendererService.js");
const messageSenderService = require("../js/services/messageSenderService.js");
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

let messagesList = document.getElementById('messages');
let isScrollLoading = false;

syncBtn.onclick = refreshBox;
logoutBtn.onclick = logout;

initApp();

function initApp() {
    const { email, password } = credentialsManager.getCredentials();

    showLoading();
    document.title = `${email} - MailElectron`;

    document.querySelectorAll('.menu-btn').forEach(element =>
        element.addEventListener('click', onMenuIconClick));

    document.getElementById('send-mail-menu').addEventListener('click', onSendMenuClick);

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
        emailRendererService.renderEmailInfo(currentBox, message, onDeleteClick, onSpamClick, onInboxClick);
        if (!message.isSeen()) {
            imapService.markAsSeen(message.uid);
        }
    }
}

function onDeleteClick(uid) {
    if (confirm("Are you sure you want to delete this message?")) {
        emailRendererService.removeMessageFromList(uid);
        imapService.moveToBox(uid, "trash");
    }
}

function onSpamClick(uid) {
    if (confirm("Are you sure you want to mark this message as SPAM?")) {
        emailRendererService.removeMessageFromList(uid);
        imapService.moveToBox(uid, "spam");
    }
}

function onInboxClick(uid) {
    if (confirm("Are you sure you want to move this message to INBOX?")) {
        emailRendererService.removeMessageFromList(uid);
        imapService.moveToBox(uid, "inbox");
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

function onSendMenuClick(event) {
    messageSenderService.renderSendForm();
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

messagesList.addEventListener('scroll', function () {
    if (isScrollLoading == true || messagesList.scrollTop == 0 || messages.length >= totalMessages) {
        return;
    }

    if (messagesList.scrollTop + messagesList.clientHeight >= messagesList.scrollHeight - 10) {
        messagesList.scrollTop = messagesList.scrollHeight;

        currentPage++;
        showLoading();
        loadMore();
    }
});