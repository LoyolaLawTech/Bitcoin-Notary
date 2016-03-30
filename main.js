/* globals alert, CryptoJS, openpgp */

var sha256;

function readBlob(opt_startByte, opt_stopByte) {
    var files = document.getElementById('files').files;
    if (!files.length) {
        alert('Please select a file!');
        return;
    }

    var file = files[0];
    var start = parseInt(opt_startByte) || 0;
    var stop = parseInt(opt_stopByte) || file.size - 1;

    var reader = new FileReader();

    // If we use onloadend, we need to check the readyState.
    reader.onloadend = function(evt) {
        if (evt.target.readyState === FileReader.DONE) { // DONE == 2
            //document.getElementById('byte_content').textContent = evt.target.result;
            //document.getElementById('byte_range').textContent = 
            //    ['Read bytes: ', start + 1, ' - ', stop + 1,
            //        ' of ', file.size, ' byte file'].join('');

            sha256.update(CryptoJS.enc.Latin1.parse(evt.target.result));
            var hash = sha256.finalize();
            document.getElementById('crypto_sha256').textContent = ['SHA-256: ', hash].join('');
            $('#hash').val(hash);
        }
    };

    var blob = file.slice(start, stop + 1);
    reader.readAsBinaryString(blob);
}

document.querySelector('.readBytesButtons').addEventListener('click', function(evt) {
alert('click');
if (evt.target.tagName.toLowerCase() === 'button') {
  var startByte = evt.target.getAttribute('data-startbyte');
  var endByte = evt.target.getAttribute('data-endbyte');

  sha256 = CryptoJS.algo.SHA256.create();

  readBlob(startByte, endByte);
} }, false);

document.querySelector('#sign').addEventListener('click', function(evt) {
    sign($('#hash').val());
});
//Test

var sign = function(hash, callback) {

//$('#okSignature').enable(false).text('Loading...');
var privKey = $('#privateKey').val();
$('#privateKey').val('');
var signature;

//var nextStep = function() {
    //var dig = bitcore.crypto.Hash.sha256(new bitcore.deps.Buffer(signature)).toString('hex');
//};

var result = openpgp.key.readArmored(privKey);

if (result.keys.length) {
    var passphrase = $('#passphrase').val();
    if (passphrase) {
    if (!result.keys[0].decrypt(passphrase)) {
        //showErrorSigning = true;
        //errorSigning.text('Your password doesn\'t match the private key\'s. Mind trying again?')
        //errorSigning.show();
        //$('#okSignature').enable(true).text('Sign');
        return;
    }
    }
    var fingerprint = result.keys[0].primaryKey.getFingerprint();

    openpgp.signClearMessage(result.keys, hash).then(function(sig) {

        signature = sig;
        $('#hash-result').val(hash);
        $('#fingerprint').val(fingerprint);
        $('#signature').val(signature);

        $.post('/api/v2/appendSig/', {
            hash: hash,
            signature: {signature: signature, fingerprint: fingerprint}
        }).done(function(result) {
            if (!result.success) {
            //showErrorSigning = true;
            //errorSigning.text('We had some issues verifying your signature. Mind trying again later?');
            //errorSigning.show();
            $('#okSignature').enable(true).text('Sign');
            } else {
            $('#okSignature').enable(true).text('Sign');
            callback();
            }
        });
    }).catch(function(e) {
        //showErrorSigning = true
        //errorSigning.text('We had some issues verifying your private key. Mind trying again later?');
        //errorSigning.show();
        $('#okSignature').enable(true).text('Sign');
    });
} else {
    //showErrorSigning = true
    //errorSigning.text('We couldn\'t recognize the validity of your private key. Mind trying again?');
    //errorSigning.show();
    $('#okSignature').enable(true).text('Sign');
}
};


