# Kubernetes and Helm Charts

To manage the packaging of  the Kubernetes resources, we are using  [Helm]( https://helm.sh/). If you want to make use of our charts locally, do the following steps. Before installing this chart please check the `README.md`file present on the previous directory, with some deployment notes.

```
$cd charts

$helm dep build

$helm install crowdwire  .
```

To observe the initialization of all Pods, use the following command:

```
kubectl get all -o wide 
```

This is the structure of our Charts: An Umbrella Chart containing all our microservices, as subcharts. 

```
├── Chart.lock
├── Chart.yaml
├── subcharts
│   ├── api
│   ├── frontend
|	├── mediaserver
│   ├── postgresql
│   ├── rabbitmq
│   └── redis
├── templates
│   ├── _helpers.tpl
│   └── ingress.yaml
└── values.yaml
```

 

Important to refer that the `rabbitmq`, `postgresql` and `redis` charts belong to [Bitnami](https://github.com/bitnami) .

