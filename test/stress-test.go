package main


import (
	"fmt"
	"io"
	"net/http"
	"sync"
	"sync/atomic"
	"time"
)

const (
	targetURL     = "http://localhost:8080/stream/1080p/topgun_maverick_trailer.mp4"
	totalClients  = 500
	requestsPerUser = 5
)

func main() {
	fmt.Printf("🚀 Avvio dello stress test: %d client concorrenti, %d richieste ciascuno...\n", totalClients, requestsPerUser)
	
	var wg sync.WaitGroup
	var successCount int64
	var errorCount int64
	var totalLatency int64

	startTime := time.Now()

	for i := 0; i < totalClients; i++ {
		wg.Add(1)
		go func(clientID int) {
			defer wg.Done()
			
			client := &http.Client{
				Timeout: 10 * time.Second,
			}

			for r := 0; r < requestsPerUser; r++ {
				req, err := http.NewRequest("GET", targetURL, nil)
				if err != nil {
					atomic.AddInt64(&errorCount, 1)
					continue
				}

				req.Header.Set("Range", "bytes=0-524288")

				reqStart := time.Now()
				resp, err := client.Do(req)
				latency := time.Since(reqStart).Milliseconds()

				if err != nil {
					atomic.AddInt64(&errorCount, 1)
					continue
				}

				_, err = io.Copy(io.Discard, resp.Body)
				resp.Body.Close()

				if resp.StatusCode == http.StatusOK || resp.StatusCode == http.StatusPartialContent {
					atomic.AddInt64(&successCount, 1)
					atomic.AddInt64(&totalLatency, latency)
				} else {
					atomic.AddInt64(&errorCount, 1)
				}
			}
		}(i)
	}

	wg.Wait()
	duration := time.Since(startTime)

	totalRequests := successCount + errorCount
	avgLatency := int64(0)
	if successCount > 0 {
		avgLatency = totalLatency / successCount
	}

	fmt.Println("\n================ STATISTICHE STRESS TEST ================")
	fmt.Printf("⏱️ Tempo totale impiegato: %v\n", duration)
	fmt.Printf("📊 Richieste totali effettuate: %d\n", totalRequests)
	fmt.Printf("✅ Richieste completate con successo: %d\n", successCount)
	fmt.Printf("❌ Richieste fallite / Errore: %d\n", errorCount)
	fmt.Printf("⚡ Latenza media di risposta: %d ms\n", avgLatency)
	fmt.Println("==========================================================")
}