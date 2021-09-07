##### .dataSize 
 1\. **\<TvmCell>**.dataSize(uint n) returns (uint /\*cells\*/, uint /\*bits\*/, uint /\*refs\*/);

Returns the count of distinct cells, data bits in the distinct cells and cell references in the distinct cells. If count of the distinct cells exceeds n+1 then a cell overflow exception (8) is thrown. This function is a wrapper for opcode "CDATASIZE" 



2\. **\<TvmSlice>**.dataSize(uint n) returns (uint /\*cells\*/, uint /\*bits\*/, uint /\*refs\*/);

Returns the count of distinct cells, data bits in the distinct cells and cell references in the distinct cells. If count of the distinct cells exceeds n+1 then a cell overflow exception (8) is thrown. Note that the returned count of distinct cells does not take into account the cell that contains the slice itself. This function is a wrapper for opcode SDATASIZE

3\. **\<bytes>**.dataSize(uint n) returns (uint /\*cells\*/, uint /\*bits\*/, uint /\*refs\*/);