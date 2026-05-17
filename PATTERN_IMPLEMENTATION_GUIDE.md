# Design Patterns Implementation - Location Guide

This document shows exactly where each design pattern is implemented in the Subscription Analytics codebase with file locations and code references.

---

## 1. SINGLETON PATTERN

### Location & Implementation

The Singleton pattern is implemented using Spring's **@Service**, **@Repository**, and **@Component** annotations. Spring automatically creates a single instance (bean) that is reused throughout the application.

#### Service Layer - Singleton Services

**File**: `Backend/src/main/java/com/yourorg/Subscriptions/SubscriptionService.java`
```java
@Service
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final CurrentUserService currentUserService;
    private final CloudinaryStorageService cloudinaryStorageService;

    public SubscriptionService(
            SubscriptionRepository subscriptionRepository,
            CurrentUserService currentUserService,
            CloudinaryStorageService cloudinaryStorageService
    ) {
        this.subscriptionRepository = subscriptionRepository;
        this.currentUserService = currentUserService;
        this.cloudinaryStorageService = cloudinaryStorageService;
    }

    @Transactional(readOnly = true)
    public List<SubscriptionResponse> getAll() {
        User user = currentUserService.getCurrentUser();
        return subscriptionRepository.findAllByUserId(user.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }
}
```

**Why Singleton**:
- Only ONE instance of `SubscriptionService` exists in the application
- All requests use the SAME instance
- Efficient resource usage
- Spring's IoC container manages the lifecycle

#### Other Singleton Services

**Location**: `Backend/src/main/java/com/yourorg/`

| Service | File | Purpose |
|---------|------|---------|
| **RecommendationService** | `Recommendation/RecommendationService.java` | Single instance for all recommendation operations |
| **UsageTrackingService** | `UsageTracking/UsageTrackingService.java` | Single instance for usage tracking |
| **JwtTokenService** | `Auth/JwtTokenService.java` | Single instance for JWT token generation/validation |
| **CurrentUserService** | `Users/CurrentUserService.java` | Single instance to get current authenticated user |
| **CloudinaryStorageService** | `Storage/CloudinaryStorageService.java` | Single instance for file uploads |

#### Repository Layer - Singleton Repositories

**File**: `Backend/src/main/java/com/yourorg/Subscriptions/SubscriptionRepository.java`
```java
@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    List<Subscription> findAllByUserId(Long userId);
    Optional<Subscription> findByUserIdAndProviderNameIgnoreCase(Long userId, String providerName);
}
```

**Why Singleton**:
- Spring creates a single proxy instance
- Manages database connections efficiently
- All service layers use the same repository instance

#### Controller Layer - Singleton Controllers

**File**: `Backend/src/main/java/com/yourorg/Auth/AuthController.java`
```java
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenService jwtTokenService;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtTokenService jwtTokenService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenService = jwtTokenService;
    }

    @PostMapping("/register")
    public AuthResponse register(@RequestBody RegisterRequest request) {
        // Single instance handles ALL authentication requests
    }
}
```

#### Filter Component - Singleton Filter

**File**: `Backend/src/main/java/com/yourorg/Auth/JwtAuthenticationFilter.java`
```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenService jwtTokenService;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(JwtTokenService jwtTokenService, UserRepository userRepository) {
        this.jwtTokenService = jwtTokenService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                   HttpServletResponse response, 
                                   FilterChain filterChain) throws ServletException, IOException {
        // Single instance processes ALL HTTP requests
        String token = extractToken(request);
        // Validate token...
        filterChain.doFilter(request, response);
    }
}
```

---

## 2. BUILDER PATTERN

### Location & Implementation

The Builder pattern is implemented using **Lombok annotations** that auto-generate constructors and setter methods for flexible object construction.

#### Entity with Builder Pattern

**File**: `Backend/src/main/java/com/yourorg/BillingRecord/BillingRecord.java`
```java
@Entity
@Table(name="billing_records")
@Data                    // Generates getters, setters, toString, equals, hashCode
@Getter
@Setter
@AllArgsConstructor      // Generates constructor with all fields
@NoArgsConstructor       // Generates no-argument constructor
public class BillingRecord {

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name="id", nullable=false)
    private long id;

    @Column(name="amount")
    private Double amount;

    @ManyToOne(fetch=FetchType.LAZY, optional=false)
    @JoinColumn(name="subscription_id", nullable=false)
    private Subscription subscription;

    @Column(length=3, nullable=false)
    private String currency;

    @Column(name="billing_period", nullable=false, length=7)
    private String billingPeriod;

    @Column(name="paid_at", nullable=false)
    private Instant paidAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable=false)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(nullable=false)
    private Source source;

    @Column(name="created_at", nullable=false, updatable=false)
    private Instant createdAt;
}
```

**Generated Code** (by Lombok at compile time):
```java
// All-args constructor (Builder-like)
public BillingRecord(long id, Double amount, Subscription subscription, 
                     String currency, String billingPeriod, Instant paidAt, 
                     PaymentMethod paymentMethod, Source source, Instant createdAt) {
    this.id = id;
    this.amount = amount;
    this.subscription = subscription;
    // ... other assignments
}

// No-args constructor
public BillingRecord() {}

// Setter methods
public void setAmount(Double amount) {
    this.amount = amount;
}
public void setCurrency(String currency) {
    this.currency = currency;
}
// ... other setters
```

**Usage**:
```java
// Method 1: Using all-args constructor
BillingRecord record = new BillingRecord(
    null, 29.99, subscription, "USD", "2024-04", 
    Instant.now(), PaymentMethod.CREDIT_CARD, Source.WEB, Instant.now()
);

// Method 2: Using setters (more flexible)
BillingRecord record = new BillingRecord();
record.setAmount(29.99);
record.setCurrency("USD");
record.setPaymentMethod(PaymentMethod.CREDIT_CARD);
record.setSource(Source.WEB);
record.setPaidAt(Instant.now());
```

#### Other Entities with Builder Pattern

**Location**: `Backend/src/main/java/com/yourorg/`

| Entity | File | Lombok Annotations |
|--------|------|-------------------|
| **Recommendation** | `Recommendation/Recommendation.java` | `@Data, @AllArgsConstructor, @NoArgsConstructor` |
| **User** | `Users/User.java` | Custom constructors (no Lombok) |
| **UsageTracking** | `UsageTracking/UsageTracking.java` | Custom constructors (no Lombok) |
| **Subscription** | `Subscriptions/Subscription.java` | Custom constructors (no Lombok) |

**File**: `Backend/src/main/java/com/yourorg/Recommendation/Recommendation.java`
```java
@Entity
@Table(name="recommendations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Recommendation {

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name="id", nullable=false)
    private long id;

    @ManyToOne(fetch=FetchType.LAZY, optional=false)
    @JoinColumn(name="user_id", nullable=false)
    private User user;

    @ManyToOne(fetch=FetchType.LAZY, optional=false)
    @JoinColumn(name="subscription_id", nullable=false)
    private Subscription subscription;

    @Enumerated(EnumType.STRING) 
    @Column(name="type", nullable=false)
    private Type type;

    @Column(name="reason", length=100)
    private String reason;

    @Column(name="confidence_score")
    private Double confidenceScore;

    @Enumerated(EnumType.STRING)
    @Column(name="status", nullable=false)
    private Status status;

    @Column(name="generated_at", nullable=false)
    private Instant generatedAt;
}
```

---

## 3. FACTORY PATTERN

### Location & Implementation

The Factory pattern is implemented in the **CloudinaryStorageService**, which encapsulates the complex creation of Cloudinary objects.

#### Factory Service

**File**: `Backend/src/main/java/com/yourorg/Storage/CloudinaryStorageService.java`
```java
@Service
public class CloudinaryStorageService {

    private final CloudinaryProperties properties;

    public CloudinaryStorageService(CloudinaryProperties properties) {
        this.properties = properties;
    }

    // FACTORY METHOD: Creates and configures Cloudinary instance
    public String uploadCsv(MultipartFile file) {
        if (!properties.isConfigured()) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET");
        }

        // FACTORY: Creating configuration map
        Map<String, String> config = ObjectUtils.asMap(
                "cloud_name", properties.getCloudName(),
                "api_key", properties.getApiKey(),
                "api_secret", properties.getApiSecret()
        );

        // FACTORY: Creating Cloudinary instance with configuration
        Cloudinary cloudinary = new Cloudinary(config);

        try {
            // Generate unique public ID for the file
            String publicId = (properties.getFolder() == null || properties.getFolder().isBlank()
                    ? "subscription-csv"
                    : properties.getFolder()) + "/" + UUID.randomUUID();

            // Upload to Cloudinary with configured instance
            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "resource_type", "raw",
                    "public_id", publicId,
                    "overwrite", true
            ));

            // Extract and return the secure URL
            Object secureUrl = result.get("secure_url");
            return secureUrl == null ? null : secureUrl.toString();
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to upload file to Cloudinary", ex);
        }
    }
}
```

**Why Factory Pattern**:
1. **Encapsulation**: Complex Cloudinary creation logic is hidden
2. **Reusability**: Can be called from multiple services
3. **Flexibility**: Easy to switch to S3, Azure, or other storage providers
4. **Testability**: Easy to mock for unit tests

#### Usage of Factory in Service

**File**: `Backend/src/main/java/com/yourorg/Subscriptions/SubscriptionService.java`
```java
@Service
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final CurrentUserService currentUserService;
    private final CloudinaryStorageService cloudinaryStorageService;  // Factory injected

    public SubscriptionService(
            SubscriptionRepository subscriptionRepository,
            CurrentUserService currentUserService,
            CloudinaryStorageService cloudinaryStorageService  // Factory service dependency
    ) {
        this.subscriptionRepository = subscriptionRepository;
        this.currentUserService = currentUserService;
        this.cloudinaryStorageService = cloudinaryStorageService;
    }

    // Using the factory to upload files
    public UploadCsvResponse uploadCsv(MultipartFile file) {
        // Calls factory method to create Cloudinary instance and upload
        String fileUrl = cloudinaryStorageService.uploadCsv(file);
        // ... process the uploaded file URL
        return new UploadCsvResponse(fileUrl, "CSV uploaded successfully");
    }
}
```

**Future: Strategy Pattern + Factory**

The Factory pattern can be extended to support multiple storage strategies:

```java
// Future implementation
public interface StorageStrategy {
    String upload(MultipartFile file);
    String download(String fileId);
    void delete(String fileId);
}

@Service
public class StorageFactory {
    
    @Autowired
    private CloudinaryStorageService cloudinaryStorage;
    
    @Autowired
    private S3StorageService s3Storage;
    
    public StorageStrategy getStorage(String type) {
        return switch(type) {
            case "cloudinary" -> cloudinaryStorage;
            case "s3" -> s3Storage;
            default -> cloudinaryStorage;
        };
    }
}
```

---

## 4. REPOSITORY PATTERN

### Location & Implementation

The Repository pattern abstracts data access logic using **Spring Data JPA**.

#### Repository Interfaces

**File**: `Backend/src/main/java/com/yourorg/Subscriptions/SubscriptionRepository.java`
```java
@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    // Custom query methods provide domain-specific data access
    List<Subscription> findAllByUserId(Long userId);
    Optional<Subscription> findByUserIdAndProviderNameIgnoreCase(Long userId, String providerName);
}
```

**File**: `Backend/src/main/java/com/yourorg/BillingRecord/BillingRecordRepository.java`
```java
@Repository
public interface BillingRecordRepository extends JpaRepository<BillingRecord, Long> {
    List<BillingRecord> findAllBySubscriptionUserIdOrderByPaidAtDesc(Long userId);
    List<BillingRecord> findAllBySubscriptionUserIdAndPaidAtAfterOrderByPaidAtAsc(Long userId, Instant date);
}
```

**File**: `Backend/src/main/java/com/yourorg/Recommendation/RecommendationRepository.java`
```java
@Repository
public interface RecommendationRepository extends JpaRepository<Recommendation, Long> {
    List<Recommendation> findAllByUserId(Long userId);
    Optional<Recommendation> findByIdAndUserId(Long id, Long userId);
}
```

**File**: `Backend/src/main/java/com/yourorg/UsageTracking/UsageTrackingRepository.java`
```java
@Repository
public interface UsageTrackingRepository extends JpaRepository<UsageTracking, Long> {
    List<UsageTracking> findAllByUserIdAndDateBetween(Long userId, LocalDate start, LocalDate end);
    Optional<UsageTracking> findByIdempotencyKey(String key);
}
```

**File**: `Backend/src/main/java/com/yourorg/Users/UserRepository.java`
```java
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUserName(String userName);
}
```

**Benefits**:
1. **Abstraction**: Data access logic is abstracted
2. **Testability**: Easy to mock repositories for unit tests
3. **Reusability**: Same methods available across all services
4. **Maintainability**: Centralized data access code

#### Usage in Services

**File**: `Backend/src/main/java/com/yourorg/Subscriptions/SubscriptionService.java`
```java
@Service
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;

    public SubscriptionService(SubscriptionRepository subscriptionRepository, ...) {
        this.subscriptionRepository = subscriptionRepository;
    }

    // Using repository
    @Transactional(readOnly = true)
    public List<SubscriptionResponse> getAll() {
        User user = currentUserService.getCurrentUser();
        // Repository provides the query method
        return subscriptionRepository.findAllByUserId(user.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // Using repository for single record
    @Transactional(readOnly = true)
    public SubscriptionResponse getById(Long id) {
        User user = currentUserService.getCurrentUser();
        Subscription subscription = subscriptionRepository.findById(id)
                .filter(s -> s.getUser().getId() == user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Subscription not found"));
        return toResponse(subscription);
    }
}
```

---

## 5. DEPENDENCY INJECTION PATTERN

### Location & Implementation

Dependency Injection is implemented using **Spring's constructor-based injection**.

#### Constructor Injection in Service

**File**: `Backend/src/main/java/com/yourorg/Subscriptions/SubscriptionService.java`
```java
@Service
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final CurrentUserService currentUserService;
    private final CloudinaryStorageService cloudinaryStorageService;

    // Constructor Injection: Dependencies provided by Spring
    public SubscriptionService(
            SubscriptionRepository subscriptionRepository,
            CurrentUserService currentUserService,
            CloudinaryStorageService cloudinaryStorageService
    ) {
        this.subscriptionRepository = subscriptionRepository;
        this.currentUserService = currentUserService;
        this.cloudinaryStorageService = cloudinaryStorageService;
    }

    // Services can now use injected dependencies
    @Transactional(readOnly = true)
    public List<SubscriptionResponse> getAll() {
        // Using injected currentUserService
        User user = currentUserService.getCurrentUser();
        // Using injected subscriptionRepository
        return subscriptionRepository.findAllByUserId(user.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }
}
```

#### Constructor Injection in Controller

**File**: `Backend/src/main/java/com/yourorg/Auth/AuthController.java`
```java
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenService jwtTokenService;

    // Constructor Injection
    public AuthController(UserRepository userRepository, 
                         PasswordEncoder passwordEncoder, 
                         JwtTokenService jwtTokenService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenService = jwtTokenService;
    }

    @PostMapping("/register")
    public AuthResponse register(@RequestBody RegisterRequest request) {
        // Using injected dependencies
        if (userRepository.findByEmail(request.email().trim()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }
        User saved = userRepository.save(new User(...));
        String token = jwtTokenService.issueToken(saved.getId(), saved.getUserName(), saved.getEmail());
        return new AuthResponse(token, ...);
    }
}
```

#### Constructor Injection in Filter

**File**: `Backend/src/main/java/com/yourorg/Auth/JwtAuthenticationFilter.java`
```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenService jwtTokenService;
    private final UserRepository userRepository;

    // Constructor Injection
    public JwtAuthenticationFilter(JwtTokenService jwtTokenService, 
                                   UserRepository userRepository) {
        this.jwtTokenService = jwtTokenService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                   HttpServletResponse response, 
                                   FilterChain filterChain) throws ServletException, IOException {
        // Using injected dependencies
        Long userId = jwtTokenService.getUserId(token);
        User user = userRepository.findById(userId).orElse(null);
        filterChain.doFilter(request, response);
    }
}
```

**Benefits**:
1. **Loose Coupling**: Services don't create their own dependencies
2. **Testability**: Easy to inject mock objects for testing
3. **Flexibility**: Can swap implementations without changing code
4. **Lifecycle Management**: Spring manages bean creation and disposal

---

## 6. DTO (Data Transfer Object) PATTERN

### Location & Implementation

The DTO pattern separates API contracts from internal models.

#### Request DTOs

**File**: `Backend/src/main/java/com/yourorg/Auth/dto/LoginRequest.java`
```java
public record LoginRequest(
    String email,
    String password
) {}
```

**File**: `Backend/src/main/java/com/yourorg/Auth/dto/RegisterRequest.java`
```java
public record RegisterRequest(
    String username,
    String email,
    String password
) {}
```

**File**: `Backend/src/main/java/com/yourorg/Subscriptions/dto/SubscriptionRequest.java`
```java
public record SubscriptionRequest(
    String providerName,
    Category category,
    LocalDate startDate,
    Renewal_Cycle renewalCycle,
    BigDecimal price,
    String currency
) {}
```

#### Response DTOs

**File**: `Backend/src/main/java/com/yourorg/Auth/dto/AuthResponse.java`
```java
public record AuthResponse(
    String token,
    UserView user
) {
    public record UserView(
        Long id,
        String username,
        String email
    ) {}
}
```

**File**: `Backend/src/main/java/com/yourorg/Subscriptions/dto/SubscriptionResponse.java`
```java
public record SubscriptionResponse(
    Long id,
    String providerName,
    String category,
    LocalDate startDate,
    LocalDate renewalDate,
    BigDecimal price,
    String currency,
    String status,
    Instant createdAt
) {}
```

**File**: `Backend/src/main/java/com/yourorg/BillingRecord/dto/BillingResponse.java`
```java
public record BillingResponse(
    Long id,
    Long subscriptionId,
    String providerName,
    Double amount,
    String currency,
    String billingPeriod,
    Instant paidAt,
    String paymentMethod,
    String source,
    Instant createdAt
) {}
```

#### Usage in Controllers

**File**: `Backend/src/main/java/com/yourorg/Subscriptions/SubscriptionController.java`
```java
@RestController
@RequestMapping("/api/subscriptions")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SubscriptionResponse create(@RequestBody SubscriptionRequest request) {
        // DTO comes in, DTO goes out
        return subscriptionService.create(request);
    }

    @GetMapping
    public List<SubscriptionResponse> getAll() {
        // Response DTOs hide internal entity structure
        return subscriptionService.getAll();
    }
}
```

#### DTO to Entity Conversion

**File**: `Backend/src/main/java/com/yourorg/Subscriptions/SubscriptionService.java`
```java
@Service
public class SubscriptionService {

    private SubscriptionResponse toResponse(Subscription subscription) {
        return new SubscriptionResponse(
            subscription.getId(),
            subscription.getProviderName(),
            subscription.getCategory().name(),
            subscription.getStartDate(),
            subscription.getRenewalDate(),
            subscription.getPrice(),
            subscription.getCurrency(),
            subscription.getStatus().name(),
            subscription.getCreatedAt()
        );
    }

    private Subscription toEntity(SubscriptionRequest request, User user) {
        return new Subscription(
            user,
            request.providerName(),
            request.category(),
            request.startDate(),
            request.renewalCycle(),
            calculateRenewalDate(request.startDate(), request.renewalCycle()),
            request.price(),
            request.currency()
        );
    }
}
```

**Benefits**:
1. **API Decoupling**: Entity changes don't break API contracts
2. **Security**: Don't expose sensitive fields (passwords, internal IDs)
3. **Validation**: Validate input at boundary
4. **Performance**: Only send needed fields to client

---

## 7. ADAPTER PATTERN

### Location & Implementation

The Adapter pattern is used to adapt the domain `User` model to Spring Security's `UserDetails` interface.

#### Adapter Implementation

**File**: `Backend/src/main/java/com/yourorg/Auth/AuthUserPrincipal.java`
```java
public class AuthUserPrincipal implements UserDetails {

    private final Long id;
    private final String username;
    private final String email;
    private final String passwordHash;

    public AuthUserPrincipal(Long id, String username, String email, String passwordHash) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.passwordHash = passwordHash;
    }

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    // Adapting to UserDetails interface
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_USER"));
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
```

#### Adapter Creation & Usage

**File**: `Backend/src/main/java/com/yourorg/Users/CustomUserDetailsService.java`
```java
@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUserName(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        // Adapting User entity to UserDetails
        return new AuthUserPrincipal(
            user.getId(),
            user.getUserName(),
            user.getEmail(),
            user.getPassWordHash()
        );
    }
}
```

**Why Adapter Pattern**:
1. **Integration**: Connects domain model with Spring Security framework
2. **Separation**: Domain logic separate from security framework
3. **Reusability**: Adapter can be used in different security contexts

---

## 8. FILTER/INTERCEPTOR PATTERN

### Location & Implementation

The Filter pattern intercepts HTTP requests for cross-cutting concerns like authentication.

#### Filter Implementation

**File**: `Backend/src/main/java/com/yourorg/Auth/JwtAuthenticationFilter.java`
```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenService jwtTokenService;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                   HttpServletResponse response, 
                                   FilterChain filterChain) throws ServletException, IOException {

        // Skip filter for auth endpoints
        String path = request.getRequestURI();
        if (path.startsWith("/api/auth/")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Extract JWT token from Authorization header
        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);
        try {
            // Validate token and extract user ID
            Long userId = jwtTokenService.getUserId(token);
            User user = userRepository.findById(userId).orElse(null);

            if (user != null) {
                // Create authentication token
                UsernamePasswordAuthenticationToken authentication = 
                    new UsernamePasswordAuthenticationToken(
                        new AuthUserPrincipal(user.getId(), user.getUserName(), user.getEmail(), user.getPassWordHash()),
                        null,
                        List.of(new SimpleGrantedAuthority("ROLE_USER"))
                    );

                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                
                // Set authentication in security context
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (JwtException e) {
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }
}
```

**Filter Registration**

**File**: `Backend/src/main/java/com/yourorg/Config/SecurityConfig.java`
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers("/api/auth/**").permitAll()
                .anyRequest().authenticated()
            );
        return http.build();
    }
}
```

**Why Filter Pattern**:
1. **Cross-cutting Concerns**: Centralized authentication logic
2. **Reusability**: Applied to all requests
3. **Separation**: Authentication logic separate from business logic
4. **Interception**: Intercepts each request before controller

---

## 9. TRANSACTIONAL PATTERN

### Location & Implementation

The Transactional pattern ensures ACID properties for database operations.

#### Transactional Service Methods

**File**: `Backend/src/main/java/com/yourorg/Subscriptions/SubscriptionService.java`
```java
@Service
public class SubscriptionService {

    // Read-only transaction - optimized for reads
    @Transactional(readOnly = true)
    public List<SubscriptionResponse> getAll() {
        User user = currentUserService.getCurrentUser();
        return subscriptionRepository.findAllByUserId(user.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // Write transaction - all or nothing
    @Transactional
    public SubscriptionResponse create(SubscriptionRequest request) {
        User user = currentUserService.getCurrentUser();
        
        // If any step fails, all operations rollback
        Subscription subscription = new Subscription(
            user,
            request.providerName(),
            request.category(),
            request.startDate(),
            request.renewalCycle(),
            calculateRenewalDate(request.startDate(), request.renewalCycle()),
            request.price(),
            request.currency()
        );
        
        Subscription saved = subscriptionRepository.save(subscription);
        
        // Create associated billing record
        BillingRecord billingRecord = createBillingRecord(saved);
        billingRecordRepository.save(billingRecord);
        
        return toResponse(saved);
    }

    @Transactional
    public SubscriptionResponse update(Long id, SubscriptionRequest request) {
        // All updates happen in single transaction
        Subscription subscription = subscriptionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        
        subscription.setProviderName(request.providerName());
        subscription.setPrice(request.price());
        subscription.setRenewalCycle(request.renewalCycle());
        
        Subscription updated = subscriptionRepository.save(subscription);
        return toResponse(updated);
    }

    @Transactional
    public void delete(Long id) {
        // Delete subscription and cascade to billing records
        subscriptionRepository.deleteById(id);
    }
}
```

**Other Transactional Services**

**File**: `Backend/src/main/java/com/yourorg/UsageTracking/UsageTrackingService.java`
```java
@Service
public class UsageTrackingService {

    @Transactional
    public UsageTrackingResponse createUsageEntry(UsageTrackingRequest request) {
        User user = currentUserService.getCurrentUser();
        
        // Check for duplicate using idempotency key
        Optional<UsageTracking> existing = usageTrackingRepository
            .findByIdempotencyKey(request.idempotencyKey());
        
        if (existing.isPresent()) {
            return toResponse(existing.get());
        }
        
        // Create new usage entry
        UsageTracking tracking = new UsageTracking(
            user,
            request.serviceName(),
            request.date(),
            request.minutesUsed(),
            request.idempotencyKey()
        );
        
        UsageTracking saved = usageTrackingRepository.save(tracking);
        return toResponse(saved);
    }
}
```

**Benefits**:
1. **Data Consistency**: All or nothing - prevents partial updates
2. **Rollback**: Automatic rollback on exception
3. **Performance**: Read-only flag optimizes read operations
4. **Safety**: Prevents race conditions

---

## 10. JWT TOKEN PATTERN

### Location & Implementation

The JWT Token pattern provides stateless authentication.

#### JWT Service Implementation

**File**: `Backend/src/main/java/com/yourorg/Auth/JwtTokenService.java`
```java
@Service
public class JwtTokenService {

    private final JwtProperties jwtProperties;

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration-ms:86400000}")
    private long expirationMs;

    // Generate JWT token
    public String issueToken(Long userId, String username, String email) {
        return Jwts.builder()
                .claim("userId", userId)
                .claim("username", username)
                .claim("email", email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // Validate and extract user ID
    public Long getUserId(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .get("userId", Long.class);
    }

    private Key getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
```

#### Token Usage in Authentication

**File**: `Backend/src/main/java/com/yourorg/Auth/AuthController.java`
```java
@PostMapping("/login")
public AuthResponse login(@RequestBody LoginRequest request) {
    User user = userRepository.findByEmail(request.email().trim().toLowerCase())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

    if (!passwordEncoder.matches(request.password(), user.getPassWordHash())) {
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
    }

    // Issue JWT token
    String token = jwtTokenService.issueToken(user.getId(), user.getUserName(), user.getEmail());
    
    return new AuthResponse(token, 
        new AuthResponse.UserView(user.getId(), user.getUserName(), user.getEmail()));
}
```

#### Token Validation in Filter

**File**: `Backend/src/main/java/com/yourorg/Auth/JwtAuthenticationFilter.java`
```java
@Override
protected void doFilterInternal(HttpServletRequest request, 
                               HttpServletResponse response, 
                               FilterChain filterChain) throws ServletException, IOException {
    String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
    if (authHeader != null && authHeader.startsWith("Bearer ")) {
        String token = authHeader.substring(7);
        try {
            // Validate token
            Long userId = jwtTokenService.getUserId(token);
            // Token is valid, set authentication
        } catch (JwtException e) {
            // Token is invalid, clear security context
            SecurityContextHolder.clearContext();
        }
    }
    filterChain.doFilter(request, response);
}
```

**Benefits**:
1. **Stateless**: No server-side session storage needed
2. **Scalable**: Works with distributed systems
3. **Secure**: Cryptographically signed
4. **Standard**: JWT is industry standard

---

## 11. SERVICE LOCATOR PATTERN

### Location & Implementation

The Service Locator pattern locates the current authenticated user.

#### Service Locator Implementation

**File**: `Backend/src/main/java/com/yourorg/Users/CurrentUserService.java`
```java
@Service
public class CurrentUserService {

    private final UserRepository userRepository;

    public CurrentUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Locates current authenticated user from security context
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }

        AuthUserPrincipal principal = (AuthUserPrincipal) authentication.getPrincipal();
        Long userId = principal.getId();

        return userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    // Get only the user ID
    public Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }
        return ((AuthUserPrincipal) authentication.getPrincipal()).getId();
    }
}
```

#### Usage in Services

**File**: `Backend/src/main/java/com/yourorg/Subscriptions/SubscriptionService.java`
```java
@Service
public class SubscriptionService {

    private final CurrentUserService currentUserService;

    @Transactional(readOnly = true)
    public List<SubscriptionResponse> getAll() {
        // Service locator pattern - find current user
        User user = currentUserService.getCurrentUser();
        return subscriptionRepository.findAllByUserId(user.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public SubscriptionResponse create(SubscriptionRequest request) {
        // Locate current user
        User user = currentUserService.getCurrentUser();
        // ... create subscription for this user
    }
}
```

---

## 12. STRATEGY PATTERN (Future Implementation)

### Planned Location & Implementation

The Strategy pattern enables swappable storage implementations.

**File**: `Backend/src/main/java/com/yourorg/Storage/StorageStrategy.java` (Future)
```java
public interface StorageStrategy {
    String upload(MultipartFile file);
    String download(String fileId);
    void delete(String fileId);
}

@Service
public class CloudinaryStorageStrategy implements StorageStrategy {
    @Override
    public String upload(MultipartFile file) {
        // Cloudinary implementation
    }
}

@Service
public class S3StorageStrategy implements StorageStrategy {
    @Override
    public String upload(MultipartFile file) {
        // AWS S3 implementation
    }
}

@Service
public class StorageFactory {
    public StorageStrategy getStrategy(String type) {
        return switch(type) {
            case "cloudinary" -> cloudinaryStrategy;
            case "s3" -> s3Strategy;
            default -> cloudinaryStrategy;
        };
    }
}
```

---

## Summary Table

| Pattern | Location | File | Type |
|---------|----------|------|------|
| **Singleton** | Auth, Subscriptions, Billing, Usage, Recommendation | `*Service.java`, `*Controller.java`, `*Repository.java` | ✅ Implemented |
| **Builder** | BillingRecord, Recommendation | `BillingRecord.java`, `Recommendation.java` | ✅ Implemented |
| **Factory** | Storage | `CloudinaryStorageService.java` | ✅ Implemented |
| **Repository** | Data Access | `*Repository.java` | ✅ Implemented |
| **Dependency Injection** | Controllers, Services, Filters | All classes | ✅ Implemented |
| **DTO** | API Layer | `*Request.java`, `*Response.java` | ✅ Implemented |
| **Adapter** | Authentication | `AuthUserPrincipal.java` | ✅ Implemented |
| **Filter/Interceptor** | Security | `JwtAuthenticationFilter.java` | ✅ Implemented |
| **Transactional** | Services | `*Service.java` | ✅ Implemented |
| **JWT Token** | Authentication | `JwtTokenService.java` | ✅ Implemented |
| **Service Locator** | User Management | `CurrentUserService.java` | ✅ Implemented |
| **Strategy** | Storage | `StorageStrategy.java` | 📅 Planned |
| **Observer** | Notifications | Future | 📅 Planned |

---

**Generated**: April 21, 2026  
**Status**: Complete for current implementation, with roadmap for future patterns
