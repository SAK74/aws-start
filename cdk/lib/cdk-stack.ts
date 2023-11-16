import { RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import {
  CloudFrontWebDistribution,
  OriginAccessIdentity,
} from "aws-cdk-lib/aws-cloudfront";
import { CanonicalUserPrincipal, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { BlockPublicAccess, Bucket } from "aws-cdk-lib/aws-s3";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import { Construct } from "constructs";

export class StaticSite extends Construct {
  constructor(scope: Stack, id: string, props?: StackProps) {
    super(scope, id);
    const s3bucket = new Bucket(this, "S3-Bucket", {
      bucketName: "cdk-app",
      websiteIndexDocument: "index.html",
      publicReadAccess: false,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const cloudFrontOAI = new OriginAccessIdentity(this, "OAI");

    s3bucket.addToResourcePolicy(
      new PolicyStatement({
        actions: ["S3:GetObject"],
        resources: [s3bucket.arnForObjects("*")],
        principals: [
          new CanonicalUserPrincipal(
            cloudFrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId
          ),
        ],
      })
    );

    const distribution = new CloudFrontWebDistribution(
      this,
      "front-distribution",
      {
        originConfigs: [
          {
            s3OriginSource: {
              s3BucketSource: s3bucket,
              originAccessIdentity: cloudFrontOAI,
            },
            behaviors: [
              {
                isDefaultBehavior: true,
              },
            ],
          },
        ],
      }
    );

    new BucketDeployment(this, "bucket-deployment", {
      sources: [Source.asset("../dist")],
      destinationBucket: s3bucket,
      distribution,
      distributionPaths: ["/*"],
    });
  }
}
