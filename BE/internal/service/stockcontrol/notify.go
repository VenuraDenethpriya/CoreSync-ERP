// [ADDED 2026-10-13] Approval emails to Eranja (Eranja: "to approve it CoreSync should send me an email").
// Sent after the change is saved, in the background; a failed email is logged, never blocks the work.
// Recipients: STOCK_APPROVER_EMAIL (comma-separated). Link: CoreSync_APP_URL + /stock-control.
package stockcontrol

import (
	"context"
	"fmt"
	"html"
	"log"
	"os"
	"strings"
	"time"
)

// ApproverEmails returns the addresses approval emails go to.
func ApproverEmails() []string {
	var out []string
	for _, s := range strings.Split(os.Getenv("STOCK_APPROVER_EMAIL"), ",") {
		if s = strings.TrimSpace(s); s != "" {
			out = append(out, s)
		}
	}
	return out
}

func appLink() string {
	base := strings.TrimRight(strings.TrimSpace(os.Getenv("CoreSync_APP_URL")), "/")
	if base == "" {
		return ""
	}
	return base + "/stock-control"
}

// approvalEmailHTML builds the email body: a heading, one line per item, a button to CoreSync.
func approvalEmailHTML(heading string, lines []string, hold string) string {
	var b strings.Builder
	b.WriteString(`<div style="font-family:Arial,sans-serif;font-size:14px;color:#1e293b">`)
	b.WriteString(`<p><strong>` + html.EscapeString(heading) + `</strong></p><ul>`)
	for _, l := range lines {
		b.WriteString(`<li>` + html.EscapeString(l) + `</li>`)
	}
	b.WriteString(`</ul>`)
	if hold != "" {
		b.WriteString(`<p style="color:#b45309">` + html.EscapeString(hold) + `</p>`)
	}
	if link := appLink(); link != "" {
		b.WriteString(`<p><a href="` + html.EscapeString(link) + `" style="background:#2563eb;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none">Open Stock Control to approve</a></p>`)
	} else {
		b.WriteString(`<p>Open CoreSync → Stock Control to approve.</p>`)
	}
	b.WriteString(`<p style="color:#64748b;font-size:12px">Sent automatically by CoreSync.</p></div>`)
	return b.String()
}

// askApproval emails the approver in the background.
func (s *Service) askApproval(subject, heading string, lines []string) {
	if s.mail == nil || len(lines) == 0 {
		return
	}
	hold, msg, _ := s.HoldStatus(context.Background())
	if !hold {
		msg = ""
	}
	body := approvalEmailHTML(heading, lines, msg)
	go func() {
		if err := s.mail(subject, body); err != nil {
			log.Printf("stock control: approval email %q failed: %v", subject, err)
		}
	}()
}

// dbNow is the database clock (report created_at uses it).
func (s *Service) dbNow(ctx context.Context) time.Time {
	var t time.Time
	if err := s.db.WithContext(ctx).Raw(`SELECT now()`).Scan(&t).Error; err != nil || t.IsZero() {
		return time.Now().Add(-time.Minute)
	}
	return t
}

// emailNewReports emails Eranja the excess/shortage reports created since `since`
// (used after pack completions and deliveries, which can raise shortages).
func (s *Service) emailNewReports(ctx context.Context, since time.Time, subject string) {
	if s.mail == nil {
		return
	}
	var rows []struct {
		ItemCode    string
		Quantity    int
		Explanation string
	}
	if err := s.db.WithContext(ctx).Raw(`SELECT i.item_code, d.quantity, COALESCE(d.explanation,'') AS explanation
		FROM stock_discrepancies d JOIN inventory i ON i.id = d.inventory_id
		WHERE d.status = 'PENDING' AND d.created_at >= ? ORDER BY i.item_code`, since).Scan(&rows).Error; err != nil || len(rows) == 0 {
		return
	}
	lines := make([]string, 0, len(rows))
	for _, r := range rows {
		lines = append(lines, fmt.Sprintf("%s %+d: %s", r.ItemCode, r.Quantity, r.Explanation))
	}
	s.askApproval(subject, "These excess/shortage reports need your approval:", lines)
}
