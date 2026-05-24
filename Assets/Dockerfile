# Этап 1: Сборка приложения внутри контейнера
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Этап 2: Запуск скомпилированного .jar приложения
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Убираем EXPOSE, чтобы Render сам определял динамический порт
# Передаем переменную среды PORT напрямую в рантайм Java
ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT:-8080} -jar app.jar"]