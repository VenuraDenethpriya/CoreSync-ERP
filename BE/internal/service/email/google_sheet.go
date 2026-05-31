package email

type SheetCheck interface {
	GetFileLinks(cadFiles []string) (map[string]string, error)
}
