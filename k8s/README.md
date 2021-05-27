## Kubernetes Metrics Server

In order to make use of the autoscaling functionality on Kubernetes, it is needed to install the metric server.

If you are using minikube, you can simply run the following command:

```
$ minikube addons enable metrics-server
```

Without minikube, you will need to run the following the command:

```
$ kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/download/v0.4.4/components.yaml

```