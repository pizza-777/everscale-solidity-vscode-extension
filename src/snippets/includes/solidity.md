It's used to reject compilation source file with some versions of the compiler.

```
pragma ton-solidity >= 0.35.5; // Check compiler version is at least 0.35.5
pragma ton-solidity ^ 0.35.5; // Check compiler version is at least 0.35.5 and less 0.36.0
pragma ton-solidity < 0.35.5; // Check compiler version is less 0.35.5
pragma ton-solidity >= 0.35.5 < 0.35.7; // Check compiler version equal to 0.35.5 or 0.35.6
```
