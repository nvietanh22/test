package vn.lottefinance.esign.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import vn.lottefinance.esign.dto.captcha.CaptchaDto;
import vn.lottefinance.esign.properties.CaptchaProperties;

import java.util.Objects;

@Slf4j
@Service
public class CaptchaService {

    private final RestTemplate template;


    @Autowired
    private CaptchaProperties captchaSettings;


    public CaptchaService(final RestTemplateBuilder templateBuilder) {
        this.template = templateBuilder.build();
    }

    public CaptchaDto.Response validateCaptcha(final String captchaResponse, final String remoteip) {
        log.info("Going to validate the captcha response = {}", captchaResponse);
        final MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("secret", captchaSettings.getSecret());
        params.add("response", captchaResponse);
        params.add("remoteip", remoteip);
        return template.postForObject(captchaSettings.getEndpoint(), params, CaptchaDto.Response.class);
    }

    public boolean isValidateCaptcha(final String captchaResponse, final String remoteip) {
        log.info("Going to validate the captcha response = {}", captchaResponse);
        final MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("secret", captchaSettings.getSecret());
        params.add("response", captchaResponse);
        if (remoteip != null) {
            params.add("remoteip", remoteip);
        }

        CaptchaDto.Response apiResponse = null;
        try {
            apiResponse = template.postForObject(
                    captchaSettings.getEndpoint(),
                    params,
                    CaptchaDto.Response.class
            );
        } catch (final RestClientException e) {
            log.error("Error while calling reCAPTCHA endpoint", e);
            // tuỳ chính sách: fail open hay fail closed
            return false;
        }

        if (apiResponse == null) {
            return false;
        }

        double threshold = 0.5;

        boolean valid = apiResponse.isSuccess()
                && apiResponse.getScore() != null
                && apiResponse.getScore() >= threshold
                && "submit".equals(apiResponse.getAction()) // hoặc action bạn đặt ở client
                && "your-domain.com".equals(apiResponse.getHostname());

        log.info("Captcha API response = {}, finalValid={}", apiResponse, valid);
        return valid;
    }
}
