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
			"service": "coinpurex-go-gateway",
			"domain":  "coinpurex.com",
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

func TestHandleCopyTraders_Top1Percent(t *testing.T) {
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

	if len(resTraders) < 4 {
		t.Errorf("expected at least 4 traders, got %d", len(resTraders))
	}

	for _, trader := range resTraders {
		if trader.ID == "" || trader.Name == "" || trader.Strategy == "" {
			t.Errorf("trader has empty fields: %+v", trader)
		}
		if trader.GlobalRank <= 0 {
			t.Errorf("trader %s missing GlobalRank: got %d", trader.Name, trader.GlobalRank)
		}
		if trader.PercentileRank == "" {
			t.Errorf("trader %s missing PercentileRank", trader.Name)
		}
		if !trader.AutoReplicateEnabled {
			t.Errorf("trader %s must have AutoReplicateEnabled set to true", trader.Name)
		}
		if trader.AuditedSharpe < 2.0 {
			t.Errorf("trader %s expected audited Sharpe > 2.0, got %f", trader.Name, trader.AuditedSharpe)
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

func TestHandlePrices(t *testing.T) {
	req, err := http.NewRequest(http.MethodGet, "/api/v1/prices", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handlePrices(rr, req)

	if status := rr.Code; status != http.StatusOK {
		t.Errorf("expected status 200, got %d", status)
	}

	var prices map[string]MarketPrice
	if err := json.Unmarshal(rr.Body.Bytes(), &prices); err != nil {
		t.Fatalf("failed to decode prices JSON: %v", err)
	}

	if _, ok := prices["BTC/DAI"]; !ok {
		t.Errorf("missing BTC/DAI in live prices")
	}
	if _, ok := prices["ETH/DAI"]; !ok {
		t.Errorf("missing ETH/DAI in live prices")
	}
	if _, ok := prices["LINK/DAI"]; !ok {
		t.Errorf("missing LINK/DAI in live prices")
	}

	if prices["BTC/DAI"].MarkPrice <= 0 {
		t.Errorf("BTC/DAI mark price must be > 0, got %f", prices["BTC/DAI"].MarkPrice)
	}
}

func TestHandlePrices_Options(t *testing.T) {
	req, err := http.NewRequest(http.MethodOptions, "/api/v1/prices", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handlePrices(rr, req)

	if status := rr.Code; status != http.StatusOK {
		t.Errorf("expected status 200 on OPTIONS preflight, got %d", status)
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

func TestHandleLogin_TraderOne(t *testing.T) {
	req, err := http.NewRequest(http.MethodGet, "/api/v1/auth/login?login=a@coinpurex.com&password=bloqum", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handleLogin(rr, req)

	if status := rr.Code; status != http.StatusOK {
		t.Errorf("expected status 200 for Trader One login, got %d", status)
	}

	var profile UserProfile
	if err := json.Unmarshal(rr.Body.Bytes(), &profile); err != nil {
		t.Fatalf("failed to decode profile JSON: %v", err)
	}

	if !profile.Authenticated || profile.Name != "Trader One" || profile.Login != "a@coinpurex.com" {
		t.Errorf("unexpected profile data for Trader One: %+v", profile)
	}
	if profile.Address != "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" {
		t.Errorf("expected primary address for Trader One, got %s", profile.Address)
	}
}

func TestHandleLogin_TraderTwo(t *testing.T) {
	req, err := http.NewRequest(http.MethodGet, "/api/v1/auth/login?login=b@coinpurex.com&password=bloqum", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handleLogin(rr, req)

	if status := rr.Code; status != http.StatusOK {
		t.Errorf("expected status 200 for Trader Two login, got %d", status)
	}

	var profile UserProfile
	if err := json.Unmarshal(rr.Body.Bytes(), &profile); err != nil {
		t.Fatalf("failed to decode profile JSON: %v", err)
	}

	if !profile.Authenticated || profile.Name != "Trader Two" || profile.Login != "b@coinpurex.com" {
		t.Errorf("unexpected profile data for Trader Two: %+v", profile)
	}
	if profile.Address != "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC" {
		t.Errorf("expected secondary address for Trader Two, got %s", profile.Address)
	}
}

func TestHandleLogin_Invalid(t *testing.T) {
	req, err := http.NewRequest(http.MethodGet, "/api/v1/auth/login?login=bad@user.com&password=wrong", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handleLogin(rr, req)

	if status := rr.Code; status != http.StatusUnauthorized {
		t.Errorf("expected status 401 for bad login, got %d", status)
	}
}

func TestHandleOffering(t *testing.T) {
	req, err := http.NewRequest(http.MethodGet, "/api/v1/offering", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handleOffering(rr, req)

	if status := rr.Code; status != http.StatusOK {
		t.Errorf("expected status 200 for offering endpoint, got %d", status)
	}

	var data map[string]interface{}
	if err := json.Unmarshal(rr.Body.Bytes(), &data); err != nil {
		t.Fatalf("failed to decode offering JSON: %v", err)
	}

	if data["tokenSymbol"] != "CRS" || data["tokenName"] != "Ceris Coin" {
		t.Errorf("expected Ceris Coin (CRS), got %v", data)
	}
	if data["tokenAddress"] != "0x819c468e5dc88beb0702577cf8a90c2d0566ac8b" {
		t.Errorf("expected mainnet token address 0x819c468e5dc88beb0702577cf8a90c2d0566ac8b, got %v", data["tokenAddress"])
	}
}
