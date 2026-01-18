# Fax-lang Makefile

PREFIX ?= /usr/local
BINDIR = $(PREFIX)/bin

.PHONY: all build test clean install uninstall docs

all: build

build:
	npm run build

test:
	npm test

clean:
	rm -rf dist/
	find . -name "*.tmp.ll" -delete
	find . -name "*.tmp.o" -delete
	rm -f examples/mvp examples/logic examples/logic_if

docs-serve:
	cd book && mdbook serve --open

docs-build:
	cd book && mdbook build

install: build
	mkdir -p $(BINDIR)
	cp dist/index.js $(BINDIR)/fax
	chmod +x $(BINDIR)/fax
	@echo "Fax-lang installed to $(BINDIR)/fax"

uninstall:
	rm -f $(BINDIR)/fax
	@echo "Fax-lang removed."
