FROM eclipse-temurin:21-jdk-jammy
WORKDIR /app
RUN apt-get update && apt-get install -y maven && rm -rf /var/lib/apt/lists/*
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src src
RUN mvn clean package -DskipTests
EXPOSE 8082
CMD ["java", "-jar", "target/payment-service-0.0.1-SNAPSHOT.jar"]
