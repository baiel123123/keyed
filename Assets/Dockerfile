# Этап 1: Сборка приложения внутри контейнера
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

# Копируем pom.xml и исходный код бэкенда
COPY pom.xml .
COPY src ./src

# Собираем проект в .jar файл, пропуская тесты для скорости деплоя
RUN mvn clean package -DskipTests

# Этап 2: Запуск скомпилированного .jar приложения
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Копируем собранный jar-файл из предыдущего этапа
COPY --from=build /app/target/*.jar app.jar

# Явно открываем порт 8080 для сети контейнеров
EXPOSE 8080

# Жестко указываем порт Спрингу при старте Java-машины
ENTRYPOINT ["java", "-Dserver.port=8080", "-jar", "app.jar"]