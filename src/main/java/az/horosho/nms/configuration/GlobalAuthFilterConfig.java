package az.horosho.nms.configuration;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

@Configuration
public class GlobalAuthFilterConfig implements WebFilter {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {

        return exchange.getSession().flatMap(webSession -> {

            if (exchange.getRequest().getPath().toString().contains("/api/auth")) {
                return chain.filter(exchange);
            }

            String account = webSession.getAttribute("admin");

            if (account != null){
                return chain.filter(exchange);
            }

            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();

        });

    }
}
