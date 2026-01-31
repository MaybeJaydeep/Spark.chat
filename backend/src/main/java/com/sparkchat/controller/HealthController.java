package com.sparkchat.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Health check controller for monitoring application status
 * 
 * Provides endpoints to check the health and status of the Spark.chat backend service.
 * Includes database connectivity checks and system information.
 * 
 * @author Spark.chat Team
 * @version 1.0.0
 */
@RestController
@RequestMapping("/api")
public class HealthController {
    
    @Autowired
    private DataSource dataSource;
    
    /**
     * Basic health check endpoint
     * 
     * @return Health status information
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("timestamp", LocalDateTime.now());
        response.put("service", "Spark.chat Backend");
        response.put("version", "1.0.0");
        response.put("description", "Real-time chat application backend");
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Detailed health check with database connectivity
     * 
     * @return Detailed health status including database connection
     */
    @GetMapping("/health/detailed")
    public ResponseEntity<Map<String, Object>> detailedHealth() {
        Map<String, Object> response = new HashMap<>();
        Map<String, Object> checks = new HashMap<>();
        
        // Basic service info
        response.put("service", "Spark.chat Backend");
        response.put("version", "1.0.0");
        response.put("timestamp", LocalDateTime.now());
        response.put("uptime", getUptime());
        
        // Database connectivity check
        checks.put("database", checkDatabaseConnection());
        
        // Memory information
        Runtime runtime = Runtime.getRuntime();
        Map<String, Object> memory = new HashMap<>();
        memory.put("total", runtime.totalMemory());
        memory.put("free", runtime.freeMemory());
        memory.put("used", runtime.totalMemory() - runtime.freeMemory());
        memory.put("max", runtime.maxMemory());
        checks.put("memory", memory);
        
        // System properties
        Map<String, Object> system = new HashMap<>();
        system.put("javaVersion", System.getProperty("java.version"));
        system.put("osName", System.getProperty("os.name"));
        system.put("osVersion", System.getProperty("os.version"));
        checks.put("system", system);
        
        response.put("checks", checks);
        
        // Overall status
        boolean allHealthy = checks.values().stream()
            .allMatch(check -> {
                if (check instanceof Map) {
                    return "UP".equals(((Map<?, ?>) check).get("status"));
                }
                return true;
            });
        
        response.put("status", allHealthy ? "UP" : "DOWN");
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Check database connection status
     * 
     * @return Database connection status
     */
    private Map<String, Object> checkDatabaseConnection() {
        Map<String, Object> dbStatus = new HashMap<>();
        try (Connection connection = dataSource.getConnection()) {
            if (connection.isValid(5)) {
                dbStatus.put("status", "UP");
                dbStatus.put("database", connection.getMetaData().getDatabaseProductName());
                dbStatus.put("version", connection.getMetaData().getDatabaseProductVersion());
            } else {
                dbStatus.put("status", "DOWN");
                dbStatus.put("error", "Connection validation failed");
            }
        } catch (Exception e) {
            dbStatus.put("status", "DOWN");
            dbStatus.put("error", e.getMessage());
        }
        return dbStatus;
    }
    
    /**
     * Get application uptime
     * 
     * @return Uptime in milliseconds
     */
    private long getUptime() {
        return System.currentTimeMillis() - 
               java.lang.management.ManagementFactory.getRuntimeMXBean().getStartTime();
    }
}