# Hidden in Images

[![Made with pollinations.ai](https://raw.githubusercontent.com/pollinations/pollinations/main/packages/ui/src/brand/badge-made-with.svg)](https://pollinations.ai/?ref=badge)

Hide a secret message inside an ordinary-looking picture, so only someone who knows to look will find it. Inspired by the Fable 5.1 steganography post: a picture that looks normal can carry a message.

## How it works

- **Hide:** pick a cover picture (upload your own, or generate one with the Pollinations image model), type a secret, and download a PNG. The message is written into the least significant bit of each red, green and blue pixel. Changing a pixel from 142 to 143 is invisible to the eye, but the pattern of those last bits spells out the message.
- **Reveal:** upload a PNG made by this app and read the message back.
- **Decoy caption:** a Pollinations text model writes an innocent-looking caption for the picture. The real message is in the pixels, not in the caption.
- **Your own Pollen:** paste your own Pollinations token in the app and LLM calls are made with it, so your own Pollen pays. Without a token the anonymous tier is used. The token is used only in your browser and never sent to any server of ours.

There is no server. The whole app runs in your browser. Your picture and your message never leave your browser, except for the optional Pollinations calls you ask for.

## Why PNG

PNG is lossless. Saving as JPEG re-encodes the picture and destroys the hidden bits, so share the PNG file itself, never a screenshot or a JPEG.

## Run it

Open `index.html` in a browser. No build step, no dependencies. `stego.js` holds the pure encode/decode functions and is unit-tested with Node (roundtrip, plain-image rejection, oversize rejection all pass).

## Quest

Built for Pollinations quest #18367: an app about messages hidden in images, built on a Pollinations LLM, with users paying with their own Pollen.
