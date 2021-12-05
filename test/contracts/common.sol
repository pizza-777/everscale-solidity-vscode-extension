pragma ton-solidity >= 0.52.0;
pragma AbiHeader time;
pragma AbiHeader pubkey;
pragma AbiHeader expire;
pragma ignoreIntOverflow;
pragma msgValue 1e10;
//import './import.sol';


library MathHelper {
    // State variables are forbidden in library but constants are not
    uint constant MAX_VALUE = 300;

    uint t = now;
	uint a = 100000000000000_000;

    // Library function
    function sum(uint a, uint b) internal pure returns (uint) {
        uint c = a + b;
        require(c < MAX_VALUE);
        return c;
    }
}
interface TestInterface {}
contract Test {

    enum testEnum {item1, item2}

    event name(address addr);

    mapping (uint=>string) testMapping;

    uint static a; // ok
    uint public static b;
    struct Name {
        uint b;
    }

    constructor(uint a) public {}

    function testFunc1(uint b) public {
         for (uint256 index = 0; index > 100; index++) {}

         if (true) {
         } else {
         }
         //Name.unpack();
        uint[] arr;
        require(arr.empty());
        arr.push();
        require(!arr.empty());
    }

    modifier testModifier() {
        _;
    }

   function fview(uint b) view public returns (uint) {
       repeat(10) {

       }
       for ((uint256 key, string value) : testMapping) { // iteration over mapping

       }
       bytes byteArray = "Hello!";
       for (byte d : byteArray) {

       }

       return b;
   }

   function fret(uint c) internal returns (uint) {
       return c;
   }
    TvmCell tcellvar;
    uint32 key;
    uint256 value;
    function tvmcellfunc() public {
        tcellvar.depth();
        tcellvar.dataSize(10);
        tcellvar.dataSizeQ(1);
        tcellvar.toSlice();
    }

    function optTest() public {
        optional(uint) opt;
        opt.set(11);
        opt = 22;
        opt.get() = 33;
        opt.reset();
        optional(uint) x = 123;
        opt.hasValue();
    }

    function vectorTest() public {
        vector(uint) vect;
        uint a = 11;
        vect.push(a);
        vect.push(111);
        vect.pop();
        vect.length();
        vect.empty();
    }

    function tonUnits() public {
        require(1 nano == 1);
        require(1 nanoton == 1);
        require(1 nTon == 1);
        require(1 ton == 1e9 nanoton);
        require(1 Ton == 1e9 nanoton);
        require(1 micro == 1e-6 ton);
        require(1 microton == 1e-6 ton);
        require(1 milli == 1e-3 ton);
        require(1 milliton == 1e-3 ton);
        require(1 kiloton == 1e3 ton);
        require(1 kTon == 1e3 ton);
        require(1 megaton == 1e6 ton);
        require(1 MTon == 1e6 ton);
        require(1 gigaton == 1e9 ton);
        require(1 GTon == 1e9 ton);
    }

     function dst(TvmCell message, uint n, uint16 u16, uint8 u8) public {
         message.depth();
         message.dataSize(n);
         message.dataSizeQ(n);
         TvmSlice s = message.toSlice();
         s.empty();
         s.size();
         s.bits();
         s.refs();
         s.dataSize(n);
         s.dataSizeQ(n);
         s.depth();
         s.hasNBits(u16);
         s.hasNRefs(u8);
         s.hasNBitsAndRefs(u16, u8);
         s.compare(s);
         s.decode(uint8, uint16);
         s.loadRef();
         s.loadRefAsSlice();
         s.loadSigned(u16);
         s.loadUnsigned(u16);
         s.loadTons();
         s.loadSlice(n);
         s.decodeFunctionParams(dst);
         s.skip(n,n);

         TvmBuilder builder;
         builder.toSlice();
         builder.toCell();
         //builder.size();
         builder.bits();
         builder.refs();
         builder.remBits();
         builder.remRefs();
         builder.remBitsAndRefs();
         builder.depth();
         builder.store(message, n, u16, u8);
         builder.storeOnes(n);
         //builder.storeZeroes(0);
         builder.storeSigned(int(-109), u16);
         builder.storeUnsigned(u8,u16);
         builder.storeRef(message);
         builder.storeTons(uint128(10));

         ExtraCurrencyCollection curCol;
          optional(uint32, uint256) res = curCol.min();
         res = curCol.next(1);
         res = curCol.prev(1);
         res = curCol.nextOrEq(1);
         res = curCol.prevOrEq(1);
         res = curCol.delMin();
         res = curCol.delMax();
         //res = curCol.fetch(k);
        bool exists = curCol.exists(key);
        bool isEmpty = curCol.empty();
        bool success = curCol.replace(key, value);
        success = curCol.add(key, value);
        bool index;
        //success = curCol[index];
    }

    function other(string s, bytes b, uint i) public {
        tvm.setGasLimit(100000);
        b.empty();
        bytes byteArray = "abba";
        int index = 0;
        byte a0 = byteArray[i];
        byteArray = "01234567890123456789";
        bytes slice = byteArray[5:10];
        bytes etalon = "56789";
        require(slice == etalon);
        slice = byteArray[10:];
        etalon = "0123456789";
        require(slice == etalon);
        slice = byteArray[:10];
        require(slice == etalon);
        slice = byteArray[:];
        require(slice == byteArray);
        require(byteArray[:10] == etalon);
        require(etalon == byteArray[:10]);
        b.dataSize(i);
        b.dataSizeQ(i);
        b.append(b);
        byteArray = "1234";
        //bytes4 bb = byteArray;
        s.byteLength();
        s.substr(i);
        //s.find(s);
        //s.findLast(s);
        string str = format("Hello {} 0x{:X} {}  {}.{} tons", 123, 255, address.makeAddrStd(-33,0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF123456789ABCDE), 100500, 32);
        require(str == "Hello 123 0xFF -21:7fffffffffffffffffffffffffffffffffffffffffffffffff123456789abcde  100500.32 tons", 101);
        require(format("Hello {}", 123) == "Hello 123", 102);
        require(format("Hello 0x{:X}", 123) == "Hello 0x7B", 103);
        require(format("{}", -123) == "-123", 103);
        require(format("{}", address.makeAddrStd(127,0)) == "7f:0000000000000000000000000000000000000000000000000000000000000000", 104);
        require(format("{}", address.makeAddrStd(-128,0)) == "-80:0000000000000000000000000000000000000000000000000000000000000000", 105);
        require(format("{:6}", 123) == "   123", 106);
        require(format("{:06}", 123) == "000123", 107);
        require(format("{:06d}", 123) == "000123", 108);
        require(format("{:06X}", 123) == "00007B", 109);
        require(format("{:6x}", 123) == "    7b", 110);
        uint128 a = 1 ton;
        require(format("{:t}", a) == "1.000000000", 101);
        a = 123;
        require(format("{:t}", a) == "0.000000123", 103);
        fixed32x3 v = 1.5;
        require(format("{}", v) == "1.500", 106);
        fixed256x10 vv = -987123.4567890321;
        require(format("{}", vv) == "-987123.4567890321", 108);

        uint res;
        bool status;
        (res, status) = stoi("123");
        require(status, 111);
        require(res == 123, 101);
        string hexstr = "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF123456789ABCDE";
        uint num = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF123456789ABCDE;
        (res, status) = stoi(hexstr);
        require(status, 112);
        require(res == num, 102);
        (res, status) = stoi("0xag");
        require(!status, 116);

        uint address_value;
        address addrStd = address(address_value);

        int8 wid;
        uint addr;
        address addrr = address.makeAddrStd(wid, addr);

        address addrNone = address.makeAddrNone();

        uint addrNumber;
        uint bitCnt;
        address addrExtern = address.makeAddrExtern(addrNumber, bitCnt);

        //addrr.wid();

        address(this).currencies;
        address(this).balance;
        address(this).getType();

        address dest = address(0);
        uint128 m = 100000;
        bool bounce = true;
        uint16 flag = 2;
        TvmCell body;
        ExtraCurrencyCollection c;
        TvmCell stateInit;
        // sequential order of parameters
        dest.transfer(m);
        dest.transfer(m, bounce);
        dest.transfer(m, bounce, flag);
        dest.transfer(m, bounce, flag, body);
        dest.transfer(m, bounce, flag, body, c);
        // using named parameters
        dest.transfer({value: m, bounce: false, flag: 128, body: body, currencies: c});
        dest.transfer({bounce: false, value: 1 ton, flag: 128, body: body});
        dest.transfer({value: 1 ton, bounce: false});

        testMapping.min();
        testMapping.max();
        testMapping.next(1);
        testMapping.prev(1);
        testMapping.nextOrEq(1);
        testMapping.prevOrEq(1);
        testMapping.fetch(1);
        testMapping.exists(1);
        testMapping.empty();
        testMapping.replace(1,'2');
        testMapping.add(1,'2');
        testMapping.getSet(1,'2');
        testMapping.getAdd(1,'2');
        testMapping.getReplace(1,'2');
    }

    function getSum(int a, int b) internal pure returns (int) {
        return a + b;
    }

    function getSub(int a, int b) internal pure returns (int) {
        return a - b;
    }

    function process(int a, int b, uint8 mode) public returns (int) {
        function (int, int) returns (int) fun;
        if (mode == 0) {
            fun = getSum;
        } else if (mode == 1) {
            fun = getSub;
        }
        return fun(a, b); // if `fun` isn't initialized then exception is thrown
    }

    function re() public {
        uint a = 5;

        require(a == 5); // ok
        require(a == 6); // throws an exception with code 100
        require(a == 6, 101); // throws an exception with code 101
        require(a == 6, 101, "a is not equal to six"); // throws an exception with code 101 and string
        require(a == 6, 101, a); // throws an exception with code 101 and number a

        a = 5;
        revert(); // throw exception 100
        revert(101); // throw exception 101
        revert(102, "We have a some problem"); // throw exception 102 and string
        revert(101, a); // throw exception 101 and number a

        msg.sender;
        msg.value;
        msg.currencies;
        msg.pubkey();
        msg.isExternal;
        msg.isInternal;
        msg.createdAt;
        msg.data;

        tvm.accept();
        tvm.commit();
        tvm.rawCommit();
        //tvm.getData();
        TvmCell c;
        tvm.setData(c);
        tvm.log('log');
        TvmBuilder bld;
        bld.storeUnsigned(0x9876543210, 40);
        c = bld.toCell();
        tvm.hexdump(a);
        tvm.bindump(c);
        a = 123;
        tvm.hexdump(a);
        tvm.bindump(a);
        int b = -333;
        tvm.hexdump(b);
        tvm.bindump(b);

        tvm.setcode(c);
        tvm.configParam(a);
        tvm.rawReserve(1, 2);
        tvm.hash('string');
        tvm.insertPubkey(c, msg.pubkey());
        tvm.buildStateInit(c,c);
        tvm.stateInitHash(256, 256, 256, 16);
        tvm.buildEmptyData(msg.pubkey());
        TvmCell code = tvm.code();
        tvm.codeSalt(code);
        TvmCell salt;
        tvm.setCodeSalt(code, salt);
        tvm.pubkey();
        tvm.setPubkey(msg.pubkey());
        tvm.setCurrentCode(code);
        tvm.resetStorage();
        tvm.functionId(dst);
        tvm.encodeBody(dst,dst, a);
        tvm.exit();
        tvm.exit1();
        uint8 flag;
        TvmCell msg;
        tvm.sendrawmsg(msg, flag);
        uint a = 1;
        uint b = 2;
        math.min(a, b);
        math.max(a, b);
        math.minmax(a, b);
        math.abs(a);
        math.modpow2(a, b);
        math.divc(a, b);
        math.divr(a, b);
        math.muldiv(a, b);
        math.muldivc(a, b);
        math.muldivmod(a, b);
        math.divmod(a, b);
        tx.timestamp;
        //block.timestamp;
        rnd.next(10);
        rnd.getSeed();
        rnd.setSeed(a);
        rnd.shuffle();

        uint b = 3;
        uint32 p = 4;
        uint res = b ** p;
        require(res == 81);

        selfdestruct(address(0));
        TvmSlice s;
        sha256(s);
        gasToValue(1000, 0);
        valueToGas(10000, 0);

        tvm.buildExtMsg({
            dest: address,
            time:uint64,
            expire:uint64,
            call:{f1},
            sign:bool,
            pubkey:optional(uint256),
            abiVer:uint8,
            callbackId:uint32,
            onErrorId:uint32,
            stateInit:TvmCell,
            signBoxHandle:optional(uint32)
            });
        tvm.buildIntMsg({
            dest:address,
            value:uint128,
            call:{f1},
            bounce:bool,
            currencies:ExtraCurrencyCollection
            });
    }

    fallback() external {

    }

    onBounce(TvmSlice body) external {
    /*...*/
    }

    onTickTock(bool isTock) external {
    /*...*/
    }
    function onCodeUpgrade() private{
    /*...*/
    }

    function f1() public pure functionID(123) {
    /*...*/
    }

    function f2() public externalMsg { // this function receives only external messages
    /*...*/
    }

    function test(uint b) public {
        f1();
    }
 }