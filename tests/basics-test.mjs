
import test from "ava";
import { Readable } from "stream";
import { Decode, Encode } from "length-prefix-framed-stream";

test("encode-decode", async t => {
  async function * seq() {
    yield "Hello";
    yield "1";
    yield "";
    yield "9999999999";
  }

  const readable = Readable.from(seq(), { objectMode: true });
  const encode = new Encode();
  const decode = new Decode({ objectMode: true, encoding: 'utf8' });

  readable.pipe(encode).pipe(decode);
 
  const messages = [];

  for await (const message of decode) {
    messages.push(message);   
  }

  t.deepEqual(messages,["Hello","1","", "9999999999"]);
}); 

test("encode-decode multiple", async t => {
  async function * seq() {
    yield "Hello";
    yield "1";
    yield "";
    yield "9999999999";
  }

  const readable = Readable.from(seq(), { objectMode: true });
  const encode = new Encode();
  
  const p = readable.pipe(encode);

  const messages = [];

  for(let i = 0; i < 3; i++) { 
  const decode = new Decode({ objectMode: true, encoding: 'utf8' });

  p.pipe(decode);
 
  const m = [];
  messages.push(m);

  for await (const message of decode) {
    m.push(message);   
  }
   }

  t.deepEqual(messages,[["Hello","1","", "9999999999"],[],[]]);
}); 
