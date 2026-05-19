package com.example.Assets.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import java.io.File;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Программно вычисляем путь к папке Protected на твоем жестком диске
        String protectedDir = System.getProperty("user.dir") + File.separator + "KeyedVault" + File.separator
                + "Protected" + File.separator;

        // Превращаем локальную папку в веб-путь
        // Теперь любой файл из папки Protected будет доступен по адресу:
        // http://localhost:8080/vault/protected/имя_файла
        registry.addResourceHandler("/vault/protected/**")
                .addResourceLocations("file:" + protectedDir);
    }
}