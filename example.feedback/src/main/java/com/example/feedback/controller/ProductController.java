package com.example.feedback.controller;

import com.example.feedback.model.Product;
import com.example.feedback.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    // Directory where images are stored
    private static final String IMAGE_DIR = "src/main/resources/static/images";

    // Get all products
    @GetMapping
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // Get product by ID
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        Optional<Product> product = productRepository.findById(id);
        return product.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Upload (Create new product)
    @PostMapping("/upload")
    public ResponseEntity<Product> uploadProduct(
            @RequestParam String name,
            @RequestParam double price,
            @RequestParam(defaultValue = "0.0") double cost,
            @RequestParam(defaultValue = "0") int discount,
            @RequestParam String category,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) MultipartFile image
    ) {
        try {
            Product product = new Product();
            product.setName(name);
            product.setPrice(price);
            product.setCost(cost);
            product.setDiscount(discount);
            product.setCategory(category);
            product.setDescription(description);

            if (image != null && !image.isEmpty()) {
                String filename = StringUtils.cleanPath(image.getOriginalFilename());
                Path uploadPath = Paths.get(IMAGE_DIR);
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }
                Path filePath = uploadPath.resolve(filename);
                Files.copy(image.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                product.setImage("/images/" + filename); // relative path for frontend
            }

            Product saved = productRepository.save(product);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    // Update product by ID
    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(
            @PathVariable Long id,
            @RequestParam String name,
            @RequestParam double price,
            @RequestParam(defaultValue = "0.0") double cost,
            @RequestParam(defaultValue = "0") int discount,
            @RequestParam String category,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) MultipartFile image
    ) {
        Optional<Product> optionalProduct = productRepository.findById(id);
        if (!optionalProduct.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        try {
            Product product = optionalProduct.get();
            product.setName(name);
            product.setPrice(price);
            product.setCost(cost);
            product.setDiscount(discount);
            product.setCategory(category);
            product.setDescription(description);

            if (image != null && !image.isEmpty()) {
                String filename = StringUtils.cleanPath(image.getOriginalFilename());
                Path uploadPath = Paths.get(IMAGE_DIR);
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }
                Path filePath = uploadPath.resolve(filename);
                Files.copy(image.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                product.setImage("/images/" + filename);
            }

            Product updated = productRepository.save(product);
            return ResponseEntity.ok(updated);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    // Delete product by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        if (!productRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        try {
            productRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}
