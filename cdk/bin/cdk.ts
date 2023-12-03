import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { StaticSite } from "../lib/cdk-stack";

const app = new cdk.App();

class StaticSiteStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    new StaticSite(this, "static-site");
  }
}
new StaticSiteStack(app, "StaticSiteStack", {
  env: {
    account: "680957611181",
    region: "eu-north-1",
  },
});
app.synth();
