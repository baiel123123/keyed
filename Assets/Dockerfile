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

# Копируем скрипты и зависимости в корень рабочей директории контейнера (/app)
# ... (верхняя часть Dockerfile остается без изменений) ...

# ... (твоя верхняя часть Dockerfile остается без изменений) ...

# Копируем скрипты и зависимости
# ... (твоя верхняя часть Dockerfile остается без изменений) ...

# Копируем скрипты и зависимости
COPY phash_engine.py .
COPY watermark_engine.py .
COPY req.txt .

# Создаем структуру папок для Java
RUN mkdir -p Assets && cp phash_engine.py Assets/ && cp watermark_engine.py Assets/

# ── БРОНЕБОЙНОЕ РЕШЕНИЕ ──
# Ставим библиотеки напрямую через пакетный менеджер Ubuntu
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-opencv \
    python3-numpy \
    && rm -rf /var/lib/apt/lists/*

# Если в req.txt есть что-то еще, доставляем (уже без флагов)
RUN if [ -s req.txt ]; then pip3 install --no-cache-dir -r req.txt; fi
# ─────────────────────────

EXPOSE 10000

ENTRYPOINT ["java", "-jar", "app.jar"]