import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as gatewayapi from "aws-cdk-lib/aws-apigateway";
import * as iam from "aws-cdk-lib/aws-iam";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as sns from "aws-cdk-lib/aws-sns";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";

export const cors: gatewayapi.CorsOptions = {
  allowOrigins: gatewayapi.Cors.ALL_ORIGINS,
  allowMethods: [lambda.HttpMethod.ALL],
  allowHeaders: [
    "Content-Type",
    "Authorization",
    "X-Amz-Date",
    "X-Api-Key",
    "X-Amz-Security-Token",
    "X-Amz-User-Agent",
  ],
  allowCredentials: true,
};

export const sharedLambdaProps: Omit<
  cdk.aws_lambda.FunctionProps,
  "handler" | "code"
> = {
  runtime: lambda.Runtime.NODEJS_18_X,
};

// interface ProductsServiceProps extends cdk.StackProps {
//   catalogItemsQueue: sqs.Queue;
// }

export class ProductService extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const getProductList = new lambda.Function(this, "get-products-list", {
      ...sharedLambdaProps,
      code: lambda.Code.fromAsset("dist/getProductsList"),

      handler: "getProductsList.handler",
    });

    const api = new gatewayapi.RestApi(this, "products-api", {
      restApiName: "product-api",
      deployOptions: {
        stageName: "dev",
      },
    });

    const productsListIntegration = new gatewayapi.LambdaIntegration(
      getProductList,
      {
        requestTemplates: {
          "application/json": '{"statusCode":"200"}',
        },
      }
    );

    const productsList = api.root.addResource("products");
    productsList.addMethod("GET", productsListIntegration);
    productsList.addCorsPreflight(cors);

    const getProductById = new lambda.Function(this, "get product-by-id", {
      ...sharedLambdaProps,
      code: lambda.Code.fromAsset("dist/getProductById"),

      handler: "getProductById.handler",
    });

    const productByIdIntegraion = new gatewayapi.LambdaIntegration(
      getProductById,
      {
        requestTemplates: {
          "application/json": '{"statusCode":"200"}',
        },
      }
    );

    const productById = productsList.addResource("{id}");
    productById.addMethod("GET", productByIdIntegraion);
    productById.addCorsPreflight(cors);

    const createProduct = new lambda.Function(this, "create-product", {
      ...sharedLambdaProps,
      code: lambda.Code.fromAsset("dist/createProduct"),

      handler: "createProduct.handler",
    });

    const createProductIntegration = new gatewayapi.LambdaIntegration(
      createProduct,
      {
        requestTemplates: {
          "application/json": '{"statusCode":"200"}',
        },
      }
    );

    const delProdLambda = new lambda.Function(this, "delete-product-lambda", {
      ...sharedLambdaProps,
      code: lambda.Code.fromAsset("dist/deleteProduct"),
      handler: "deleteProduct.handler",
    });
    const deleteProdIntegration = new gatewayapi.LambdaIntegration(
      delProdLambda
    );
    const authorizer = new gatewayapi.TokenAuthorizer(
      this,
      "basic-authorizer",
      {
        handler: lambda.Function.fromFunctionArn(
          this,
          "lambda-authorizer",
          cdk.Fn.importValue("AuthStack:AuthorizerId")
        ),
        resultsCacheTtl: cdk.Duration.minutes(0),
      }
    );

    productById.addMethod(lambda.HttpMethod.DELETE, deleteProdIntegration, {
      authorizer,
    });

    productsList.addMethod(lambda.HttpMethod.PUT, createProductIntegration, {
      authorizer,
    });

    const productTopic = new sns.Topic(this, "create-product-topic", {});

    new sns.Subscription(this, "main-mail-subscription", {
      topic: productTopic,
      protocol: sns.SubscriptionProtocol.EMAIL,
      endpoint: process.env.SUBSCRIBED_EMAIL1 || "",
    });

    new sns.Subscription(this, "additional-mail-subscription", {
      topic: productTopic,
      protocol: sns.SubscriptionProtocol.EMAIL,
      endpoint: process.env.SUBSCRIBED_EMAIL2 || "",
      filterPolicy: {
        price: sns.SubscriptionFilter.numericFilter({ lessThan: 30 }),
        count: sns.SubscriptionFilter.numericFilter({ greaterThan: 10 }),
      },
    });

    // const catalogItemsQueue = props.catalogItemsQueue;
    const catalogItemsQueue = sqs.Queue.fromQueueArn(
      this,
      "items-queue",
      cdk.Fn.importValue("ImportService:QueueArn")
    );

    const catalogBatchProcessLambda = new lambda.Function(
      this,
      "catalog-batch-process",
      {
        ...sharedLambdaProps,
        code: lambda.Code.fromAsset("dist/catalogBatchProcess"),
        handler: "catalogBatchProcess.handler",
        environment: {
          QUEUE_URL: catalogItemsQueue.queueUrl,
          TOPIC_ARN: productTopic.topicArn,
        },
      }
    );

    catalogItemsQueue.grantConsumeMessages(catalogBatchProcessLambda);

    productTopic.grantPublish(catalogBatchProcessLambda);

    catalogBatchProcessLambda.addEventSource(
      new SqsEventSource(catalogItemsQueue, { batchSize: 5 })
    );

    const dbAccessPolicy = iam.ManagedPolicy.fromAwsManagedPolicyName(
      "AmazonDynamoDBFullAccess"
    );
    [
      getProductList,
      getProductById,
      createProduct,
      catalogBatchProcessLambda,
      delProdLambda,
    ].forEach((lambda) => {
      lambda.role?.addManagedPolicy(dbAccessPolicy);
      lambda.addEnvironment("PRODUCTS_TABLE_NAME", "Products");
      lambda.addEnvironment("STOCK_TABLE_NAME", "Stock");
    });
  }
}
