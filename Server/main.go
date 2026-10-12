package main

import (
	"log"
	"net/http"
)

func main() {
	fs := http.FileServer(http.Dir("./media"))

	http.Handle("/stream/", http.StripPrefix("/stream/", fs))

	port := ":8080"

	log.Printf("Server Attivo su http://localhost%s\n", port)
	
	err := http.ListenAndServe(port, nil)

	if err != nil {
		log.Fatalf("Errore nell'avvio del server: %v", err)
	}
}

/*

Ogni volta che un utente richiede un file si collega alla cartella media/la-sua-risoluzione/nome-del-file.mp4
e riceve una serie di chunck del video lanciando una goroutine dedicata

*/