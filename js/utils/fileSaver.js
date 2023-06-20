function downloadFile(fileName, byte) {
    let blob = new Blob([byte]);
    let link = document.getElementById('attachment-link');
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
};

module.exports = {
    downloadFile
};