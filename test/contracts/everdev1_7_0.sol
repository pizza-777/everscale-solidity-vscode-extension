pragma ever-solidity >=0.69.0;

contract Common {
	function f1() public { 
		int a = type(int).max; // how to use
		uint256 c = type(uint256).min;
		TvmSlice b;
		b.loadQ(uint256);
		b.load(uint256);
		uint120 d = tx.storageFee;
		uint64 e = tx.logicaltime;
		int2 f = math.sign(int(2));
		TvmBuilder g;
		g.storeUint(1, 2);
		g.storeInt(1, 2);
		b.preload(int);
		b.preloadInt(2);
		b.preloadUint(2);
		b.preloadRef(2);
		b.preloadQ(uint);
		b.preloadSlice(3);
		b.loadFunctionParams(f1);
		b.loadStateVars(Common);
		b.decodeStateVars(Common);
		b.loadSlice(10);
		b.loadSliceQ(12);
		b.loadInt(3);
		b.loadUint(3);
		b.loadIntQ(3);
		b.loadUintQ(3);
	}
}
