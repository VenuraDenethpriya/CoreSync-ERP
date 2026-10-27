package repository

import (
	"CoreSync-backend/internal/helper/logger"
	"CoreSync-backend/internal/models"
	"CoreSync-backend/internal/service/domain"
	"context"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type SiteRepository struct {
	db       *gorm.DB
	userRepo UserRepositoryInterface
}

func NewSiteRepository(db *gorm.DB, userRepo UserRepositoryInterface) *SiteRepository {
	return &SiteRepository{
		db:       db,
		userRepo: userRepo,
	}
}

//	func (sr *SiteRepository) CreateSite(ctx context.Context, site *domain.Site) (*domain.Site, error) {
//		siteModel := models.SiteModelFromDomain(site)
//		if err := sr.db.Create(siteModel).Error; err != nil {
//			logger.Error(ctx, "Error creating site: ", zap.String("method", "POST"), zap.String("path", "site"), zap.Any("site", site), zap.Error(err))
//			return nil, err
//		}
//		logger.Info(ctx, "Site created", zap.String("method", "POST"), zap.String("path", "sit"), zap.Any("site", site))
//		return siteModel.SiteModelToDomain(), nil
//	}
func (sr *SiteRepository) CreateSite(ctx context.Context, site *domain.Site) (*domain.Site, error) {
	siteModel := models.SiteModelFromDomain(site)

	if err := sr.db.Create(siteModel).Error; err != nil {
		logger.Error(ctx, "Error creating site: ", zap.Error(err))
		return nil, err
	}

	if err := sr.db.Preload("Order").Preload("Order.Customer").Preload("User").First(siteModel, "id = ?", siteModel.ID).Error; err != nil {
		logger.Error(ctx, "Error fetching created site relations: ", zap.Error(err))
		return nil, err
	}

	logger.Info(ctx, "Site created", zap.String("method", "POST"), zap.Any("site", siteModel))
	return siteModel.SiteModelToDomain(), nil
}

func (sr *SiteRepository) GetSites(ctx context.Context, query string, limit int, offset int) ([]*domain.Site, int, error) {
	var sites []*models.SiteModel
	searchPattern := "%" + query + "%"
	var totalSites int64

	dbQuery := sr.db.Model(&models.SiteModel{}).
		Joins("LEFT JOIN orders ON orders.order_id = sites.order_id").
		Where("sites.location ILIKE ? OR array_to_string(sites.assignee, ',') ILIKE ? OR sites.description ILIKE ? OR orders.order_no ILIKE ? OR sites.status ILIKE ?",
			searchPattern, searchPattern, searchPattern, searchPattern, searchPattern)

	if err := dbQuery.Count(&totalSites).Error; err != nil {
		logger.Error(ctx, "Error counting sites", zap.Error(err))
		return nil, 0, err
	}

	if err := dbQuery.Preload("Order").Preload("User").
		Order("sites.created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&sites).Error; err != nil {
		logger.Error(ctx, "Error retrieving sites", zap.Error(err))
		return nil, 0, err
	}

	clerkIDs := make(map[string]struct{})
	for _, site := range sites {
		for _, assigneeID := range site.Assignee {
			if assigneeID != "" {
				clerkIDs[assigneeID] = struct{}{}
			}
		}
	}

	idSlice := make([]string, 0, len(clerkIDs))
	for id := range clerkIDs {
		idSlice = append(idSlice, id)
	}

	userMap, err := sr.userRepo.FindManyByClerkIDs(ctx, idSlice)
	if err != nil {
		logger.Error(ctx, "Could not fetch user details for sites", zap.Error(err))
	}

	domainSites := make([]*domain.Site, 0, len(sites))
	for _, s := range sites {
		domainSite := s.SiteModelToDomain()

		var assigneeNames []string
		for _, assigneeID := range s.Assignee {
			if user, ok := userMap[assigneeID]; ok {
				assigneeNames = append(assigneeNames, fmt.Sprintf("%s %s", user.FirstName, user.LastName))
			} else {
				assigneeNames = append(assigneeNames, assigneeID)
			}
		}
		domainSite.Assignee = assigneeNames

		if s.Order.OrderID != uuid.Nil {
			domainSite.Order = &domain.Order{
				OrderNo: s.Order.OrderNo,
				Type:    s.Order.Type,
			}
		}

		domainSites = append(domainSites, domainSite)
	}

	return domainSites, int(totalSites), nil
}

func (sr *SiteRepository) GetSiteByID(ctx context.Context, reqSite *domain.Site) (*domain.Site, error) {
	var site models.SiteModel

	if err := sr.db.Preload("Order").Preload("User").
		Where("id = ?", reqSite.ID).
		First(&site).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("site not found")
		}
		logger.Error(ctx, "Error retrieving site by ID", zap.Error(err))
		return nil, err
	}

	var assigneeNames []string
	if len(site.Assignee) > 0 {
		var validIDs []string
		for _, id := range site.Assignee {
			if id != "" {
				validIDs = append(validIDs, id)
			}
		}

		if len(validIDs) > 0 {
			userMap, err := sr.userRepo.FindManyByClerkIDs(ctx, validIDs)
			if err != nil {
				logger.Error(ctx, "Could not fetch user details for site", zap.Error(err))
			}

			for _, assigneeID := range validIDs {
				if user, ok := userMap[assigneeID]; ok {
					assigneeNames = append(assigneeNames, fmt.Sprintf("%s %s", user.FirstName, user.LastName))
				} else {
					assigneeNames = append(assigneeNames, assigneeID)
				}
			}
		}
	}

	domainSite := site.SiteModelToDomain()

	domainSite.Assignee = assigneeNames

	if site.Order.OrderID != uuid.Nil {
		domainSite.Order = &domain.Order{
			OrderNo: site.Order.OrderNo,
			Type:    site.Order.Type,
		}
	}

	return domainSite, nil
}

func (sr *SiteRepository) DeleteSite(ctx context.Context, site *domain.Site) (*domain.Site, error) {
	var existingSite models.SiteModel
	err := sr.db.First(&existingSite, "id = ?", site.ID).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, gorm.ErrRecordNotFound
		}
		return nil, err
	}
	if err := sr.db.Delete(&existingSite).Error; err != nil {
		logger.Error(ctx, "Error deleting site: ", zap.String("method", "DELETE"), zap.String("path", "site"), zap.Any("site", site), zap.Error(err))
		return nil, err
	}
	logger.Info(ctx, "site deleted", zap.String("method", "DELETE"), zap.String("path", "site"), zap.Any("site", site))
	return existingSite.SiteModelToDomain(), nil
}

func (sr *SiteRepository) UpdateSite(ctx context.Context, site *domain.Site) (*domain.Site, error) {
	var existingSite models.SiteModel
	err := sr.db.First(&existingSite, "id = ?", site.ID).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, gorm.ErrRecordNotFound
		}
		return nil, err
	}
	existingSite.OrderID = site.OrderID
	existingSite.Location = site.Location
	existingSite.Date = site.Date
	existingSite.Status = site.Status
	existingSite.Assignee = site.Assignee
	existingSite.StartTime = site.StartTime
	existingSite.EndTime = site.EndTime
	existingSite.Capacity = site.Capacity
	existingSite.PanelType = site.PanelType
	existingSite.SolarType = site.SolarType
	existingSite.Inverter = site.Inverter
	existingSite.Description = site.Description

	if err := sr.db.Updates(&existingSite).Error; err != nil {
		logger.Error(ctx, "Error updating site: ", zap.String("method", "PUT"), zap.String("path", "site"), zap.Any("site", site), zap.Error(err))
		return nil, err
	}
	logger.Info(ctx, "site updated", zap.String("method", "PUT"), zap.String("path", "site"), zap.Any("site", site))
	return existingSite.SiteModelToDomain(), nil
}
