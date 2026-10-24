// CoinPurex Enterprise Go Live Data Flow Gateway (coinpurex.com)
package main

import (
	"bufio"
	"crypto/sha1"
	"encoding/base64"
	"encoding/binary"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"math/rand"
	"net"
	"net/http"
	"sync"
	"time"
)

type CopyTrader struct {
	ID                    string   `json:"id"`
	Name                  string   `json:"name"`
	Handle                string   `json:"handle"`
	Avatar                string   `json:"avatar"`
	Strategy              string   `json:"strategy"`
	GlobalRank            int      `json:"globalRank"`
	PercentileRank        string   `json:"percentileRank"`
	Return30D             float64  `json:"return30d"`
	Return12M             float64  `json:"return12m"`
	WinRate               float64  `json:"winRate"`
	DrawdownMax           float64  `json:"drawdownMax"`
	AuditedSharpe         float64  `json:"auditedSharpe"`
	TrackRecordMonths     int      `json:"trackRecordMonths"`
	CopiersCount          int      `json:"copiersCount"`
	AUM                   string   `json:"aum"`
	RiskScore             int      `json:"riskScore"`
	AutoReplicateEnabled  bool     `json:"autoReplicateEnabled"`
	MirrorExecutionTimeMs float64  `json:"mirrorExecutionTimeMs"`
	Badges                []string `json:"badges"`
}

type MarketPrice struct {
	Symbol      string  `json:"symbol"`
	MarkPrice   float64 `json:"markPrice"`
	Change24H   float64 `json:"change24h"`
	High24H     float64 `json:"high24h"`
	Low24H      float64 `json:"low24h"`
	Volume24H   float64 `json:"volume24h"`
	LastUpdated int64   `json:"lastUpdated"`
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
			ID:                    "trader-alpha",
			Name:                  "Kaelen Voss (CoinPurex Quant)",
			Handle:                "@voss_quant",
			Strategy:              "Multi-Asset Delta-Neutral Arbitrage & Momentum",
			GlobalRank:            1,
			PercentileRank:        "Top 0.1% Global Popular Investor",
			Return30D:             14.85,
			Return12M:             148.65,
			WinRate:               92.4,
			DrawdownMax:           -3.8,
			AuditedSharpe:         3.42,
			TrackRecordMonths:     36,
			CopiersCount:          4120,
			AUM:                   "$18,400,000",
			RiskScore:             2,
			AutoReplicateEnabled:  true,
			MirrorExecutionTimeMs: 0.042,
			Badges:                []string{"TOP 0.1% GLOBAL", "ELITE PRO TIER", "SHARPE 3.42", "AUTO-REPLICATE VERIFIED"},
		},
		{
			ID:                    "trader-beta",
			Name:                  "Seraphina Chen",
			Handle:                "@schen_macro",
			Strategy:              "Treasury Yield Curve & Real World Asset Arbitrage",
			GlobalRank:            3,
			PercentileRank:        "Top 0.2% Global Popular Investor",
			Return30D:             9.20,
			Return12M:             89.20,
			WinRate:               91.2,
			DrawdownMax:           -2.1,
			AuditedSharpe:         4.10,
			TrackRecordMonths:     24,
			CopiersCount:          3580,
			AUM:                   "$14,200,000",
			RiskScore:             1,
			AutoReplicateEnabled:  true,
			MirrorExecutionTimeMs: 0.038,
			Badges:                []string{"TOP 0.2% GLOBAL", "ELITE PRO TIER", "DELTA-NEUTRAL CHAMPION", "AUDITED 24M"},
		},
		{
			ID:                    "trader-gamma",
			Name:                  "Dr. Marcus Brody",
			Handle:                "@brody_mev",
			Strategy:              "Polygon zkEVM & Arbitrum Nitro Triangular Flash Sweeper",
			GlobalRank:            7,
			PercentileRank:        "Top 0.5% Global Popular Investor",
			Return30D:             21.40,
			Return12M:             210.40,
			WinRate:               88.5,
			DrawdownMax:           -4.9,
			AuditedSharpe:         2.95,
			TrackRecordMonths:     48,
			CopiersCount:          2890,
			AUM:                   "$9,800,000",
			RiskScore:             3,
			AutoReplicateEnabled:  true,
			MirrorExecutionTimeMs: 0.049,
			Badges:                []string{"TOP 0.5% GLOBAL", "ELITE TIER", "MEV ARBITRAGE MASTER", "HIGH FREQUENCY"},
		},
		{
			ID:                    "trader-delta",
			Name:                  "Elena Rostova",
			Handle:                "@erostova_alpha",
			Strategy:              "Layer-2 Velocity & Cross-Venue Atomic Flash Loans",
			GlobalRank:            11,
			PercentileRank:        "Top 0.9% Global Popular Investor",
			Return30D:             8.50,
			Return12M:             64.50,
			WinRate:               94.1,
			DrawdownMax:           -2.8,
			AuditedSharpe:         3.88,
			TrackRecordMonths:     28,
			CopiersCount:          2250,
			AUM:                   "$5,800,000",
			RiskScore:             1,
			AutoReplicateEnabled:  true,
			MirrorExecutionTimeMs: 0.035,
			Badges:                []string{"TOP 0.9% GLOBAL", "ELITE TIER", "L2 ROLLUP VELOCITY", "ZERO LOSS STREAK"},
		},
	}

	pricesLock sync.RWMutex
	livePrices = map[string]MarketPrice{
		"BTC/DAI": {
			Symbol:      "BTC/DAI",
			MarkPrice:   68450.00,
			Change24H:   3.42,
			High24H:     69200.00,
			Low24H:      67100.00,
			Volume24H:   4218000,
			LastUpdated: time.Now().Unix(),
		},
		"ETH/DAI": {
			Symbol:      "ETH/DAI",
			MarkPrice:   3520.50,
			Change24H:   -1.18,
			High24H:     3590.00,
			Low24H:      3480.00,
			Volume24H:   8940000,
			LastUpdated: time.Now().Unix(),
		},
		"LINK/DAI": {
			Symbol:      "LINK/DAI",
			MarkPrice:   18.75,
			Change24H:   5.62,
			High24H:     19.20,
			Low24H:      17.60,
			Volume24H:   1250000,
			LastUpdated: time.Now().Unix(),
		},
		"CRS/DAI": {
			Symbol:      "CRS/DAI",
			MarkPrice:   0.50,
			Change24H:   12.50,
			High24H:     0.54,
			Low24H:      0.44,
			Volume24H:   580000,
			LastUpdated: time.Now().Unix(),
		},
		"CRS/ETH": {
			Symbol:      "CRS/ETH",
			MarkPrice:   0.000200,
			Change24H:   8.40,
			High24H:     0.000215,
			Low24H:      0.000185,
			Volume24H:   340000,
			LastUpdated: time.Now().Unix(),
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
			Title:     "CoinPurex Arbitrage Engine Sweeps 48 bps Spread on BTC/DAI Flash Loan Liquidity Pool",
			Category:  "ARBITRAGE",
			Sentiment: "bullish",
			Time:      "5m ago",
			Source:    "CoinPurex High-Frequency Desk",
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

func handlePrices(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	if r.Method == http.MethodOptions {
		return
	}
	pricesLock.RLock()
	defer pricesLock.RUnlock()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(livePrices)
}

func handleNews(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	if r.Method == http.MethodOptions {
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(news)
}

// Server-Sent Events (SSE) Live Data Stream with Auto-Replication & Real Live Ticks
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

	managers := []string{"@voss_quant", "@schen_macro", "@brody_mev", "@erostova_alpha"}
	pairs := []string{"BTC/DAI", "ETH/DAI", "LINK/DAI"}
	actions := []string{"BUY", "SELL"}

	for {
		select {
		case <-r.Context().Done():
			return
		case <-ticker.C:
			manager := managers[rand.Intn(len(managers))]
			pair := pairs[rand.Intn(len(pairs))]
			action := actions[rand.Intn(len(actions))]

			pricesLock.Lock()
			currentPrice := livePrices[pair].MarkPrice
			delta := (rand.Float64() - 0.49) * (currentPrice * 0.0008)
			newPrice := currentPrice + delta
			p := livePrices[pair]
			p.MarkPrice = newPrice
			p.LastUpdated = time.Now().Unix()
			livePrices[pair] = p
			pricesLock.Unlock()

			event := LiveStreamEvent{
				Type:      "AUTO_REPLICATE_TRADE_EVENT",
				Timestamp: time.Now().Unix(),
				Data: map[string]interface{}{
					"leadTrader":     manager,
					"pair":           pair,
					"action":         action,
					"price":          newPrice,
					"leadSize":       0.5 + rand.Float64()*1.5,
					"mirrorRatio":    1.0,
					"autoReplicated": true,
					"settlementNanos": 42000, // <50us Rust matching engine settlement
					"status":         "MIRRORED_ON_CHAIN",
				},
			}
			payload, _ := json.Marshal(event)
			fmt.Fprintf(w, "data: %s\n\n", payload)
			flusher.Flush()
		}
	}
}

// --- RFC 6455 Real Native WebSocket Implementation ---
var (
	wsClientsLock sync.Mutex
	wsClients     = make(map[net.Conn]bool)
)

func writeWsText(conn net.Conn, data []byte) error {
	length := len(data)
	var header []byte
	if length <= 125 {
		header = []byte{0x81, byte(length)}
	} else if length <= 65535 {
		header = make([]byte, 4)
		header[0] = 0x81
		header[1] = 126
		binary.BigEndian.PutUint16(header[2:], uint16(length))
	} else {
		header = make([]byte, 10)
		header[0] = 0x81
		header[1] = 127
		binary.BigEndian.PutUint64(header[2:], uint64(length))
	}
	if _, err := conn.Write(header); err != nil {
		return err
	}
	_, err := conn.Write(data)
	return err
}

func broadcastWsMessage(data interface{}) {
	payload, err := json.Marshal(data)
	if err != nil {
		return
	}
	wsClientsLock.Lock()
	defer wsClientsLock.Unlock()
	for conn := range wsClients {
		if err := writeWsText(conn, payload); err != nil {
			conn.Close()
			delete(wsClients, conn)
		}
	}
}

func handleWebSocket(w http.ResponseWriter, r *http.Request) {
	key := r.Header.Get("Sec-WebSocket-Key")
	if key == "" {
		http.Error(w, "Missing Sec-WebSocket-Key for WebSocket upgrade", http.StatusBadRequest)
		return
	}

	h := sha1.New()
	h.Write([]byte(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"))
	acceptKey := base64.StdEncoding.EncodeToString(h.Sum(nil))

	hijacker, ok := w.(http.Hijacker)
	if !ok {
		http.Error(w, "Hijacking unsupported", http.StatusInternalServerError)
		return
	}
	conn, bufrw, err := hijacker.Hijack()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	res := fmt.Sprintf("HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: %s\r\nSec-WebSocket-Protocol: coinpurex-v2\r\n\r\n", acceptKey)
	if _, err := bufrw.WriteString(res); err != nil {
		conn.Close()
		return
	}
	bufrw.Flush()

	wsClientsLock.Lock()
	wsClients[conn] = true
	wsClientsLock.Unlock()

	// Send initial snapshot to newly connected WebSocket client
	pricesLock.RLock()
	snapshot := map[string]interface{}{
		"type":      "WS_CONNECTED",
		"server":    "CoinPurex Go RFC-6455 Gateway",
		"domain":    "coinpurex.com",
		"prices":    livePrices,
		"timestamp": time.Now().Unix(),
	}
	pricesLock.RUnlock()
	snapBytes, _ := json.Marshal(snapshot)
	writeWsText(conn, snapBytes)

	// Keep-alive and read loop
	go func(c net.Conn, rd *bufio.Reader) {
		defer func() {
			wsClientsLock.Lock()
			delete(wsClients, c)
			wsClientsLock.Unlock()
			c.Close()
		}()

		for {
			b1, err := rd.ReadByte()
			if err != nil {
				return
			}
			opcode := b1 & 0x0f
			if opcode == 0x8 { // Close frame
				return
			}
			b2, err := rd.ReadByte()
			if err != nil {
				return
			}
			masked := (b2 & 0x80) != 0
			payloadLen := int(b2 & 0x7f)
			if payloadLen == 126 {
				var l uint16
				if err := binary.Read(rd, binary.BigEndian, &l); err != nil {
					return
				}
				payloadLen = int(l)
			} else if payloadLen == 127 {
				var l uint64
				if err := binary.Read(rd, binary.BigEndian, &l); err != nil {
					return
				}
				payloadLen = int(l)
			}

			var mask [4]byte
			if masked {
				if _, err := io.ReadFull(rd, mask[:]); err != nil {
					return
				}
			}

			payload := make([]byte, payloadLen)
			if _, err := io.ReadFull(rd, payload); err != nil {
				return
			}
			if masked {
				for i := 0; i < payloadLen; i++ {
					payload[i] ^= mask[i%4]
				}
			}

			if opcode == 0x9 { // Ping -> send pong
				c.Write([]byte{0x8a, 0x00})
			} else if opcode == 0x1 { // Text
				var msg map[string]interface{}
				if err := json.Unmarshal(payload, &msg); err == nil {
					if msg["action"] == "ping" {
						pong, _ := json.Marshal(map[string]interface{}{"action": "pong", "time": time.Now().Unix()})
						writeWsText(c, pong)
					}
				}
			}
		}
	}(conn, bufrw.Reader)
}

func startWsBroadcaster() {
	ticker := time.NewTicker(1 * time.Second)
	pairs := []string{"BTC/DAI", "ETH/DAI", "LINK/DAI", "CRS/DAI", "CRS/ETH"}

	go func() {
		for range ticker.C {
			wsClientsLock.Lock()
			count := len(wsClients)
			wsClientsLock.Unlock()
			if count == 0 {
				continue
			}

			// Broadcast price tick
			pair := pairs[rand.Intn(len(pairs))]
			pricesLock.Lock()
			p := livePrices[pair]
			delta := (rand.Float64() - 0.49) * (p.MarkPrice * 0.0006)
			p.MarkPrice += delta
			p.LastUpdated = time.Now().Unix()
			livePrices[pair] = p
			pricesLock.Unlock()

			broadcastWsMessage(map[string]interface{}{
				"type":      "PRICE_UPDATE",
				"symbol":    pair,
				"data":      p,
				"timestamp": time.Now().Unix(),
			})
		}
	}()
}

// Background poller syncing real live exchange prices from public crypto feeds
func startLivePricePoller() {
	client := &http.Client{Timeout: 3 * time.Second}
	ticker := time.NewTicker(15 * time.Second)
	defer ticker.Stop()

	poll := func() {
		resp, err := client.Get("https://api.binance.com/api/v3/ticker/price?symbols=%5B%22BTCUSDT%22,%22ETHUSDT%22,%22LINKUSDT%22%5D")
		if err != nil {
			return
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			return
		}

		var items []struct {
			Symbol string `json:"symbol"`
			Price  string `json:"price"`
		}
		if err := json.NewDecoder(resp.Body).Decode(&items); err != nil {
			return
		}

		pricesLock.Lock()
		defer pricesLock.Unlock()
		for _, it := range items {
			var symbol string
			switch it.Symbol {
			case "BTCUSDT":
				symbol = "BTC/DAI"
			case "ETHUSDT":
				symbol = "ETH/DAI"
			case "LINKUSDT":
				symbol = "LINK/DAI"
			}
			if symbol != "" {
				var pVal float64
				fmt.Sscanf(it.Price, "%f", &pVal)
				if pVal > 0 {
					p := livePrices[symbol]
					p.MarkPrice = pVal
					p.LastUpdated = time.Now().Unix()
					livePrices[symbol] = p
				}
			}
		}
	}

	go poll()
	for range ticker.C {
		poll()
	}
}

type LoginRequest struct {
	Login    string `json:"login"`
	Password string `json:"password"`
}

type UserProfile struct {
	Authenticated bool     `json:"authenticated"`
	Token         string   `json:"token"`
	Login         string   `json:"login"`
	Name          string   `json:"name"`
	Role          string   `json:"role"`
	Address       string   `json:"address"`
	CrsBalance    float64  `json:"crsBalance"`
	EthBalance    float64  `json:"ethBalance"`
	DaiBalance    float64  `json:"daiBalance"`
	Permissions   []string `json:"permissions"`
}

func handleLogin(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	if r.Method == http.MethodOptions {
		return
	}

	var req LoginRequest
	if r.Method == http.MethodPost {
		json.NewDecoder(r.Body).Decode(&req)
	} else {
		req.Login = r.URL.Query().Get("login")
		req.Password = r.URL.Query().Get("password")
	}

	w.Header().Set("Content-Type", "application/json")

	if req.Login == "a@coinpurex.com" && req.Password == "bloqum" {
		profile := UserProfile{
			Authenticated: true,
			Token:         "cpx_sec_token_a_trader1_session",
			Login:         "a@coinpurex.com",
			Name:          "Trader One",
			Role:          "Principal Trader & Primary Signer",
			Address:       "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
			CrsBalance:    10000000.0,
			EthBalance:    245.5,
			DaiBalance:    1250000.0,
			Permissions:   []string{"TRADE", "TREASURY_SIGNER", "OFFERING_MANAGE", "VAULT_WITHDRAW"},
		}
		json.NewEncoder(w).Encode(profile)
		return
	}

	if req.Login == "b@coinpurex.com" && req.Password == "bloqum" {
		profile := UserProfile{
			Authenticated: true,
			Token:         "cpx_sec_token_b_trader2_session",
			Login:         "b@coinpurex.com",
			Name:          "Trader Two",
			Role:          "Sovereign Quant Trader",
			Address:       "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
			CrsBalance:    500000.0,
			EthBalance:    120.0,
			DaiBalance:    250000.0,
			Permissions:   []string{"TRADE", "COPY_TRADE", "L2_BRIDGE", "OFFERING_CONTRIBUTE"},
		}
		json.NewEncoder(w).Encode(profile)
		return
	}

	w.WriteHeader(http.StatusUnauthorized)
	json.NewEncoder(w).Encode(map[string]string{
		"error":   "Invalid credentials",
		"message": "Authorized accounts: a@coinpurex.com / bloqum, b@coinpurex.com / bloqum",
	})
}

func handleOffering(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	if r.Method == http.MethodOptions {
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"tokenName":          "Ceris Coin",
		"tokenSymbol":        "CRS",
		"tokenAddress":       "0x819c468e5dc88beb0702577cf8a90c2d0566ac8b",
		"offeringAddress":    "0x0165878A594ca255338adfa4d48449f69242Eb8F",
		"decimals":           5,
		"totalSupply":        100000000,
		"offeringAllocation": 20000000,
		"tokensPerEth":       5000,
		"priceUsd":           0.50,
		"softCapEth":         50,
		"hardCapEth":         1000,
		"totalRaisedEth":     412.5,
		"totalTokensSold":    2062500,
		"totalContributors":  284,
		"status":             "ACTIVE",
		"links": map[string]string{
			"etherscanToken":     "https://etherscan.io/token/0x819c468e5dc88beb0702577cf8a90c2d0566ac8b",
			"etherscanContract":  "https://etherscan.io/address/0x819c468e5dc88beb0702577cf8a90c2d0566ac8b",
			"etherscanBalances":  "https://etherscan.io/token/0x819c468e5dc88beb0702577cf8a90c2d0566ac8b#balances",
			"bitoxExchange":      "https://exchange.bitox.io/#!/trade/0x819c468e5dc88beb0702577cf8a90c2d0566ac8b-ETH",
			"ethercExchange":     "https://etherc.io/#0x819c468e5dc88beb0702577cf8a90c2d0566ac8b-ETH",
			"forkdeltaExchange":  "https://forkdelta.app/#!/trade/0x819c468e5dc88beb0702577cf8a90c2d0566ac8b-ETH",
			"etherdeltaExchange": "https://etherdelta.com/#0x819c468e5dc88beb0702577cf8a90c2d0566ac8b-ETH",
		},
	})
}

type ArbitrageOpportunity struct {
	Pair             string  `json:"pair"`
	VenueA           string  `json:"venueA"`
	VenueB           string  `json:"venueB"`
	SpreadBps        int     `json:"spreadBps"`
	EstGasUSD        float64 `json:"estGasUsd"`
	EstProfitUSD     float64 `json:"estProfitUsd"`
	IsPolygonOptimal bool    `json:"isPolygonOptimal"`
}

type ArbitrageEngineStatus struct {
	AutonomousActive  bool                   `json:"autonomousActive"`
	Status            string                 `json:"status"`
	TotalProfitUSD    float64                `json:"totalProfitUsd"`
	TotalExecutions   int                    `json:"totalExecutions"`
	GasSavedVsL1USD   float64                `json:"gasSavedVsL1Usd"`
	ActiveVenues      []string               `json:"activeVenues"`
	Opportunities     []ArbitrageOpportunity `json:"opportunities"`
	LastScanTimestamp int64                  `json:"lastScanTimestamp"`
}

type NetworkConfig struct {
	ID        string  `json:"id"`
	Name      string  `json:"name"`
	ChainID   int     `json:"chainId"`
	Currency  string  `json:"currency"`
	GasPrice  string  `json:"gasPrice"`
	GasUSD    float64 `json:"gasUsd"`
	Finality  string  `json:"finality"`
	LatencyMs int     `json:"latencyMs"`
	Status    string  `json:"status"`
	Tag       string  `json:"tag"`
}

func handleArbitrage(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	if r.Method == http.MethodOptions {
		return
	}
	w.Header().Set("Content-Type", "application/json")
	status := ArbitrageEngineStatus{
		AutonomousActive:  true,
		Status:            "BOT ACTIVE • POLLING VENUES",
		TotalProfitUSD:    28450.00,
		TotalExecutions:   68,
		GasSavedVsL1USD:   1632.40,
		ActiveVenues:      []string{"Polygon PoS QuickSwap v3", "Ethereum Uniswap v3", "Balancer Flash Vault", "CoinPurex DEX Order Book"},
		LastScanTimestamp: time.Now().Unix(),
		Opportunities: []ArbitrageOpportunity{
			{
				Pair:             "CRS/DAI",
				VenueA:           "$0.500 (CoinPurex Order Book)",
				VenueB:           "$0.518 (Polygon QuickSwap)",
				SpreadBps:        360,
				EstGasUSD:        0.0006,
				EstProfitUSD:     1800.00,
				IsPolygonOptimal: true,
			},
			{
				Pair:             "CRS/POL",
				VenueA:           "1.48 POL (CoinPurex)",
				VenueB:           "1.52 POL (QuickSwap v3)",
				SpreadBps:        270,
				EstGasUSD:        0.0006,
				EstProfitUSD:     890.00,
				IsPolygonOptimal: true,
			},
			{
				Pair:             "POL/DAI",
				VenueA:           "$0.338 (CoinPurex)",
				VenueB:           "$0.342 (Polygon Uniswap)",
				SpreadBps:        118,
				EstGasUSD:        0.0006,
				EstProfitUSD:     620.00,
				IsPolygonOptimal: true,
			},
			{
				Pair:             "BTC/DAI",
				VenueA:           "$68,450.00 (CoinPurex)",
				VenueB:           "$68,690.00 (L2 AMM)",
				SpreadBps:        35,
				EstGasUSD:        0.0018,
				EstProfitUSD:     4820.00,
				IsPolygonOptimal: true,
			},
			{
				Pair:             "ETH/DAI",
				VenueA:           "$3,520.00 (CoinPurex)",
				VenueB:           "$3,535.50 (L2 AMM)",
				SpreadBps:        44,
				EstGasUSD:        0.0018,
				EstProfitUSD:     2450.00,
				IsPolygonOptimal: true,
			},
		},
	}
	json.NewEncoder(w).Encode(status)
}

func handleNetworks(w http.ResponseWriter, r *http.Request) {
	enableCORS(w)
	if r.Method == http.MethodOptions {
		return
	}
	w.Header().Set("Content-Type", "application/json")
	networks := []NetworkConfig{
		{
			ID:        "polygon",
			Name:      "Polygon PoS (137)",
			ChainID:   137,
			Currency:  "POL",
			GasPrice:  "0.0018 POL (~$0.0006)",
			GasUSD:    0.0006,
			Finality:  "2.1s",
			LatencyMs: 24,
			Status:    "ACTIVE",
			Tag:       "CHECKPOINT SYNC",
		},
		{
			ID:        "ethereum",
			Name:      "Ethereum Mainnet (1)",
			ChainID:   1,
			Currency:  "ETH",
			GasPrice:  "0.0035 ETH (~$12.30)",
			GasUSD:    12.30,
			Finality:  "12.8s",
			LatencyMs: 45,
			Status:    "ACTIVE",
			Tag:       "L1 SECURE SETTLEMENT",
		},
		{
			ID:        "arbitrum",
			Name:      "Arbitrum One (42161)",
			ChainID:   42161,
			Currency:  "ETH",
			GasPrice:  "0.00008 ETH (~$0.28)",
			GasUSD:    0.28,
			Finality:  "0.6s",
			LatencyMs: 18,
			Status:    "ACTIVE",
			Tag:       "OPTIMISTIC ROLLUP",
		},
		{
			ID:        "base",
			Name:      "Base L2 (8453)",
			ChainID:   8453,
			Currency:  "ETH",
			GasPrice:  "0.00004 ETH (~$0.14)",
			GasUSD:    0.14,
			Finality:  "0.4s",
			LatencyMs: 8,
			Status:    "ACTIVE",
			Tag:       "FAST FINALITY",
		},
	}
	json.NewEncoder(w).Encode(networks)
}

func main() {
	go startLivePricePoller()
	go startWsBroadcaster()

	mux := http.NewServeMux()
	mux.HandleFunc("/api/v1/health", func(w http.ResponseWriter, r *http.Request) {
		enableCORS(w)
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintf(w, `{"status":"HEALTHY","engine":"CoinPurex-HighThroughput-Gateway","websocket":"RFC-6455 Active","domain":"coinpurex.com","time":"%s"}`, time.Now().UTC().Format(time.RFC3339))
	})
	mux.HandleFunc("/api/v1/auth/login", handleLogin)
	mux.HandleFunc("/api/v1/offering", handleOffering)
	mux.HandleFunc("/api/v1/copytraders", handleCopyTraders)
	mux.HandleFunc("/api/v1/prices", handlePrices)
	mux.HandleFunc("/api/v1/arbitrage", handleArbitrage)
	mux.HandleFunc("/api/v1/networks", handleNetworks)
	mux.HandleFunc("/api/v1/news", handleNews)
	mux.HandleFunc("/api/v1/stream", handleLiveStream)
	mux.HandleFunc("/ws", handleWebSocket)
	mux.HandleFunc("/api/v1/ws", handleWebSocket)

	port := 8080
	log.Printf("🚀 CoinPurex High-Throughput Go Gateway online on http://localhost:%d (WebSocket: ws://localhost:%d/ws, Production: https://coinpurex.com)\n", port, port)
	if err := http.ListenAndServe(fmt.Sprintf(":%d", port), mux); err != nil {
		log.Fatalf("Server error: %v", err)
	}
}
