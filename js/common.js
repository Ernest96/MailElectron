const shell = require('electron').shell;

document.body.addEventListener('click', function (e) {
    if (e.target.nodeName.toUpperCase() === 'A' && e.target.href.includes('http')) {
        e.preventDefault();
        shell.openExternal(e.target.href);
    }
}, true);