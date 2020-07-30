
import test from "ava";
import { Decode, Encode } from "length-prefix-framed-stream";


test("encode-decode", async t => {
  const encode = new Encode();
  const decode = new Decode();
  
  encode.pipe(decode);
  
  encode.push("Hallo");
  encode.push("1");
  encode.push("");

  const messages = [];
  
  for await (const message from decode) {
    messages.push(message);   
  }

  t.deepEqual(messages,["Hallo","1",""]);
}); 
