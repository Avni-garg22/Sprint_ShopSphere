package com.sprint.admin_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.util.StringUtils;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import feign.RequestInterceptor;

@Configuration
public class FeignAuthConfig {

    @Bean
    public RequestInterceptor authorizationForwardingInterceptor() {
        return template -> {
            var attributes = RequestContextHolder.getRequestAttributes();
            if (!(attributes instanceof ServletRequestAttributes servletAttributes)) {
                return;
            }

            String authorization = servletAttributes.getRequest().getHeader(HttpHeaders.AUTHORIZATION);
            if (StringUtils.hasText(authorization)) {
                template.header(HttpHeaders.AUTHORIZATION, authorization);
            }
        };
    }
}
