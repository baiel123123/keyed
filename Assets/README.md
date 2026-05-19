# KEYED — запуск

## Docker (PostgreSQL)

Нужен установленный [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows/Mac).

```bash
cd Assets
docker compose up -d
```

Проверка, что БД поднялась:

```bash
docker compose ps
```

Статус контейнера `keyed-postgres` должен быть **healthy**.

Остановить:

```bash
docker compose down
```

Параметры БД — в файле `.env` (уже есть в проекте):

| Переменная | По умолчанию |
|------------|----------------|
| `POSTGRES_DB` | `keyed` |
| `POSTGRES_USER` | `postgres` |
| `POSTGRES_PASSWORD` | `keyed_secure` |
| `POSTGRES_PORT` | `5432` |

Spring подключается к `localhost:5432` — менять `application.properties` не нужно, если `.env` совпадает с дефолтами.

### Если меняли пароль/логин в `.env` после первого запуска

Старые данные останутся в volume. Сброс:

```bash
docker compose down -v
docker compose up -d
```

### Посмотреть пользователей в БД

```bash
docker exec -it keyed-postgres psql -U postgres -d keyed -c "SELECT id, email, author_id FROM users;"
```

---

## Приложение

Запуск Spring — как обычно, **рабочая папка: корень `keyed`** (не `Assets`).

UI: **http://localhost:8080/**

Python (если ещё не ставил): `pip install pillow ImageHash opencv-python numpy`
