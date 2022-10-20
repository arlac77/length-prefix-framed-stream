import test from "ava";
import { decodeLength, encodeLength } from "length-prefix-framed-stream";

function eclt(t, number) {
  const buffer = encodeLength(number);
  const [consumed, n] = decodeLength(buffer);

  t.is(n, number);
  t.is(buffer.length, consumed);
}

eclt.title = (providedTitle = "", a) =>
  `encode-decode ${providedTitle}${a}`.trim();

  test(eclt, 0);
  test(eclt, 1);
  test(eclt, 10);
  test(eclt, 100);
  test(eclt, 1000);
  test(eclt, 10000);
  test(eclt, 100000);
  test(eclt, 1000000);
  test(eclt, 10000000);
