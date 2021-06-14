

# Deployment Notes

## Kubernetes Metrics Server

In order to make use of the autoscaling functionality on Kubernetes, it is needed to install the metric server.  If you are using using a Cloud Provider for your cluster,  you should not need to run any command of the following!

If you are using minikube, you can simply run the following command:

```
$ minikube addons enable metrics-server
```

Without minikube, you will need to do the following steps:

```
$ curl https://github.com/kubernetes-sigs/metrics-server/releases/download/v0.4.4/components.yaml
$ vi component.yaml
```

Change the Deployment Resource,  by adding the following flag `--kubelet-insecure-tls`:

```yaml
    spec:
      containers:
      - args:
        - --cert-dir=/tmp
        - --secure-port=4443
        - --kubelet-preferred-address-types=InternalIP,ExternalIP,Hostname
        - --kubelet-use-node-status-port
        - --kubelet-insecure-tls

```

## Kubernetes LoadBalancer Service

If you are not using a Cloud Provider, usually the use of services of type LoadBalancer are difficult to use, since no external IP is provided. However, by using MetalLB, external IPs may be provided by configuring a IP range within your Network.  This can be done by a ConfigMap, like on the file `metallb/metallb.yaml`:

 ```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  namespace: metallb-system
  name: config
data:
  config: |
    address-pools:
    - name: my-ip-space
      protocol: layer2
      addresses:
       - x.x.x.x - y.y.y.y
 ```



## Nginx Ingress Controller

In order to install an NGINX Ingress controller, if using Minikube run the following command:

```
$ minikube addons enable ingress
```

Otherwise you should use the following Chart:

```
$ helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
$ helm repo update
$ helm install ingress-nginx ingress-nginx/ingress-nginx
```



## Dynamic Provisioning on Persistent Volumes

If you are using these charts, and using a BareMetal Cluster, you will have to install an NFS  server and also deploy NFS client  Provisioner to your cluster, in order to make use of dynamic provisioning for Persistent Volumes. However, if you are using Minikube you do not need to do any of the following steps!

**NFS Server**:

```
$ sudo mkdir /srv/nfs/kubedata -p
$ sudo chown nobody: /srv/nfs/kubedata
$ vi /etc/exports
```

Add the following line on `/etc/exports`

```
srv/nfs/kubedata  *(rw,sync,no_subtree_check,no_root_squash,no_all_squash,insecure)
```

Start the nfs server:

```
$ sudo systemctl enable --now nfs-server
$ sudo exportfs -rav
```

If you are using more than one worker node, do the following steps for each of the other nodes:

```
$ sudo apt install -y nfs-common
$ mount -f nfs <node1-ip>:/srv/nfs/kubedata mnt
```

**NFS Client Provisioner :**

```
$ helm repo add nfs-subdir-external-provisioner https://kubernetes-sigs.github.io/nfs-subdir-external-provisioner/
$ helm install nfs-subdir-external-provisioner nfs-subdir-external-provisioner/nfs-subdir-external-provisioner \
    --set nfs.server=x.x.x.x \
    --set nfs.path=/exported/path
```

