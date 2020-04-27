FROM golang:latest AS backend
WORKDIR /app
ENV GO111MODULE=on
COPY backend/go.mod .
COPY backend/go.sum .
RUN go mod download
COPY backend/ .
RUN CGO_ENABLED=0 go build -o backend .

FROM node:latest AS frontend
WORKDIR /app
COPY frontend/package.json .
COPY frontend/package-lock.json .
RUN npm i
COPY frontend/ .
RUN npm run build

FROM alpine:latest
WORKDIR /app/backend
COPY --from=backend /app/backend ./backend
COPY --from=backend /app/data ./data
COPY --from=frontend /app/build ../frontend/build
CMD ["./backend"]
