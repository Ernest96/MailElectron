const shell = require('electron').shell;

function openLinksInExternal(doc) {
    doc.body.addEventListener('click', function (e) {

        // check if element is not a an attachment
        if (e.target.className === 'attachment' || e.target.id === 'attachment-link') {
            return;
        }

        // check if element is inside a link
        for (let node = e.target; node; node = node.parentNode) {
            if (node.nodeName.toUpperCase() === 'A') {
                e.preventDefault();
                shell.openExternal(node.href);
                return;
            }
        }

    }, true);
}

openLinksInExternal(document);

module.exports = {
    openLinksInExternal
};