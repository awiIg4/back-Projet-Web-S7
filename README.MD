README

# Prerequisite

Install `Docker`

Install `Docker Desktop` (optionnal but docker-compose.yml may need changes)

# Setup

Clone project

``` bash
docker compose up --build
```

# Troubleshoot

Port aldready in use ?
``` bash
sudo lsof -i :<port>
```

Stop process and relaunch container