package az.horosho.nms.services;

import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import reactor.core.scheduler.Schedulers;

import java.io.IOException;


@Service
public class JSoupService {

    public Mono<String> getImageSrcUrlByModelName(String model) {
        return Mono.fromCallable(() -> {
            try {
                String searchQuery = "switch " + model;
                String url = "https://duckduckgo.com/?q=" + searchQuery.replace(" ", "+") + "&iax=images&ia=images";

                Document doc = Jsoup.connect(url)
                        .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36")
                        .timeout(4000)
                        .get();

                Element image = doc.selectFirst("img");

                if (image != null) {
                    String src = image.attr("src");
                    System.out.println("image src attribute " + src);
                    if (!src.startsWith("http")) {
                        src = "https:" + src;
                    }
                    return src;
                } else {
                    return null;
                }

            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }).subscribeOn(Schedulers.boundedElastic());
    }

}
