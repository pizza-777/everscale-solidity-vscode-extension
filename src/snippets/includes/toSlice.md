##### .toSlice
1. Converts the cell to a slice.

```
<TvmCell>.toSlice() returns (TvmSlice);
```

2. Converts the builder into a slice.

```
<TvmBuilder>.toSlice() returns (TvmSlice);
```

3. Converts bytes to TvmSlice.

Warning: if length of the array is greater than 127
then extra bytes are stored in the first reference of the slice. Use <TvmSlice>.loadRef() to load that extra bytes.

```
<bytes>.toSlice() returns (TvmSlice);
```
