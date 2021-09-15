Force message forming utility to fill an appropriate field(s) in the header of the exteranl inbound message to be sent to this contract:

* **pubkey** - public key by which the message can be signed;
* **time** - local time at what message was created;
* **expire** - time at which message should be meant as expired.

**pubkey** field is optional. Let's consider some cases:

* If the message contains signature and optional field pubkey is set then the field pubkey is used to check signature.
* If the message contains signature and optional field pubkey is empty then the tvm.pubkey() is used to check signature. See also: msg.pubkey() and tvm.pubkey(). time and expire fields can be used for replay protection and if set they should be read in afterSignatureCheck in case of not default replay protection. To read more about this and ABI follow this link. Here is example of message expiration time usage.
