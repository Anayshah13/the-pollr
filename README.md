# 🎯 DJS Committee Insight Platform

A full-stack, data-driven platform that aggregates student preferences to rank and analyze all committees at DJSCE using multiple voting systems.

---

## 🚀 Overview

This project is a **multi-model preference aggregation system** that collects user opinions through different interaction modes and converts them into meaningful rankings and insights.

Instead of relying on a single voting method, the platform combines:
- Pairwise comparisons (Tinder-style)
- Star ratings (1–5)
- Tier lists (A–F)
- Direct rankings

All inputs are processed through a backend ranking engine to generate **dynamic, data-backed insights**.

---

## 🧠 Key Features

### 🗳️ Multiple Voting Modes
- **Pairwise (Tinder-style):** Choose between two committees → ELO-based scoring
- **Star Ratings:** Rate committees from 1 to 5
- **Tier Lists:** Assign committees to tiers (A–F)
- **Direct Ranking:** Order committees by preference

---

### 📊 Intelligent Rankings
- Global leaderboard
- Category-wise rankings:
  - Student Chapters
  - Tech Committees
  - Clubs
  - SAE Teams
  - IETE Teams
- Top & bottom committees
- Most loved / least preferred
- Most controversial (high variance)

---

### 🔍 Insights Engine
- Aggregates multiple data sources into a unified score
- Detects trends and patterns
- Enables comparisons (e.g., Antariksh vs Arya)

---

### 🔒 Anonymous & Fair Voting
- Session-based user tracking (no login required)
- Rate limiting & anti-abuse mechanisms
- No personal data stored

---

## 🛠️ Tech Stack

### Frontend
- **Next.js (React)**
- Tailwind CSS (optional)

### Backend
- **FastAPI (Python)**
- RESTful API design

### Database
- **Supabase (PostgreSQL)**

---

## 🏗️ Architecture
