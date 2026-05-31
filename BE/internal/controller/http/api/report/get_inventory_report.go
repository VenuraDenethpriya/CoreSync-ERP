package report

import (
	"rims-backend/internal/controller/http/common"
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/helper/logger"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (h *ReportHandler) GetInventoryReport(c *gin.Context) {
	logger.Info(c, "Get inventory report request received")

	var searchParams dto.GetReportRequest
	if err := c.ShouldBindQuery(&searchParams); err != nil {
		logger.Error(c, "Error binding query parameters", zap.Error(err))
		common.ValidationError(c, err)
		return
	}
	getReports, err := h.reportService.GetInventoryReport(searchParams.StartDate, searchParams.EndDate)
	if err != nil {
		logger.Error(c, "Error getting inventory report", zap.Error(err))
		common.HandleError(c, err)
		return
	}
	var responseList []*dto.GetInventoryReportResponse
	for _, report := range getReports {
		responseList = append(responseList, dto.NewGetInventoryReportResponse(report))
	}

	if responseList == nil {
		responseList = make([]*dto.GetInventoryReportResponse, 0)
	}

	logger.Info(c, "Inventory report retrieved", zap.Int("count", len(responseList)))
	common.HandleSuccess(c, common.StatusOK, responseList)
}
