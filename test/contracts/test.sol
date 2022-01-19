pragma ton-solidity >= 0.53.0;

contract Test {
    uint static value0;

    uint3 c = 1;

    struct Stakes {
        uint total;
        mapping(uint => uint) stakes;
    }
    
    function a() public{
       Stakes stakes = Stakes({stakes: emptyMap, total: 200});
    }
    function test(function() a, bool b) private returns(function()) {
        function() a = test1;
    }

    function test1() private{
        for (uint256 index = 0; index < 10; index++) {
            continue;
            break;        
        }    

        repeat(10) {
            break;
        }
    }    
}