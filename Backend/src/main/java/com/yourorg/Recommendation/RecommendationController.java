package com.yourorg.Recommendation;

import com.yourorg.Recommendation.dto.RecommendationResponse;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    private final RecommendationService recommendationService;

    public RecommendationController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    @GetMapping
    public List<RecommendationResponse> getAll() {
        return recommendationService.getAll();
    }

    @PatchMapping("/{id}/dismiss")
    public RecommendationResponse dismiss(@PathVariable Long id) {
        return recommendationService.dismiss(id);
    }
}
