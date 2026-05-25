package com.example.Assets.auth.dto;

import com.example.Assets.model.Gender;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegisterRequest {

    @NotBlank
    @Email
    private String email;

    // НОВОЕ: Поле Username из формы
    @NotBlank
    @Size(min = 3, max = 100)
    private String username;

    @NotBlank
    @Size(min = 8, max = 100)
    private String password;

    // НОВОЕ: Поле Confirm Password для проверки совпадения
    @NotBlank
    @Size(min = 8, max = 100)
    private String confirmPassword;

    // Это твой Full Name из интерфейса
    @NotBlank
    @Size(max = 100)
    private String displayName;

    // НОВОЕ: Номер телефона
    @Size(max = 30)
    private String phoneNumber;

    // НОВОЕ: Гендер из радио-кнопок/селектора
    private Gender gender;

    // ── ГЕТТЕРЫ И СЕТТЕРЫ ────────────────────────────────────────────

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getConfirmPassword() {
        return confirmPassword;
    }

    public void setConfirmPassword(String confirmPassword) {
        this.confirmPassword = confirmPassword;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public Gender getGender() {
        return gender;
    }

    public void setGender(Gender gender) {
        this.gender = gender;
    }
}