/* globals alert, CryptoJS, openpgp */
var sha256, receiptData;

function readBlob(opt_startByte, opt_stopByte) {
    var files = document.getElementById('files').files;
    if (!files.length) {
        alert('Please select your receipt');
        return;
    }

    var file = files[0];
    var start = parseInt(opt_startByte) || 0;
    var stop = parseInt(opt_stopByte) || file.size - 1;

    var reader = new FileReader();

    // If we use onloadend, we need to check the readyState.
    reader.onloadend = function(evt) {
        if (evt.target.readyState === FileReader.DONE) { // DONE == 2
            receiptData = JSON.parse(evt.target.result);
            sha256.update(CryptoJS.enc.Latin1.parse(evt.target.result));
            var hash = sha256.finalize();
            $('#hash').val(hash);
        }
    };

    var blob = file.slice(start, stop + 1);
    reader.readAsBinaryString(blob);
}

$('#getHash').on('click', function(e){
    var startByte = e.target.getAttribute('data-startbyte');
    var endByte = e.target.getAttribute('data-endbyte');
    sha256 = CryptoJS.algo.SHA256.create();
    readBlob(startByte, endByte);
});

$('#checkRegister').on('click', function(){
    var data = $('#hash').val();
    var settings = {
        'dataType': 'json',
        'url': 'https://loyolalawtech.org/json/btc-notary.php?d=' + data,
        'method': 'GET'
    };

    $.ajax(settings).done(function (response) {
       console.log(response);
       var docHash = receiptData.signature.match(/([a-z0-9]){64}/g);
       if (response.success){
         $('#regUpshot').html('<b>Congrats. This hash is registered in the blockchain</b>');
            $('#docHash').html('The hash of the document you registered is ' + docHash);
         } else {
            $('#regUpshot').html('<b>Sorry. This hash is not registered in the blockchain');
         }
    });
});
