import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { cors } from "./product-service";
import { Bucket, HttpMethods, EventType } from "aws-cdk-lib/aws-s3";

const UPLOAD_DIR = "uploaded";
const REGION = "eu-north-1";
const PARSE_DIR = "parsed";

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new Bucket(this, "bucket-to-upload", {
      autoDeleteObjects: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      cors: [
        {
          allowedMethods: [HttpMethods.GET, HttpMethods.PUT],
          allowedOrigins: apigateway.Cors.ALL_ORIGINS,
          allowedHeaders: apigateway.Cors.DEFAULT_HEADERS,
        },
      ],
    });

    const api = new apigateway.RestApi(this, "import-api", {
      deployOptions: {
        stageName: "dev",
      },
      description: "Get upload-to-S3 URL",
    });

    const importProductLambda = new lambda.Function(this, "get-upload-url", {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset("resources"),
      handler: "importProduct.handler",
      environment: {
        BUCKET_NAME: bucket.bucketName,
        UPLOAD_DIR,
        REGION,
      },
    });

    const importParseLambda = new lambda.Function(this, "parse-uploaded", {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset("dist"),
      handler: "importParse.handler",
      environment: {
        REGION,
        PARSE_DIR,
      },
    });

    bucket.grantWrite(importProductLambda, `${UPLOAD_DIR}/*`);
    bucket.addEventNotification(
      EventType.OBJECT_CREATED,
      new cdk.aws_s3_notifications.LambdaDestination(importParseLambda)
    );
    bucket.grantDelete(importParseLambda, `${UPLOAD_DIR}/*`);
    bucket.grantRead(importParseLambda, `${UPLOAD_DIR}/*`);
    bucket.grantWrite(importParseLambda, `${PARSE_DIR}/*`);

    const lambdaIntegration = new apigateway.LambdaIntegration(
      importProductLambda,
      {}
    );

    const importResource = api.root.addResource("import", {
      defaultCorsPreflightOptions: cors,
    });
    importResource.addMethod("GET", lambdaIntegration, {});
  }
}
