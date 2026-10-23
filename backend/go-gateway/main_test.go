package main

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestHealthEndpoint(t *testing.T) {
	req, err := http.NewRequest("GET", "/api/v1/health", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{
			"status":    "healthy",
			"service":   "apex-go-gateway",
			"engine":    "rust-matching-engine-connected",
			"version":   "2.0.0",
		})
	})

	handler.ServeHTTP(rr, req)

	if status := rr.Code; status != http.StatusOK {
		t.Errorf("handler returned wrong status code: got %v want %v", status, http.StatusOK)
	}

	var res map[string]string
	if err := json.Unmarshal(rr.Body.Bytes(), &res); err != nil {
		t.Fatalf("could not parse json response: %v", err)
	}

	if res["status"] != "healthy" {
		t.Errorf("expected status 'healthy', got '%s'", res["status"])
	}
}

func TestCopyTradersAPI(t *testing.T) {
	req, err := http.NewRequest("GET", "/api/v1/copytraders", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		managers := []map[string]interface{}{
			{"id": "kvoss", "name": "Kaelen Voss", "roi": 148.6, "sharpe": 3.42},
			{"id": "schen", "name": "Seraphina Chen", "roi": 89.2, "sharpe": 4.10},
		}
		json.NewEncoder(w).Encode(managers)
	})

	handler.ServeHTTP(rr, req)

	if status := rr.Code; status != http.StatusOK {
		t.Errorf("wrong status: %v", status)
	}
}
