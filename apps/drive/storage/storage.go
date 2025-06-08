package storage

import (
	"github.com/sakshxm08/buildwithsaksham/tree/main/apps/drive/v2/auth"
	"github.com/sakshxm08/buildwithsaksham/tree/main/apps/drive/v2/settings"
	"github.com/sakshxm08/buildwithsaksham/tree/main/apps/drive/v2/share"
	"github.com/sakshxm08/buildwithsaksham/tree/main/apps/drive/v2/users"
)

// Storage is a storage powered by a Backend which makes the necessary
// verifications when fetching and saving data to ensure consistency.
type Storage struct {
	Users    users.Store
	Share    *share.Storage
	Auth     *auth.Storage
	Settings *settings.Storage
}
