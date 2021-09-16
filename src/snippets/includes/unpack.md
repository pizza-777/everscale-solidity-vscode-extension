##### .unpack

1. Unpacks all members stored in the struct.
```
<struct>.unpack() returns (TypeA /a/, TypeB /b/, ...);
```

2. Parses <address> containing a valid MsgAddressInt (addr_std or addr_var), applies rewriting from the anycast (if present) to the same-length prefix of the address, and returns both the workchain wid and the 256-bit address value. If the address value is not 256-bit, or if <address> is not a valid serialization of MsgAddressInt, throws a cell deserialization exception.

It's wrapper for opcode REWRITESTDADDR.

```
<address>.unpack() returns (int8 /wid/, uint256 /value/);
```

----

Examples 1:

```
struct MyStruct {
    uint a;
    int b;
    address c;
}
function f() pure public {
    MyStruct s = MyStruct(1, -1, address(2));
    (uint a, int b, address c) = s.unpack();
}
```

Example 2:

```
(int8 wid, uint addr) = address(this).unpack();
```
