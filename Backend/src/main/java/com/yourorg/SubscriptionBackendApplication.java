package com.yourorg;
import org.flywaydb.core.Flyway;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import javax.sql.DataSource;

@SpringBootApplication
public class SubscriptionBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(SubscriptionBackendApplication.class, args);
    }
    @Bean
    public CommandLineRunner runFlyway(DataSource dataSource) {
        return args -> {
            System.out.println(">>> MANUAL FLYWAY: Starting Migration...");
            Flyway.configure()
                  .dataSource(dataSource)
                  .locations("classpath:db/migration")
                  .baselineOnMigrate(true)
                  .load()
                  .migrate();
            System.out.println(">>> MANUAL FLYWAY: Success!");
        };
    }
}
