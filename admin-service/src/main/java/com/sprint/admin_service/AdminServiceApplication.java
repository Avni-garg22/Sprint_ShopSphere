package com.sprint.admin_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication(exclude = { UserDetailsServiceAutoConfiguration.class })
@EnableFeignClients
public class AdminServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(AdminServiceApplication.class, args);
	}

}
