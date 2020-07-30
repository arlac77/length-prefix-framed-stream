
import test from "ava";
import { Readable } from "stream";
import { Decode, Encode } from "length-prefix-framed-stream";

test("encode-decode", async t => {
  async function * seq() {
    yield "Hello";
    yield "1";
    yield "";
    yield "9999999999999999999999999999999999999999";
  }

  const readable = Readable.from(seq(), { objectMode: false});
  const encode = new Encode();
  const decode = new Decode({ encoding: 'utf8' });

  readable.pipe(encode).pipe(decode);
 
  const messages = [];

  for await (const message of decode) {
    messages.push(message);   
  }

  t.deepEqual(messages,["Hello","1",""]);
}); 
