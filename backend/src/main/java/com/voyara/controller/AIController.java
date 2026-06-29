package com.voyara.controller;

import com.voyara.service.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/gemini")
public class AIController {

    @Autowired
    private GeminiService geminiService;

    @PostMapping("/itinerary")
    public ResponseEntity<?> generateTravelItinerary(@RequestBody Map<String, Object> payload) {
        String destination = (String) payload.getOrDefault("destination", "Kyoto");
        String budget = (String) payload.getOrDefault("budget", "$500");
        
        int durationDays = 3;
        Object rawDays = payload.containsKey("days") ? payload.get("days")
                : payload.get("durationDays");
        if (rawDays != null) {
            if (rawDays instanceof Number n) {
                durationDays = n.intValue();
            } else {
                try {
                    durationDays = Integer.parseInt(rawDays.toString().trim());
                } catch (NumberFormatException ignored) {
                    // keep default
                }
            }
            durationDays = Math.max(1, Math.min(durationDays, 14));
        }

        // Call our live Gemini proxy
        String rawJson = geminiService.generateItinerary(destination, budget, durationDays);

        // Return the JSON directly as application/json
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(rawJson);
    }
}
