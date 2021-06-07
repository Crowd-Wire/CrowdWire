# Media Server Infrastructure

Kubernetes does not allow a port range opening functionality like Docker, which is really important in the context of our MediaServer(MediaSoup), since it needs a wide range of UDP open ports to send/receive audio and video streams. Therefore we opened manually each of this ports. 

Another Option could be the use of hostNetworking, by adding in the `deployment.yaml` the flag `hostNetwork: true`, however we would have 1 pod per node, which would not allow dynamic scaling of the replicas.

Each Service  can only have 100 endpoints, and as we needed over 10000 ports, we had to create another additional services to serve our purposes. It is obviously not the best way to do this, but it was not possible to find another solution yet.

