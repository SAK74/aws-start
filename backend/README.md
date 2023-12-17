## Authorization

### Goals

- Learn what authorization in AWS is all about
- Explore different authorization concepts and services like Cognito, user pool, etc.
- Set up authorization via AWS Lambda and AWS Cognito

### [Cloud front link](https://d2w6eb7for7x7b.cloudfront.net)

---

### Short user manual:

&nbsp;&nbsp; Frontend App getting auth-token from local-storage, so to simplify it, you can use util  
command :  
`npm run token:generate` // in backend directory  
wich encodes `SAK74:TEST_PASSWORD` (according to task requirements)  
then you should set it encoded value "manually" to browser localStorage with key `authorization_token`
