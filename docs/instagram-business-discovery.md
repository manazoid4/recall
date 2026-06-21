# Instagram public-account import

Recall uses Meta's supported **Instagram Business Discovery** API. It can preview recent feed media from public Instagram Business and Creator accounts.

It does not access:

- personal accounts;
- private accounts;
- saved folders;
- viewed or recommended posts;
- passwords, cookies or Instagram sessions;
- Stories through this workflow.

## Meta prerequisites

1. Create or select a Meta app with the Instagram API with Facebook Login.
2. Connect a Facebook Page to an Instagram Business or Creator account controlled by the founder.
3. Grant the app the permissions required by Meta Business Discovery for that connected professional account.
4. Generate a valid long-lived access token.
5. Obtain the connected Instagram professional account ID.

Meta documentation:

- https://developers.facebook.com/docs/instagram-platform/instagram-api-with-facebook-login/business-discovery/
- https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/ig-user/business_discovery/

## Vercel variables

Set all three environments as appropriate:

```text
INSTAGRAM_BUSINESS_ACCOUNT_ID=<connected professional account ID>
INSTAGRAM_ACCESS_TOKEN=<valid Meta access token>
META_GRAPH_API_VERSION=v25.0
```

The token is server-only. Never prefix it with `NEXT_PUBLIC_`.

## Verification

1. Deploy a preview after setting the variables.
2. Sign in.
3. Open `/upload`.
4. Select **Import a public Instagram account**.
5. Enter a known public Business or Creator username.
6. Confirm preview results match that account.
7. Select specific posts and import.
8. Confirm the library stores canonical Instagram URLs and provenance with:
   - `captureMethod: manual_import`;
   - `accessClass: public`;
   - the original platform item ID;
   - capture and publication timestamps.

If configuration is absent, the endpoint returns HTTP 503. If Meta cannot expose the account, it returns HTTP 422 with a public-professional-account explanation.
