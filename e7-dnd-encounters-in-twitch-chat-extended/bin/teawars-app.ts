#!/usr/bin/env node
import * as cdk from "@aws-cdk/core";
import * as dotenv from "dotenv";
import "source-map-support/register";
import { DebuggerStack } from "../lib/debugger.stack";
import { DocDb } from "../lib/docdb.stack";
import { NestjsOnFargateStack } from "../lib/nestjs-on-fargate-stack";

dotenv.config({ path: "./lib/.env" }); // path is relative to where `cdk deploy` is run
const env = process.env;
assertEnv(env);

const app = new cdk.App();

const dbStack = new DocDb(app, "TeawarsDocDbStack", {
  databaseMasterUsername: env.DATABASE_MASTER_USERNAME,
  env: {
    account: env.CDK_DEFAULT_ACCOUNT,
    region: env.CDK_DEFAULT_REGION,
  },
});
new NestjsOnFargateStack(app, "TeawarsStack", {
  vpc: dbStack.vpc,
  databaseSecret: dbStack.databaseSecret,
  env: {
    account: env.CDK_DEFAULT_ACCOUNT,
    region: env.CDK_DEFAULT_REGION,
  },
});
new DebuggerStack(app, "TeawarsDbDebuggerStack", {
  vpc: dbStack.vpc,
  env: {
    account: env.CDK_DEFAULT_ACCOUNT,
    region: env.CDK_DEFAULT_REGION,
  },
  sshForwardLocalPort: "27017",
  sshForwardTargetUrl: dbStack.databaseUrl,
  profile: env.PROFILE,
});

interface Env {
  DATABASE_MASTER_USERNAME?: string;
  // CDK_DEFAULT_* is set based on the AWS profile specified using the --profile option, or the default AWS profile if none is specified.
  CDK_DEFAULT_REGION?: string;
  CDK_DEFAULT_ACCOUNT?: string;
  DEBUG_USER_ARN?: string;
  PROFILE?: string;
}

function assertEnv(env: Env): asserts env is Required<Env> {
  if (!env.DATABASE_MASTER_USERNAME)
    throw new Error("Missing DATABASE_MASTER_USERNAME");
}
