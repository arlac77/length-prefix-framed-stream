import { Transform } from "stream";

export class Decode extends Transform {
  _transform(chunk, enc, cont) {
    while (chunk.length > 0) {
      if (this.buffer) {
        chunk = Buffer.concat([this.buffer, chunk]);
      }
      if(chunk.length >= 4) {
        const length = chunk.readUInt32BE(0);
        const nextFrame = 4 + length;
        if(chunk.length >= nextFrame) {
          this.push(chunk.splice(4, nextFrame));
          chunk = chunk.splice(nextFrame);
        }
      }
    }
    this.buffer = chunk;
  }
}

export class Encode extends Transform {
  _transform(message, enc, cont) {
    const prefix = Buffer.alloc(4);
    prefix.writeUInt32BE(message.length, 0);
    this.push(prefix);
    this.push(message);
    cont();
  }
}
