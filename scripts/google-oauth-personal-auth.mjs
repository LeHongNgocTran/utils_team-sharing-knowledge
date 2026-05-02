import { createHash, randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import http from "node:http";
import { dirname, resolve } from "node:path";

const configPath = process.argv[2] ?? "configs/google-oauth-personal-post-voting-live.example.json";
const config = JSON.parse(await readFile(resolve(process.cwd(), configPath), "utf8"));
const credentialsFile = config.googlePersonal?.credentialsFile;
const tokenFile = config.googlePersonal?.tokenFile;

if (!credentialsFile || !tokenFile) {
  throw new Error(`Config "${configPath}" must include googlePersonal.credentialsFile and googlePersonal.tokenFile.`);
}

const credentials = JSON.parse(await readFile(resolve(process.cwd(), credentialsFile), "utf8"));
const client = credentials.installed ?? credentials.web;

if (!client) {
  throw new Error(`Credentials file "${credentialsFile}" must contain an installed or web OAuth client.`);
}

const redirectUri = client.redirect_uris?.[0];
if (!redirectUri) {
  throw new Error(`Credentials file "${credentialsFile}" must include at least one redirect URI.`);
}

const resolvedRedirectUri = normalizeRedirectUri(redirectUri);

const verifier = base64UrlEncode(randomBytes(32));
const challenge = base64UrlEncode(createHash("sha256").update(verifier).digest());
const state = base64UrlEncode(randomBytes(16));
const scopes = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/gmail.send"
];

const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
authUrl.searchParams.set("client_id", client.client_id);
authUrl.searchParams.set("redirect_uri", resolvedRedirectUri);
authUrl.searchParams.set("response_type", "code");
authUrl.searchParams.set("scope", scopes.join(" "));
authUrl.searchParams.set("access_type", "offline");
authUrl.searchParams.set("prompt", "consent");
authUrl.searchParams.set("code_challenge", challenge);
authUrl.searchParams.set("code_challenge_method", "S256");
authUrl.searchParams.set("state", state);

console.log("Open this URL in your browser and complete the Google login:");
console.log(authUrl.toString());

const redirect = new URL(resolvedRedirectUri);
const server = http.createServer();

const code = await new Promise((resolveCode, rejectCode) => {
  const timer = setTimeout(() => {
    server.close();
    rejectCode(new Error("Timed out waiting for Google OAuth callback."));
  }, 5 * 60 * 1000);

  server.on("request", (req, res) => {
    const requestUrl = new URL(req.url ?? "/", resolvedRedirectUri);
    if (requestUrl.pathname !== redirect.pathname) {
      res.statusCode = 404;
      res.end("Not found");
      return;
    }

    if (requestUrl.searchParams.get("state") !== state) {
      clearTimeout(timer);
      res.statusCode = 400;
      res.end("State mismatch");
      server.close();
      rejectCode(new Error("OAuth state mismatch."));
      return;
    }

    const returnedCode = requestUrl.searchParams.get("code");
    if (!returnedCode) {
      clearTimeout(timer);
      res.statusCode = 400;
      res.end("Missing code");
      server.close();
      rejectCode(new Error("OAuth callback did not include code."));
      return;
    }

    clearTimeout(timer);
    res.statusCode = 200;
    res.end("Google OAuth completed. You can close this window.");
    server.close();
    resolveCode(returnedCode);
  });

  server.on("error", (error) => {
    clearTimeout(timer);
    rejectCode(error);
  });

  server.listen(Number(redirect.port), redirect.hostname);
});

const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    client_id: client.client_id,
    client_secret: client.client_secret,
    code,
    code_verifier: verifier,
    grant_type: "authorization_code",
    redirect_uri: resolvedRedirectUri
  })
});

if (!tokenResponse.ok) {
  throw new Error(`Failed to exchange OAuth code for token: ${tokenResponse.status} ${await tokenResponse.text()}`);
}

const tokenPayload = await tokenResponse.json();
await mkdir(dirname(resolve(process.cwd(), tokenFile)), { recursive: true });
await writeFile(resolve(process.cwd(), tokenFile), `${JSON.stringify({
  ...tokenPayload,
  expiry_date: Date.now() + (tokenPayload.expires_in ?? 0) * 1000
}, null, 2)}\n`, "utf8");

console.log(`Saved personal Google OAuth token to ${tokenFile}`);

function base64UrlEncode(buffer) {
  return Buffer.from(buffer)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function normalizeRedirectUri(redirectUri) {
  const url = new URL(redirectUri);
  if (!url.hostname || url.hostname === "localhost") {
    url.hostname = "127.0.0.1";
  }

  if (!url.port) {
    url.port = "53682";
  }

  if (url.pathname === "/" || url.pathname === "") {
    url.pathname = "/callback";
  }

  return url.toString();
}
