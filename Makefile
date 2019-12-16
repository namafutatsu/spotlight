deploy:
	rsync -avz --delete -e ssh src/ myserver:projects/ssshare.laflaque.fr/dist/
