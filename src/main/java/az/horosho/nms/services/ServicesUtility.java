package az.horosho.nms.services;

import reactor.core.publisher.Mono;

public interface ServicesUtility {
    default Mono<String[]> calculateSubnetMask(String ipAddress){
        try {
            String[] ipParts = ipAddress.split("/");

            if (ipParts.length != 2) {
                return Mono.error(new IllegalArgumentException("Invalid IP address format"));
            }

            String ip = ipParts[0];
            short prefix = ipParts[1] != null ? Short.parseShort(ipParts[1]) : -1;

            if (prefix < 0 || prefix > 32) {
                return Mono.error(new IllegalArgumentException("Invalid prefix"));
            }

            int mask = 0xFFFFFFFF << (32 - prefix);
            int octet1 = (mask >> 24) & 0xFF;
            int octet2 = (mask >> 16) & 0xFF;
            int octet3 = (mask >> 8) & 0xFF;
            int octet4 = mask & 0xFF;

            return Mono.just(new String[]{
                    String.format("%d.%d.%d.%d", (octet1), (octet2), (octet3), (octet4)), ip
            });
        } catch (NumberFormatException e) {
            return Mono.error(new RuntimeException(e));
        }
    }
}
