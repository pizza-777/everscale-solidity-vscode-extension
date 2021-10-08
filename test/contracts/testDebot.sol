pragma ton-solidity >=0.46.0;
pragma AbiHeader expire;
pragma AbiHeader time;
pragma AbiHeader pubkey;
import "https://raw.githubusercontent.com/tonlabs/debots/main/Debot.sol";
import "https://raw.githubusercontent.com/tonlabs/DeBot-IS-consortium/main/Terminal/Terminal.sol";
import "https://raw.githubusercontent.com/tonlabs/DeBot-IS-consortium/main/UserInfo/UserInfo.sol";
import "https://raw.githubusercontent.com/tonlabs/DeBot-IS-consortium/main/SigningBoxInput/SigningBoxInput.sol";
import "https://raw.githubusercontent.com/tonlabs/DeBot-IS-consortium/main/SecurityCardManagement/SecurityCardManagement.sol";
import "https://raw.githubusercontent.com/tonlabs/DeBot-IS-consortium/main/QRCode/QRCode.sol";
import "https://raw.githubusercontent.com/tonlabs/DeBot-IS-consortium/main/NumberInput/NumberInput.sol";
import "https://raw.githubusercontent.com/tonlabs/DeBot-IS-consortium/main/Network/Network.sol";
import "https://raw.githubusercontent.com/tonlabs/DeBot-IS-consortium/main/Media/Media.sol";
import "https://raw.githubusercontent.com/tonlabs/DeBot-IS-consortium/main/Hex/Hex.sol";
import "https://raw.githubusercontent.com/tonlabs/DeBot-IS-consortium/main/EncryptionBoxInput/EncryptionBoxInput.sol";
import "https://raw.githubusercontent.com/tonlabs/DeBot-IS-consortium/main/DateTimeInput/DateTimeInput.sol";
import "https://raw.githubusercontent.com/tonlabs/DeBot-IS-consortium/main/CountryInput/CountryInput.sol";
import "https://raw.githubusercontent.com/tonlabs/DeBot-IS-consortium/main/Base64/Base64.sol";
import "https://raw.githubusercontent.com/tonlabs/DeBot-IS-consortium/main/AmountInput/AmountInput.sol";
import "https://raw.githubusercontent.com/tonlabs/DeBot-IS-consortium/main/AddressInput/AddressInput.sol";
import "https://raw.githubusercontent.com/tonlabs/DeBot-IS-consortium/main/SecurityCardManagement/SecurityCardManagement.sol";
import "https://raw.githubusercontent.com/tonlabs/DeBot-IS-consortium/main/Sdk/Sdk.sol";
import "https://raw.githubusercontent.com/tonlabs/DeBot-IS-consortium/1d587e2899c857572d94e6cf2468ccee6e98b7ac/libraries/JsonLib.sol";
import "https://raw.githubusercontent.com/tonlabs/DeBot-IS-consortium/main/Query/Query.sol";
import "https://raw.githubusercontent.com/tonlabs/DeBot-IS-consortium/main/Menu/Menu.sol";
import "https://raw.githubusercontent.com/tonlabs/DeBot-IS-consortium/1d587e2899c857572d94e6cf2468ccee6e98b7ac/libraries/JsonLib.sol";
import "https://raw.githubusercontent.com/tonlabs/DeBot-IS-consortium/main/ConfirmInput/ConfirmInput.sol";

contract TestDebot is Debot{

    function start() public override {       
        UserInfo.getSigningBox(0);
        UserInfo.getPublicKey(0);
        UserInfo.getAccount(0);
        TvmCell c;
        Terminal.printf(0, '', c);
        SigningBoxInput.get(0, '',[tvm.pubkey()]);
        bytes p1;
        bytes cs;
        uint192 sn;
        SecurityCardManagement.createKeyForHmac(0, p1, cs, sn);
        SecurityCardManagement.getTonWalletAppletState(0);
        SecurityCardManagement.getSerialNumber(0);
        SecurityCardManagement.getRecoveryData(0);
        bytes recoveryData;
        SecurityCardManagement.setRecoveryData(0, recoveryData);
        bytes iv;
        SecurityCardManagement.turnOnWallet(0, sn, p1, iv, cs);
        SecurityCardManagement.getBlockHashes(0);         
        uint32 s;
        uint32 count;
        Sdk.substring(0, '', s, count); 
        Sdk.genRandom(0, 1);
        uint32 boxHandle;
        uint256 h;
        Sdk.signHash(0, boxHandle, h);        
        Sdk.decrypt(0, boxHandle, '');
        Sdk.encrypt(0, boxHandle, ''); 
        address addr;
        Sdk.getAccountCodeHash(0, addr);
            Sdk.getAccountType(0, addr);
        Sdk.getBalance(0, addr);
        uint32 limit;        
        Query.collection(0,  
            QueryCollection.Messages,
            format("{\"src\":{\"eq\":\"{}\"},\"msg_type\":{\"eq\":0}}", address(this)),
            "created_lt value dst body",
            limit,
            QueryOrderBy("created_lt", SortDirection.Ascending));
            bytes prompt;
            bytes text;
        QRCode.draw(0, prompt, text);     
        QRCode.read(0, prompt);
        int256 min;
        int256 max;
        NumberInput.get(0, prompt, min, max);
        bytes url;
        bytes[] headers;
        bytes body;
        Network.post(0, url, headers, body);
        Network.get(0, url, headers);
        bytes title;
        string description;
        MenuItem(title, description, 0);        
        Menu.select(title, description, [
            MenuItem(title, description, 0)
        ]);
        bytes data;
        Media.output(0, prompt, data);
        string json;
        //Json.deserialize(0,'');
        string hexstr;
        Hex.decode(0, hexstr);
        Hex.encode(0, data);
        EncryptionBoxInput.getSupportedAlgorithms(0);
        uint32 handle;
        EncryptionBoxInput.remove(0, handle);
        bytes nonce;
        EncryptionBoxInput.getChaCha20Box(0, prompt, nonce);
        uint256 theirPubkey;
        EncryptionBoxInput.getNaclBox(0, prompt, nonce, theirPubkey);
        EncryptionBoxInput.getNaclSecretBox(0, prompt, nonce);
        DateTimeInput.getTimeZoneOffset(0);
        int128 defaultDatetime;
        int128 minDatetime;
        int128 maxDatetime;
        uint8 minuteInterval;        
        int16 inTimeZoneOffset;
        DateTimeInput.getDateTime(0, "bytes prompt", defaultDatetime, minDatetime, maxDatetime, minuteInterval, inTimeZoneOffset);
        uint32 defaultTime;
        uint32 minTime;
        uint32 maxTime;
         uint8 Interval;
        DateTimeInput.getTime(0, "bytes prompt", defaultTime, minTime, maxTime, Interval);
        int128 defaultDate;
        int128 minDate;
        int128 maxDate;
        DateTimeInput.getDate(0, "bytes prompt", defaultDate, minDate, maxDate);
        string[] permitted;
        string[] banned;
        CountryInput.get(0, "bytes prompt", permitted, banned);
        ConfirmInput.get(0, "bytes prompt");
        Base64.decode(0, "string base64");
        Base64.encode(0, "bytes prompt");
        uint8 decimal;
        uint128 min1;
        uint128 max1;
        AmountInput.get(0, "bytes prompt", decimal, min1, max1);
        AddressInput.get(0, "bytes prompt");        
    }
    
    function getDebotInfo() public functionID(0xDEB) override view returns(
        string name, string version, string publisher, string key, string author,
        address support, string hello, string language, string dabi, bytes icon
    ) {
        name = "Test DeBot";
        version = "0.0.1";
        publisher = "publisher name";
        key = "How to use";
        author = "Author name";
        support = address.makeAddrStd(0, 0x000000000000000000000000000000000000000000000000000000000000);
        hello = "Hello, i am an test DeBot.";
        language = "en";
        dabi = m_debotAbi.get();
        icon = '';
    }
    
    function getRequiredInterfaces() public view override returns (uint256[] interfaces) {
        return [ Terminal.ID ];
    }     
}
