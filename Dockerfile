FROM eclipse-temurin:17-jdk-jammy AS build
WORKDIR /workspace

COPY backend/gradlew backend/gradlew.bat backend/settings.gradle backend/build.gradle ./
COPY backend/gradle ./gradle
RUN chmod 0755 gradlew && ./gradlew --no-daemon dependencies

COPY backend/src ./src
RUN ./gradlew --no-daemon clean bootJar

FROM eclipse-temurin:17-jre-jammy AS runtime
WORKDIR /app

ENV SPRING_PROFILES_ACTIVE=prod

COPY --from=build --chown=10001:10001 /workspace/build/libs/*.jar /app/app.jar

USER 10001:10001
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
