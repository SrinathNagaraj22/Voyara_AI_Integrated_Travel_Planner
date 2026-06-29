package com.voyara;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class VoyaraApplication {
    public static void main(String[] args) {
        System.out.println("Starting Voyara Core Spring Boot Server Node...");
        SpringApplication.run(VoyaraApplication.class, args);
        System.out.println("Voyara High-Speed Backend successfully launched. Core Ready on Port 8080!");
    }
}
