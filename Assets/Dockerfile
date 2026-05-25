# Этап 1: Сборка Java-приложения
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
# Копируем всё содержимое папки Assets внутрь контейнера
COPY . .
RUN mvn clean package -DskipTests

# Этап 2: Финальный образ
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Устанавливаем Python и pip
RUN apt-get update && apt-get install -y python3 python3-pip && rm -rf /var/lib/apt/lists/*

# Копируем jar-ник из этапа сборки
COPY --from=build /app/target/*.jar app.jar

# Копируем скрипты и зависимости (они теперь в корне контекста сборки)
COPY phash_engine.py .
COPY watermark_engine.py .
COPY req.txt .

# Создаем дублирующую папку Assets/ внутри /app, чтобы удовлетворить проверку в Java (AService)
RUN mkdir -p Assets && cp phash_engine.py Assets/

# Устанавливаем Python-зависимости
RUN pip3 install --no-cache-dir -r req.txt

EXPOSE 10000

ENTRYPOINT ["java", "-jar", "app.jar"]