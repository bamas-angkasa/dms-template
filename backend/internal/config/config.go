package config

import (
	"os"
	"time"
)

type Config struct {
	Address      string
	DatabaseURL string
	FrontendURL string
	ReadTimeout  time.Duration
	WriteTimeout time.Duration
}

func Load() Config {
	return Config{
		Address: env("API_ADDRESS", ":8080"), DatabaseURL: env("DATABASE_URL", "postgres://dms:dms@localhost:5432/aice_dms?sslmode=disable"),
		FrontendURL: env("FRONTEND_URL", "http://localhost:3000"), ReadTimeout: 10 * time.Second, WriteTimeout: 20 * time.Second,
	}
}

func env(key, fallback string) string { if value := os.Getenv(key); value != "" { return value }; return fallback }
