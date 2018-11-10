TAG:=$(shell git rev-list HEAD --max-count=1 --abbrev-commit)
export TAG

test:
	go test ./...

build:
	go build -ldflags "-X main.version=$(TAG)" -o chatserver ./src

pack: build #Build is a dependency for pack
	docker build -t gcr.io/myproject/chat-server:$(TAG) .

upload:
   docker push gcr.io/myproject/chat-server:$(TAG)