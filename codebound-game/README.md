# CodeBound - Unity Educational Game

## Overview
CodeBound is a 2D puzzle-based educational game that teaches Java programming fundamentals through 100 progressively challenging levels.

## Architecture
- **Presentation Layer**: UI Controllers, Input Handlers, Visual Feedback
- **Business Logic Layer**: Game State Manager, Level Manager, Code Validation Engine, Achievement System, Progression Controller
- **Data Access Layer**: API Service, Local Storage, Serialization, Cache Manager

## Features
- Robust API Service with retry logic and circuit breaker
- Local storage with PlayerPrefs
- Achievement system
- Analytics tracking
- Offline mode support
- MVC pattern implementation

## Setup
1. Install Unity 2021+ with Universal Render Pipeline
2. Open this project in Unity
3. Set up API endpoints in APIConfig.cs
4. Build and run

## Dependencies
- Unity 2021.3+
- .NET Standard 2.1

## Scripts Structure
- Managers/: GameManager.cs
- Services/: API, Storage, Achievement, Analytics services
- Models/: Data models like ApiResponse, Achievement
- UI/: UI controllers (to be implemented)