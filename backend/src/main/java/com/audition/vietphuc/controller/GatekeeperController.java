package com.audition.vietphuc.controller;

import com.audition.vietphuc.dto.EvaluationRequest;
import com.audition.vietphuc.dto.EvaluationResponse;
import com.audition.vietphuc.service.GeminiService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/gatekeeper")
@CrossOrigin(origins = "*")
public class GatekeeperController {

    private final GeminiService geminiService;

    public GatekeeperController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    @PostMapping("/evaluate")
    public ResponseEntity<?> evaluateOutfit(@Valid @RequestBody EvaluationRequest request) {
        try {
            EvaluationResponse response = geminiService.evaluateOutfit(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Không thể kết nối với Chị Gatekeeper lúc này.",
                    "details", e.getMessage()
            ));
        }
    }
}
