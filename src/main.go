package main

import (
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

//Change these to not use global variables
var clients = make(map[*websocket.Conn]bool) // connected clients rewrite to use a dynamic list.
var broadcast = make(chan Message)           // broadcast channel

// Configure the upgrader
var upgrader = websocket.Upgrader{}

// Define our message object
type Message struct {
	Channel  string `json:"channel"`
	Email    string `json:"email"`
	Username string `json:"username"`
	Message  string `json:"message"`
}

var defaultChannel = "Sup"

func main() {
	// Create a simple file server
	fs := http.FileServer(http.Dir("../public"))
	http.Handle("/", fs)

	// Confgure websocket route
	http.HandleFunc("/ws", HandleConnections)
	go HandleMessages()

	// Start the server on localhost port 8000 and log any errors
	log.Println("http server started on :8000")
	err := http.ListenAndServe(":8000", nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}

func HandleConnections(w http.ResponseWriter, r *http.Request) {
	// Upgrade initial GET request to a websocket
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Fatal(err)
	}
	//Make sure we close the connection when the function returns
	defer ws.Close()

	clients[ws] = true

	for {
		var msg Message
		//Read in a new message as JSON and map it to a Message object
		err := ws.ReadJSON(&msg)
		if err != nil {
			log.Printf("error1: %v", err)
			delete(clients, ws)
			break
		}
		// Send the newly received message to the broadcast channel
		broadcast <- msg
	}
}

func HandleMessages() {
	for {
		// Grab the next message from the broadcast channel
		msg := <-broadcast
		// Send it out to every client that is currently connected
		for client := range clients {
			err := client.WriteJSON(msg)
			if err != nil {
				log.Printf("error2: %v", err)
				client.Close()
				delete(clients, client)
			}
		}
	}
}
