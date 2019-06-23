FROM ubuntu:16.04

LABEL MAINTAINER="Camila Pontes cftpontes@gmail.com"


RUN apt-get update
RUN sudo apt-get install

RUN adduser --disabled-password --gecos '' docker
RUN sudo adduser docker
RUN echo '%sudo ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers

USER docker

RUN sudo apt-get update

RUN sudo apt-get -y install curl

RUN sudo apt-get install -y python3-pip  

RUN sudo apt-get install -y python-pip python-dev

RUN sudo -s

EXPOSE 5000

COPY ./requirements.txt /app/requirements.txt

COPY ./static/entries.log /app/static/entries.log

WORKDIR /app

RUN sudo -H pip3 install -r requirements.txt

COPY . /app

# ENTRYPOINT [ "python3" ]

CMD ["sudo", "-E","python3","server.py"]

# Comandos: sudo docker build -t <nome>:latest .
#           sudo docker run -d -it -p 80:80 <nome>:latest

