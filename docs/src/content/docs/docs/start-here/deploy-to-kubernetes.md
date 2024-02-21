---
title: Deploy to Kubernetes
---

## Deploy to Kubernetes

### Generate an `fpd` API Token in the Studio

![Register an FPD](@assets/images/register_an_fpd.png)

In order for the `fpd` to talk to the Fiberplane Studio successfully it needs to
be successfully authorized. This step will generate a **`fpd` API Token** that
will be needed later.

1. Go to your Fiberplane Settings page.
2. Click **`+ New`** to register a proxy with a name that identifies the cluster
	 you will install it into (for example, "Production"). This will generate and
	 display a `fpd` API Token that the proxy will use to authenticate with the
	 Fiberplane Studio.
3. Copy the `fpd` API Token generated in Step 2 for the next step.

### Deploy the `fpd` to your Kubernetes cluster

1. Create the Kubernetes configuration file and change the Prometheus URL to
	 point to the Prometheus instance(s) inside your cluster:

```yaml
# configmap.yaml

---
apiVersion: v1
kind: ConfigMap
metadata:
  name: fpd
data:
  data_sources.yaml: |

    # The data source name will appear in the Fiberplane Studio
   - name: prometheus-prod
     description: Prometheus (Production)
     providerType: prometheus
     config:
       url: http://prometheus
```

1. Create the Kubernetes deployment file (replace `<token>` with the `fpd` API
	 Token created during the earlier step):

```yaml
# deployment.yaml
---
apiVersion: apps/v1
kind: Deployment
metadata:
    name: fpd
    labels:
        app: fpd
spec:
    replicas: 1
    selector:
        matchLabels:
            app: fpd
    template:
        metadata:
            labels:
                app: fpd
        spec:
            containers:
                - name: fpd
                  image: "fiberplane/fpd:v2"
                  env:
                      - name: TOKEN
                        value: "<token>" # <-------------------------------- REPLACE ME
                      - name: DATA_SOURCES_PATH
                        value: /app/config/data_sources.yaml
                      - name: RUST_LOG
                        value: proxy=debug
                  volumeMounts:
                      - name: data-sources
                        mountPath: /app/config/data_sources.yaml
                        subPath: data_sources.yaml
            volumes:
                - name: data-sources
                  configMap:
                      # Provide the name of the ConfigMap containing the files you want
                      # to add to the container
                      name: fpd
                      items:
                          - key: data_sources.yaml
                            path: data_sources.yaml
```

2. Apply the changes to your Kubernetes cluster by running the following commands:

```bash
kubectl apply -f configmap.yml
kubectl apply -f deployment.yml
```

Once you complete your Proxy setup, your data sources linked in the Proxy
configuration should be recognized by the Studio - you can verify this again by
going to the **Settings > Data Sources** screen.👇

![Untitled](@assets/images/Untitled.png)
