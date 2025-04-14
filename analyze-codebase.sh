#!/bin/bash

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Timeout settings (in seconds)
TIMEOUT=300  # 5 minutes

# Common exclude patterns
EXCLUDE_PATHS=(
    "*/node_modules/*"
    "*/dist/*"
    "*/coverage/*"
    "*/dist-electron/*"
    "*/dist-web/*"
    "*/build/*"
    "*/out/*"
    "*/.next/*"
    "*/.cache/*"
    "*/.yarn/*"
    "*/node_modules/.vite/*"
)

# Convert exclude patterns to find command arguments
EXCLUDE_FIND_ARGS=""
for path in "${EXCLUDE_PATHS[@]}"; do
    EXCLUDE_FIND_ARGS+=" -not -path \"$path\""
done

# Function to run a command with timeout
run_with_timeout() {
    local cmd="$1"
    local timeout="$2"
    timeout "$timeout" bash -c "$cmd"
    local status=$?
    if [ $status -eq 124 ]; then
        echo -e "${RED}Command timed out after $timeout seconds${NC}"
        return 1
    fi
    return $status
}

# Function to find source files
find_source_files() {
    find . -type f \( -name "*.ts" -o -name "*.tsx" \) \
        -not -path "*/node_modules/*" \
        -not -path "*/dist/*" \
        -not -path "*/coverage/*" \
        -not -path "*/dist-electron/*" \
        -not -path "*/dist-web/*" \
        -not -path "*/build/*" \
        -not -path "*/out/*" \
        -not -path "*/.next/*" \
        -not -path "*/.cache/*" \
        -not -path "*/.yarn/*" \
        -not -path "*/node_modules/.vite/*"
}

# Function to find TypeScript files
find_ts_files() {
    find . -type f -name "*.ts" \
        -not -path "*/node_modules/*" \
        -not -path "*/dist/*" \
        -not -path "*/coverage/*" \
        -not -path "*/dist-electron/*" \
        -not -path "*/dist-web/*" \
        -not -path "*/build/*" \
        -not -path "*/out/*" \
        -not -path "*/.next/*" \
        -not -path "*/.cache/*" \
        -not -path "*/.yarn/*" \
        -not -path "*/node_modules/.vite/*"
}

# Function to find TypeScript React files
find_tsx_files() {
    find . -type f -name "*.tsx" \
        -not -path "*/node_modules/*" \
        -not -path "*/dist/*" \
        -not -path "*/coverage/*" \
        -not -path "*/dist-electron/*" \
        -not -path "*/dist-web/*" \
        -not -path "*/build/*" \
        -not -path "*/out/*" \
        -not -path "*/.next/*" \
        -not -path "*/.cache/*" \
        -not -path "*/.yarn/*" \
        -not -path "*/node_modules/.vite/*"
}

# Function to extract component names from a file
extract_component_names() {
    local file="$1"
    # Match both function components and class components
    grep -E "export (const|function|class) [A-Z][A-Za-z0-9]*|export default (function|class) [A-Z][A-Za-z0-9]*" "$file" | \
    sed -E 's/export (const|function|class) ([A-Z][A-Za-z0-9]*).*/\2/;s/export default (function|class) ([A-Z][A-Za-z0-9]*).*/\2/'
}

# Function to analyze component complexity
analyze_component_complexity() {
    local file="$1"
    local complexity=0
    local warnings=()
    
    # Count lines of code
    local lines=$(wc -l < "$file")
    if [ "$lines" -gt 200 ]; then
        complexity=$((complexity + 20))
        warnings+=("Large file (>200 lines)")
    fi
    
    # Count props
    local props=$(grep -c "interface.*Props\|type.*Props" "$file")
    if [ "$props" -gt 10 ]; then
        complexity=$((complexity + (props - 10) * 2))
        warnings+=("Many props (>10)")
    fi
    
    # Count hooks
    local hooks=$(grep -c "use[A-Z][A-Za-z]*" "$file")
    if [ "$hooks" -gt 5 ]; then
        complexity=$((complexity + (hooks - 5) * 3))
        warnings+=("Many hooks (>5)")
    fi
    
    # Count nested components
    local nested_components=$(grep -c "const [A-Z][A-Za-z]* = \(function\|const\)" "$file")
    if [ "$nested_components" -gt 2 ]; then
        complexity=$((complexity + (nested_components - 2) * 5))
        warnings+=("Nested components (>2)")
    fi
    
    # Count conditional rendering
    local conditionals=$(grep -c "&&\|?\|if (" "$file")
    if [ "$conditionals" -gt 5 ]; then
        complexity=$((complexity + (conditionals - 5) * 2))
        warnings+=("Many conditionals (>5)")
    fi
    
    # Count useEffect dependencies
    local effect_deps=$(grep -c "useEffect.*\[" "$file")
    if [ "$effect_deps" -gt 3 ]; then
        complexity=$((complexity + (effect_deps - 3) * 4))
        warnings+=("Complex effects (>3)")
    fi
    
    # Count state variables
    local state_vars=$(grep -c "useState" "$file")
    if [ "$state_vars" -gt 5 ]; then
        complexity=$((complexity + (state_vars - 5) * 2))
        warnings+=("Many state variables (>5)")
    fi
    
    if [ "$complexity" -gt 50 ]; then
        echo -e "${RED}High complexity component: $file${NC}"
        echo "  Lines: $lines"
        echo "  Props: $props"
        echo "  Hooks: $hooks"
        echo "  Nested components: $nested_components"
        echo "  Conditionals: $conditionals"
        echo "  Effect dependencies: $effect_deps"
        echo "  State variables: $state_vars"
        echo "  Complexity score: $complexity"
        echo -e "${YELLOW}Warning signs:${NC}"
        for warning in "${warnings[@]}"; do
            echo "  - $warning"
        done
        echo -e "${BLUE}Recommendations:${NC}"
        if [[ "${warnings[*]}" == *"Large file"* ]]; then
            echo "  - Consider splitting into smaller components"
        fi
        if [[ "${warnings[*]}" == *"Many props"* ]]; then
            echo "  - Consider using context or composition"
        fi
        if [[ "${warnings[*]}" == *"Many hooks"* ]]; then
            echo "  - Consider extracting custom hooks"
        fi
        if [[ "${warnings[*]}" == *"Nested components"* ]]; then
            echo "  - Consider moving nested components to separate files"
        fi
        if [[ "${warnings[*]}" == *"Many conditionals"* ]]; then
            echo "  - Consider using early returns or component composition"
        fi
        if [[ "${warnings[*]}" == *"Complex effects"* ]]; then
            echo "  - Consider splitting effects or using custom hooks"
        fi
        if [[ "${warnings[*]}" == *"Many state variables"* ]]; then
            echo "  - Consider using reducer or context"
        fi
    fi
}

# Function to check code style consistency
check_code_style() {
    local file="$1"
    local issues=0
    local warnings=()
    local file_extension="${file##*.}"
    
    # Check for consistent indentation
    local indent_issues=$(grep -c "^[[:space:]]*[^[:space:]]" "$file" | grep -v "^[[:space:]]\{2\}[^[:space:]]" | wc -l)
    if [ "$indent_issues" -gt 0 ]; then
        warnings+=("Inconsistent indentation: $indent_issues lines")
        issues=$((issues + indent_issues))
    fi
    
    # Check for consistent quotes
    local single_quotes=$(grep -c "'[^']*'" "$file" | grep -v '"')
    local double_quotes=$(grep -c '"[^"]*"' "$file" | grep -v "'")
    if [ "$single_quotes" -gt 0 ] && [ "$double_quotes" -gt 0 ]; then
        warnings+=("Mixed quote usage: $single_quotes single quotes, $double_quotes double quotes")
        issues=$((issues + 1))
    fi
    
    # Check for trailing whitespace
    local trailing_whitespace=$(grep -c "[[:space:]]$" "$file")
    if [ "$trailing_whitespace" -gt 0 ]; then
        warnings+=("Trailing whitespace: $trailing_whitespace lines")
        issues=$((issues + trailing_whitespace))
    fi
    
    # Check for missing semicolons (TypeScript/JavaScript specific)
    if [[ "$file_extension" == "ts" || "$file_extension" == "tsx" || "$file_extension" == "js" || "$file_extension" == "jsx" ]]; then
        local missing_semicolons=$(grep -c "[^;]$" "$file" | grep -v "}" | grep -v "{" | grep -v "=>" | wc -l)
        if [ "$missing_semicolons" -gt 0 ]; then
            warnings+=("Missing semicolons: $missing_semicolons lines")
            issues=$((issues + missing_semicolons))
        fi
    fi
    
    # TypeScript specific checks
    if [[ "$file_extension" == "ts" || "$file_extension" == "tsx" ]]; then
        # Check for explicit any types
        local any_types=$(grep -c ": any" "$file")
        if [ "$any_types" -gt 0 ]; then
            warnings+=("Explicit 'any' types: $any_types occurrences")
            issues=$((issues + any_types))
        fi
        
        # Check for non-null assertions
        local non_null_assertions=$(grep -c "!" "$file" | grep -v "!=" | grep -v "!==" | wc -l)
        if [ "$non_null_assertions" -gt 0 ]; then
            warnings+=("Non-null assertions (!): $non_null_assertions occurrences")
            issues=$((issues + non_null_assertions))
        fi
        
        # Check for type assertions
        local type_assertions=$(grep -c "as " "$file")
        if [ "$type_assertions" -gt 0 ]; then
            warnings+=("Type assertions (as): $type_assertions occurrences")
            issues=$((issues + type_assertions))
        fi
    fi
    
    # Check for line length
    local long_lines=$(grep -c "^.\{100,\}" "$file")
    if [ "$long_lines" -gt 0 ]; then
        warnings+=("Lines exceeding 100 characters: $long_lines lines")
        issues=$((issues + long_lines))
    fi
    
    # Check for multiple empty lines
    local multiple_empty_lines=$(grep -c "^$" "$file" | grep -A1 "^$" | wc -l)
    if [ "$multiple_empty_lines" -gt 0 ]; then
        warnings+=("Multiple consecutive empty lines: $multiple_empty_lines occurrences")
        issues=$((issues + multiple_empty_lines))
    fi
    
    if [ "$issues" -gt 0 ]; then
        echo -e "${YELLOW}Style issues in: $file${NC}"
        for warning in "${warnings[@]}"; do
            echo "  - $warning"
        done
        echo -e "${BLUE}Recommendations:${NC}"
        if [[ "${warnings[*]}" == *"indentation"* ]]; then
            echo "  - Use consistent indentation (2 or 4 spaces)"
        fi
        if [[ "${warnings[*]}" == *"quote"* ]]; then
            echo "  - Use consistent quote style (preferably single quotes)"
        fi
        if [[ "${warnings[*]}" == *"whitespace"* ]]; then
            echo "  - Remove trailing whitespace"
        fi
        if [[ "${warnings[*]}" == *"semicolon"* ]]; then
            echo "  - Add missing semicolons"
        fi
        if [[ "${warnings[*]}" == *"any"* ]]; then
            echo "  - Replace 'any' with more specific types"
        fi
        if [[ "${warnings[*]}" == *"assertion"* ]]; then
            echo "  - Avoid type assertions and non-null assertions when possible"
        fi
        if [[ "${warnings[*]}" == *"100 characters"* ]]; then
            echo "  - Break long lines into multiple lines"
        fi
        if [[ "${warnings[*]}" == *"empty lines"* ]]; then
            echo "  - Use single empty lines between logical sections"
        fi
    fi
}

# Function to check performance indicators
check_performance() {
    local file="$1"
    local warnings=()
    
    # Check for inline styles
    local inline_styles=$(grep -c "style=" "$file")
    if [ "$inline_styles" -gt 0 ]; then
        warnings+=("Inline styles: $inline_styles occurrences")
    fi
    
    # Check for unnecessary re-renders
    local unnecessary_renders=$(grep -c "useEffect.*\[\s*\]" "$file")
    if [ "$unnecessary_renders" -gt 0 ]; then
        warnings+=("Potential unnecessary re-renders: $unnecessary_renders")
    fi
    
    # Check for large render functions
    local large_renders=$(grep -c "return.*{" "$file" | grep -v "return.*=>" | wc -l)
    if [ "$large_renders" -gt 0 ]; then
        warnings+=("Large render functions: $large_renders")
    fi
    
    if [ ${#warnings[@]} -gt 0 ]; then
        echo -e "${YELLOW}Performance concerns in: $file${NC}"
        for warning in "${warnings[@]}"; do
            echo "  - $warning"
        done
        echo -e "${BLUE}Recommendations:${NC}"
        if [[ "${warnings[*]}" == *"Inline styles"* ]]; then
            echo "  - Move styles to CSS modules or styled components"
        fi
        if [[ "${warnings[*]}" == *"re-renders"* ]]; then
            echo "  - Add proper dependencies to useEffect"
        fi
        if [[ "${warnings[*]}" == *"render functions"* ]]; then
            echo "  - Break down large render functions into smaller components"
        fi
    fi
}

# Main analysis sections
echo "=== Codebase Analysis Report ==="

# 1. Project Structure
echo -e "\n${GREEN}1. Project Structure${NC}"
echo "Main directories and file counts:"
run_with_timeout "find . -maxdepth 1 -type d -not -path '*/\.*' -not -name 'node_modules' -not -name 'dist' -not -name 'coverage' -not -name '.' | while read dir; do
    count=$(find \"\$dir\" -type f $EXCLUDE_FIND_ARGS | wc -l | tr -d ' ')
    printf \"%-40s %s files\n\" \"\$dir\" \"\$count\"
done" $TIMEOUT

# 2. Large Files Analysis
echo -e "\n${GREEN}2. Large Files Analysis${NC}"
echo "Files over 300 lines (potential candidates for refactoring):"
find_source_files | while read file; do
    lines=$(wc -l < "$file")
    if [ "$lines" -gt 300 ]; then
        printf "%-60s %8d lines\n" "$file" "$lines"
    fi
done

# 3. Type Safety Analysis
echo -e "\n${GREEN}3. Type Safety Analysis${NC}"
echo "Files using 'any' type:"
find_ts_files -exec grep -l "any" {} \; | wc -l | tr -d ' '
echo "Files using non-null assertions (!):"
find_ts_files -exec grep -l "!" {} \; | wc -l | tr -d ' '
echo "Files with type assertions (as):"
find_ts_files -exec grep -l "as " {} \; | wc -l | tr -d ' '

# 4. React Component Analysis
echo -e "\n${GREEN}4. React Component Analysis${NC}"
echo "Components by directory:"
find . -type f -name "*.tsx" $EXCLUDE_FIND_ARGS | sed 's/\/[^/]*$//' | sort | uniq -c | sort -nr

# 5. Performance Analysis
echo -e "\n${GREEN}5. Performance Analysis${NC}"
echo "Components without memoization:"
find . -type f -name "*.tsx" $EXCLUDE_FIND_ARGS -exec grep -L "React.memo\|memo" {} \;

# 6. Test Coverage Analysis
echo -e "\n${GREEN}6. Test Coverage Analysis${NC}"
echo "Files missing tests:"
find_ts_files -not -name "*.test.ts" -not -name "*.test.tsx" -exec sh -c '
    file="$1"
    test_file="${file%.ts}*.test.ts"
    test_file_tsx="${file%.tsx}*.test.tsx"
    if ! find . -path "*$test_file" -o -path "*$test_file_tsx" | grep -q .; then
        echo "$file"
    fi
' sh {} \;

# 7. Import/Export Analysis
echo -e "\n${GREEN}7. Import/Export Analysis${NC}"
echo "Relative path imports (../*): $(find_ts_files -exec grep -l "from '\.\." {} \; | wc -l | tr -d ' ')"

# 8. Electron Architecture Analysis
echo -e "\n${GREEN}8. Electron Architecture Analysis${NC}"
echo "IPC usage count:"
find_ts_files -exec grep -l "ipcMain\|ipcRenderer" {} \; | wc -l | tr -d ' '

# 9. Development Artifacts
echo -e "\n${GREEN}9. Development Artifacts${NC}"
echo "Console statements:"
echo "  console.log: $(find_ts_files -exec grep -l "console.log" {} \; | wc -l | tr -d ' ')"
echo "  console.debug: $(find_ts_files -exec grep -l "console.debug" {} \; | wc -l | tr -d ' ')"
echo "  console.error: $(find_ts_files -exec grep -l "console.error" {} \; | wc -l | tr -d ' ')"

# 10. Technical Debt Indicators
echo -e "\n${GREEN}10. Technical Debt Indicators${NC}"
echo "TODO/FIXME comments:"
find_ts_files -exec grep -l "TODO\|FIXME" {} \;

# 11. Legacy Code Analysis
echo -e "\n${GREEN}11. Legacy Code Analysis${NC}"
echo "Potentially unused files:"
find_ts_files -exec sh -c '
    file="$1"
    filename=$(basename "$file")
    if ! find . -type f $EXCLUDE_FIND_ARGS -not -path "$file" -exec grep -l "$filename" {} \; | grep -q .; then
        echo "$file"
    fi
' sh {} \;

# 12. Component Analysis
echo -e "\n${BLUE}12. Component Analysis${NC}"

# Create a temporary directory for component analysis
TEMP_DIR=$(mktemp -d)
trap 'rm -rf "$TEMP_DIR"' EXIT

# Find all components and their locations
echo -e "\n${GREEN}Component Inventory:${NC}"
declare -A component_locations
declare -A component_files

echo "Scanning for components..."
while IFS= read -r file; do
    echo -n "."
    while IFS= read -r component; do
        if [ -n "$component" ]; then
            component_locations["$component"]+="$file "
            component_files["$file"]+="$component "
        fi
    done < <(extract_component_names "$file")
done < <(find_ts_files)
echo -e "\nDone scanning components."

# 13. Component Quality Analysis
echo -e "\n${BLUE}13. Component Quality Analysis${NC}"

echo -e "\n${GREEN}Component Complexity:${NC}"
while IFS= read -r file; do
    analyze_component_complexity "$file"
done < <(find_ts_files)

echo -e "\n${GREEN}Code Style Consistency:${NC}"
while IFS= read -r file; do
    echo "Checking: $(basename "$file")"
    check_code_style "$file"
done < <(find_ts_files)

echo -e "\n${GREEN}Performance Indicators:${NC}"
while IFS= read -r file; do
    echo "Checking: $(basename "$file")"
    check_performance "$file"
done < <(find_ts_files)

# 13.1 Code Similarity Analysis
echo -e "\n${BLUE}13.1 Code Similarity Analysis${NC}"
echo -e "\n${GREEN}Checking for similar code patterns:${NC}"

# Create a temporary directory for similarity analysis
SIM_TEMP_DIR=$(mktemp -d)
trap 'rm -rf "$SIM_TEMP_DIR"' EXIT

# Process each file for similarity checking
while IFS= read -r file; do
    # Create a normalized version of the file (remove comments, standardize whitespace)
    normalized_file="$SIM_TEMP_DIR/$(basename "$file").normalized"
    grep -v '^[[:space:]]*//' "$file" | \
    sed 's/\/\*.*\*\///g' | \
    tr -s '[:space:]' ' ' | \
    sed 's/^[[:space:]]*//;s/[[:space:]]*$//' > "$normalized_file"
done < <(find_source_files)

# Compare files for similarity
echo "Checking for similar code patterns..."
find "$SIM_TEMP_DIR" -type f -name "*.normalized" | while read -r file1; do
    while read -r file2; do
        if [ "$file1" != "$file2" ]; then
            similarity=$(comm -12 <(sort "$file1") <(sort "$file2") | wc -l)
            total_lines=$(wc -l < "$file1")
            if [ "$total_lines" -gt 0 ]; then
                similarity_percent=$((similarity * 100 / total_lines))
                if [ "$similarity_percent" -gt 70 ]; then
                    original_file1="${file1%.normalized}"
                    original_file2="${file2%.normalized}"
                    echo -e "${YELLOW}High similarity detected (${similarity_percent}%):${NC}"
                    echo "  File 1: ${original_file1#./}"
                    echo "  File 2: ${original_file2#./}"
                    echo "  Similar lines: $similarity"
                    echo "  Total lines: $total_lines"
                fi
            fi
        fi
    done < <(find "$SIM_TEMP_DIR" -type f -name "*.normalized")
done

# 14. Source Code Statistics
echo -e "\n${BLUE}14. Source Code Statistics${NC}"
echo -e "\n${GREEN}Files Analyzed:${NC}"

# Count files properly
TS_FILES=$(find_ts_files | wc -l)
TSX_FILES=$(find_tsx_files | wc -l)

echo "Total source files: $((TS_FILES + TSX_FILES))"
echo "Component files (.tsx): $TSX_FILES"
echo "Type files (.ts): $TS_FILES"

echo -e "\n${GREEN}Lines of Code:${NC}"

# Count lines properly
TOTAL_LINES=0
while IFS= read -r file; do
    LINES=$(wc -l < "$file")
    TOTAL_LINES=$((TOTAL_LINES + LINES))
done < <(find_source_files)

TOTAL_FILES=$((TS_FILES + TSX_FILES))
AVG_LINES=$((TOTAL_FILES > 0 ? TOTAL_LINES / TOTAL_FILES : 0))

echo "Total lines: $TOTAL_LINES"
echo "Average lines per file: $AVG_LINES"

echo -e "\n${GREEN}Analysis complete!${NC}" 