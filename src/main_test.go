package main

import (
	"net/http"
	"testing"
)

func TestHandelConnection(t *testing.T) {
	// Test clients are empty
	if len(Clients) == 0 {
		t.Error("Clients are not 0")
	}

	http.HandleFunc("/ws", HandleConnections)
	// Test Connecting and bad message
	// Test Connecting and good message
}

func TestHandelMessages(t *testing.T) {
	// Test
}
