$( document ).ready(function() {
    
    var PUBLIC_KEY_VERSION = parseInt(0x6F);
    var PRIVATE_KEY_VERSION = (PUBLIC_KEY_VERSION+128)&255;
    
    get_dz_encoded("5d8430ff52b93ac65b131d605cfde188c8dfb246ffff6dc8462e9c616fbec36f", function(utxo_hash, data_chunk, dz_addr){
    
        //console.log(data_chunk);
        
        var allparts = findParts(data_chunk);
        //console.log(allparts['p'].substr(4,40));
        
        var pubkeyhex = allparts['p'].substr(4,40); 
        var bytes = Crypto.util.hexToBytes(pubkeyhex);
        var addr = new Bitcoin.Address(bytes);
        addr.version = bytes.length <= 20 ? PUBLIC_KEY_VERSION : PRIVATE_KEY_VERSION;
        var testnetaddr = addr.toString();
        
        console.log(testnetaddr);
    
    });
    

});