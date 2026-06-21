FROM node:22-alpine AS build

WORKDIR /app/frontend

ARG VITE_USE_MOCK=false
ARG VITE_API_BASE_URL=/api
ENV VITE_USE_MOCK=${VITE_USE_MOCK}
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

COPY frontend/package*.json ./
RUN npm ci

COPY frontend ./
RUN npm run build

FROM alpine:3.22

COPY --from=build /app/frontend/dist /dist

CMD ["sh", "-c", "cp -r /dist/. /frontend-dist/"]
