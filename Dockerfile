# Local "test with gzip" container.
# Build the site locally first (`make build`), then `make docker-serve` (or
# `make docker-build && make docker-serve`) to serve `dist/` through nginx
# with gzip + immutable cache headers on hashed assets. Mirrors what a real
# production reverse proxy would do.
FROM nginx/nginx-unprivileged:stable

# Replace stock config with ours.
COPY nginx.conf /etc/nginx/nginx.conf

# Ship the prebuilt static site.
COPY --chown=nginx:nginx dist/ /usr/share/nginx/html/

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]

HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
