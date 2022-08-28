pragma ton-solidity >=0.64.0;

contract Game {
  function t() public {
    TvmBuilder builder;
    uint256 c = 0;
    try {
      c = a + b;
      require(c != 42, 100, 22);
      require(c != 43, 100, 33);
      builder.store(c);
    } catch (variant value, uint256 errorCode) {
      uint256 errorValue;
      if (value.isUint()) {
        errorValue = value.toUint();
      }

      if (errorCode == 100) {
        if (errorValue == 22) {
          // it was line: `require(c != 42, 100, 22);`
        } else if (errorValue == 33) {
          // it was line: `require(c != 43, 100, 33);`
        }
      } else if (errorCode == 8) {
        // Cell overflow
        // It was line: `builder.store(c);`
      } else if (errorCode == 4) {
        // Integer overflow
        // It was line: `c = a + b;`
      }
    }
  }
}
