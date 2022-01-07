#!/bin/sh

npm run build

tag=gshafrir/shufersal
docker build -t ${tag} . 
docker push ${tag}