package email

import (
	"context"
	"fmt"

	"google.golang.org/api/option"
	"google.golang.org/api/sheets/v4"
)

type GoogleSheetsClient struct {
	srv           *sheets.Service
	spreadsheetID string
}

func NewGoogleSheetsClient(credentialsFile, spreadsheetID string) (*GoogleSheetsClient, error) {
	ctx := context.Background()
	srv, err := sheets.NewService(ctx, option.WithCredentialsFile(credentialsFile))
	if err != nil {
		return nil, fmt.Errorf("unable to retrieve Sheets client: %v", err)
	}
	return &GoogleSheetsClient{srv: srv, spreadsheetID: spreadsheetID}, nil
}

func (g *GoogleSheetsClient) GetFileLinks(cadFiles []string) (map[string]string, error) {
	readRange := "Sheet1!A:B"
	resp, err := g.srv.Spreadsheets.Values.Get(g.spreadsheetID, readRange).Do()
	if err != nil {
		return nil, fmt.Errorf("unable to retrieve data from sheet: %v", err)
	}

	links := make(map[string]string)
	if len(resp.Values) == 0 {
		return links, nil
	}

	for _, row := range resp.Values {
		if len(row) < 2 {
			continue
		}
		name := fmt.Sprintf("%v", row[0])
		link := fmt.Sprintf("%v", row[1])

		for _, cad := range cadFiles {
			if cad == name {
				links[cad] = link
			}
		}
	}

	return links, nil
}

func (g *GoogleSheetsClient) GetAllCADFiles() ([]string, error) {
	readRange := "Sheet1!A:A"
	resp, err := g.srv.Spreadsheets.Values.Get(g.spreadsheetID, readRange).Do()
	if err != nil {
		return nil, fmt.Errorf("unable to retrieve CAD file data: %v", err)
	}

	var cadFiles []string
	for i, row := range resp.Values {
		if i <= 1 {
			continue // skip the first and second row (column name)
		}
		if len(row) > 0 {
			cadFiles = append(cadFiles, fmt.Sprintf("%v", row[0]))
		}
	}

	return cadFiles, nil
}
