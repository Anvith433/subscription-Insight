package com.yourorg.Subscriptions;

import com.yourorg.Subscriptions.dto.SubscriptionRequest;
import com.yourorg.Subscriptions.dto.SubscriptionResponse;
import com.yourorg.Subscriptions.dto.UploadCsvResponse;
import org.springframework.http.HttpStatus;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subscriptions")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    public SubscriptionController(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    @GetMapping
    public List<SubscriptionResponse> getAll() {
        return subscriptionService.getAll();
    }

    @GetMapping("/{id}")
    public SubscriptionResponse getById(@PathVariable Long id) {
        return subscriptionService.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SubscriptionResponse create(@RequestBody SubscriptionRequest request) {
        return subscriptionService.create(request);
    }

    @PutMapping("/{id}")
    public SubscriptionResponse update(@PathVariable Long id, @RequestBody SubscriptionRequest request) {
        return subscriptionService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        subscriptionService.delete(id);
    }

    @PostMapping("/upload-csv")
    public UploadCsvResponse uploadCsv(@RequestPart("file") MultipartFile file) {
        return subscriptionService.uploadCsv(file);
    }
}
