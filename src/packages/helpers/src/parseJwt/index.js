function parseJwt(data) {
  return JSON.parse(atob(data.split('.')[1]));
}

export default parseJwt;
