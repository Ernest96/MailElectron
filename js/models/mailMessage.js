const seenFlag = '\\Seen';

class MailMessage {

    constructor(obj) {
      this.uid = '';
      this.messageId = '';
      this.subject = '';
      this.date;
      this.dateString = '';
      this.fromName = '';
      this.shortName = '';
      this.fromEmail = '';
      this.text = '';
      this.html = '';
      this.flags = [];
      this.attachments = [];
      this.threadId = '';

      obj && Object.assign(this, obj);
    }

    isSeen() {
      return this.flags.includes(seenFlag);
    }
}

module.exports = MailMessage;