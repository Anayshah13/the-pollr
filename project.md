I am building a full-stack, data-driven preference aggregation platform that allows users to rank and evaluate all committees within my college using multiple input methods. The goal of the project is not just to display rankings, but to design a robust backend system that collects, processes, and combines different types of user feedback into meaningful, aggregated insights.

The application supports four distinct voting modes:

Pairwise comparison (Tinder-style) – users choose between two committees, and an ELO-based rating system updates their scores dynamically.
Star ratings (1–5) – users rate committees individually.
Tier lists (A–F) – users categorize committees into qualitative tiers.
Direct ranking – users rank committees in order of preference.

Each of these produces different types of data, and the backend is responsible for normalizing and combining them into a unified ranking system using weighted scoring. The system also generates insights such as:

top and bottom committees overall
category-wise rankings (student chapters, tech committees, clubs, SAE teams, etc.)
most loved / least preferred
most controversial (based on variance)
comparisons (e.g., Antariksh vs Arya preference)
Tech Stack
Frontend: Next.js (React)
Backend: FastAPI (Python)
Database: Supabase (PostgreSQL)
Backend Responsibilities (Core Focus)

The backend is the most important part of the project and handles:

API design for all voting systems
Business logic (ELO rating, weighted aggregation, normalization)
Database interactions using a structured schema
Session-based user tracking (anonymous users via UUID)
Anti-abuse mechanisms (rate limiting, vote constraints)
Data aggregation for rankings and insights

The architecture follows a clean separation:

routes → services → database
Database Design

The system uses a relational schema with tables such as:

committees (core entities with categories and ELO score)
users (session-based tracking)
votes_pairwise
votes_star
votes_tier
votes_ranking
follower_stats (for external data like Instagram followers)
Advanced Features
Ranking Engine: Combines multiple scoring systems into a final weighted score
Analytics Layer: Generates insights like trends, category leaders, and polarizing committees
Web Scraping (planned): Periodically fetch Instagram follower counts for each committee to track popularity trends
Dashboard Views: Different ways to visualize data (leaderboards, category filters, comparisons)
Purpose of the Project

This project is designed to:

Learn real backend system design
Work with structured databases (PostgreSQL)
Implement ranking algorithms (ELO, weighted scoring)
Build scalable APIs using FastAPI
Handle multiple data models and aggregation logic
Simulate a real-world analytics platform
Key Idea

This is not just a ranking website — it is a multi-model preference aggregation system that converts diverse user inputs into structured, meaningful insights through a well-designed backend.