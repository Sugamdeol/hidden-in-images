// LSB steganography for Hidden in Images.
// Pure functions over RGBA pixel data, so they can be unit-tested in Node
// and used unchanged in the browser. PNG only: JPEG re-encoding destroys LSBs.
(function (root) {
  var MAGIC = [0x48, 0x49, 0x44, 0x31]; // "HID1"

  function capacityBytes(pixelCount) {
    // 3 LSBs per pixel (R, G, B), 8 bits per byte.
    return Math.floor((pixelCount * 3) / 8);
  }

  function bytesNeeded(messageBytes) {
    return MAGIC.length + 4 + messageBytes.length; // magic + length + payload
  }

  function encodeMessage(pixels, message) {
    var text = new TextEncoder().encode(message);
    var total = bytesNeeded(text);
    if (total > capacityBytes(pixels.length / 4)) {
      return { ok: false, error: "Message too long for this image. Use a larger image or a shorter message." };
    }
    var payload = new Uint8Array(total);
    payload.set(MAGIC, 0);
    payload[4] = (text.length >>> 24) & 255;
    payload[5] = (text.length >>> 16) & 255;
    payload[6] = (text.length >>> 8) & 255;
    payload[7] = text.length & 255;
    payload.set(text, 8);
    var out = new Uint8ClampedArray(pixels);
    var bit = 0;
    for (var i = 0; i < payload.length; i++) {
      for (var b = 7; b >= 0; b--) {
        var bitVal = (payload[i] >>> b) & 1;
        var channel = Math.floor(bit / 3);
        var offset = bit % 3;
        var idx = channel * 4 + offset; // skip alpha
        out[idx] = (out[idx] & 0xFE) | bitVal;
        bit++;
      }
    }
    return { ok: true, pixels: out, bytesUsed: total };
  }

  function decodeMessage(pixels) {
    function readByte(bitPos) {
      var value = 0;
      for (var b = 0; b < 8; b++) {
        var bit = bitPos + b;
        var channel = Math.floor(bit / 3);
        var offset = bit % 3;
        value = (value << 1) | (pixels[channel * 4 + offset] & 1);
      }
      return value;
    }
    var totalBits = Math.floor(pixels.length / 4) * 3;
    if (totalBits < 64) return { ok: false, error: "Image too small to hold a message." };
    for (var m = 0; m < 4; m++) {
      if (readByte(m * 8) !== MAGIC[m]) {
        return { ok: false, error: "No hidden message found in this image (or it was not made by this app)." };
      }
    }
    var len = 0;
    for (var l = 0; l < 4; l++) len = (len << 8) | readByte(32 + l * 8);
    if (len < 0 || 8 + len > Math.floor(totalBits / 8)) {
      return { ok: false, error: "No hidden message found in this image (or it was not made by this app)." };
    }
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) bytes[i] = readByte(64 + i * 8);
    return { ok: true, message: new TextDecoder().decode(bytes) };
  }

  var api = { encodeMessage: encodeMessage, decodeMessage: decodeMessage, capacityBytes: capacityBytes, bytesNeeded: bytesNeeded };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.Stego = api;
})(typeof window !== "undefined" ? window : globalThis);
