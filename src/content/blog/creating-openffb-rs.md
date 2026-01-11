---
title: "Creating the openffb-rs"
description: "Explaining how i got the openffb-rs with embassy to work on multi-platform, zephyr style"
pubDate: 2026-01-11
author: "Orhan"
tags: ["rust", "embedded"]
---

## Why?

We have all seen the hype around "memory-safe Rust." As we all know, that’s a bit of a myth—bad logic is bad logic in any language. When written properly, C and C++ can be just as memory-safe as Rust. However, the key difference is effort: C++ requires you to be a perfect programmer 100% of the time to avoid segfaults. Rust just makes it significantly easier to be "good enough" by yelling at you during compilation rather than crashing at runtime.

But the real "why" is specific to the hardware we love.

The current OpenFFBoard codebase is legendary, but it’s getting old. Years of features, hacks, and patches have led to a bit of spaghetti code. It is heavily tied to specific STM32 HALs, making it painful to port to new, interesting chips like the ESP32-S3 (for wireless wheels) or the RP2040 (for budget builds).

I want to change this. I want a firmware that separates the physics of force feedback from the silicon it runs on.
The Goal: "Zephyr Style" without the C

I wanted the portability of an RTOS like Zephyr—where you write application code once and deploy it to any board—but I didn't want the bloat of a C kernel or the complexity of CMake build systems.

I found the solution in the Rust Embedded Ecosystem, specifically using Embassy.
The Architecture: The Sandwich Pattern

To make this work on both an STM32F407 (ARM Cortex-M4) and an ESP32-S3 (Xtensa), I couldn't just write one main.rs. I had to architect a Cargo Workspace that acts like a sandwich:

    The Top Bun (Hardware HALs): Binary crates (firmware-stm, firmware-esp) that handle the dirty work—clocks, pin assignments, and startup sequences.

    The Meat (Shared Logic): A no_std library (ffb-common) that contains the FFB physics engine, USB HID PID parsers, and control loops.

    The Bottom Bun (Traits): This is the secret sauce.

Instead of hardcoding "Write to Timer 1", the core logic talks to Traits.
## The Magic of Traits

In ffb-common, I defined what a motor is, not how it works.

```rust
// The core logic doesn't know if this is a VESC via CAN or a generic H-Bridge
pub trait Actuator {
    async fn set_torque(&mut self, torque: f32) -> Result<(), Error>;
}

pub trait Encoder {
    async fn get_position(&mut self) -> f32;
}
```

On the STM32, the Actuator implementation writes to a hardware timer's PWM register. On a Wireless Wheel, the Actuator implementation sends a UDP packet via ESP-NOW. The FFB PID loop? It doesn't care. It just calls set_torque().
## Why Embassy?

Force Feedback is inherently asynchronous. You have distinct events happening at different rates:

    USB Interrupts: Windows sends a "Rumble" command (1kHz).

    Motor Loop: The torque loop needs to run fast and consistent (4kHz+).

    Telemetry: Sending data back to the dashboard (100Hz).

In the old C++ way, we'd use complex Interrupt Service Routines (ISRs) and volatile flags, hoping we didn't create a race condition.

With Embassy, we use async/await. The executor handles the scheduling. The USB task goes to sleep (.await) until a packet arrives, freeing up the CPU for the motor loop.

```rust
#[embassy_executor::task]
async fn usb_task(mut device: UsbDevice) {
    loop {
        // This yields the CPU instantly if no data is there
        let packet = device.read_packet().await; 
        process_ffb(packet);
    }
}
```

## The Roadblocks

It wasn't all smooth sailing.

    Flash Memory: Abstracting storage was a nightmare. STM32 has internal flash; ESP32 uses partition tables. I had to use embedded-storage-async to treat them generically.

    The "Driver" Problem: I initially tried to make a single MotorDriver struct. That failed because a VESC provides both torque control and encoder data over one cable, while a PWM setup needs two separate pins. The solution was "Interface Segregation"—splitting the physical driver into logical capabilities (Actuator vs Encoder).

## What's Next?

The project structure is live. The STM32 can blink an LED using the same business logic that the ESP32 uses to send WiFi packets.

The next step is the beast: The USB HID PID descriptor. Getting Windows to recognize a Rust device as a Force Feedback Joystick.

Stay tuned.
