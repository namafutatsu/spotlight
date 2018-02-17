deploy:
	rsync -avz --delete -e ssh src/ myserver:projects/spotlight.cam/dist/
