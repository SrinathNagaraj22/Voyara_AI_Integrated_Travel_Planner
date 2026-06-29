package com.voyara.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.voyara.exception.ServiceUnavailableException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    private static final Logger log = LoggerFactory.getLogger(GeminiService.class);

    private final String apiKey;
    private final String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public GeminiService(
            @Value("${voyara.gemini.api-key:}") String apiKey,
            @Value("${voyara.gemini.api-url}") String apiUrl) {
        this.apiKey = apiKey;
        this.apiUrl = apiUrl;
    }

    /**
     * Generate a multi-day itinerary via Gemini. Returns the raw JSON string
     * Gemini produced (matching the schema this prompt enforces). If Gemini
     * is unreachable, unconfigured, or returns unparseable output, throws
     * {@link ServiceUnavailableException} so the controller can return a
     * proper 503 instead of a misleading canned plan.
     */
    public String generateItinerary(String destination, String budget, int days) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new ServiceUnavailableException(
                    "AI planner is not configured on this server. Set GEMINI_API_KEY and restart.");
        }

        String systemPrompt = """
                You are a professional travel planner. Generate a detailed itinerary for %s for %d days, optimized for the budget '%s'.
                Return ONLY a valid JSON object with EXACTLY this structure (no markdown, no code fences).
                Each activity MUST include realistic departure and arrival times in 24-hour HH:MM format,
                a travel mode, a concrete recommended option (specific transport, restaurant, or operator),
                and an estimated cost per person in the trip's currency.
                {
                  "destination": "%s",
                  "estimatedBudget": "%s",
                  "totalDays": %d,
                  "summary": "Short description.",
                  "budgetBreakdown": [
                    { "category": "Lodging",   "amount": "...", "description": "..." },
                    { "category": "Food",      "amount": "...", "description": "..." },
                    { "category": "Transport", "amount": "...", "description": "..." },
                    { "category": "Activities","amount": "...", "description": "..." }
                  ],
                  "days": [
                    {
                      "dayNumber": 1,
                      "theme": "...",
                      "activities": [
                        {
                          "timeOfDay": "Morning",
                          "activityName": "...",
                          "description": "...",
                          "departureTime": "HH:MM",
                          "arrivalTime": "HH:MM",
                          "travelMode": "...",
                          "recommendedOption": "...",
                          "estimatedCost": "..."
                        }
                      ]
                    }
                  ],
                  "tips": ["...", "...", "..."]
                }
                """.formatted(destination, days, budget, destination, budget, days);

        try {
            Map<String, Object> textPart = Map.of("text", systemPrompt);
            Map<String, Object> parts = Map.of("parts", List.of(textPart));
            Map<String, Object> body = Map.of("contents", List.of(parts));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            String requestUrl = apiUrl + "?key=" + apiKey;
            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            ResponseEntity<String> response =
                    restTemplate.postForEntity(requestUrl, requestEntity, String.class);

            if (response.getStatusCode() != HttpStatus.OK) {
                log.warn("Gemini returned non-200 status: {}", response.getStatusCode());
                throw new ServiceUnavailableException("AI planner upstream returned an error.");
            }

            JsonNode root = objectMapper.readTree(response.getBody());
            String rawText = root.path("candidates").path(0)
                    .path("content").path("parts").path(0)
                    .path("text").asText();

            if (rawText == null || rawText.isBlank()) {
                throw new ServiceUnavailableException("AI planner returned an empty response.");
            }

            rawText = rawText.replaceAll("```json", "").replaceAll("```", "").trim();

            // Validate the response is well-formed JSON in the shape we promised.
            try {
                objectMapper.readTree(rawText);
            } catch (Exception parseErr) {
                log.warn("Gemini returned non-JSON; first 200 chars: {}",
                        rawText.length() > 200 ? rawText.substring(0, 200) : rawText);
                throw new ServiceUnavailableException(
                        "AI planner returned a malformed itinerary. Try again.");
            }

            return rawText;
        } catch (ServiceUnavailableException e) {
            throw e;
        } catch (Exception e) {
            log.warn("Gemini call failed: {}", e.getMessage());
            throw new ServiceUnavailableException(
                    "AI planner is temporarily unavailable. Please try again in a moment.");
        }
    }
}
