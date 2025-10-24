
package com.example.quickcart.backened.service;
import com.example.quickcart.backened.dto.CartUpdateEvent;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SseEmitterService {
    private static final long EMITTER_TIMEOUT = 30_000L;
    private static final String CART_UPDATE_EVENT_NAME = "cart-update";

    private final Map<String, Set<SseEmitter>> emitters = new ConcurrentHashMap<>();

    public SseEmitter createEmitter(String sessionId) {
        SseEmitter emitter = new SseEmitter(EMITTER_TIMEOUT);
        registerEmitter(sessionId, emitter);
        configureEmitterCallbacks(sessionId, emitter);
        return emitter;
    }

    @KafkaListener(topics = "cart-updates")
    public void handleCartUpdate(CartUpdateEvent event) {
        Set<SseEmitter> sessionEmitters = emitters.get(event.getSessionId());
        if (sessionEmitters != null) {
            broadcastToEmitters(sessionEmitters, event);
        }
    }

    private void registerEmitter(String sessionId, SseEmitter emitter) {
        emitters.computeIfAbsent(sessionId, k -> ConcurrentHashMap.newKeySet()).add(emitter);
    }

    private void configureEmitterCallbacks(String sessionId, SseEmitter emitter) {
        emitter.onCompletion(() -> removeEmitter(sessionId, emitter));
        emitter.onTimeout(() -> {
            emitter.complete();
            removeEmitter(sessionId, emitter);
        });
    }

    private void removeEmitter(String sessionId, SseEmitter emitter) {
        Set<SseEmitter> sessionEmitters = emitters.get(sessionId);
        if (sessionEmitters != null) {
            sessionEmitters.remove(emitter);
            if (sessionEmitters.isEmpty()) {
                emitters.remove(sessionId);
            }
        }
    }

    private void broadcastToEmitters(Set<SseEmitter> sessionEmitters, CartUpdateEvent event) {
        Iterator<SseEmitter> it = sessionEmitters.iterator();
        while (it.hasNext()) {
            SseEmitter emitter = it.next();
            if (!sendEventToEmitter(emitter, event)) {
                it.remove();
            }
        }
    }

    private boolean sendEventToEmitter(SseEmitter emitter, CartUpdateEvent event) {
        try {
            emitter.send(SseEmitter.event()
                    .name(CART_UPDATE_EVENT_NAME)
                    .data(event.getCart()));
            return true;
        } catch (Exception e) {
            emitter.completeWithError(e);
            return false;
        }
    }
}