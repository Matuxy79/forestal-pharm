.PHONY: help build run stop logs shell clean dev dev-install

PORT ?= 8000
export PORT

ifeq ($(OS),Windows_NT)
VENV_PYTHON := .venv/Scripts/python.exe
VENV_CHAINLIT := .venv/Scripts/chainlit.exe
else
VENV_PYTHON := .venv/bin/python
VENV_CHAINLIT := .venv/bin/chainlit
endif

help:
	@echo "Forestal Machipisa Pharmacy - Docker and development"
	@echo ""
	@echo "  make run          Build and start the app"
	@echo "  make build        Build the container image"
	@echo "  make stop         Stop and remove the app container"
	@echo "  make logs         Follow application logs"
	@echo "  make shell        Open a shell in the app container"
	@echo "  make clean        Stop the app and remove its image"
	@echo "  make dev-install  Create a local venv and install dependencies"
	@echo "  make dev          Run locally with auto-reload"

build:
	docker compose build

run:
	docker compose up --build --detach
	@echo "App available at http://localhost:$(PORT)"

stop:
	docker compose down

logs:
	docker compose logs --follow

shell:
	docker compose exec app sh

clean:
	docker compose down --rmi local

dev-install:
	python -m venv .venv
	$(VENV_PYTHON) -m pip install -r requirements.txt

dev:
	$(VENV_PYTHON) run_local.py -w
