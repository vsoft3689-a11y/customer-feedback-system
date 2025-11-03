package com.example.feedback.controller;

import com.example.feedback.model.User;
import com.example.feedback.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // Register user (only customers)
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already exists");
        }

        // Enforce role customer for registration
        user.setRole("customer");
        userRepository.save(user);
        return ResponseEntity.ok("User registered successfully");
    }

    // Admin login only for unique admin email (no register endpoint for admin)
    // Login for all users (admin or customer)
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody User loginData) {
        Optional<User> userOpt = userRepository.findByEmail(loginData.getEmail());

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body("Invalid email or password");
        }

        User user = userOpt.get();

        if (!user.getPassword().equals(loginData.getPassword())) {
            return ResponseEntity.status(401).body("Invalid email or password");
        }

        // Return minimal info (id, name, email, role) to front-end
        User responseUser = new User();
        responseUser.setId(user.getId());
        responseUser.setName(user.getName());
        responseUser.setEmail(user.getEmail());
        responseUser.setRole(user.getRole());

        return ResponseEntity.ok(responseUser);
    }
}
