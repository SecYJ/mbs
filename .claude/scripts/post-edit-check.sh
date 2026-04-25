#!/usr/bin/env bash
# PostToolUse hook for Write|Edit on TS/JS sources.
# Runs `tsc --noEmit` (project-wide) and `oxlint` (on the edited file).
# On success: exits silently.
# On issues: emits hookSpecificOutput.additionalContext JSON so Claude sees the errors.

set -uo pipefail

cd "$(dirname "$0")/../.." || exit 0

input=$(cat)
file=$(printf '%s' "$input" | jq -r '.tool_response.filePath // .tool_input.file_path // empty')

[ -z "$file" ] && exit 0

case "$file" in
    *.ts|*.tsx|*.mts|*.cts|*.js|*.jsx) ;;
    *) exit 0 ;;
esac

# Skip generated files
case "$file" in
    */routeTree.gen.*|*/.gen.*|*/dist/*|*/node_modules/*) exit 0 ;;
esac

ts_out=$(bunx tsc --noEmit -p tsconfig.json 2>&1)
ts_status=$?

if [ -f "$file" ]; then
    lint_out=$(bunx oxlint "$file" 2>&1)
    lint_status=$?
else
    lint_out=""
    lint_status=0
fi

if [ $ts_status -eq 0 ] && [ $lint_status -eq 0 ]; then
    exit 0
fi

msg="Lint/typecheck issues after editing $file. Review and fix before continuing."$'\n'

if [ $ts_status -ne 0 ]; then
    msg+=$'\n=== tsc --noEmit ===\n'
    msg+=$(printf '%s' "$ts_out" | grep -E "error TS|^Found " | head -60)
    msg+=$'\n'
fi

if [ $lint_status -ne 0 ]; then
    msg+=$'\n=== oxlint '"$file"$' ===\n'
    msg+=$(printf '%s' "$lint_out" | head -80)
    msg+=$'\n'
fi

jq -n --arg msg "$msg" '{
    hookSpecificOutput: {
        hookEventName: "PostToolUse",
        additionalContext: $msg
    }
}'
