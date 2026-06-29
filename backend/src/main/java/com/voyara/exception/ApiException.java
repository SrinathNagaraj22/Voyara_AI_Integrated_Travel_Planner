package com.voyara.exception;

import org.springframework.http.HttpStatus;

/**
 * Base class for typed domain errors. Services throw subclasses;
 * GlobalExceptionHandler maps them to consistent JSON responses.
 */
public abstract class ApiException extends RuntimeException {

    protected ApiException(String message) {
        super(message);
    }

    public abstract HttpStatus status();
}
