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

    event name(address addr );

    mapping (uint=>string) testMapping;

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
       return b;
   }
   
   function tonUnits() public returns (public name) {
       
   }
}