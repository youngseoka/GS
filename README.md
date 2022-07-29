[//]: # (SPDX-License-Identifier: CC-BY-4.0)

# Digitalzone Hyperledger Fabric GS



Hyperledger_fabric, IPFS, DID, NFT, Monitoring

## 설치 가이드

* 사전 필요 설치
- Docker
- Docker-Compose
- Golang
- ...

## 사전 준비 사항

- 설치 전 8대의 서버 혹은 노드가 필요하다. 한대의 PC 혹은 서버, 노드에서 실행이 가능하지만 서술하는 기준은 8대의 서버 혹은 노드가 존재한다고 생각하고 기술한다.


## Docker Swarm 연결
 - 설치 전 한대의 서버 혹은 노드를 마스터 노드라 지칭하고 기준으로 삼는다.

# MasterNode
 - docker swarm init --advertise-addr <master_node_ip>
 - docker swarm join-token manager
 - -> 출력값 ex) docker swarm join --token SWMTKN-1-5149xr7hs32v4ygf6bb609vckh0x4wulwdnr8kfcqp57izlgdk-5z162w2f9s9c8m6effaj3lw1a <master_node_ip>:2377

# 다른 7대의 NODE
 - MasterNode의 출력값에 --advertise-addr <node_ip>를 입력한다
 - -> 입력값 ex) docker swarm join --token SWMTKN-1-5149xr7hs32v4ygf6bb609vckh0x4wulwdnr8kfcqp57izlgdk-5z162w2f9s9c8m6effaj3lw1a <master_node_ip>:2377 --advertise-addr <node_ip>

 - 전체 노드에서 docker info 사용하여 docker swarm에 아이피 추가된거 확인.

## 실행 가이드
..

..




## 보유한 기술 목록



|  **제목** | **설명** | **가이드** | **필요 언어** | **기타** |
| -----------|------------------------------|----------|---------|---------|
| [DID] | DID | [링크](https://hyperledger-fabric.readthedocs.io/en/latest/write_first_app.html) | Go, JavaScript, TypeScript, Java | Go, JavaScript, TypeScript, Java |
| [ipfs] | ipfs | [링크](https://hyperledger-fabric.readthedocs.io/en/latest/write_first_app.html) | Go, JavaScript, TypeScript, Java | Go, JavaScript, TypeScript, Java |
| [nft] | nft | [링크](https://hyperledger-fabric.readthedocs.io/en/latest/write_first_app.html) | Go, JavaScript, TypeScript, Java | Go, JavaScript, TypeScript, Java |



## License <a name="license"></a>

Digitalzone
