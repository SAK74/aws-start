export class RequiredMethodError extends Error {
  constructor() {
    super();
    this.message = 'Method "GET" is required!';
  }
}
