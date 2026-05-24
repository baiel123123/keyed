package com.example.Assets.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import javax.sql.DataSource;

@Configuration
public class DatabaseConfig {

    @Bean
    public DataSource dataSource() {
        // Проверяем стандартные переменные Render
        String rawUrl = System.getenv("SPRING_DATASOURCE_URL");
        if (rawUrl == null || rawUrl.isEmpty()) {
            rawUrl = System.getenv("DATABASE_URL");
        }

        HikariConfig config = new HikariConfig();

        if (rawUrl != null && !rawUrl.isEmpty()) {
            // Если строка начинается с postgresql://, автоматически исправляем для JDBC
            if (rawUrl.startsWith("postgresql://")) {
                rawUrl = "jdbc:" + rawUrl;
            }
            config.setJdbcUrl(rawUrl);
        } else {
            // Фолбэк на локальную разработку, если переменных окружения нет
            config.setJdbcUrl("jdbc:postgresql://localhost:5432/keyed");
            config.setUsername("postgres");
            config.setPassword("postgres");
        }

        config.setDriverClassName("org.postgresql.Driver");
        return new HikariDataSource(config);
    }
}