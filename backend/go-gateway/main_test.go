package main

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestHealthEndpoint(t *testing.T) {
	req, err := http.NewRequest(http.MethodGet, "/api/v1/health", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		enableCORS(w)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{
			"status":  "HEALTHY",
			"service": "apex-go-gateway",
			"version": "2.0.0",
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

	if res["status"] != "HEALTHY" {
		t.Errorf("expected status 'HEALTHY', got '%s'", res["status"])
	}
}

func TestHandleCopyTraders(t *testing.T) {
	req, err := http.NewRequest(http.MethodGet, "/api/v1/copytraders", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handleCopyTraders(rr, req)

	if status := rr.Code; status != http.StatusOK {
		t.Errorf("expected status 200, got %d", status)
	}

	if origin := rr.Header().Get("Access-Control-Allow-Origin"); origin != "*" {
		t.Errorf("expected CORS header '*', got '%s'", origin)
	}

	var resTraders []CopyTrader
	if err := json.Unmarshal(rr.Body.Bytes(), &resTraders); err != nil {
		t.Fatalf("failed to decode traders JSON: %v", err)
	}

	if len(resTraders) < 3 {
		t.Errorf("expected at least 3 traders, got %d", len(resTraders))
	}

	for _, trader := range resTraders {
		if trader.ID == "" || trader.Name == "" || trader.Strategy == "" {
			t.Errorf("trader has empty fields: %+v", trader)
		}
	}
}

func TestHandleCopyTraders_Options(t *testing.T) {
	req, err := http.NewRequest(http.MethodOptions, "/api/v1/copytraders", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handleCopyTraders(rr, req)

	if status := rr.Code; status != http.StatusOK {
		t.Errorf("expected status 200 on OPTIONS preflight, got %d", status)
	}
	if origin := rr.Header().Get("Access-Control-Allow-Origin"); origin != "*" {
		t.Errorf("expected CORS header '*', got '%s'", origin)
	}
}

func TestHandleNews(t *testing.T) {
	req, err := http.NewRequest(http.MethodGet, "/api/v1/news", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handleNews(rr, req)

	if status := rr.Code; status != http.StatusOK {
		t.Errorf("expected status 200, got %d", status)
	}

	var newsList []NewsItem
	if err := json.Unmarshal(rr.Body.Bytes(), &newsList); err != nil {
		t.Fatalf("failed to decode news JSON: %v", err)
	}

	if len(newsList) < 4 {
		t.Errorf("expected at least 4 news items, got %d", len(newsList))
	}

	for _, n := range newsList {
		if n.Title == "" || n.Category == "" || n.Source == "" {
			t.Errorf("news item has missing required fields: %+v", n)
		}
	}
}

func TestHandleNews_Options(t *testing.T) {
	req, err := http.NewRequest(http.MethodOptions, "/api/v1/news", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handleNews(rr, req)

	if status := rr.Code; status != http.StatusOK {
		t.Errorf("expected status 200 on OPTIONS preflight, got %d", status)
	}
}
