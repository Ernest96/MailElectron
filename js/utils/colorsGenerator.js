const colors = ['#9000ff', '#205523', '#ce5515', '#661717', '#181152',
    '#81428b', '#255190', '#22A699', '#F2BE22', '#F29727', '#F24C3D'];

function shortNameToColor(shortName) {
    let sum = 0;

    if (shortName) {
        for (let i = 0; i < shortName.length; i++) {
            sum += shortName.charCodeAt(i);
        }
    }
    
    return colors[sum % colors.length];
}

module.exports = {
    shortNameToColor
};