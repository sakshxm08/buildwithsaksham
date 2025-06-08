package auth

import (
	"net/http"

	"github.com/sakshxm08/buildwithsaksham/tree/main/apps/drive/v2/settings"
	"github.com/sakshxm08/buildwithsaksham/tree/main/apps/drive/v2/users"
)

// Auther is the authentication interface.
type Auther interface {
	// Auth is called to authenticate a request.
	Auth(r *http.Request, usr users.Store, stg *settings.Settings, srv *settings.Server) (*users.User, error)
	// LoginPage indicates if this auther needs a login page.
	LoginPage() bool
}
