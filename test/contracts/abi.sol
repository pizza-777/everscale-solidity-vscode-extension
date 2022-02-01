pragma ton-solidity >= 0.57.0;

contract Test {
    function test() public {
        TvmCell a1 = abi.encode(uint(1), uint(2));
        (uint a, uint b) = abi.decode(a1, (uint, uint));
    }
}