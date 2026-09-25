package com.audition.vietphuc.service;

import com.audition.vietphuc.dto.AuthRequest;
import com.audition.vietphuc.dto.AuthResponse;
import com.audition.vietphuc.dto.RegisterRequest;
import com.audition.vietphuc.model.User;
import com.audition.vietphuc.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            return AuthResponse.error("Username already taken! Please choose another one.");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            return AuthResponse.error("Email is already registered!");
        }

        String avatar = request.getAvatarUrl();
        if (avatar == null || avatar.isBlank()) {
            avatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80";
        }

        String bio = request.getBio();
        if (bio == null || bio.isBlank()) {
            bio = "Tín đồ thời trang Việt Phục Remix - Gen Z bảo tồn di sản bằng phong cách thời thượng ✨🇻🇳";
        }

        User user = new User(
                request.getUsername(),
                request.getPassword(), // In production, hash with BCrypt
                request.getFullName(),
                request.getEmail(),
                avatar,
                bio
        );

        User saved = userRepository.save(user);
        String token = "vpr_" + UUID.randomUUID().toString().replace("-", "");

        return AuthResponse.success(token, saved.getId(), saved.getUsername(), saved.getFullName(), saved.getEmail(), saved.getAvatarUrl(), saved.getBio());
    }

    public AuthResponse login(AuthRequest request) {
        Optional<User> optionalUser = userRepository.findByUsername(request.getUsername());
        if (optionalUser.isEmpty()) {
            return AuthResponse.error("User not found!");
        }

        User user = optionalUser.get();
        if (!user.getPassword().equals(request.getPassword())) {
            return AuthResponse.error("Invalid password!");
        }

        String token = "vpr_" + UUID.randomUUID().toString().replace("-", "");
        return AuthResponse.success(token, user.getId(), user.getUsername(), user.getFullName(), user.getEmail(), user.getAvatarUrl(), user.getBio());
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    public User updateProfile(String username, String fullName, String bio, String avatarUrl) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        if (fullName != null && !fullName.isBlank()) user.setFullName(fullName);
        if (bio != null) user.setBio(bio);
        if (avatarUrl != null && !avatarUrl.isBlank()) user.setAvatarUrl(avatarUrl);
        return userRepository.save(user);
    }
}
