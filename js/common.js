const shell = require('electron').shell;

function openLinksInExternal(doc) {
    doc.body.addEventListener('click', function (e) {
        if (e.target.nodeName.toUpperCase() === 'A' && e.target.href.includes('http')) {
            e.preventDefault();
            shell.openExternal(e.target.href);
        }
    }, true);
}

openLinksInExternal(document);


module.exports = {
    openLinksInExternal
};