package cmd

import (
	"fmt"

	"github.com/spf13/cobra"

	"github.com/sakshxm08/buildwithsaksham/tree/main/apps/drive/v2/version"
)

func init() {
	rootCmd.AddCommand(versionCmd)
}

var versionCmd = &cobra.Command{
	Use:   "version",
	Short: "Print the version number",
	Run: func(_ *cobra.Command, _ []string) {
		fmt.Println("Devault v" + version.Version + "/" + version.CommitSHA)
	},
}
