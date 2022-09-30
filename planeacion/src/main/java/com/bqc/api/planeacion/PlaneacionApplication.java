package com.bqc.api.planeacion;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.web.bind.annotation.CrossOrigin;

@SpringBootApplication
@EnableFeignClients

public class PlaneacionApplication {

	public static void main(String[] args) {
		SpringApplication.run(PlaneacionApplication.class, args);
	}

}
