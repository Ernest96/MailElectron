const Toastify = require('../utils/toaster');

const smtpService = require('../services/smtpService');

const messageContentContainer = document.getElementById('message-content');


function renderSendForm() {
    messageContentContainer.innerHTML = `
    <div class="send-message-container">
    <form id="send-form">
      <div class="form-row">
        <label>To: </label>
        <input type="email" name="to" required>
      </div>
      <div class="form-row">
        <label>Subject: </label>
        <input type="text" name="subject" required>
      </div>

      <div class="form-row">
        <textarea required name="text"></textarea>
      </div>

    
    <button type="button" value="Send" id="send-email-btn">Send <i class="fa-solid fa-paper-plane"></i></button>
    </form>
  </div>
    `;

    document.getElementById('send-email-btn').onclick = sendEmail;
}

async function sendEmail() {
    let emailForm = document.getElementById('send-form');
    let message = Object.fromEntries(new FormData(emailForm));
    let toastSettings = Toastify.getToastSettings();

    if (!emailForm.checkValidity()) {
        emailForm.reportValidity();
        return;
    }

    toastSettings.text = "Sending Message...";
    Toastify(toastSettings).showToast();
    
    emailForm.reset();
    await smtpService.sendSmtpMessage(message.to, message.subject, message.text);

    toastSettings.text = "Message was sent";
    Toastify(toastSettings).showToast();
}


module.exports = {
    renderSendForm
};