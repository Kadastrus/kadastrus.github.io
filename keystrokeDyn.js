var debug = true;
var allEvents = [];
var allParams = [];
var testNum = 0;
var startTs = 0;
var samples = [
'Когда мне было 5 лет, мама всегда говорила, что главное в жизни - счастье. Когда я пошел в школу, на вопрос, кем я хочу быть, когда вырасту, я ответил "счастливым человеком". Мне тогда сказали, что я не понимаю вопроса, а я ответил, что это они не понимают жизни.',
'Нет, - быстро сказал он. - Только не это. Остаться друзьями? Развести огородик на остывшей лаве угасших чувств? Нет, это не для нас с тобой. Так бывает только после маленьких интрижек, да и то получается довольно фальшиво. Любовь не пятнают дружбой. Конец есть конец.'
];

var round = function(num) {
    return Math.round(num * 10) / 10;
};

var keyHandler = function(e) {
    var char = e.key;
    var isBackspace = e.keyCode == 8;
    var isEnter = e.keyCode == 13;
    var isShift = e.keyCode == 16;
    if (isEnter) return false;

    var originText = $('#origin-text span');
    var typingText = $('#typing-text').val();
    var hasInvalid = false;
    for (var i = 0; i < originText.length; i++) {
        var originTextSymbol = originText[i];
        var status = '';
        if (typingText.length > i) {
            status = (originTextSymbol.innerHTML == typingText[i] && !hasInvalid) ? 'valid' : 'invalid';
            if (status == 'invalid') hasInvalid = true;
        }
        else if (typingText.length == i && !hasInvalid)
            status = 'current';
        if (originTextSymbol.className != status)
            originTextSymbol.className = status;
    }

    var re = /^[\wа-яё =+.,'"/!"№;%:?*()@#&\-]$/i;
    if (char.match(re) || isBackspace || isShift) {
        if (debug) console.log(e.type + '\t' + e.keyCode + '  ' + e.timeStamp + '  ' + char);
        if (!allEvents[testNum]) {
            allEvents[testNum] = [];
            startTs = round(e.timeStamp);
        }

        allEvents[testNum].push({
            type: e.type,
            keyCode: e.keyCode,
            timeStamp: round(e.timeStamp - startTs)
        });
    }
};

var next = function() {
    if (!$('#typing-text').val()) return;
    testNum++;
    pasteOriginText(testNum);
    $('#typing-text').val('');
    $('#next-btn').hide();
    $('#run-btn').show();
};

var run = function() {
    if (!$('#typing-text').val()) return;
    testNum++;
    $('#message').show();
    save(allEvents);
    clear();
};

var clear = function() {
    delete allEvents[testNum];
    $('#typing-text').val('');
    pasteOriginText(testNum);
};

var reset = function() {
    allEvents = [];
    allParams = [];
    testNum = 0;
    $('#typing-text').val('');
    pasteOriginText(testNum);
};

var pasteOriginText = function(n) {
    if (!samples[n]) return;
    $('#origin-text').html('<p>' + samples[n].split('').map(function(symbol) {
        return '<span>' + symbol + '</span>';
    }).join('') + '</p>');
};

var save = function(data) {
    var now = new Date();
    var dateTime = now.toLocaleDateString().split('.').reverse().join('-') + '_' + now.toLocaleTimeString().replace(/:/g, '-');
    var text = JSON.stringify(data);
    var file = new Blob([text], {type: 'text/plain'});
    var a = document.createElement('a');
    var url = URL.createObjectURL(file);
    a.href = url;
    a.download = 'keystroke_' + dateTime + '.txt';
    document.body.appendChild(a);
    a.click();
    setTimeout(function() {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 0);
};

var init = function() {
    $('#reset-btn').on('click', reset);
    $('#next-btn').on('click', next);
    $('#run-btn').on('click', run);
    $('#origin-text').on('copy', function() { return false; });
    $('#typing-text').bind({
        cut: function() { return false; },
        copy: function() { return false; },
        paste: function() { return false; },
        keydown: keyHandler,
        keyup: keyHandler
    });
    reset();
};
$(document).ready(init);