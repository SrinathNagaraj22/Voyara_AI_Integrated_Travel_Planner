# syntax=docker/dockerfile:1.7
#
# Multi-stage Spring Boot image. BuildKit cache mounts give us fast
# incremental rebuilds without copy-once-build-once gymnastics.

# ---------- builder ----------
FROM maven:3.9-eclipse-temurin-17 AS builder

WORKDIR /workspace

# Resolve deps first so the layer caches when only source changes.
COPY pom.xml ./
RUN --mount=type=cache,target=/root/.m2 mvn -B -q dependency:go-offline

COPY src ./src
RUN --mount=type=cache,target=/root/.m2 \
    mvn -B -q -DskipTests package \
    && cp target/backend-*.jar /workspace/app.jar

# ---------- runtime ----------
FROM eclipse-temurin:17-jre-jammy AS runtime

# curl for the container healthcheck; nothing else.
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd --system --gid 1000 app \
    && useradd --system --uid 1000 --gid app --home-dir /app --shell /usr/sbin/nologin app

WORKDIR /app
COPY --from=builder /workspace/app.jar /app/app.jar
USER app

ENV SERVER_PORT=8080 \
    SPRING_PROFILES_ACTIVE=prod \
    JAVA_OPTS=""

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD curl -fsS http://127.0.0.1:8080/actuator/health || exit 1

ENTRYPOINT ["sh","-c","exec java $JAVA_OPTS -jar /app/app.jar"]
