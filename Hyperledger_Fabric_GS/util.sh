

sudo docker run --volume=/:/rootfs:ro --volume=/var/run:/var/run:rw --volume=/sys/fs/cgroup:/sys/fs/cgroup:ro --volume=/var/lib/docker/:/var/lib/docker:ro --publish=8080:8080 --detach=true --name=cadvisor --privileged=true google/cadvisor:latest

pushd setup/
./node_exporter
popd
