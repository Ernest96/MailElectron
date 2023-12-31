const MailMessage = require("../models/mailMessage");
const FileSaver = require("../utils/fileSaver");
const ColorsGenerator = require("../utils/colorsGenerator");
const Common = require("../common");
const messagesContainer = document.getElementById('messages');
const messageContentContainer = document.getElementById('message-content');
const menuIcons = document.querySelectorAll('.menu-icon');
const currentBoxText = document.getElementById('current-box-text');

function changeBox(box) {
    messagesContainer.innerHTML = '';
    messageContentContainer.innerHTML = '';

    currentBoxText.innerHTML = box;
    menuIcons.forEach(element => element.classList.remove('active'));
    document.getElementById(`${box}-menu`).classList.add('active');
}

function removeMessageFromList(uid) {
    messageContentContainer.innerHTML = '';
    document.querySelector(`[data-uid="${uid}"]`).remove();
}

function renderEmailList(messages, onEmailClick) {
    let html = '';

    //console.log(messages);

    messagesContainer.innerHTML = '';

    if (messages.length === 0) {
        messagesContainer.innerHTML = `
        <h4 class="centered">
            <i class="fa-solid fa-inbox"></i>
            No messages 
        </h4>`;
        return;
    }

    messages.forEach(obj => {
        let msg = new MailMessage(obj);
        let seenClass = msg.isSeen() ? 'seen' : 'unseen';
        let div = document.createElement("div");

        div.classList.add('message', seenClass);
        div.setAttribute('data-uid', msg.uid);


        html = `
            <div class="message-header">
                <div class="status-dot"></div>

                <div class="message-date">${msg.dateString} </div>

                <div class="short-name-icon" style="background-color:${ColorsGenerator.shortNameToColor(msg.shortName)}">
                    ${msg.shortName}
                </div>

                <div class="message-header-text">
                    <h4 class="message-name">${msg.fromName}</h4>
                    <h4 class="message-subject">${msg.subject}</h4>
                </div>

            </div>

            <div class="message-text">
                ${msg.text}
            </div>
        `

        div.addEventListener('click', () => onEmailClick(msg.uid));
        div.innerHTML = html;
        messagesContainer.appendChild(div);
    });
}

function renderEmailInfo(currentBox, messageObject, onDeleteClick, onSpamClick, onInboxClick) {
    let msg = new MailMessage(messageObject);

    //console.log(msg);
    document.querySelectorAll('.message').forEach(element => {
        element.classList.remove('active');
    });

    let attachmentsHtml = '';

    msg.attachments.forEach(atttachment => {
        attachmentsHtml += `
        <div class="attachment">
            <i class="fa-solid fa-file"></i>
            ${atttachment.filename}
        </div>
        `;
    })

    messageContentContainer.innerHTML = `
        <div class="message-content-header">

            <div class="short-name-icon" style="background-color:${ColorsGenerator.shortNameToColor(msg.shortName)}">
                ${msg.shortName}
            </div>

            <div class="message-header-text">
                <h5 class="message-email-date">${msg.dateString}</h5>
                <h4 class="message-name">${msg.fromName}</h4>
                <h5 class="message-email-from">${msg.fromEmail}</h5>
            </div>

        </div>

        <div class="message-content-body">
            <div class="message-content-top">
                <h3 class="message-content-subject">${msg.subject}</h3>
                <div class="message-buttons">
                    <div class="message-button" title="Reply" id="reply-btn"><i class="fa-solid fa-reply"></i></div>
                    ${currentBox == 'spam' ? '' : '<div class="message-button" title="Spam" id="spam-btn"><i class="fa-solid fa-ban"></i></div>'}
                    ${currentBox == 'inbox' ? '' : '<div class="message-button" title="Move to INBOX" id="inbox-btn"><i class="fa-solid fa-envelope"></i></div>'}
                    ${currentBox == 'trash' ? '' : '<div class="message-button" title="Delete" id="delete-btn"><i class="fa-solid fa-trash"></i></div>'}
                </div>
            </div>
            <div class="attachments-list">
                ${attachmentsHtml}
            </div>
            <iframe id="iframe-content" class="message-content-text" >
            </iframe>
        </div>
    `;

    let iframe = document.getElementById('iframe-content');
    iframe.srcdoc += msg.html;
    iframe.onload = () => onIframeLoad(msg, onDeleteClick, onSpamClick, onInboxClick);
}

function onIframeLoad(msg, onDeleteClick, onSpamClick, onInboxClick) {
    let iframe = document.getElementById('iframe-content');

    document.querySelector(`[data-uid="${msg.uid}"]`).classList.toggle('active');
    document.querySelector(`[data-uid="${msg.uid}"]`).classList.add('seen');
    document.getElementById('delete-btn')?.addEventListener('click', () => onDeleteClick(msg.uid));
    document.getElementById('spam-btn')?.addEventListener('click', () => onSpamClick(msg.uid));
    document.getElementById('inbox-btn')?.addEventListener('click', () => onInboxClick(msg.uid));

    let attachments = document.querySelectorAll('.attachment');
    for (let i = 0; i < attachments.length; i++) {
        const attachment = msg.attachments[i];
        attachments[i].addEventListener('click', () => FileSaver.downloadFile(attachment.filename, attachment.content))
    }

    Common.openLinksInExternal(iframe.contentDocument);
}

module.exports = {
    renderEmailList,
    renderEmailInfo,
    changeBox,
    removeMessageFromList
};