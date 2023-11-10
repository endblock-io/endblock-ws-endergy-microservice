 
connect :
sudo ssh -i "key/keypair-endblock.pem" ec2-user@ec2-18-192-10-122.eu-central-1.compute.amazonaws.com


Send to server:
sudo scp -i key/keypair-endblock.pem /Users/jorgealcazar/Documents/GitHub/endblock-ws-endergy-microservice.zip ec2-user@ec2-18-192-10-122.eu-central-1.compute.amazonaws.com:/tmp/endblock-ws-endergy-microservice.zip

cp /tmp/endblock-ws-endergy-microservice.zip .

unzip endblock-ws-endergy-microservice.zip