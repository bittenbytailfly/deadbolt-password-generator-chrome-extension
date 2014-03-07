
function selectNode(node) {
    var selection, range, doc, win;

    if ((doc = node.ownerDocument) && (win = doc.defaultView) && typeof 
            win.getSelection != 'undefined' && typeof doc.createRange !=
            'undefined' && (selection = window.getSelection()) && typeof 
            selection.removeAllRanges != 'undefined') {
        range = doc.createRange();
        range.selectNode(node);
        selection.removeAllRanges();
        selection.addRange(range);
    }
    else if (document.body && typeof document.body.createTextRange !=
            'undefined' && (range = document.body.createTextRange())) {
        range.moveToElementText(node);
        range.select();
    }
}
