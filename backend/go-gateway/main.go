// Apex Enterprise Go Live Data Flow Gateway
package main

import (
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"sync"
	"time"
)

type CopyTrader struct {
	ID           string   `json:"id"`
	Name         string   `json:"name"`
	Handle       string   `json:"handle"`
	Avatar       string   `json:"avatar"`
	Strategy     string   `json:"strategy"`
	Return30D    float64  `json:"return30d"`
	WinRate      float64  `json:"winRate"`
	DrawdownMax  float64  `json:"drawdownMax"`
	CopiersCount int      `json:"copiersCount"`
	AUM          string   `json:"aum"`
	RiskScore    int      `json:"riskScore"`
	Badges       []string `json:"badges"`
}

type NewsItem struct {
	ID        int    `json:"id"`
	Title     string `json:"title"`
	Category  string `json:"category"`
	Sentiment string `json:"sentiment"`
	Time      string `json:"time"`
	Source    string `json:"source"`
	Summary   string `json:"summary"`
}

type LiveStreamEvent struct {
	Type      string      `json:"type"`
	Timestamp int64       `json:"timestamp"`
	Data      interface{} `json:"data"`
}

var (
	tradersLock sync.RWMutex
	traders     = []CopyTrader{
		{
			ID:           "trader-alpha",
			Name:         "Kaelen Voss (Apex Quant)",
			Handle:       "@voss_quant",
			Strategy:     "Multi-Asset Delta-Neutral Arbitrage & Momentum",
			Return30D:    148.65,
			WinRate:      92.4,
			DrawdownMax:  -3.8,
			CopiersCount: 2410,
			AUM:          "$14,850,000",
			RiskScore:    2,
			Badges:       []string{"VERIFIED INSTITUTIONAL", "TOP SHARPE 4.2", "ZERO REHYPOTHECATION"},
		},
		{
			ID:           "trader-beta",
			Name:         "Seraphina Chen",
			Handle:       "@schen_macro",
			Strategy:     "Treasury Yield Curve & Real World Asset Arbitrage",
			Return30D:    89.20,
			WinRate:      88.9,
			DrawdownMax:  -2.1,
			CopiersCount: 1845,
			AUM:          "$28,400,000",
			RiskScore:    1,
			Badges:       []string{"RWA SPECIALIST", "SEC COMPLIANT", "AUDITED TRACK RECORD"},
		},
		{
			ID:           "trader-gamma",
			Name:         "Dr. Marcus Brody",
			Handle:       "@brody_mev",
			Strategy:     "Polygon zkEVM & Arbitrum Nitro Triangular Flash Sweeper",
			Return30D:    210.40,
			WinRate:      95.1,
			DrawdownMax:  -4.9,
			CopiersCount: 3120,
			AUM:          "$9,250,000",
			RiskScore:    3,
			Badges:       []string{"MEV PROTECTED", "HIGH FREQUENCY", "FLASH LOAN MASTER"},
		},
	}

	news = []NewsItem{
		{
			ID:        1,
			Title:     "BlackRock Expands BUIDL Tokenized Treasury Fund Across Polygon and Arbitrum Nitro",
			Category:  "SECURITIES / RWA",
			Sentiment: "bullish",
			Time:      "2m ago",
			Source:    "Institutional Wire Feeds",
			Summary:   "Institutional liquidity providers now settle real-world US Treasury yields on-chain via ERC-3643 compliant permissioned smart contracts.",
		},
		{
			ID:        2,
			Title:     "Apex Arbitrage Engine Sweeps 48 bps Spread on BTC/DAI Flash Loan Liquidity Pool",
			Category:  "ARBITRAGE",
			Sentiment: "bullish",
			Time:      "5m ago",
			Source:    "Apex High-Frequency Desk",
			Summary:   "Atomic flash loan across order book liquidity and AMM depth yields $1,420 net profit automatically credited to Multi-Sig treasury.",
		},
		{
			ID:        3,
			Title:     "SEC Issues Regulatory Guidance on ERC-3643 Tokenized Securities & On-Chain KYC",
			Category:  "SECURITIES",
			Sentiment: "neutral",
			Time:      "12m ago",
			Source:    "SEC Regulatory Bulletin",
			Summary:   "Regulatory safe harbors confirm on-chain identity whitelisting, clawback capabilities, and automated dividend settlement standard.",
		},
		{
			ID:        4,
			Title:     "Polygon 2.0 & Arbitrum Sequencer Upgrades Cut Cross-Chain Finality Under 200ms",
			Category:  "POLYGON / ARBITRUM",
			Sentiment: "bullish",
			Time:      "25m ago",
			Source:    "L2Beat Institutional",
			Summary:   "Zero-knowledge state proofs and optimistic rollups enhance cross-venue liquidity routing with institutional sub-cent transaction fees.",
		},
		{
			ID:        5,
			Title:     "Institutional FTPS Batch Clearing Gateway Reconciles $125M in EoD Prime Broker Trades",
			Category:  "FTPS / SETTLEMENT",
			Sentiment: "neutral",
			Time:      "45m ago",
			Source:    "Global Financial Wire",
			Summary:   "Automated SFTP pipeline synchronizes off-chain institutional trade batches with on-chain Merkle root cryptographic proofs.",
		},
	}
)

func enableCORS(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
}

func handleCopyTraders(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	if r.Method == http.MethodOptions {
		return
	}
	tradersLock.RLock()
	defer tradersLock.RUnlock()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(traders)
}

func handleNews(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	if r.Method == http.MethodOptions {
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(news)
}

// Server-Sent Events (SSE) Live Data Stream
func handleLiveStream(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")

	flusher, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "Streaming unsupported", http.StatusInternalServerError)
		return
	}

	ticker := time.NewTicker(2 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-r.Context().Done():
			return
		case <-ticker.C:
			// Emit a synthetic live tick or copy-trade execution
			event := LiveStreamEvent{
				Type:      "COPY_TRADE_EXECUTION",
				Timestamp: time.Now().Unix(),
				Data: map[string]interface{}{
					"trader":       "@voss_quant",
					"pair":         "BTC/DAI",
					"action":       "BUY",
					"price":        68450.0 + (rand.Float64()-0.5)*15.0,
					"size":         1.25,
					"copiersCount": 2410,
					"status":       "AUTO_MIRRORED",
				},
			}
			payload, _ := json.Marshal(event)
			fmt.Fprintf(w, "data: %s\n\n", payload)
			flusher.Flush()
		}
	}
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/api/v1/health", func(w http.ResponseWriter, r *http.Request) {
		enableCORS(w)
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintf(w, `{"status":"HEALTHY","engine":"Go-HighThroughput-Gateway","time":"%s"}`, time.Now().UTC().Format(time.RFC3339))
	})
	mux.HandleFunc("/api/v1/copytraders", handleCopyTraders)
	mux.HandleFunc("/api/v1/news", handleNews)
	mux.HandleFunc("/api/v1/stream", handleLiveStream)

	port := 8080
	log.Printf("🚀 Apex High-Throughput Go Gateway online on http://localhost:%d\n", port)
	if err := http.ListenAndServe(fmt.Sprintf(":%d", port), mux); err != nil {
		log.Fatalf("Server error: %v", err)
	}
}
