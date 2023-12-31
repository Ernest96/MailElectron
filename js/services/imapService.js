const Imap = require('imap');
const { simpleParser } = require('mailparser');
const MailMessageBuilder = require('../utils/mailMessageBuilder');
const events = require('events');
const { EventEmitter } = require('stream');
const imapEventEmitter = new events.EventEmitter();

const boxesMap = {
    "inbox" : "INBOX",
    "sent" : "[Gmail]/Sent Mail",
    "spam" : "[Gmail]/Spam",
    "drafts" : "[Gmail]/Drafts",
    "trash" : "[Gmail]/Trash",
}

const imapSettings = {
    host: 'imap.gmail.com',
    port: 993,
    tls: true,
    tlsOptions: { rejectUnauthorized: false }
};

const fetchPerPage = 15;

let imap;
let currentPage;

function connect(user, password) {
    endConnection();

    imapSettings.user = user;
    imapSettings.password = password;

    imap = new Imap(imapSettings);

    imap.once('ready', onConnect);
    imap.once('error', onError);

    imap.connect();
}

function fetchBox(boxKey, page) {
    let box = boxesMap[boxKey];
    currentPage = page;

    imap.openBox(box, false, openBox);
}

function markAsSeen(uid) {
    imap.addFlags(uid, ['\\Seen'], onMessageMove);
}

function moveToBox(uid, box) {
    imap.move(uid, boxesMap[box], onMessageMove)
}

function onMessageMove(err) {
    if (err) {
        imapEventEmitter.emit('error', err);
    }
}

function openBox(err, box) {
    if (err) {
        imapEventEmitter.emit('error', err);
        return;
    }
    getBoxMessage(box);
}

function getBoxMessage(box) {
    let boxTotal = box.messages.total;
    let messages = [];
    let messagesBuildCount = 0;

    if (boxTotal === 0) {
        onFetchEnd(messages, boxTotal);
        return;
    }

    let fetchTo = boxTotal;
    let fetchFrom = boxTotal - ((currentPage + 1) * fetchPerPage) + 1;
    fetchFrom = fetchFrom <= 0 ? 1 : fetchFrom;

    let fetchCount = Math.abs(fetchFrom - fetchTo) + 1;

    let messagesStream = imap.seq.fetch(`${fetchFrom}:${fetchTo}`, { bodies: [''] });

    messagesStream.on('message', function (msgEventEmitter) {
        let messageBuilder = new MailMessageBuilder();
        let messageBuildEventEmitter = new EventEmitter();
        let partCount = 0;

        msgEventEmitter.on('body', function (stream, info) {
            simpleParser(stream, async (err, parsedMessage) => {
                //console.log(parsedMessage);
                messageBuilder.setText(parsedMessage.text, parsedMessage.html, parsedMessage.textAsHtml)
                messageBuilder.setHeaders(parsedMessage.headers);
                messageBuilder.setMessageId(parsedMessage.messageId);
                messageBuilder.setAttachments(parsedMessage.attachments);
                messageBuildEventEmitter.emit('build');
            });
        });

        msgEventEmitter.once('attributes', attributes => {
            //console.log(attributes);
            messageBuilder.setAttributes(attributes);
            messageBuildEventEmitter.emit('build');
        });

        messageBuildEventEmitter.on('build', function() {
            partCount++;

            if (partCount == 2) {
                messagesBuildCount++;
                let message = messageBuilder.build();
                messages.push(message);

                if (messagesBuildCount == fetchCount) {
                    messages = messages.sort((m1, m2) => {
                        return m2.uid - m1.uid;
                    });

                    //console.log(messages);
                    onFetchEnd(messages, boxTotal);
                }
            }
        });

    });
}

function onConnect() {
    imapEventEmitter.emit("connect", imapSettings.user, imapSettings.password);
}

function onFetchEnd(messages, boxTotal) {
    imapEventEmitter.emit('fetchend', messages, boxTotal);
}

function onError(err) {
    imapEventEmitter.emit('error', err);
    console.log(err);
}

function endConnection() {
    if (imap) {
        imap.end();
    }
}

module.exports = {
    connect,
    imapEventEmitter,
    fetchBox,
    markAsSeen,
    moveToBox,
    endConnection
};