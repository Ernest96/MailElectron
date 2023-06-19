const MailMessage = require("../models/mailMessage");

class MailMessageBuilder {

    constructor() {
        this.message = new MailMessage();
    }

    #toShortName(name) {
        if (!name) {
            return "";
        }

        let words = name.split(' ');
        let shortName = words[0][0];
    
        if (words.length > 1) {
            shortName += words[1][0];
        }
    
        return shortName;
    }

    build () {
        return this.message;
    }

    setText(text, html) {
        this.message.text = text;
        this.message.html = html;
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

                this.message.fromEmail = value.text.substring(firstIdx + 1, lastIdx);
                this.message.fromName = value.text ? value.text.substring(0, firstIdx - 1) : "";
                this.message.shortName = this.#toShortName(this.message.fromName);
            }
            else if (key === 'subject'){
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
        for(let attr in attributes) {
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