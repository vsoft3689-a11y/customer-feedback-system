package com.example.feedback.controller;

import com.example.feedback.dto.FeedbackDTO;
import com.example.feedback.dto.FeedbackUpdateDTO;
import com.example.feedback.model.Feedback;
import com.example.feedback.model.Product;
import com.example.feedback.model.User;
import com.example.feedback.repository.FeedbackRepository;
import com.example.feedback.repository.ProductRepository;
import com.example.feedback.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/feedback")
@CrossOrigin(origins = "http://localhost:5500") // Adjust to your frontend port if needed
public class FeedbackController {

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    // Convert entity to DTO (include user name and product name)
    private FeedbackDTO toDTO(Feedback fb) {
        FeedbackDTO dto = new FeedbackDTO();
        dto.setId(fb.getId());

        if (fb.getUser() != null) {
            dto.setUserId(fb.getUser().getId());
            dto.setUserName(fb.getUser().getName());
        }

        if (fb.getProduct() != null) {
            dto.setProductId(fb.getProduct().getId());
            dto.setProductName(fb.getProduct().getName());
        }

        dto.setComment(fb.getComment());
        dto.setRating(fb.getRating());
        dto.setStatus(fb.getStatus());
        dto.setAdminComment(fb.getAdminComment());

        return dto;
    }

    // Get all feedbacks
    @GetMapping
    public List<FeedbackDTO> getAllFeedback() {
        return feedbackRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // Get feedback by user ID
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<FeedbackDTO>> getFeedbackByUser(@PathVariable Long userId) {
        List<FeedbackDTO> list = feedbackRepository.findByUserId(userId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    // Create new feedback
    @PostMapping
    public ResponseEntity<?> createFeedback(@RequestBody Feedback feedback) {
        if (feedback.getUser() == null || feedback.getUser().getId() == null) {
            return ResponseEntity.badRequest().body("User must be provided");
        }
        if (feedback.getProduct() == null || feedback.getProduct().getId() == null) {
            return ResponseEntity.badRequest().body("Product must be provided");
        }

        Optional<User> uOpt = userRepository.findById(feedback.getUser().getId());
        Optional<Product> pOpt = productRepository.findById(feedback.getProduct().getId());

        if (!uOpt.isPresent()) return ResponseEntity.badRequest().body("Invalid user ID");
        if (!pOpt.isPresent()) return ResponseEntity.badRequest().body("Invalid product ID");

        feedback.setUser(uOpt.get());
        feedback.setProduct(pOpt.get());

        if (feedback.getStatus() == null) {
            feedback.setStatus("Pending");
        }

        Feedback saved = feedbackRepository.save(feedback);
        return ResponseEntity.ok(toDTO(saved));
    }

    // Full update of feedback (not typically used by admin but kept for completeness)
    @PutMapping("/{id}")
    public ResponseEntity<?> updateFeedback(@PathVariable Long id, @RequestBody Feedback feedbackUpdate) {
        Optional<Feedback> existOpt = feedbackRepository.findById(id);
        if (!existOpt.isPresent()) return ResponseEntity.notFound().build();

        Feedback existing = existOpt.get();

        if (feedbackUpdate.getComment() != null) {
            existing.setComment(feedbackUpdate.getComment());
        }
        if (feedbackUpdate.getRating() != null) {
            existing.setRating(feedbackUpdate.getRating());
        }
        if (feedbackUpdate.getStatus() != null) {
            existing.setStatus(feedbackUpdate.getStatus());
        }
        if (feedbackUpdate.getAdminComment() != null) {
            existing.setAdminComment(feedbackUpdate.getAdminComment());
        }

        Feedback saved = feedbackRepository.save(existing);
        return ResponseEntity.ok(toDTO(saved));
    }

    // Partial update (used for admin comment or status)
    @PatchMapping("/{id}")
    public ResponseEntity<?> patchFeedback(@PathVariable Long id, @RequestBody FeedbackUpdateDTO dto) {
        Optional<Feedback> existOpt = feedbackRepository.findById(id);
        if (!existOpt.isPresent()) return ResponseEntity.notFound().build();

        Feedback existing = existOpt.get();

        if (dto.getAdminComment() != null || dto.getAdminComment() == null) {
            existing.setAdminComment(dto.getAdminComment()); // can clear comment
        }

        if (dto.getStatus() != null) {
            existing.setStatus(dto.getStatus());
        }

        Feedback saved = feedbackRepository.save(existing);
        return ResponseEntity.ok(toDTO(saved));
    }

    // Delete entire feedback
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFeedback(@PathVariable Long id) {
        if (!feedbackRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        feedbackRepository.deleteById(id);
        return ResponseEntity.ok("Feedback deleted.");
    }
}
