/* globals alert, CryptoJS, openpgp */

var sha256, requestHash;

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
            sha256.update(CryptoJS.enc.Latin1.parse(evt.target.result));
            var hash = sha256.finalize();
            document.getElementById('crypto_sha256').textContent = ['SHA-256: ', hash].join('');
            $('#hash').val(hash);
            $('#hash2').val(hash);
        }
    };

    var blob = file.slice(start, stop + 1);
    reader.readAsBinaryString(blob);
}

document.querySelector('.readBytesButtons').addEventListener('click', function(evt) {
    if (evt.target.tagName.toLowerCase() === 'button') {
    var startByte = evt.target.getAttribute('data-startbyte');
    var endByte = evt.target.getAttribute('data-endbyte');

    sha256 = CryptoJS.algo.SHA256.create();

    readBlob(startByte, endByte);
} }, false);

document.querySelector('#sign').addEventListener('click', function(evt) {
    sign($('#hash').val());
});

var sign = function(hash, callback) {

    var privKey = $('#privateKey').val();
    var signature;

    var result = openpgp.key.readArmored(privKey);

    if (result.keys.length) {
        var passphrase = $('#passphrase').val();
        if (passphrase) {
            if (!result.keys[0].decrypt(passphrase)) {
                return;
            }
        }
        var fingerprint = result.keys[0].primaryKey.getFingerprint();

        openpgp.signClearMessage(result.keys, hash).then(function(sig) {
            signature = sig;
            $('#hash-result').val(hash);
            $('#fingerprint').val(fingerprint);
            $('#signature').val(signature);

           //var api = JSON.stringify('[{"signature":"' + signature + '","fingerprint":"' + fingerprint + '"}]');
           var api = JSON.stringify({'signature':signature,'fingerprint':fingerprint}); 
           $('#api_data').val(api); 

           
           requestHash = CryptoJS.algo.SHA256.create();
           requestHash.update(CryptoJS.enc.Latin1.parse(api));
           var hash2 = requestHash.finalize();
           $('#api_hash').val(hash2); 

            //$.post('/api/v2/appendSig/', {
                //hash: hash,
                //signature: {signature: signature, fingerprint: fingerprint}
            //}).done(function(result) {
                //if (!result.success) {
                ////showErrorSigning = true;
                ////errorSigning.text('We had some issues verifying your signature. Mind trying again later?');
                ////errorSigning.show();
                //$('#okSignature').enable(true).text('Sign');
                //} else {
                //$('#okSignature').enable(true).text('Sign');
                //callback();
                //}
            //});
        }).catch(function(e) {
            //showErrorSigning = true
            //errorSigning.text('We had some issues verifying your private key. Mind trying again later?');
            //errorSigning.show();
            //$('#okSignature').enable(true).text('Sign');
        });
    } else {
        //showErrorSigning = true
        //errorSigning.text('We couldn\'t recognize the validity of your private key. Mind trying again?');
        //errorSigning.show();
        //$('#okSignature').enable(true).text('Sign');
    }
};

$('#keybaseLookup').on('click', function(e){
    var kbuser = $('#keybaseUser').val(); 
    $.ajax('https://keybase.io/_/api/1.0/user/lookup.json?usernames=' + kbuser).done(function(res){
        var fprint = res.them[0].public_keys.primary.key_fingerprint;
        console.log(res); 
        $('#keybaseFingerprint').val(fprint);
        var signature = $('#keybaseSig').val();
        var fingerprint = fprint;
        var api = JSON.stringify({'signature':signature,'fingerprint':fingerprint}); 
        $('#api_data').val(api);
        requestHash = CryptoJS.algo.SHA256.create();
        requestHash.update(CryptoJS.enc.Latin1.parse(api));
        var hash2 = requestHash.finalize();
        $('#api_hash').val(hash2); 
    });
});
