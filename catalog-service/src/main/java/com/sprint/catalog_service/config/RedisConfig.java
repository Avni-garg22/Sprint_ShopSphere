package com.sprint.catalog_service.config;



import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
public class RedisConfig {

    @Bean
    public RedisConnectionFactory connectionFactory(
            @org.springframework.beans.factory.annotation.Value("${spring.data.redis.host:localhost}") String host,
            @org.springframework.beans.factory.annotation.Value("${spring.data.redis.port:6379}") int port) {
        return new LettuceConnectionFactory(host, port);
    }

    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory factory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(factory);

        // 🔥 KEY as String
        template.setKeySerializer(new StringRedisSerializer());

        // 🔥 VALUE as JSON
        template.setValueSerializer(new GenericJackson2JsonRedisSerializer());

        return template;
    }
}