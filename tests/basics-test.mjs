import test from "ava";
import { Readable } from "stream";
import { Decode, Encode } from "length-prefix-framed-stream";

const fragmentFixture = ["Hello", "1", "", "9999999999"];

async function* sequence(fragments) {
  for(const f of fragments) {
    yield f;
  }
}

test("encode-decode", async t => {
  const readable = Readable.from(sequence(fragmentFixture), { objectMode: true });
  const encode = new Encode();
  const decode = new Decode({ objectMode: true, encoding: "utf8" });

  readable.pipe(encode).pipe(decode);

  const messages = [];

  for await (const message of decode) {
    messages.push(message);
  }

  t.deepEqual(messages, fragmentFixture);
});

test("encode-decode multiple", async t => {
  const readable = Readable.from(sequence(fragmentFixture), { objectMode: true });
  const encode = new Encode();

  const p = readable.pipe(encode);

  const messages = [];

  for (let i = 0; i < 3; i++) {
    const decode = new Decode({ objectMode: true, encoding: "utf8" });

    p.pipe(decode);

    const m = [];
    messages.push(m);

    for await (const message of decode) {
      m.push(message);
    }
  }

  t.deepEqual(messages, [fragmentFixture, [], []]);
});
