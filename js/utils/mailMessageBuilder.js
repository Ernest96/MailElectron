const MailMessage = require("../models/mailMessage");

class MailMessageBuilder {

    constructor() {
        this.message = new MailMessage();
    }

    #toShortName(name, email) {
        let usedName = name;

        if (!usedName) {
            usedName = email;
        }

        let words = name.split(' ');
        let shortName = words[0][0];

        if (words.length > 1) {
            shortName += words[1][0];
        }

        return shortName;
    }

    build() {
        return this.message;
    }

    setText(text, html, textAsHtml) {
        this.message.text = text || "";
        this.message.html = html || textAsHtml || "";
    }

    setMessageId(messageId) {
        this.message.messageId = messageId;
    }

    setHeaders(headers) {
        for (let header of headers) {
            let key = header[0];
            let value = header[1];

            if (key === 'from') {
                let lastIdx = value.text.lastIndexOf('>');
                let firstIdx = value.text.lastIndexOf('<');

                if (lastIdx != -1 && firstIdx != -1) {
                    this.message.fromEmail = value.text.substring(firstIdx + 1, lastIdx);
                    this.message.fromName = value.text ? value.text.substring(0, firstIdx - 1) : "";
                }
                else {
                    this.message.fromEmail = value.text;
                    this.message.fromName = value.text;
                }

                this.message.shortName = this.#toShortName(this.message.fromName, this.message.fromEmail);
            }
            else if (key === 'subject') {
                this.message.subject = value;
            }
            else if (key == 'date') {
                this.message.date = value;
                this.message.dateString = value.toLocaleDateString();
            }
        }
    }

    setAttributes(attributes) {
        //console.log(attributes);
        for (let attr in attributes) {
            if (attr === 'uid' || attr === 'flags') {
                this.message[attr] = attributes[attr];
            }
            else if (attr === 'x-gm-thrid') {
                this.message.threadId = attributes[attr];
            }
        }
    }

    setAttachments(attachments) {
        this.message.attachments = attachments;
    }
}


module.exports = MailMessageBuilder;