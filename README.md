# TS3BOT

# [Instalacja po polsku](https://egcforum.pl/topic/3077-ts3bot/)

First opensource teamspeak3 bot with configuration panel. 
First opensource teamspeak3 bot with RAW and SSH support.

### Suported languages

- English
- Polish

Feel free to pull request with translation [here](https://github.com/elipeF/TS3BOT-front) :)

### Functions
```
commands:
    -ping
    -pwall
    -pokeall
functions
    -channelscheck
    -nicknamecheck
    -serveredit
events
    -privatechannel
    -welcomemessage
    -adminpoke
```

### Installation

TS3BOT requires [Docker](https://docs.docker.com/engine/install/)

```sh
$ mkdir ts3bot
$ cd ts3bot
$ wget https://gist.githubusercontent.com/elipeF/0f86cdd833bfacc02c885042aab9ed3b/raw/02560c0b8c198d146e610d58c9af9830cc2d027b/docker-compose.yml
!IMPORTANT: Adjust docker-compose 
$ docker-compose up -d
```

Configuration
- visit http://your-ip
- configure features you want to use
- docker-compose restart
- enter dash and enable features

### Screenshots

![Dashboard](https://i.imgur.com/NiuUArY.png)
![PingCommand](https://i.imgur.com/ynd3ViZ.png)
![PokeBotEvent](https://i.imgur.com/85uxora.png)

## License

MIT
