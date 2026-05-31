package report

import (
	"rims-backend/internal/controller/http/common"
	"rims-backend/internal/controller/http/dto"
	"rims-backend/internal/helper/logger"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func (h *ReportHandler) GetProductsReport(c *gin.Context) {
	logger.Info(c, "Get products report request received")

	var searchParams dto.GetReportRequest
	if err := c.ShouldBindQuery(&searchParams); err != nil {
		logger.Error(c, "Error binding query parameters", zap.Error(err))
		common.ValidationError(c, err)
		return
	}
	getReports, err := h.reportService.GetProductsReport(searchParams.StartDate, searchParams.EndDate)
	if err != nil {
		logger.Error(c, "Error getting products report", zap.Error(err))
		common.HandleError(c, err)
		return
	}
	var responseList []*dto.GetProductsReportResponse
	for _, report := range getReports {
		responseList = append(responseList, dto.NewGetProductsReportResponse(report))
	}
	if responseList == nil {
		responseList = make([]*dto.GetProductsReportResponse, 0)
	}
	logger.Info(c, "Products report retrieved", zap.Int("count", len(responseList)))
	common.HandleSuccess(c, common.StatusOK, responseList)
}
