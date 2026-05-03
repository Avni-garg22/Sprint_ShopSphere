FROM eclipse-temurin:21-jdk-jammy
WORKDIR /app
COPY mvnw .
COPY mvnw.cmd .
COPY .mvn .mvn
COPY pom.xml .
COPY src src
RUN chmod +x mvnw && ./mvnw clean package -DskipTests
EXPOSE 8085
CMD ["java", "-jar", "target/admin-service-0.0.1-SNAPSHOT.jar"]
