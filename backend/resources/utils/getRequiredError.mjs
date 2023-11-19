export class GetRequiredError extends Error {
  constructor() {
    super();
    this.message = 'Method "GET" is required!';
  }
}
