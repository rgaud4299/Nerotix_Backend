const { StandardCheckoutClient, Env } = require("pg-sdk-node");

const clientId = "TEST-M225K177O8IGP_25081";
const clientSecret = "OTk2ODEwMTMtNGEyOS00MzUyLWE5MDItNjk4NTQwMTgwNjY4";
const clientVersion = "1";
const env = Env.SANDBOX;

const client = StandardCheckoutClient.getInstance(
  clientId,
  clientSecret,
  clientVersion,
  env
);

module.exports = client;
