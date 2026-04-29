package com.updatemate;

import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class LicenseController {

    @PostMapping("/trial/start")
    @ResponseStatus(HttpStatus.OK)
    public Map<String, Object> startTrial(@RequestBody DeviceRequest request) {
        return Map.of(
            "deviceId", request.deviceId(),
            "startedAt", Instant.now().toString(),
            "expiresAt", Instant.now().plus(7, ChronoUnit.DAYS).toString(),
            "active", true
        );
    }

    @PostMapping("/trial/check")
    @ResponseStatus(HttpStatus.OK)
    public Map<String, Object> checkTrial(@RequestBody DeviceRequest request) {
        return Map.of(
            "deviceId", request.deviceId(),
            "active", true,
            "remainingDays", 7
        );
    }

    @PostMapping("/license/activate")
    @ResponseStatus(HttpStatus.OK)
    public Map<String, Object> activate(@RequestBody ActivateRequest request) {
        return Map.of(
            "licenseKey", request.licenseKey(),
            "deviceId", request.deviceId(),
            "edition", "standard",
            "status", "active"
        );
    }

    @PostMapping("/license/check")
    @ResponseStatus(HttpStatus.OK)
    public Map<String, Object> checkLicense(@RequestBody DeviceRequest request) {
        return Map.of(
            "deviceId", request.deviceId(),
            "status", "active"
        );
    }

    @PostMapping("/license/deactivate")
    @ResponseStatus(HttpStatus.OK)
    public Map<String, Object> deactivate(@RequestBody DeviceRequest request) {
        return Map.of(
            "deviceId", request.deviceId(),
            "status", "deactivated"
        );
    }

    public record DeviceRequest(@NotBlank String deviceId) {}
    public record ActivateRequest(@NotBlank String licenseKey, @NotBlank String deviceId) {}
}
