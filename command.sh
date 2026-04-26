#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}"

BOLD='\033[1m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
DIM='\033[2m'
NC='\033[0m'

OUTBOXES=("outbox-user" "outbox-social" "outbox-post" "outbox-event")

show_menu() {
  clear
  echo -e "${BOLD}${CYAN}"
  echo "╔══════════════════════════════════════════════╗"
  echo "║          Outbox Runners — Command Center     ║"
  echo "╚══════════════════════════════════════════════╝"
  echo -e "${NC}"
  
  echo -e "  ${BOLD}${CYAN}Maintenance${NC}"
  echo -e "  ${BOLD}1)${NC}  📦  Install All        ${DIM}— yarn install in all outboxes${NC}"
  echo -e "  ${BOLD}2)${NC}  🏗   Build All          ${DIM}— tsc in all outboxes${NC}"
  echo -e "  ${BOLD}3)${NC}  ✨  Lint All           ${DIM}— eslint --fix in all outboxes${NC}"
  echo -e "  ${BOLD}4)${NC}  🧪  Test All           ${DIM}— jest in all outboxes${NC}"
  echo -e "  ${BOLD}5)${NC}  🧹  Clean All          ${DIM}— Remove node_modules & dist${NC}"
  
  echo -e "\n  ${BOLD}${CYAN}Development${NC}"
  echo -e "  ${BOLD}6)${NC}  🚀  Run All (Local)    ${DIM}— Launch all 4 runners${NC}"
  echo -e "  ${BOLD}7)${NC}  🔄  Update ci-tools    ${DIM}— Update submodule to latest main${NC}"
  
  echo -e "\n  ${BOLD}0)${NC}  ❌  Exit"
  echo ""
}

run_on_all() {
  local cmd="$1"
  local label="$2"
  
  echo -e "\n${BLUE}━━━ ${BOLD}${label}${NC}${BLUE} ━━━${NC}\n"
  
  for outbox in "${OUTBOXES[@]}"; do
    if [ -d "$outbox" ]; then
      echo -e "${CYAN}▸ Processing ${BOLD}${outbox}${NC}..."
      (cd "$outbox" && eval "$cmd")
    else
      echo -e "${RED}✖ Directory ${outbox} not found.${NC}"
    fi
  done
  
  echo -e "\n${GREEN}━━━ Done: ${label} ━━━${NC}\n"
}

while true; do
  show_menu
  read -rp "$(echo -e "${CYAN}▸${NC} Pick an option: ")" choice

  case "${choice}" in
    1) run_on_all "yarn install" "Installing Dependencies" ;;
    2) run_on_all "yarn build" "Building Projects" ;;
    3) run_on_all "yarn lint" "Linting Projects" ;;
    4) run_on_all "yarn test" "Running Tests" ;;
    5) 
      echo -e "${YELLOW}⚠️  This will remove node_modules and dist in all projects.${NC}"
      read -rp "Are you sure? (y/N): " confirm
      if [[ $confirm == [yY] ]]; then
        run_on_all "rm -rf node_modules dist .yarn/cache yarn.lock" "Cleaning Projects"
      fi
      ;;
    6) 
      echo -e "\n${BLUE}━━━ Running: ${BOLD}All Runners${NC}${BLUE} ━━━${NC}\n"
      # If root package.json exists (which I added for workspace but user said separate)
      # I'll just use concurrently directly
      npx concurrently -k -p '[{name}]' -n user,social,post,event -c green,red,cyan,yellow \
        "cd outbox-user && yarn start:local" \
        "cd outbox-social && yarn start:local" \
        "cd outbox-post && yarn start:local" \
        "cd outbox-event && yarn start:local"
      ;;
    7)
      echo -e "\n${BLUE}━━━ Updating ci-tools ━━━${NC}\n"
      git submodule update --remote ci-tools
      echo -e "${GREEN}Done.${NC}"
      ;;
    0)
      echo -e "\n${DIM}Bye!${NC}\n"
      exit 0
      ;;
    *)
      echo -e "\n${RED}Invalid option. Try again.${NC}\n"
      ;;
  esac

  read -rp "$(echo -e "${DIM}Press Enter to return to menu...${NC}")"
done
