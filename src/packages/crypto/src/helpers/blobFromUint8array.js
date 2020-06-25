export default function (bytes) {
  // note the brackets around "bytes"!
  // Without them it does not throw but it behaves super weirdly
  // see https://stackoverflow.com/a/44148694/3025740
  return new Blob([bytes]);
}
