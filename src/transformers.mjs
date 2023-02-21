import { Transform } from "stream";

export class Decode extends Transform {
  _transform(chunk, enc, cont) {
    if (this.buffer) {
      chunk = Buffer.concat([this.buffer, chunk]);
    }

    while (chunk.length > 0) {
      const [consumed, length] = decodeLength(chunk);
      if(consumed > 0) {
        const nextFrame = consumed + length;
        if(chunk.length >= nextFrame) {
          this.push(chunk.subarray(consumed, nextFrame));
          chunk = chunk.subarray(nextFrame);
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
    this.push(encodeLength(message.length));
    this.push(message);
    cont();
  }
}

export function encodeLength(number) {
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

export function decodeLength(buffer) {
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

