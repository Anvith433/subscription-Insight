package com.yourorg.Storage;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.yourorg.Config.CloudinaryProperties;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Service
public class CloudinaryStorageService {

    private final CloudinaryProperties properties;

    public CloudinaryStorageService(CloudinaryProperties properties) {
        this.properties = properties;
    }

    public String uploadCsv(MultipartFile file) {
        if (!properties.isConfigured()) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET");
        }

        Map<String, String> config = ObjectUtils.asMap(
                "cloud_name", properties.getCloudName(),
                "api_key", properties.getApiKey(),
                "api_secret", properties.getApiSecret()
        );

        Cloudinary cloudinary = new Cloudinary(config);

        try {
            String publicId = (properties.getFolder() == null || properties.getFolder().isBlank()
                    ? "subscription-csv"
                    : properties.getFolder()) + "/" + UUID.randomUUID();

            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "resource_type", "raw",
                    "public_id", publicId,
                    "overwrite", true
            ));
            Object secureUrl = result.get("secure_url");
            return secureUrl == null ? null : secureUrl.toString();
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to upload file to Cloudinary", ex);
        }
    }
}
