package vn.lottefinance.esign.dto.captcha;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.security.Timestamp;
import java.time.LocalDateTime;
import java.util.List;

public class CaptchaDto {

    @Data
    @SuperBuilder
    @NoArgsConstructor
    public static class Request {
        @NotBlank
        private String token;

    }
    @Data
    @SuperBuilder
    @NoArgsConstructor
    public static class Response {
        private boolean success;
        @JsonProperty("challenge_ts")
        private String challengeTs;
        private String hostname;
        private Double score;
        private String action;
        @JsonProperty("error-codes")
        private List<String> errorCodes;
    }
}
