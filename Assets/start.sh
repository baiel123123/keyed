# Запускаем Python-движок в фоне
python3 -m uvicorn rag_notary_engine:app --host 0.0.0.0 --port 8001 &

# Запускаем Java-приложение (оно будет "главным")
java -Xmx400m -jar app.jar