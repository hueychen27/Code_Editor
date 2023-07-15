// https://stackoverflow.com/a/54352392/15055490
const editor = document.getElementById('editor');
let end = 0;
let selected = [0, 0];
const getTextSelection = function (editor) {
    const selection = window.getSelection();

    if (selection != null && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);

        return {
            start: getTextLength(editor, range.startContainer, range.startOffset),
            end: getTextLength(editor, range.endContainer, range.endOffset)
        };
    } else
        return null;
}

const getTextLength = function (parent, node, offset) {
    var textLength = 0;

    if (node.nodeName == '#text')
        textLength += offset;
    else for (var i = 0; i < offset; i++)
        textLength += getNodeTextLength(node.childNodes[i]);

    if (node != parent)
        textLength += getTextLength(parent, node.parentNode, getNodeOffset(node));

    return textLength;
}

const getNodeTextLength = function (node) {
    var textLength = 0;

    if (node.nodeName == 'BR')
        textLength = 1;
    else if (node.nodeName == '#text')
        textLength = node.nodeValue.length;
    else if (node.childNodes != null)
        for (var i = 0; i < node.childNodes.length; i++)
            textLength += getNodeTextLength(node.childNodes[i]);

    return textLength;
}

const getNodeOffset = function (node) {
    return node == null ? -1 : 1 + getNodeOffset(node.previousSibling);
}
const handleSelectionChange = function () {
    if (isEditor(document.activeElement)) {
        const textSelection = getTextSelection(editor);

        if (textSelection != null) {
            const text = editor.innerText;
            const selection = text.slice(textSelection.start, textSelection.end);
            selected = [textSelection.start, textSelection.end];
            end = selected[1];
        }
    }
}

const isEditor = function (element) {
    return element != null && element.classList.contains('editor');
}

// By https://codepen.io/jeffward/pen/OJjPKYo
// CaretUtil library, based on
// https://stackoverflow.com/questions/6249095/41034697#41034697
var CaretUtil = {};

/**
 * Set the caret position inside a contentEditable container
 */
CaretUtil.setCaretPosition = function (container, position) {
    if (position >= 0) {
        var selection = window.getSelection();
        var range = CaretUtil.createRange(container, { count: position });
        if (range != null) {
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }
};

/**
 * Get the current caret position inside a contentEditable container
 */
CaretUtil.getCaretPosition = function (container) {
    var selection = window.getSelection();
    var charCount = -1;
    var node;
    if (selection.focusNode != null) {
        if (CaretUtil.isDescendantOf(selection.focusNode, container)) {
            node = selection.focusNode;
            charCount = selection.focusOffset;
            while (node != null) {
                if (node == container) {
                    break;
                }
                if (node.previousSibling != null) {
                    node = node.previousSibling;
                    charCount += node.textContent.length;
                } else {
                    node = node.parentNode;
                    if (node == null) {
                        break;
                    }
                }
            }
        }
    }
    return charCount;
};

/**
 * Returns true if the node is a descendant (or equal to) a parent
 */
CaretUtil.isDescendantOf = function (node, parent) {
    while (node != null) {
        if (node == parent) {
            return true;
        }
        node = node.parentNode;
    }
    return false;
};

CaretUtil.createRange = function (node, chars, range) {
    if (range == null) {
        range = window.document.createRange();
        range.selectNode(node);
        range.setStart(node, 0);
    }
    if (chars.count == 0) {
        range.setEnd(node, chars.count);
    } else if (node != null && chars.count > 0) {
        if (node.nodeType == 3) {
            if (node.textContent.length < chars.count) {
                chars.count -= node.textContent.length;
            } else {
                range.setEnd(node, chars.count);
                chars.count = 0;
            }
        } else {
            var _g = 0;
            var _g1 = node.childNodes.length;
            while (_g < _g1) {
                var lp = _g++;
                range = CaretUtil.createRange(node.childNodes[lp], chars, range);
                if (chars.count == 0) {
                    break;
                }
            }
        }
    }
    return range;
};

document.addEventListener('selectionchange', () => {
    end = CaretUtil.getCaretPosition(editor);
});

document.querySelectorAll('.code').forEach(el => {
    hljs.highlightAll();
});
const something = (e) => {
    hljs.highlightAll();
    CaretUtil.setCaretPosition(editor, end);
    // From: https://stackoverflow.com/a/18134124/15055490
    handleSelectionChange();
    // let text = editor.innerText;
    // text = text.slice(0, selected[0]) + text.slice(selected[1]);
    // if (e.key == "Backspace") {
    //     editor.innerText = text;
    //     console.log(text);
    // }
    if (e.key == "ArrowLeft" || e.key == "ArrowRight" || e.key == "Backspace") return;
    document.getElementById('iframe').innerHTML = editor.innerText;
}
editor.addEventListener('keydown', (e) => {
    something(e);
})
editor.addEventListener('keyup', () => {
    document.getElementById('iframe').innerHTML = editor.innerText;
})