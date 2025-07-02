package az.horosho.nms.controllers;

import az.horosho.nms.models.dto.UserCredentials;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.WebSession;
import reactor.core.publisher.Mono;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

    @Value("${spring.password_auth}")
    private String BASIC_PASSWORD;


    @GetMapping("/check")
    public Mono<ResponseEntity<?>> checkAuth(
        WebSession session
    ) {
        String admin = session.getAttribute("admin");

        if (admin == null) {
            return Mono.just(ResponseEntity.status(401).body("Not Authenticated"));
        }

        return Mono.just(ResponseEntity.ok().body("Authenticated"));
    }


    @PostMapping("/login")
    public Mono<ResponseEntity<?>> login(
            @RequestBody UserCredentials data,
            WebSession session
    ) {

        if(data.username().equals("admin") && data.password().equals(BASIC_PASSWORD)) {
            session.getAttributes().put("admin", data.username());
            return Mono.just(ResponseEntity.ok().body("Authenticated"));
        };

        return Mono.just(ResponseEntity.badRequest().body("Not Authenticated"));
    }

    @GetMapping("/logout")
    public Mono<ResponseEntity<?>> logout(
            WebSession session
    ){
        return session.invalidate().thenReturn(ResponseEntity.ok("Logged out"));
    }

}
