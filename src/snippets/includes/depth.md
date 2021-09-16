##### .depth 

 1. Returns the depth of TvmCell c. If c has no references, then d = 0; otherwise d is one plus the maximum of depths of cells referred to from c. If c is a Null instead of a Cell, returns zero.

 ```
 <TvmCell>.depth() returns(uint64);
```

2. Returns the depth of the slice. If slice has no references, then 0 is returned, otherwise function result is one plus the maximum of depths of the cells referred to from the slice.

```
<TvmSlice>.depth() returns (uint64);
```

3. Returns the depth of the builder. If no cell references are stored in the builder, then 0 is returned; otherwise function result is one plus the maximum of depths of cells referred to from the builder.

```
<TvmBuilder>.depth() returns (uint64);
```
