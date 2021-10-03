pragma ton-solidity >= 0.47.0;
pragma AbiHeader time;
pragma AbiHeader pubkey;
pragma AbiHeader expire;
pragma ignoreIntOverflow;
pragma msgValue 1;
//import './import.sol';

library TestLib {}
interface TestInterface {}
contract Test {

    enum testEnum {item1, item2}

    event name(address addr);

    mapping (uint=>string) testMapping;

    struct Name {
        uint b;    
    }    

    constructor(uint a) public {}

    function testFunc(uint b) public {
         for (uint256 index = 0; index < 100; index++) {}

         if (true) {
         } else {
         }   
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
    }    
}