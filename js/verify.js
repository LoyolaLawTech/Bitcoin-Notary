
/* globals alert, CryptoJS, openpgp */
var sha256, receiptData, docHash, fingerprint, timestamp, tx;

function scrollToAnchor(aid){
    var aTag = $('#' + aid);
    $('html,body').animate({scrollTop: aTag.offset().top},'slow');
}

function readBlob(opt_startByte, opt_stopByte, which) {
    var files;
    if (which === 'first'){
        files = document.getElementById('files').files;
    } else {
        files = document.getElementById('files2').files;
    }
    if (!files.length) {
        alert('Please select a file');
        return;
    }

    var file = files[0];
    var start = parseInt(opt_startByte) || 0;
    var stop = parseInt(opt_stopByte) || file.size - 1;

    var reader = new FileReader();

    // If we use onloadend, we need to check the readyState.
    reader.onloadend = function(evt) {
        if (evt.target.readyState === FileReader.DONE) { // DONE == 2
            if (which === 'first'){
                //We are only parsing JSON with the receipt, not document itself
                receiptData = JSON.parse(evt.target.result);
            }
            sha256.update(CryptoJS.enc.Latin1.parse(evt.target.result));
            var hash = sha256.finalize();
            if (which === 'first'){
                $('#hash1').val(hash);
            } else {
                $('#hash2').val(hash);
                if (hash.toString() === docHash.toString()){
                    fingerprint = receiptData.fingerprint;
                    //fingerprint = '01506206c29e82b0b8c6c3000cce0de605ac57b5';
                    $('#docHashUpshot').html('Yes, your uploaded document is the same one recorded in the blockchain. ');
                    //check to see if this was signed with keybase key
                    $.ajax('https://keybase.io/_/api/1.0/user/lookup.json?key_fingerprint=' + fingerprint)
                    .done(function(res){
                            if (res.them.length > 0){
                                console.log(res);
                                var username = res.them[0].basics.username;
                                var fullName = res.them[0].profile.full_name;
                                $('#docHashUpshot').append('This document was signed by' +
                                ' <a href="https://keybase.io/' + username + 
                                '">' + fullName + '</a>' + ' on ' + timestamp);
                            } else {
                                $('#docHashUpshot').append('<p>The document was signed by a key with the fingerprint ' + fingerprint);
                            }
                    
                    });
                } else {
                    $('#docHashUpshot').html('Sorry, your uploaded document is not the same one that is in the block chain.');
                }
            }
        }
    };

    var blob = file.slice(start, stop + 1);
    reader.readAsBinaryString(blob);
}

$('.getHash').on('click', function(e){
    var startByte = e.target.getAttribute('data-startbyte');
    var endByte = e.target.getAttribute('data-endbyte');
    sha256 = CryptoJS.algo.SHA256.create();
    if ($(this).hasClass('first')){
        readBlob(startByte, endByte, 'first');
    } else {
        readBlob(startByte, endByte, 'second');
    }
});

$('#checkRegister').on('click', function(){
    var data = $('#hash1').val();
    var settings = {
        'dataType': 'json',
        'url': 'https://loyolalawtech.org/json/btc-notary.php',
        'method': 'post',
        'data': {d: data}
    };

    $.ajax(settings).done(function (response) {
       console.log(response);
       timestamp = response.timestamp;
       tx = response.tx;
       docHash = receiptData.signature.match(/([a-z0-9]){64}/g);
       if (response.success && !response.pending){
         $('#regUpshot').html('<b>Congrats. This hash is <a href="https://www.blocktrail.com/BTC/tx/' + tx + '">registered in the blockchain</a></b>');
            $('#docHash').html('The hash of the document you registered is ' + docHash);
         } else {
            $('#regUpshot').html('<b>Sorry. This hash is not registered in the blockchain');
         }
    });
});

$(document).ready(function () {

    $('#step1').show();

    $('#files').click(function(){
        $('#step2').toggle();
        scrollToAnchor('step2');
    });

    $('#step2hash').click(function(){
        $('#step3').toggle();
        scrollToAnchor('step3');
    });

    $('#checkRegister').click(function(){
        $('#step4').toggle();
        scrollToAnchor('step4');
    });
});

