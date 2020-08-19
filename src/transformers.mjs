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
        //console.log("FRAME", length, chunk.length >= nextFrame);
        if(chunk.length >= nextFrame) {
          this.push(chunk.slice(4, nextFrame));
          chunk = chunk.slice(nextFrame);
        }
        else { break; }
      }
      else { break; }
    }
    this.buffer = chunk;
    cont();
  }
}

export class Encode extends Transform {
  _transform(message, enc, cont) {
    const prefix = Buffer.alloc(4);
    //console.log("S FRAME",message.length);
    prefix.writeUInt32BE(message.length, 0);
    this.push(prefix);
    this.push(message);
    cont();
  }
}

function encodeLength(number) {
  if (number < 0xfd) {
    const buffer = Buffer.alloc(1);
    buffer.writeUInt8(number, 0);
    return buffer;
  } else if (number <= 0xffff) {
    const buffer = Buffer.alloc(3);
    buffer.writeUInt8(0xfd, 0);
    buffer.writeUInt16LE(number, 1);
    return buffer;
  }

  const buffer = Buffer.alloc(5);
  buffer.writeUInt8(0xfe, 0);
  buffer.writeUInt32LE(number, 1);
  return buffer;
}

function decodeLength(buffer) {
  if(buffer.length > 0) {
    const first = buffer.readUInt8(0);

    if (first < 0xfd) {
      return [ 1, first];
    } else if (first === 0xfd && buffer.length >= 3) {
      return [ 3, buffer.readUInt16LE(1)];
    } else if (first === 0xfe && buffer.length >= 5) {
      return [ 5, buffer.readUInt32LE(1)];
    }
  }
  return [0];
}

