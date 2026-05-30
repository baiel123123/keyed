FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app


COPY --from=build /app/target/*.jar app.jar
COPY phash_engine.py .
COPY watermark_engine.py .
COPY req.txt .
RUN pip3 install --no-cache-dir -r req.txt --break-system-packages 2>/dev/null || true

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
RUN mkdir -p KeyedVault/Protected KeyedVault/Originals

EXPOSE 10000

ENTRYPOINT ["java", "-Xmx400m", "-jar", "app.jar"]