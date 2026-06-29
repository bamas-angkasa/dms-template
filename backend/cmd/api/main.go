package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/aice-distributor/dms-api/internal/config"
	"github.com/aice-distributor/dms-api/internal/httpapi"
	"github.com/aice-distributor/dms-api/internal/store"
)

func main(){cfg:=config.Load();server:=&http.Server{Addr:cfg.Address,Handler:httpapi.New(store.NewMemory(),cfg.FrontendURL),ReadTimeout:cfg.ReadTimeout,WriteTimeout:cfg.WriteTimeout,IdleTimeout:60*time.Second};go func(){log.Printf("AICE DMS API listening on %s",cfg.Address);if err:=server.ListenAndServe();err!=nil&&!errors.Is(err,http.ErrServerClosed){log.Fatalf("api server failed: %v",err)}}();stop:=make(chan os.Signal,1);signal.Notify(stop,os.Interrupt,syscall.SIGTERM);<-stop;ctx,cancel:=context.WithTimeout(context.Background(),10*time.Second);defer cancel();if err:=server.Shutdown(ctx);err!=nil{log.Printf("graceful shutdown failed: %v",err)}}
