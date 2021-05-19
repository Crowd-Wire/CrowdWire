import json

from kubernetes import client, config
from kubernetes.client import ApiException
from kubernetes.config import ConfigException
from loguru import logger


class KubernetesHandler:
    def __init__(self):
        self.load_config()
        self.client = None
        self.apps = None

    def load_config(self):
        try:
            config.load_kube_config()
            self.client = client.CoreV1Api()
            self.apps = client.AppsV1Api()
        except ConfigException:
            logger.info("No cluster found!")

    def get_all_pods(self):
        return self.client.list_pod_for_all_namespaces(watch=False).items

    def get_mediaserver_pods_names(self):
        pods_list = self.get_all_pods()
        return [pod for pod in pods_list if 'mediaserver' in pod.metadata.name]

    def scale_mediaserver_replicas(self):
        payload = {'spec': {}}
        payload['spec']['replicas'] = len(self.get_mediaserver_pods_names()) + 1
        p = json.dumps(payload)
        try:
            self.apps.patch_namespaced_deployment(
                name='crowdwire-mediaserver', namespace='default', body=json.loads(p))
            logger.info("Successing updating number of replicas!")
        except ApiException as e:
            logger.warning(e)

    def destroy_mediaserver_pod(self, pod_name: str, namespace: str):
        try:
            api_response = self.client.delete_namespaced_pod(pod_name, namespace)
            logger.info(api_response)
        except ApiException as e:
            logger.warning(e)


k8s_handler = KubernetesHandler()
