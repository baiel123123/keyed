# Этап 1: Сборка приложения
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Этап 2: Запуск приложения
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# По умолчанию Render для Web Service открывает порт 10000 наружу
EXPOSE 10000

ENTRYPOINT ["java", "-jar", "app.jar"]