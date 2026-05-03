FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY target/catalog-service-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8084
CMD ["java", "-jar", "app.jar"]
