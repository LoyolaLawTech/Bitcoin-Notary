var sha256, requestHash;

function scrollToAnchor(aid){
    var aTag = $('#' + aid);
    $('html,body').animate({scrollTop: aTag.offset().top},'slow');
}

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
            //$('#hash').val(hash);
            $('#hash2').val(hash).select();
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

$('#AjaxRegister').on('click', function(e){
  var hash2 = $('#api_hash').val();
  $.ajax({
      url: 'https://loyolalawtech.org/json/btc-notary-register.php',
      method: 'post',
      dataType: 'json',
      data:{'d':hash2}
  })
  .fail(function(xhr,status,error){
      console.log(status);
      console.log(error);
  })
  .done(function(result) { 
    console.log(result);
    $('#payaddress').val(result.pay_address).select();
  });  
});

$('#Confirm').on('click', function(e){
  var hash2 = $('#api_hash').val();
  $.ajax({
      url: 'https://loyolalawtech.org/json/btc-notary.php',
      method: 'post',
      dataType: 'json',
      data:{'d':hash2}
  })
  .fail(function(xhr,status,error){
      console.log(status);
      console.log(error);
  })
  .done(function(result) { 
    console.log(result);
    $('#Pcomplete').val(result.txstamp);
    $('#Rcomplete').val(result.timestamp);
    $('#block').attr('href','https://www.blocktrail.com/BTC/tx/' + result.tx);
    $('#api_data').select();
    });
  });  


$('#saveDoc').on('click', function(e){
    e.preventDefault();
    var data = $('#api_data').val();
    var blob = new Blob([data], {type: 'text/plain;charset=utf-8'});
    saveAs(blob, "receipt.txt");
});

$(document).ready(function () {

   $('#begin').click(function(){
        $('#wrapper1').toggle();
        scrollToAnchor('wrapper1');
   });

   $('#files').click(function(){
        $('#wrapper2').toggle();
        scrollToAnchor('wrapper2');
   });

   $('#readBytesButtons').click(function(){
        $('#wrapper3').toggle();
        scrollToAnchor('wrapper3');
   });

   $('#keybaseLookup').click(function(){
        $('#wrapper4').toggle();
        scrollToAnchor('wrapper4');
   });

   $('#AjaxRegister').click(function(){
        $('#wrapper5').toggle();
        scrollToAnchor('wrapper5');
   });

   $('#pay').click(function(){
        $('#wrapper6').toggle();
        scrollToAnchor('wrapper6');
   });
});

$(document).ready(function () {

    $('#alert').hide();

   $('#pay').click(function(){
        $('#alert').toggle();
   });
});

