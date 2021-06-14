CERT_MANAGER_NAME=./cert-manager-1.0.4.yaml
CERT_ISSUER_NAME=./cert-issuer-nginx-ingress.yaml
CERTIFICATE_NAME=./certificate.yaml
echo "Installing cert-manager.."
kubectl apply -f $CERT_MANAGER_NAME

echo "Waiting to pods to be running.."
sleep 1m

echo "Installing Certificate Issuer"
kubectl apply -f $CERT_ISSUER_NAME

echo "Waiting to pods to be running.."
sleep 1m

echo "Issuing Certificate"
kubectl apply -f $CERTIFICATE_NAME


