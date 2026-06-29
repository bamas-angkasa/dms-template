package middleware

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"

	"github.com/aice-distributor/dms-api/internal/model"
)

type contextKey string
const tenantKey contextKey = "tenant_id"

func Tenant(next http.Handler) http.Handler { return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path == "/healthz" { next.ServeHTTP(w, r); return }
	tenantID := r.Header.Get("X-Tenant-ID"); if tenantID == "" { tenantID = model.PilotTenantID }
	if tenantID != model.PilotTenantID { writeError(w, http.StatusForbidden, "tenant tidak dikenal atau tidak aktif"); return }
	if auth := r.Header.Get("Authorization"); auth != "" && !strings.HasPrefix(auth, "Bearer ") { writeError(w, http.StatusUnauthorized, "format authorization tidak valid"); return }
	next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), tenantKey, tenantID)))
}) }

func TenantID(ctx context.Context) string { value, _ := ctx.Value(tenantKey).(string); return value }
func writeError(w http.ResponseWriter, status int, message string) { w.Header().Set("Content-Type", "application/json"); w.WriteHeader(status); _ = json.NewEncoder(w).Encode(map[string]any{"error": message, "status": status}) }
