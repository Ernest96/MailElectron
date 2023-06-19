const Imap = require('imap');
const { simpleParser } = require('mailparser');
const MailMessageBuilder = require('../utils/mailMessageBuilder');
var events = require('events');
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

let imap;
let currentPage;
const fetchPerPage = 15;

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

    // imap.getBoxes(function(err, boxes ) {
    //     console.log(boxes);
    // });
}

function markAsSeen(uid) {
    imap.addFlags(uid, ['\\Seen'], function (err) {
        if (err) {
            imapEventEmitter.emit('error', err);
        }
    });
}

function markAsTrash(uid) {
    imap.move(uid, boxesMap["trash"], function(err) {
        if (err) {
            imapEventEmitter.emit('error', err);
        }
    })
}

function markAsSpam(uid) {
    imap.move(uid, boxesMap["spam"], function(err) {
        if (err) {
            imapEventEmitter.emit('error', err);
        }
    })
}

function markAsInbox(uid) {
    imap.move(uid, boxesMap["inbox"], function(err) {
        if (err) {
            imapEventEmitter.emit('error', err);
        }
    })
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

    var messagesStream = imap.seq.fetch(`${fetchFrom}:${fetchTo}`, { bodies: [''] });

    messagesStream.on('message', function (msgEventEmitter) {
        let messageBuilder = new MailMessageBuilder();
        let messageBuildEventEmitter = new EventEmitter();
        let partCount = 0;

        msgEventEmitter.on('body', function (stream, info) {
            simpleParser(stream, async (err, parsedMessage) => {
                console.log(parsedMessage);
                messageBuilder.setText(parsedMessage.text, parsedMessage.html)
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
                        return m2.date - m1.date;
                    });

                    console.log(messages);
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
    markAsTrash,
    markAsSpam,
    markAsInbox,
    endConnection,
    markAsInbox
};