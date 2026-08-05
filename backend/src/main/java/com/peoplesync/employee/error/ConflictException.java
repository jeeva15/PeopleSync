package com.peoplesync.employee.error;

public class ConflictException extends RuntimeException {
    public ConflictException(String message) { super(message); }
}
