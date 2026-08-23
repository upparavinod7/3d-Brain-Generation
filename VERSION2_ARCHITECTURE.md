# Version 2 Architecture

## Product Vision
A cinematic, AI-native 3D brain generation platform that feels like premium medical software and AI infrastructure in one experience.

## Frontend Architecture
- App Router with a polished landing, workspace, upload, and documentation experience.
- Shared design system with motion, spacing, and glass treatments that feel premium and consistent.
- Immersive 3D viewer built around React Three Fiber, Three.js, and Drei.
- Data flow centered around typed API contracts and resilient loading states.

## Backend Architecture
- FastAPI application organized into routes, services, repositories, and schemas.
- A pipeline service that manages scan ingest, preprocessing, segmentation, reconstruction, and export in a single lifecycle.
- Async-ready worker boundary for future background and GPU workloads.
- Structured logging and health endpoints as the foundation for reliability.

## Core Modules
- Scan intake service
- Preprocessing service
- Segmentation service
- Reconstruction service
- Artifact export service
- Pipeline orchestration service
- Health and observability layer

## Runtime Goals
- Fast startup and low-latency local experience.
- Clear pipeline progression and artifact generation.
- API contracts suitable for future authentication, caching, and background processing.
