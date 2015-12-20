

if (document.location.hostname == "chain.so") {

    $('kbd').each(function(i, obj) {
        
        if (i == 0) {
            
            var txid = $(this).text();
            
            get_dz_encoded(txid, function(utxo_hash, data_chunk, dz_addr){
	        
                console.log(data_chunk);
                
                var allparts = findParts(data_chunk);

                console.log(allparts);
                
                var location = getCoord(dz_addr);
                var map_url = "https://www.google.com/maps/@" + location['lat'] + "," + location['long'] + ",10z";   
                var location_copy = "<div style='text-align: center; padding-top: 20px;'><span style='font-weight: bold; font-size: 12px; color: #aaaaaa;'>Location</span><br>"+location['rad']+" meter radius from<br><a href='"+map_url+"'>"+location['lat']+", "+location['long']+"</a></div>";
                
                if(dz_addr.substr(0,3) != "1DZ"){location_copy = "";};

                var tx_type = hex2bin(allparts['prefix']);
                if(tx_type == "DZITCRTE"){tx_type = "New Item Listing <div style='font-size: 14px'>(DZITCRTE)</div>";}
                var tx_type_copy = "<span style='font-weight: bold; font-size: 12px; color: #aaaaaa;'>Tx Type</span><br>"+tx_type;
                
                var description = allparts['d'];               
                var description_copy = "<span style='font-weight: bold; font-size: 12px; color: #aaaaaa;'>Description</span><br>"+hex2bin(description.substr(4));
                
                var currency = allparts['c'];               
                var currency_copy = hex2bin(currency.substr(4));
                         
                var price_hex = allparts['p'].substr(2); 
                var price_clean = getVarintArray(price_hex);
                var price_dec = parseInt(price_clean, 16);
                
                if (hex2bin(currency.substr(4)) == "BTC") {price_dec = price_dec / 100000000;}
                
                if (isNaN(price_dec)) {price_dec = "n/a";} 
                var price_copy = "<span style='font-weight: bold; font-size: 12px; color: #aaaaaa;'>Price</span><br><span style='font-size: 32px;'>"+price_dec+"</span>";
                
                
                var manifest = chrome.runtime.getManifest();

                $("<div style='margin: 10px auto 40px auto; width: 500px; padding: 0 10px 10px 10px; font-size: 22px; background-color: #f8f8f8;'><div align='center' style='width: 500px; padding: 5px; margin-left: -10px; color: #fff; background-color: #000; font-weight: bold;'>DROPZONE</div>"+"<div align='center' style='padding-top: 20px'>"+tx_type_copy+"</div>"+location_copy+"<div align='center' style='padding: 20px 0 10px 0;'>"+price_copy+" "+currency_copy+"</div><div style='width: 400px; margin: auto;'><span style='font-size: 16px;'>"+description_copy+"</span></div><div align='center' style='font-size: 11px; padding-top: 40px;'>data parsed by dz-view v"+manifest.version+"</div></div>").insertAfter( ".row:first" );
                
            }); 
            
        }
        
    });
    
}


function rc4(key, str) {
	
    //https://gist.github.com/farhadi/2185197
    
    var s = [], j = 0, x, res = '';
	for (var i = 0; i < 256; i++) {
		s[i] = i;
	}
	for (i = 0; i < 256; i++) {
		j = (j + s[i] + key.charCodeAt(i % key.length)) % 256;
		x = s[i];
		s[i] = s[j];
		s[j] = x;
	}
	i = 0;
	j = 0;
	for (var y = 0; y < str.length; y++) {
		i = (i + 1) % 256;
		j = (j + s[i]) % 256;
		x = s[i];
		s[i] = s[j];
		s[j] = x;
		res += String.fromCharCode(str.charCodeAt(y) ^ s[(s[i] + s[j]) % 256]);
	}
	return res;
    
}


function xcp_rc4(key, datachunk) {
    
    return bin2hex(rc4(hex2bin(key), hex2bin(datachunk)));
    
}

function hex2bin(hex) {

        var bytes = [];
        var str;
        
        for (var i = 0; i < hex.length - 1; i += 2) {

                var ch = parseInt(hex.substr(i, 2), 16);
                bytes.push(ch);

        }

        str = String.fromCharCode.apply(String, bytes);
        return str;
    
};

function bin2hex(s) {

        // http://kevin.vanzonneveld.net

        var i, l, o = "",
                n;

        s += "";

        for (i = 0, l = s.length; i < l; i++) {
                n = s.charCodeAt(i).toString(16);
                o += n.length < 2 ? "0" + n : n;
        }

        return o;
    
}; 


function get_dz_encoded(tx_id, callback) {
    
    var source_html = "https://blockchain.info/rawtx/"+tx_id+"?format=json&cors=true";
    
    var target_tx = new Array(); 
     
    $.getJSON( source_html, function( target_tx ) {
        
        var dz_addr = target_tx.out[0].addr;
        
        var tx_index = target_tx.inputs[0].prev_out.tx_index;
        
        var source_html_tx_index = "https://blockchain.info/tx-index/"+tx_index+"?format=json&cors=true";
    
        $.getJSON( source_html_tx_index, function( data ) {

            var xcp_decoded = ""; 
            
            $.each(target_tx['out'], function(i, item) {
            
                if ("addr3" in target_tx['out'][i]){
                    var target_script = target_tx['out'][i].script;
                    var haystack = target_script;

                    var finddata = haystack.substring(68, 6);
                
                    finddata += haystack.substring(136, 74);
    
                    var xcp_pubkey_data = finddata;
                    var xcp_pre = xcp_rc4(data.hash, xcp_pubkey_data);
                    
                    if (xcp_decoded.length == 0) {
                
                        xcp_decoded += xcp_pre.substr(2);
                        
                    } else {
                        xcp_decoded += xcp_pre.substr(6);
                    }

                }
            
            
            });
            
            callback(data.hash, xcp_decoded, dz_addr);
            
        });
            
    });
        
}

function getVarintArray(fullhex) {
    
  var initialbyte = fullhex.substr(0, 2);   
  var hexstring = "";
    
  if(initialbyte == "fd"){
      var finalhex = fullhex.substr(2, 4).match(/.{1,2}/g).reverse();        
  } else if(initialbyte == "fe"){
      var finalhex = fullhex.substr(2, 8).match(/.{1,2}/g).reverse();        
  } else if(initialbyte == "ff"){
      var finalhex = fullhex.substr(2, 16).match(/.{1,2}/g).reverse();        
  } else {
      return initialbyte;          
  }
    
  for(var i = 0; i < finalhex.length; i++){            
     hexstring += finalhex[i];                 
  }
    
  return hexstring;
       
}

function findParts(data_chunk) {
    
    var parts = data_chunk.match(/.{1,2}/g);  
    var allparts = new Object();
    var k = "prefix";
    var tx_type_hex = "";
    
    for(var i = 0; i < 8; i++){
            
        tx_type_hex += parts[i];
        
    }
    
    console.log(tx_type_hex);
    
    var tx_type = hex2bin(tx_type_hex);
    
    console.log(tx_type);
            
    if(tx_type == "DZITCRTE") {
                
        for(var i = 0; i < parts.length; i++){

            if(parts[i-1] == "01"){
                if(parts[i] == "64"){
                    k = "d";
                }
                if(parts[i] == "63"){
                    k = "c";
                }
                if(parts[i] == "70"){
                    k = "p";    
                }
                if(parts[i] == "65"){
                    k = "e";    
                }
            }

            if(parts[i] != "01"){
                if (allparts[k] !== undefined) {
                    allparts[k] += parts[i];
                }else{
                    allparts[k] = parts[i];
                }
            }

        }
    
        return allparts;
        
    }
    
}

function getCoord(addr){
    
    var lat = (parseInt(addr.substr(3,9).replace(/X/g, "0"), 10) - 90000000) / 1000000;
    var long = (parseInt(addr.substr(12,9).replace(/X/g, "0"), 10) - 180000000) / 1000000;
    var rad = parseInt(addr.substr(21,8).replace(/X/g, "0"), 10);
    
    var location = {lat: lat, long: long, rad: rad};
    
    return location;

}
