Allows specifying default value in nanotons attached to the internal messages that contract sends to call another contract. If it's not specified, this value is set to 10 000 000 nanotons.

Example:

```
pragma msgValue 123456789;
pragma msgValue 1e8;
pragma msgValue 10 ton;
pragma msgValue 10_000_000_123;

```
