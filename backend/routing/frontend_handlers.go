package routing

import (
	"net/http"
	"os"
	"path"
)

func StaticFrontend(w http.ResponseWriter, r *http.Request) {
	filePath := path.Join("../frontend/build", r.URL.Path)
	_, err := os.Stat(filePath)
	if os.IsNotExist(err) {
		http.ServeFile(w, r, "../frontend/build/index.html")
	} else {
		http.ServeFile(w, r, filePath)
	}
}
