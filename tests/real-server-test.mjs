import test from "ava";
import { Decode, Encode } from "length-prefix-framed-stream";
import { createServer, createConnection } from "net";
import { pipeline } from "stream";

const fragmentFixture = ["Hello", "1", "", "9999999999"];

test("server encode-decode", async t => {
  const messages = [];

  const server = createServer(async socket => {
    const decode = new Decode({ objectMode: true, encoding: "utf8" });

    pipeline(socket, decode, e => {
      console.log("pipeline", e);
    });

    for await (const message of decode) {
      messages.push(message);
    }

    t.end(true);
  }).on("error", err => {
    throw err;
  });

  server.listen(() => {
    let { port } = server.address();

    const client = createConnection({ port }, () => {
      const encode = new Encode();

      pipeline(encode, client, e => {
        console.log("pipeline", e);
      });

      for (const c of fragmentFixture) {
        encode.write(c);
      }
    });
  });

  await new Promise(r => setTimeout(r, 1000));

  t.deepEqual(messages, fragmentFixture);
});
