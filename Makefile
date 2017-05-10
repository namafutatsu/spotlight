.PHONY: docker_images

client/image.tar:
	rm -f $@ && \
		cd client && \
		docker build . --tag spotlight_client:latest && \
		docker save --output $(notdir $@) spotlight_client:latest

server/image.tar:
	rm -f $@ && \
		cd server && \
		docker build . --tag spotlight_server:latest && \
		docker save --output $(notdir $@) spotlight_server:latest

clean:
	rm -f client/image.tar server/image.tar

docker_images: client/image.tar server/image.tar
