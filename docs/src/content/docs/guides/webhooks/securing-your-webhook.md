---
title: Securing your webhook
---

After you created your webhook, you received a shared secret which is a random 32 character hexadecimal string.
If you did not save it, you can update the webhook and request a regeneration of the shared secret.

The request body + timestamp will be signed with that very shared secret using the algorithm **HMAC SHA-512**.
The hex-digest will be sent with every request in the `X-Fiberplane-Signature` header. The format of the header is `v1=[signature]`.

Keep in mind that this shared secret approach only protects against a third-party sending a fake payload in the name
of Fiberplane to your endpoint. It does *not* ensure secrecy. If you want to ensure secrecy, we strongly recommend
using HTTPS for your payload handling server. Please note that your certificate must be trusted by the Mozilla Trust
Store and cannot be self-signed.

## Python example

We can extend our server from the previous chapter to verify the signature:

```python
from flask import Flask, request
import bytes
import os
import hmac
import hashlib

shared_secret = bytes.fromhex(os.environ['FIBERPLANE_WEBHOOK_SHARED_SECRET'])
app = Flask(__name__)

def verify_payload(data, signature, timestamp):
    digest = hmac.new(shared_secret, b''.join([bytes(data, 'utf8'),bytes(timestamp, 'utf8')]), hashlib.sha512).hexdigest()
    return hmac.compare_digest(digest, signature)

@app.route("/delivery", methods=["POST"])
def handle_delivery():
    if not verify_payload(request.data, request.headers.get("X-Fiberplane-Signature")[3:], request.headers.get("X-Fiberplane-Timestamp")):
        return "Mismatching signature", 401

    payload = request.get_json(force=True)
    
    print(f"Received delivery from Fiberplane: {payload}")
    return "OK", 200
```

Now we will check every incoming request for a matching signature found in the `X-Fiberplane-Signature` header.
If the verification fails, we will respond with status code 401.
