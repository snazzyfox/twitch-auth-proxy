# Twitch Auth Proxy

A small cloudflare workers server that forwards requests to Twitch Oauth2 API. This acts as a lightweight server that turns a "public" OAuth2 app into a "Confidential" one, allowing you to get refresh tokens with indefinite expiration. This eliminates the need to either hardcode your client secret into your app somewhere (insecure) while also removing the need for users to periodically reconfigure their apps once in a while.

This proxy exposes one endpoint that is a direct proxy of the [twitch API `/token` endpoint](https://dev.twitch.tv/docs/authentication/getting-tokens-oidc/#oidc-authorization-code-grant-flow). The only difference is that you do NOT need to provide a `client_secret` - the proxy will look up the secret server-side and fill it in before forwarding the request to Twitch. Responses are returned untouched.

## Deploying

This can be deployed onto cloudflare simply using `wrangler deploy`.

You will need to add the following environment variables to your deployment, either directly on CloudFlare, or through GitHub actions:

- `TWITCH_SECRETS` - a JSON object that where keys are Twitch `client_id`s and values are `client_secret`s. The proxy will look up the client secret by the ID provided in the request (and fail the request if the ID is invalid).
- `CORS_ORIGINS` - a comma-delimited list of HTTP Origin headers that you want to permit to use your server. Wildcards/globs are not supported. This helps prevent browser-based websites you don't own from (ab)using the proxy.
