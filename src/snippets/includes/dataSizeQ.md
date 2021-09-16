##### .dataSizeQ

Returns the count of distinct cells, data bits in the distinct cells and cell references in the distinct cells. If count of the distinct cells exceeds n+1 then this function returns an optional that has no value.

```
<TvmCell>.dataSizeQ(uint n) returns (optional(uint cells, uint bits, uint refs));
<TvmSlice>**.dataSizeQ(uint n) returns (optional(uint cells, uint bits, uint refs));
```

Note that the returned count of distinct cells does not take into account the cell that contains the slice itself. This function is a wrapper for opcode SDATASIZEQ

```
<bytes>**.dataSizeQ(uint n) returns (optional(uint cells, uint bits, uint refs));
```
