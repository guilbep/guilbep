deploy1and1:
	lftp --env-password ftp://${LFTP_LOGIN}@${LFTP_FQDN} -e "mirror -R -c -P=10 dist/ /pierreguilbert.com; bye"
