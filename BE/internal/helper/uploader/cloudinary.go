// package uploader

// import (
// 	"context"
// 	"net/http"
// 	"time"

// 	"github.com/cloudinary/cloudinary-go/v2"
// 	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
// )

// // Initialize this once in your app setup and pass it to your service
// func NewCloudinaryClient(cloudName, apiKey, apiSecret string) (*cloudinary.Cloudinary, error) {
// 	return cloudinary.NewFromParams(cloudName, apiKey, apiSecret)
// }

// // UploadAudioFromURL downloads from sourceUrl and uploads to Cloudinary
// func UploadAudioFromURL(ctx context.Context, cld *cloudinary.Cloudinary, sourceUrl string) (string, error) {
// 	// 1. Create a timeout context to prevent hanging
// 	ctx, cancel := context.WithTimeout(ctx, 30*time.Second)
// 	defer cancel()

// 	// 2. Download the file from Dialog (Dialog URL)
// 	resp, err := http.Get(sourceUrl)
// 	if err != nil {
// 		return "", err
// 	}
// 	defer resp.Body.Close()

// 	// 3. Upload directly from the response body (Stream) to Cloudinary
// 	// We use "resource_type: video" because Cloudinary treats audio as video/raw usually
// 	uploadResult, err := cld.Upload.Upload(ctx, resp.Body, uploader.UploadParams{
// 		ResourceType: "video",
// 		Folder:       "call_recordings",
// 		PublicID:     "", // Let Cloudinary generate one, or use call ID
// 	})

// 	if err != nil {
// 		return "", err
// 	}

//		// 4. Return the new Secure URL
//		return uploadResult.SecureURL, nil
//	}
package uploader

import (
	"context"
	"net/http"
	"strings"
	"time"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
)

func UploadAudioFromURL(ctx context.Context, cld *cloudinary.Cloudinary, sourceUrl string) (string, error) {
	ctx, cancel := context.WithTimeout(ctx, 30*time.Second)
	defer cancel()

	if !strings.HasPrefix(sourceUrl, "http://") && !strings.HasPrefix(sourceUrl, "https://") {
		sourceUrl = "https://" + sourceUrl
	}

	resp, err := http.Get(sourceUrl)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	uploadResult, err := cld.Upload.Upload(ctx, resp.Body, uploader.UploadParams{
		ResourceType: "video",
		Folder:       "call_recordings",
	})

	if err != nil {
		return "", err
	}

	return uploadResult.SecureURL, nil
}
