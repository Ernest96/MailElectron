function downloadFile(fileName, byte) {
    var blob = new Blob([byte]);
    var link = document.getElementById('attachment-link');
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
};

module.exports = {
    downloadFile
};