$( document ).ready(function() {
    
    get_dz_encoded("414e27e676148a6279180d822c29cfe7bed684eaf3ca9695f3837f17979e50c9", function(utxo_hash, data_chunk, dz_addr){
    
        console.log(data_chunk);
        
//        var allparts = findParts(data_chunk);
//        //console.log(allparts['p'].substr(4,40));
//        
//        var pubkeyhex = allparts['p'].substr(4,40); 
//        var bytes = Crypto.util.hexToBytes(pubkeyhex);
//        var addr = new Bitcoin.Address(bytes);
//        addr.version = bytes.length <= 20 ? PUBLIC_KEY_VERSION : PRIVATE_KEY_VERSION;
//        var testnetaddr = addr.toString();
//        
//        console.log(testnetaddr);
    
    });
    

});