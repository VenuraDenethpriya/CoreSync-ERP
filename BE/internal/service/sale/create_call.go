package sale

import (
	"context"
	"rims-backend/internal/helper/logger"
	"rims-backend/internal/helper/uploader"
	"rims-backend/internal/service/domain"

	"go.uber.org/zap"
)

func (s *service) CreateCall(ctx context.Context, call *domain.Call) (*domain.Call, error) {
	// Only attempt upload if a URL exists
	if call.RecordingURL != "" {
		// Log that we are switching URLs
		logger.Info(ctx, "Swapping recording URL...", zap.String("original", call.RecordingURL))

		newURL, err := uploader.UploadAudioFromURL(ctx, s.cld, call.RecordingURL)
		if err != nil {
			// DECISION: Do you want to fail the whole call creation if upload fails?
			// OR just log the error and keep the original URL?
			// Here I log and keep original URL to prevent data loss.
			logger.Error(ctx, "Failed to upload to Cloudinary", zap.Error(err))
		} else {
			// success! replace the url
			call.RecordingURL = newURL
		}
	}
	return s.callRepo.CreateCall(ctx, call)
}
