# @fustaro/servo-core

Core classes and methods to ease the pain of controlling servos using node.

See;

1. @fustaro/pololu-maestro-controller
    for implementation running a Pololu Maestro (Windows 10 / Raspberry Pi / possibly other hardware with USB interface)

2. @fustaro/pca-9685-controller
    for implementation running a PCA-9685 servo controller (Raspberry Pi)

## Whats new in 6.1.0

- Added isDisabled() to IServoController

## Whats new in 6.0.0

- Added Servo.isDisabled()
- Servo angle can't be set if servo is disabled

## Whats new in 5.0.0

- Added optional interface for enabling servos
- Added mandatory dispose function on ServoDriver

## Whats new in 4.0.0

- Added optional interface for disabling servos
- PwmWriter renamed to ServoDriver