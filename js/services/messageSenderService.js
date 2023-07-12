const Toastify = require('../utils/toaster');
const smtpService = require('../services/smtpService');

const messageContentContainer = document.getElementById('message-content');
const ckeditorSelector = 'ckeditor';
let editor;


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
        <div id="ckeditor">

        </div>
      </div>

    
    <button type="button" value="Send" id="send-email-btn">Send <i class="fa-solid fa-paper-plane"></i></button>
    </form>
  </div>
    `;

  document.getElementById('send-email-btn').onclick = sendEmail;
  ClassicEditor.create(document.getElementById('ckeditor')).then(saveEditor);
}

async function sendEmail() {
  let emailForm = document.getElementById('send-form');
  let message = Object.fromEntries(new FormData(emailForm));
  let toastSettings = Toastify.getToastSettings();

  message.textAsHtml = editor.getData() || "";

  if (!emailForm.checkValidity()) {
    emailForm.reportValidity();
    return;
  }

  toastSettings.text = "Sending Message...";
  Toastify(toastSettings).showToast();

  emailForm.reset();
  editor.setData('');
  debugger;
  await smtpService.sendSmtpMessage(message.to, message.subject, message.textAsHtml);

  toastSettings.text = "Message was sent";
  Toastify(toastSettings).showToast();
}

function saveEditor(ckEditor) {
  editor = ckEditor;
}


module.exports = {
  renderSendForm
};