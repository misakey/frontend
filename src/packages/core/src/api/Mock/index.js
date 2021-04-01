class Mock {
  constructor(httpStatus) {
    this.httpStatus = httpStatus;
  }

  get = (httpStatus) => this.httpStatus[httpStatus];
}

export default Mock;
