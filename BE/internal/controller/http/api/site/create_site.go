package site

import (
	"CoreSync-backend/internal/controller/http/common"
	"CoreSync-backend/internal/controller/http/dto"
	"CoreSync-backend/internal/controller/http/mapper"
	"CoreSync-backend/internal/events"
	"CoreSync-backend/internal/helper/logger"
	"CoreSync-backend/internal/service/domain"
	"context"
	"fmt"
	"strings"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (h *SiteHandler) CreateSite(c *gin.Context) {
	logger.Info(c, "Create site request received")
	var req dto.CreateSiteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		common.ValidationError(c, err)
		logger.Error(c, "Failed to bind request", zap.Error(err))
		return
	}
	site := mapper.CreateSiteRequestToDomain(&req)
	createdSite, err := h.siteService.CreateSite(c, site)
	if err != nil {
		common.HandleError(c, err)
		logger.Error(c, "Failed to create site", zap.Error(err))
		return
	}
	logger.Info(c, "Task created", zap.Any("task", createdSite))

	userName := createdSite.CreatedBy
	if createdSite.User != nil {
		userName = createdSite.User.FirstName + " " + createdSite.User.LastName
	}
	common.SetAuditInfo(c, common.AuditLogDetails{
		Headers:     map[string]string{"X-Response-Message": "Site created"},
		Description: userName + "Site created",
	})
	common.HandleSuccess(c, common.StatusCreated, dto.NewCreateSiteResponse(createdSite))
	logger.Info(c, "Site created successfully", zap.Any("site", dto.NewCreateSiteResponse(createdSite)))

	go func(site *domain.Site) {
		ctx := context.Background()

		if h.smsService == nil || len(site.Assignee) == 0 {
			return
		}
		if site.Order == nil || site.Order.Customer == nil {
			logger.Error(ctx, "Missing Order or Customer details, cannot send SMS")
			return
		}

		users, err := h.userService.GetUsersByIDs(ctx, site.Assignee)
		if err != nil {
			logger.Error(ctx, "Failed to fetch assignee users for SMS", zap.Error(err))
			return
		}

		customerName := fmt.Sprintf("%s %s", site.Order.Customer.FirstName, site.Order.Customer.LastName)
		customerPhone := site.Order.Customer.PhoneNo1

		message := fmt.Sprintf(
			"New Site Assigned: %s on %s (%s-%s). Customer: %s, Phone: %s. Info: %s",
			site.Location,
			site.Date.Format("2006-01-02"),
			site.StartTime,
			site.EndTime,
			strings.TrimSpace(customerName),
			customerPhone,
			site.Description,
		)

		for _, user := range users {
			if user.PhoneNo == "" {
				logger.Info(ctx, "Skipping SMS, assignee has no phone number", zap.String("user_id", user.ID.String()))
				continue
			}

			err := h.smsService.SendSMS(ctx, user.PhoneNo, message)
			if err != nil {
				logger.Error(ctx, "Failed to send site confirmation SMS",
					zap.Error(err),
					zap.String("order_id", site.OrderID.String()),
					zap.String("assignee_phone", user.PhoneNo),
				)
			} else {
				logger.Info(ctx, "Site confirmation SMS sent successfully",
					zap.String("order_id", site.OrderID.String()),
					zap.String("assignee_phone", user.PhoneNo),
				)
			}
		}
	}(createdSite)

	go h.bus.Publish("sites", events.Event{
		Type: "site.created",
		Data: createdSite,
	})
}
