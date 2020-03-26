export default (blob, setData) => {
  blob.text().then((str) => {
    setData(JSON.parse(str));
  });
};
