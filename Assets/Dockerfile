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
COPY phash_engine.py .
COPY watermark_engine.py .
COPY req.txt .

# Создаем структуру папок для Java
RUN mkdir -p Assets && cp phash_engine.py Assets/ && cp watermark_engine.py Assets/

# ── НОВЫЙ БЛОК: Настройка виртуального окружения ──

# 1. Доустанавливаем пакет venv (на всякий случай, если его нет в базовом образе)
RUN apt-get update && apt-get install -y python3-venv

# 2. Создаем виртуальное окружение в папке /opt/venv
RUN python3 -m venv /opt/venv

# 3. Активируем его, добавляя в самое начало системного PATH
ENV PATH="/opt/venv/bin:$PATH"

# 4. Теперь команды pip и python автоматически работают внутри этого окружения!
RUN pip install --no-cache-dir opencv-python-headless numpy && \
    if [ -s req.txt ]; then pip install --no-cache-dir -r req.txt; fi

# ──────────────────────────────────────────────────

EXPOSE 10000

ENTRYPOINT ["java", "-jar", "app.jar"]