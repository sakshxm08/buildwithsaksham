package bolt

import (
	"github.com/asdine/storm/v3"

	"github.com/sakshxm08/buildwithsaksham/tree/main/apps/drive/v2/auth"
	"github.com/sakshxm08/buildwithsaksham/tree/main/apps/drive/v2/settings"
	"github.com/sakshxm08/buildwithsaksham/tree/main/apps/drive/v2/share"
	"github.com/sakshxm08/buildwithsaksham/tree/main/apps/drive/v2/storage"
	"github.com/sakshxm08/buildwithsaksham/tree/main/apps/drive/v2/users"
)

// NewStorage creates a storage.Storage based on Bolt DB.
func NewStorage(db *storm.DB) (*storage.Storage, error) {
	userStore := users.NewStorage(usersBackend{db: db})
	shareStore := share.NewStorage(shareBackend{db: db})
	settingsStore := settings.NewStorage(settingsBackend{db: db})
	authStore := auth.NewStorage(authBackend{db: db}, userStore)

	err := save(db, "version", 2)
	if err != nil {
		return nil, err
	}

	return &storage.Storage{
		Auth:     authStore,
		Users:    userStore,
		Share:    shareStore,
		Settings: settingsStore,
	}, nil
}
